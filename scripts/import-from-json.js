#!/usr/bin/env node
/**
 * scripts/import-from-json.js
 *
 * 사용자가 v1에서 백업한 JSON을 SQLite(dev.db)로 주입한다.
 *
 * 사용법:
 *   node scripts/import-from-json.js <path-to-backup.json>
 *   node scripts/import-from-json.js <path-to-backup.json> --reset
 *
 * --reset 옵션을 주면 기존 DB를 모두 비우고 새로 주입.
 *
 * JSON 형식 (v1 store.list/get 결과 그대로):
 *   {
 *     "teams": [...],
 *     "rates": [...],
 *     "categories": [...],
 *     "perms": {...},
 *     "proposal_revision_patterns": [...],
 *     "customers:{userId}": [...],
 *     "notes:{customerId}": [...]
 *   }
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");
  const fileArg = args.find(a => !a.startsWith("--"));
  if (!fileArg) {
    console.error("사용법: node scripts/import-from-json.js <backup.json> [--reset]");
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error("파일을 찾을 수 없음:", filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let data;
  try { data = JSON.parse(raw); } catch (e) {
    console.error("JSON 파싱 실패:", e.message);
    process.exit(1);
  }

  if (reset) {
    console.log("⚠️  --reset: 기존 데이터 모두 삭제");
    await prisma.note.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.pattern.deleteMany({});
    await prisma.perm.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.rate.deleteMany({});
    await prisma.teamMember.deleteMany({});
  }

  let counts = { teams: 0, rates: 0, categories: 0, perms: 0, patterns: 0, customers: 0, notes: 0 };

  if (Array.isArray(data.teams)) {
    if (!reset) await prisma.teamMember.deleteMany({});
    await prisma.teamMember.createMany({
      data: data.teams.map(m => ({
        id: String(m.id),
        name: String(m.name || ""),
        email: m.email || null,
        password: m.password || null,
        grade: m.grade || null,
        isAdmin: !!m.isAdmin,
        tagOnly: !!m.tagOnly,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      })),
    });
    counts.teams = data.teams.length;
  }
  if (Array.isArray(data.rates)) {
    if (!reset) await prisma.rate.deleteMany({});
    await prisma.rate.createMany({
      data: data.rates.map(r => ({
        role: String(r.role),
        category: r.category || "other",
        grades: JSON.stringify(r.grades || []),
      })),
    });
    counts.rates = data.rates.length;
  }
  if (Array.isArray(data.categories)) {
    if (!reset) await prisma.category.deleteMany({});
    await prisma.category.createMany({
      data: data.categories.map(c => ({
        id: String(c.id), label: c.label || c.id, desc: c.desc || null,
      })),
    });
    counts.categories = data.categories.length;
  }
  if (data.perms && typeof data.perms === "object") {
    if (!reset) await prisma.perm.deleteMany({});
    const rows = Object.entries(data.perms).map(([menuId, roles]) => ({
      menuId,
      rmAllow: !!(roles && roles.RM),
      leadAllow: !!(roles && roles["팀장"]),
      adminAllow: !!(roles && roles["관리자"]),
    }));
    await prisma.perm.createMany({ data: rows });
    counts.perms = rows.length;
  }
  if (Array.isArray(data.proposal_revision_patterns)) {
    if (!reset) await prisma.pattern.deleteMany({});
    await prisma.pattern.createMany({
      data: data.proposal_revision_patterns.map(p => ({
        id: String(p.id),
        pattern: String(p.pattern || ""),
        count: Number(p.count || 1),
        active: p.active !== false,
        createdAt: p.created_at ? new Date(p.created_at) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
      })),
    });
    counts.patterns = data.proposal_revision_patterns.length;
  }
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("customers:") && Array.isArray(v)) {
      const userId = k.slice("customers:".length);
      if (!reset) await prisma.customer.deleteMany({ where: { userId } });
      await prisma.customer.createMany({
        data: v.map(c => ({
          id: String(c.id),
          userId,
          data: JSON.stringify(c),
          status: c.status || null,
          company: c.company || null,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          lastActionAt: c.last_action_at ? new Date(c.last_action_at) : new Date(),
        })),
      });
      counts.customers += v.length;
    }
    if (k.startsWith("notes:") && Array.isArray(v)) {
      const customerId = k.slice("notes:".length);
      if (!reset) await prisma.note.deleteMany({ where: { customerId } });
      await prisma.note.createMany({
        data: v.map((n, i) => ({
          id: String(n.id || `n_${customerId}_${i}`),
          customerId,
          seq: Number(n.seq || i + 1),
          data: JSON.stringify(n),
        })),
      });
      counts.notes += v.length;
    }
  }

  console.log("✅ 주입 완료:", counts);
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error("❌", e);
  await prisma.$disconnect();
  process.exit(1);
});
