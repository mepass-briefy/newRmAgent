import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const rows = await prisma.category.findMany();
  return NextResponse.json(rows.map(c => ({ id: c.id, label: c.label, desc: c.desc || "" })));
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "expected array" }, { status: 400 });
  await prisma.$transaction([
    prisma.category.deleteMany({}),
    prisma.category.createMany({
      data: body.map(c => ({ id: String(c.id), label: String(c.label || c.id), desc: c.desc || null })),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}
