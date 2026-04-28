import { PrismaClient } from "@prisma/client";

// Next dev에서 HMR로 인스턴스가 매번 생성되는 것을 방지하는 싱글톤 패턴.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
