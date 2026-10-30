import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function findSourceDb(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "prisma", "dev.db"),
    path.join(cwd, "dev.db"),
    path.resolve("./prisma/dev.db"),
    path.resolve("./dev.db"),
    path.join(__dirname, "prisma", "dev.db"),
    path.join(__dirname, "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "..", "prisma", "dev.db"),
    path.join(__dirname, "..", "..", "..", "..", "prisma", "dev.db"),
    path.join(cwd, ".next", "server", "prisma", "dev.db"),
    path.join(cwd, ".next", "standalone", "prisma", "dev.db"),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const stats = fs.statSync(candidate);
        if (stats.size > 1000) {
          return candidate;
        }
      }
    } catch {
      // continue search
    }
  }
  return null;
}

function getDatabaseUrl(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = "/tmp/dev.db";
    let needsCopy = true;

    try {
      if (fs.existsSync(tmpDbPath)) {
        const stats = fs.statSync(tmpDbPath);
        if (stats.size > 1000) {
          needsCopy = false;
        }
      }
    } catch {
      needsCopy = true;
    }

    if (needsCopy) {
      const sourceDb = findSourceDb();
      if (sourceDb) {
        try {
          fs.copyFileSync(sourceDb, tmpDbPath);
          console.log(`[UNILOG] Seeded SQLite database initialized at ${tmpDbPath} from ${sourceDb}`);
        } catch (err) {
          console.error("[UNILOG] Failed copying dev.db to /tmp:", err);
        }
      } else {
        console.warn("[UNILOG] Warning: Source dev.db was not found in candidate paths.");
      }
    }

    process.env.DATABASE_URL = "file:/tmp/dev.db";
    return "file:/tmp/dev.db";
  }

  // Local development
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const localDb = path.resolve("prisma/dev.db").replace(/\\/g, "/");
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
