import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET — team 전체 (배열). 기존 store.get("teams") 호환.
export async function GET() {
  const rows = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows.map(rowToMember));
}

// PUT — body가 배열이면 전체 교체. 기존 store.set("teams", arr) 호환.
export async function PUT(req) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "expected array" }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.teamMember.deleteMany({}),
    prisma.teamMember.createMany({
      data: body.map(memberToRow),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}

function rowToMember(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email || "",
    password: r.password || "",
    grade: r.grade || "",
    isAdmin: !!r.isAdmin,
    tagOnly: !!r.tagOnly,
    createdAt: r.createdAt.toISOString(),
  };
}
function memberToRow(m) {
  return {
    id: String(m.id),
    name: String(m.name || ""),
    email: m.email || null,
    password: m.password || null,
    grade: m.grade || null,
    isAdmin: !!m.isAdmin,
    tagOnly: !!m.tagOnly,
    createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
  };
}
