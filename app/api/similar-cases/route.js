import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await prisma.similarCase.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(rows.map(r => ({ ...JSON.parse(r.data || "{}"), id: r.id, userId: r.userId, createdAt: r.createdAt })));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const id = "sc_" + Date.now() + Math.random().toString(36).slice(2, 7);
    const row = await prisma.similarCase.create({
      data: { id, userId: session.userId, data: JSON.stringify(body) },
    });
    return NextResponse.json({ ...body, id: row.id, userId: row.userId, createdAt: row.createdAt });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
