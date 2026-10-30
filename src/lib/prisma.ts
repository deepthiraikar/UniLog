import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// In serverless environments like Vercel, the app directory is read-only.
// We copy the seeded database to /tmp so write operations succeed seamlessly.
if (process.env.VERCEL) {
  const tmpDbPath = "/tmp/dev.db";
  const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
    try {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    } catch (e) {
      console.error("Failed to copy dev.db to /tmp:", e);
    }
  }
  process.env.DATABASE_URL = "file:/tmp/dev.db";
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
