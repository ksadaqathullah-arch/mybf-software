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


    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const actorEmail = searchParams.get('actorEmail') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const exportFormat = searchParams.get('export');

    if (exportFormat === 'csv') {
      const data = await SuperAdminService.getAuditLogs(actor, {
        page: 1,
        pageSize: 1000,
        action,
        resource,
        actorEmail,
        startDate,
        endDate,
      });

      const header = 'ID,Created At,Action,Resource,Resource ID,Actor Email,IP Address\n';
      const rows = data.logs
        .map(
          (l: any) =>
            `"${l.id}","${l.createdAt}","${l.action}","${l.resource}","${l.resourceId || ''}","${l.actorEmail || ''}","${l.ipAddress || ''}"`
        )
        .join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mybf-audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (exportFormat === 'json') {
      const data = await SuperAdminService.getAuditLogs(actor, {
        page: 1,
        pageSize: 1000,
        action,
        resource,
        actorEmail,
        startDate,
        endDate,
      });

      return new NextResponse(JSON.stringify(data.logs, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="mybf-audit-logs-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    const result = await SuperAdminService.getAuditLogs(actor, {
      page,
      pageSize,
      action,
      resource,
      actorEmail,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to query audit logs.' },
      { status }
    );
  }
}
