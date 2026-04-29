import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Claude API 프록시. 키는 서버 .env에만 보관.
// 클라이언트 lib/ai.js → POST /api/ai → Anthropic.

function readKeyFromEnvFile() {
  for (const name of [".env.local", ".env"]) {
    try {
      const p = path.join(process.cwd(), name);
      const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^ANTHROPIC_API_KEY=["']?([^"'\r\n]+)["']?/);
        if (m) return m[1].trim();
      }
    } catch {}
  }
  return null;
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY || readKeyFromEnvFile();
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

  const { useWebSearch = false } = body;

  const reqHeaders = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  if (useWebSearch) reqHeaders["anthropic-beta"] = "web-search-2025-03-05";

  const reqBody = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: system || "",
    messages: [{ role: "user", content }],
  };
  if (useWebSearch) {
    reqBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify(reqBody),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "AI call failed", raw: data }, { status: res.status });
    }
    // web_search 사용 시 tool_result/text 블록 혼재 → text 블록만 추출 합산
    const textParts = (data.content || []).filter(b => b.type === "text").map(b => b.text);
    const text = textParts.join("\n\n") || "";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
