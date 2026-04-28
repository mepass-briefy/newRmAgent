import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req, { params }) {
  const row = await prisma.project.findUnique({ where: { id: params.projectId } });
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rowToProject(row));
}

// PUT — 프로젝트 전체 갱신 (title/rmId/status는 컬럼, 나머지는 data JSON)
export async function PUT(req, { params }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { id: _id, customerId: _cid, createdAt: _ca, lastActionAt: _la, title, rmId, status, ...jsonData } = body;
  const row = await prisma.project.update({
    where: { id: params.projectId },
    data: {
      ...(title !== undefined && { title }),
      ...(rmId !== undefined && { rmId }),
      ...(status !== undefined && { status }),
      data: JSON.stringify(jsonData),
      lastActionAt: new Date(),
    },
  });
  return NextResponse.json(rowToProject(row));
}

export async function DELETE(_req, { params }) {
  await prisma.note.deleteMany({ where: { projectId: params.projectId } });
  await prisma.project.delete({ where: { id: params.projectId } });
  return new Response(null, { status: 204 });
}

function rowToProject(r) {
  let data = {};
  try { data = JSON.parse(r.data); } catch (e) {}
  return { id: r.id, customerId: r.customerId, title: r.title, rmId: r.rmId, status: r.status, createdAt: r.createdAt, lastActionAt: r.lastActionAt, ...data };
}
