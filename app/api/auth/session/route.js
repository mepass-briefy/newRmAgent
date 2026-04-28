import { NextResponse } from "next/server";
import { getSessionUserId, setSessionUserId, clearSession } from "@/app/lib/session";

// GET — 현재 세션 ({userId} 또는 null)
export async function GET() {
  const userId = getSessionUserId();
  return NextResponse.json(userId ? { userId } : null);
}

// PUT — 세션 설정. body: {userId} (null이면 로그아웃)
export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body || !body.userId) {
    clearSession();
    return NextResponse.json(null);
  }
  setSessionUserId(String(body.userId));
  return NextResponse.json({ userId: String(body.userId) });
}

// DELETE — 로그아웃
export async function DELETE() {
  clearSession();
  return NextResponse.json(null);
}
