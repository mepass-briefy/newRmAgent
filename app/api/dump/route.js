import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// 전체 데이터 export (DataExportPanel용)
// 형식: { "teams": [...], "rates": [...], "categories": [...], "perms": {...},
//         "proposal_revision_patterns": [...],
//         "customers:{userId}": [...], "notes:{customerId}": [...] }
export async function GET() {
  const [teams, rates, categories, perms, patterns, customers, notes] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.rate.findMany(),
    prisma.category.findMany(),
    prisma.perm.findMany(),
    prisma.pattern.findMany(),
    prisma.customer.findMany(),
    prisma.note.findMany(),
  ]);

  const out = {};
  out.teams = teams.map(r => ({
    id: r.id, name: r.name, email: r.email || "", password: r.password || "",
    grade: r.grade || "", isAdmin: !!r.isAdmin, tagOnly: !!r.tagOnly,
    createdAt: r.createdAt.toISOString(),
  }));
  out.rates = rates.map(r => ({ role: r.role, category: r.category, grades: safeJson(r.grades, []) }));
  out.categories = categories.map(c => ({ id: c.id, label: c.label, desc: c.desc || "" }));
  const permObj = {};
  for (const p of perms) permObj[p.menuId] = { RM: !!p.rmAllow, 팀장: !!p.leadAllow, 관리자: !!p.adminAllow };
  out.perms = permObj;
  out.proposal_revision_patterns = patterns.map(p => ({
    id: p.id, pattern: p.pattern, count: p.count, active: p.active,
    created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(),
  }));
  // customers: userId 별로 그룹핑
  const cByUser = {};
  for (const r of customers) {
    cByUser[r.userId] = cByUser[r.userId] || [];
    try { cByUser[r.userId].push(JSON.parse(r.data)); } catch (e) {}
  }
  for (const [u, list] of Object.entries(cByUser)) out["customers:" + u] = list;
  // notes: customerId 별 그룹핑
  const nByCust = {};
  for (const r of notes) {
    nByCust[r.customerId] = nByCust[r.customerId] || [];
    try { nByCust[r.customerId].push(JSON.parse(r.data)); } catch (e) {}
  }
  for (const [cid, list] of Object.entries(nByCust)) out["notes:" + cid] = list;

  return NextResponse.json(out);
}

// POST {replace, data} — 가져오기. replace=true면 모두 삭제 후 주입.
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { replace, data } = body;
  if (!data || typeof data !== "object") return NextResponse.json({ error: "data required" }, { status: 400 });

  if (replace) {
    await prisma.$transaction([
      prisma.note.deleteMany({}),
      prisma.customer.deleteMany({}),
      prisma.pattern.deleteMany({}),
      prisma.perm.deleteMany({}),
      prisma.category.deleteMany({}),
      prisma.rate.deleteMany({}),
      prisma.teamMember.deleteMany({}),
    ]);
  }

  // teams
  if (Array.isArray(data.teams)) {
    if (!replace) await prisma.teamMember.deleteMany({});
    await prisma.teamMember.createMany({
      data: data.teams.map(m => ({
        id: String(m.id), name: String(m.name || ""), email: m.email || null, password: m.password || null,
        grade: m.grade || null, isAdmin: !!m.isAdmin, tagOnly: !!m.tagOnly,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      })),
    });
  }
  if (Array.isArray(data.rates)) {
    if (!replace) await prisma.rate.deleteMany({});
    await prisma.rate.createMany({
      data: data.rates.map(r => ({ role: String(r.role), category: r.category || "other", grades: JSON.stringify(r.grades || []) })),
    });
  }
  if (Array.isArray(data.categories)) {
    if (!replace) await prisma.category.deleteMany({});
    await prisma.category.createMany({
      data: data.categories.map(c => ({ id: String(c.id), label: c.label || c.id, desc: c.desc || null })),
    });
  }
  if (data.perms && typeof data.perms === "object") {
    if (!replace) await prisma.perm.deleteMany({});
    const rows = Object.entries(data.perms).map(([menuId, roles]) => ({
      menuId, rmAllow: !!(roles && roles.RM), leadAllow: !!(roles && roles["팀장"]), adminAllow: !!(roles && roles["관리자"]),
    }));
    await prisma.perm.createMany({ data: rows });
  }
  if (Array.isArray(data.proposal_revision_patterns)) {
    if (!replace) await prisma.pattern.deleteMany({});
    await prisma.pattern.createMany({
      data: data.proposal_revision_patterns.map(p => ({
        id: String(p.id), pattern: String(p.pattern || ""), count: Number(p.count || 1), active: p.active !== false,
        createdAt: p.created_at ? new Date(p.created_at) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
      })),
    });
  }
  // customers / notes (prefix 키)
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("customers:") && Array.isArray(v)) {
      const userId = k.slice("customers:".length);
      if (!replace) await prisma.customer.deleteMany({ where: { userId } });
      await prisma.customer.createMany({
        data: v.map(c => ({
          id: String(c.id), userId, data: JSON.stringify(c),
          status: c.status || null, company: c.company || null,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          lastActionAt: c.last_action_at ? new Date(c.last_action_at) : new Date(),
        })),
      });
    }
    if (k.startsWith("notes:") && Array.isArray(v)) {
      const customerId = k.slice("notes:".length);
      if (!replace) await prisma.note.deleteMany({ where: { customerId } });
      await prisma.note.createMany({
        data: v.map((n, i) => ({
          id: String(n.id || `n_${customerId}_${i}`), customerId,
          seq: Number(n.seq || i + 1), data: JSON.stringify(n),
        })),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

function safeJson(s, fb) { try { return JSON.parse(s); } catch (e) { return fb; } }
