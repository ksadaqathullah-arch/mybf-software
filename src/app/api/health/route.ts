import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { Prisma } from '@prisma/client';

function getSafeHostClassification(url: string | undefined): string {
  if (!url) return 'none';
  const clean = url.trim().replace(/^["']|["']$/g, '');
  if (clean.includes('localhost') || clean.includes('127.0.0.1')) {
    return 'localhost_unreachable_in_serverless';
  }
  try {
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('neon.tech')) return 'neon_cloud';
    if (host.includes('supabase.co')) return 'supabase_cloud';
    if (host.includes('rds.amazonaws.com')) return 'aws_rds';
    if (host.includes('railway.app') || host.includes('rlwy.net')) return 'railway_cloud';
    if (host.includes('vercel-storage.com')) return 'vercel_postgres';
    return 'remote_custom_host';
  } catch {
    return 'malformed_uri';
  }
}

export async function GET() {
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;
  let diagnosticCode = 'OPERATIONAL';
  let safeErrorMessage = 'None';

  const rawDbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL;

  const hostType = getSafeHostClassification(rawDbUrl);

  try {
    const start = performance.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - start);
    dbStatus = 'connected';
    diagnosticCode = 'CONNECTED';
  } catch (err: any) {
    console.error('[HealthCheck] Database connection error:', err?.message || err);
    dbStatus = 'disconnected';

    if (err instanceof Prisma.PrismaClientInitializationError) {
      diagnosticCode = err.errorCode || 'PRISMA_INIT_ERROR';
      const msg = err.message || '';
      if (msg.includes('Environment variable not found')) {
        safeErrorMessage = 'ENV_DATABASE_URL_NOT_FOUND';
      } else if (msg.includes("Can't reach database server")) {
        safeErrorMessage = 'CANNOT_REACH_DATABASE_SERVER';
      } else if (msg.includes('Authentication failed')) {
        safeErrorMessage = 'DB_AUTHENTICATION_FAILED';
      } else {
        safeErrorMessage = 'INITIALIZATION_FAILED';
      }
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      diagnosticCode = err.code || 'PRISMA_KNOWN_ERROR';
      safeErrorMessage = 'QUERY_OR_SCHEMA_ERROR';
    } else {
      diagnosticCode = err?.code || 'UNKNOWN_ERROR';
      safeErrorMessage = err?.name || 'GENERIC_ERROR';
    }
  }

  const isHealthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      platform: 'MYBF Enterprise Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        nextjs: 'operational',
        database: dbStatus,
        databaseLatencyMs: dbLatencyMs,
        securityEngine: 'enforced',
        diagnostics: {
          code: diagnosticCode,
          detail: safeErrorMessage,
          envConfigured: Boolean(rawDbUrl),
          hostClassification: hostType,
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

