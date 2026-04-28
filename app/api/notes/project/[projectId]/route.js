import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET — 프로젝트 노트 조회. 없으면 customerId 기반 노트로 폴백 (마이그레이션)
export async function GET(_req, { params }) {
  const projectId = params.projectId;
  let rows = await prisma.note.findMany({ where: { projectId }, orderBy: { seq: "asc" } });

  // 프로젝트 노트가 없으면 기존 customerId 노트로 폴백 + 자동 마이그레이션
  if (rows.length === 0) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project) {
      const oldRows = await prisma.note.findMany({ where: { customerId: project.customerId, projectId: null }, orderBy: { seq: "asc" } });
      if (oldRows.length > 0) {
        // 기존 노트를 이 프로젝트로 마이그레이션
        await Promise.all(oldRows.map(r => prisma.note.update({ where: { id: r.id }, data: { projectId } })));
        rows = oldRows;
      }
    }
  }

  return NextResponse.json(rows.map(r => { try { return JSON.parse(r.data); } catch { return null; } }).filter(Boolean));
}

// PUT — 프로젝트 노트 전체 교체
export async function PUT(req, { params }) {
  const projectId = params.projectId;
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) return NextResponse.json({ error: "expected array" }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.note.deleteMany({ where: { projectId } }),
    prisma.note.createMany({
      data: body.map((n, i) => ({
        id: String(n.id || `pn_${projectId}_${Date.now()}_${i}`),
        customerId: project.customerId,
        projectId,
        seq: Number(n.seq || i + 1),
        data: JSON.stringify(n),
      })),
    }),
  ]);
  return NextResponse.json({ ok: true, count: body.length });
}
