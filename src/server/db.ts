import 'server-only';
import { PrismaClient } from '@prisma/client';

function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let cleaned = url.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || undefined;
}

// PRIMARY RUNTIME CONNECTION: Neon Connection Pooler (PgBouncer)
// Standard Vercel serverless queries MUST strictly use the pooled DATABASE_URL to prevent connection exhaustion.
const pooledDatabaseUrl = cleanDatabaseUrl(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL
);

// DIRECT MIGRATION CONNECTION: Unpooled direct connection for Prisma CLI migrations
const directMigrationUrl = cleanDatabaseUrl(
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  pooledDatabaseUrl
);

// Ensure process.env.DATABASE_URL is populated with the POOLED URL for Prisma runtime
if (pooledDatabaseUrl && process.env.DATABASE_URL !== pooledDatabaseUrl) {
  process.env.DATABASE_URL = pooledDatabaseUrl;
}

// Ensure process.env.DIRECT_URL is populated for Prisma CLI migrations
if (directMigrationUrl && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = directMigrationUrl;
}

if (process.env.NODE_ENV === 'production') {
  if (!pooledDatabaseUrl) {
    console.error(
      '[MYBF DB CONFIG] CRITICAL: DATABASE_URL environment variable is missing in Vercel production. Configure the Neon pooled DATABASE_URL in Vercel Project Settings.'
    );
  } else if (
    pooledDatabaseUrl.includes('localhost') ||
    pooledDatabaseUrl.includes('127.0.0.1')
  ) {
    console.error(
      '[MYBF DB CONFIG] CRITICAL: Production DATABASE_URL points to localhost/127.0.0.1. A remote managed PostgreSQL database instance (Neon) is required for Vercel deployment.'
    );
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: pooledDatabaseUrl
      ? {
          db: {
            url: pooledDatabaseUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

