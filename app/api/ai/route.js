import { NextResponse } from "next/server";

// Claude API 프록시. 키는 서버 .env에만 보관.
// 클라이언트 lib/ai.js → POST /api/ai → Anthropic.

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { system, userMsg, maxTokens = 1500, attachments = [] } = body;

  const content = [];
  for (const f of attachments || []) {
    if (f.type === "pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data } });
    } else if (f.type === "image") {
      content.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.data } });
    } else {
      content.push({ type: "text", text: "[첨부파일: " + (f.name || "") + "]\n" + (f.data || "") });
    }
  }
  content.push({ type: "text", text: userMsg || "" });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: system || "",
        messages: [{ role: "user", content }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "AI call failed", raw: data }, { status: res.status });
    }
    const text = data.content && data.content[0] ? data.content[0].text : "";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
