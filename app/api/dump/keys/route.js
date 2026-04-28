import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// 백업/복원 시 store.list("")가 알 수 없는 키들(customers:*, notes:*)을 enumerate하기 위한 보조 엔드포인트.
export async function GET() {
  const [customerUsers, noteCustomers, teamCount, rateCount, catCount, permCount, patCount] = await Promise.all([
    prisma.customer.findMany({ select: { userId: true }, distinct: ["userId"] }),
    prisma.note.findMany({ select: { customerId: true }, distinct: ["customerId"] }),
    prisma.teamMember.count(),
    prisma.rate.count(),
    prisma.category.count(),
    prisma.perm.count(),
    prisma.pattern.count(),
  ]);
  const keys = [];
  if (teamCount > 0) keys.push("teams");
  if (rateCount > 0) keys.push("rates");
  if (catCount > 0) keys.push("categories");
  if (permCount > 0) keys.push("perms");
  if (patCount > 0) keys.push("proposal_revision_patterns");
  for (const r of customerUsers) keys.push("customers:" + r.userId);
  for (const r of noteCustomers) keys.push("notes:" + r.customerId);
  return NextResponse.json(keys);
}
