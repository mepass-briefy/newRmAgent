import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET — 특정 customerId의 노트 배열
export async function GET(_req, { params }) {
  const { customerId } = params;
  const rows = await prisma.note.findMany({ where: { customerId }, orderBy: { seq: "asc" } });
  return NextResponse.json(rows.map(rowToNote));
}

// PUT — customerId의 노트 배열 전체 교체
export async function PUT(req, { params }) {
  const { customerId } = params;
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "expected array" }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.note.deleteMany({ where: { customerId } }),
    prisma.note.createMany({
      data: body.map((n, i) => noteToRow(n, customerId, i)),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}

function rowToNote(r) {
  try { return JSON.parse(r.data); } catch (e) { return null; }
}
function noteToRow(n, customerId, idx) {
  return {
    id: String(n.id || `n_${customerId}_${idx}`),
    customerId,
    seq: Number(n.seq || idx + 1),
    data: JSON.stringify(n),
  };
}
