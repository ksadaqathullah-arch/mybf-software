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

// Determine connection URL with fallback to standard provider/Vercel variables
const resolvedDatabaseUrl = cleanDatabaseUrl(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL
);

// Ensure process.env.DATABASE_URL is populated if another standard variable is present
if (resolvedDatabaseUrl && process.env.DATABASE_URL !== resolvedDatabaseUrl) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
}

// Fallback for DIRECT_URL (unpooled migration connection)
const resolvedDirectUrl = cleanDatabaseUrl(
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  resolvedDatabaseUrl
);

if (resolvedDirectUrl && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = resolvedDirectUrl;
}

if (process.env.NODE_ENV === 'production') {
  if (!resolvedDatabaseUrl) {
    console.error(
      '[MYBF DB CONFIG] CRITICAL: DATABASE_URL environment variable is missing in Vercel production. Configure DATABASE_URL in Vercel Project Settings.'
    );
  } else if (
    resolvedDatabaseUrl.includes('localhost') ||
    resolvedDatabaseUrl.includes('127.0.0.1')
  ) {
    console.error(
      '[MYBF DB CONFIG] CRITICAL: Production DATABASE_URL points to localhost/127.0.0.1. A remote managed PostgreSQL database instance is required for Vercel deployment.'
    );
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDatabaseUrl
      ? {
          db: {
            url: resolvedDatabaseUrl,
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

