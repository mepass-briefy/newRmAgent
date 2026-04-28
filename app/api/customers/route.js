import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSessionUserId } from "@/app/lib/session";

// GET — userId 별 고객 배열. 쿼리 ?userId=xxx 또는 세션에서.
export async function GET(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || getSessionUserId();
  if (!userId) return NextResponse.json([]);
  const rows = await prisma.customer.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(rowToCustomer));
}

// PUT — userId 별 고객 배열 전체 교체 (기존 store.set("customers:{userId}", arr) 호환)
export async function PUT(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || getSessionUserId();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "expected array" }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.customer.deleteMany({ where: { userId } }),
    prisma.customer.createMany({
      data: body.map(c => customerToRow(c, userId)),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}

function rowToCustomer(r) {
  try { return JSON.parse(r.data); } catch (e) { return null; }
}
function customerToRow(c, userId) {
  return {
    id: String(c.id),
    userId,
    data: JSON.stringify(c),
    status: c.status || null,
    company: c.company || null,
    createdAt: c.created_at ? new Date(c.created_at) : new Date(),
    lastActionAt: c.last_action_at ? new Date(c.last_action_at) : new Date(),
  };
}
