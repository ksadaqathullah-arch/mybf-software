import 'server-only';
import { PrismaClient } from '@prisma/client';

// Determine connection URL with fallback to standard provider/Vercel variables
const resolvedDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

// Ensure process.env.DATABASE_URL is populated if another standard variable is present
if (resolvedDatabaseUrl && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedDatabaseUrl;
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

