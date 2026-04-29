import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const where = { userId: session.userId };
    if (customerId) where.customerId = customerId;
    const rows = await prisma.contract.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json(rows.map(r => ({ ...JSON.parse(r.data || "{}"), id: r.id, userId: r.userId, projectId: r.projectId, customerId: r.customerId, createdAt: r.createdAt, updatedAt: r.updatedAt })));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { projectId, customerId, ...rest } = body;
    const id = "con_" + Date.now() + Math.random().toString(36).slice(2, 7);
    const row = await prisma.contract.create({
      data: { id, userId: session.userId, projectId: projectId || null, customerId: customerId || null, data: JSON.stringify(rest) },
    });
    return NextResponse.json({ ...rest, id: row.id, userId: row.userId, projectId: row.projectId, customerId: row.customerId, createdAt: row.createdAt });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
