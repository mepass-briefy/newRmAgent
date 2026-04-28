import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const rows = await prisma.rate.findMany();
  return NextResponse.json(rows.map(r => ({ role: r.role, category: r.category, grades: safeJson(r.grades, []) })));
}

export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "expected array" }, { status: 400 });
  await prisma.$transaction([
    prisma.rate.deleteMany({}),
    prisma.rate.createMany({
      data: body.map(r => ({
        role: String(r.role),
        category: String(r.category || "other"),
        grades: JSON.stringify(r.grades || []),
      })),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}

function safeJson(s, fb) { try { return JSON.parse(s); } catch (e) { return fb; } }
