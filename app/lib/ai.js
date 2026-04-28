"use client";
// Claude API 호출 — 클라이언트에서 직접 fetch 하지 않고 서버 프록시(/api/ai)를 거침.
// 키는 .env의 ANTHROPIC_API_KEY (서버에서만 보유). REQ-AI-001/002/003/004/005 모두 이 함수를 통과.

export async function callClaude(system, userMsg, maxTokens = 1500, attachments = []) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, userMsg, maxTokens, attachments }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    console.warn("[ai]", e.message);
    throw e;
  }
}
