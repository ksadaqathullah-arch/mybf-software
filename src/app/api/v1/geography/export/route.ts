import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { ALL_RESIDENTIAL_LOCAL_BODIES, VERIFIED_TALUKS, VERIFIED_BLOCK_PANCHAYATS } from '@/features/geography/constants/malappuram-master-dataset';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (
      !actor ||
      actor.status !== 'ACTIVE' ||
      (!actor.roles.includes('DISTRICT_ADMIN') && !actor.roles.includes('SUPER_ADMIN'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: District Administrator authorization required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taluk = searchParams.get('taluk');

    const localBodies = await GeographyService.getDatabaseLocalBodies(taluk || undefined);

    let csv = 'CODE,LOCAL BODY NAME,TYPE,TALUK,BLOCK PANCHAYAT,CATEGORY,VERIFICATION STATUS\n';
    localBodies.forEach((lb) => {
      const match = ALL_RESIDENTIAL_LOCAL_BODIES.find((m) => m.code === lb.code);
      const block = match?.blockPanchayat || 'None (Urban)';
      const category = match?.category || (lb.type === 'MUNICIPALITY' ? 'Urban Local Body' : 'Rural Local Body');
      csv += `"${lb.code}","${lb.name}","${lb.type}","${lb.talukName}","${block}","${category}","VERIFIED"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mybf-malappuram-location-master-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Export failed.',
      },
      { status: 500 }
    );
  }
}
