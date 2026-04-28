import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// 기존 형식: 배열 [{id,pattern,count,active,created_at,updated_at}]
export async function GET() {
  const rows = await prisma.pattern.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(rows.map(rowToPattern));
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "expected array" }, { status: 400 });
  await prisma.$transaction([
    prisma.pattern.deleteMany({}),
    prisma.pattern.createMany({
      data: body.map(p => ({
        id: String(p.id),
        pattern: String(p.pattern || ""),
        count: Number(p.count || 1),
        active: p.active !== false,
        createdAt: p.created_at ? new Date(p.created_at) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
      })),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}

function rowToPattern(r) {
  return {
    id: r.id,
    pattern: r.pattern,
    count: r.count,
    active: r.active,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}
