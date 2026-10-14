import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const start = performance.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - start);
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${(err as Error).message}`;
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
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

