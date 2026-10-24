import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@/server/super-admin.service';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const actor = {
      userId: admin.id,
      email: admin.email,
      phone: admin.phone,
      status: 'ACTIVE' as const,
      roles: admin.roles as any,
    };


    const metrics = await SuperAdminService.getDatabaseHealth(actor);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to query database health.' },
      { status }
    );
  }
}
