import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// 기존 perms 형식: { customers: {RM:true, 팀장:true, 관리자:true}, ... }
export async function GET() {
  const rows = await prisma.perm.findMany();
  const out = {};
  for (const r of rows) {
    out[r.menuId] = { RM: !!r.rmAllow, 팀장: !!r.leadAllow, 관리자: !!r.adminAllow };
  }
  return NextResponse.json(out);
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "expected object" }, { status: 400 });
  }
  const rows = Object.entries(body).map(([menuId, roles]) => ({
    menuId,
    rmAllow: !!(roles && roles.RM),
    leadAllow: !!(roles && roles["팀장"]),
    adminAllow: !!(roles && roles["관리자"]),
  }));
  await prisma.$transaction([
    prisma.perm.deleteMany({}),
    prisma.perm.createMany({ data: rows }),
  ]);
  return NextResponse.json({ ok: true, count: rows.length });
}
