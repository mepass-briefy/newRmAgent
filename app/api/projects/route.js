import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/projects?customerId=xxx
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });
  const rows = await prisma.project.findMany({ where: { customerId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(rows.map(rowToProject));
}

// POST /api/projects — 새 프로젝트 생성
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });
  const { id, customerId, title, rmId, status, ...rest } = body;
  const row = await prisma.project.create({
    data: {
      id: id || String(Date.now()),
      customerId,
      title: title || "새 프로젝트",
      rmId: rmId || null,
      status: status || "신규접수",
      data: JSON.stringify(rest),
    },
  });
  return NextResponse.json(rowToProject(row), { status: 201 });
}

function rowToProject(r) {
  let data = {};
  try { data = JSON.parse(r.data); } catch (e) {}
  return { id: r.id, customerId: r.customerId, title: r.title, rmId: r.rmId, status: r.status, createdAt: r.createdAt, lastActionAt: r.lastActionAt, ...data };
}
