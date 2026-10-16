import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (
      !actor ||
      actor.status !== 'ACTIVE' ||
      (!actor.roles.includes('DISTRICT_ADMIN') && !actor.roles.includes('SUPER_ADMIN'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: District Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    // 1. Overview Export
    if (type === 'overview') {
      const data = await DistrictAdminService.getDistrictOverviewMetrics(actor);
      let csv = 'CHAPTER CODE,CHAPTER NAME,TALUK,ACTIVE MEMBERS,PENDING REVIEWS,STATUS\n';
      data.chapters.forEach((ch) => {
        csv += `"${ch.code}","${ch.name}","${ch.taluk}",${ch.activeMembersCount},${ch.pendingReviewsCount},"${ch.status}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mybf-malappuram-district-report-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // 2. Members Directory Export
    if (type === 'members') {
      const search = searchParams.get('search') || undefined;
      const chapterSlug = searchParams.get('chapterSlug') || undefined;
      const taluk = searchParams.get('taluk') || undefined;
      const category = searchParams.get('category') || undefined;
      const position = searchParams.get('position') || undefined;

      const data = await DistrictAdminService.getDistrictMembers(actor, {
        pageSize: 1000,
        search,
        chapterSlug,
        taluk,
        category,
        position,
      });

      let csv = 'MEMBER ID,FULL NAME,CHAPTER,TALUK,CATEGORY,POSITION,OCCUPATION,COMPANY,STATUS,JOINED DATE\n';
      data.members.forEach((m) => {
        // Sanitize formula injection
        const cleanName = m.fullName.replace(/^[+=@-]/, "'$&");
        csv += `"${m.membershipNumber}","${cleanName}","${m.chapterName}","${m.taluk}","${m.memberCategory || ''}","${m.currentPosition || ''}","${m.occupation || ''}","${m.companyName || ''}","${m.status}","${m.joinedDate.slice(0, 10)}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mybf-district-members-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // 3. Applications Export
    if (type === 'applications') {
      const data = await DistrictAdminService.getDistrictApplications(actor, { pageSize: 1000 });
      let csv = 'APPLICATION ID,APPLICANT NAME,EMAIL,PHONE,CHAPTER,CATEGORY,POSITION,STATUS,SUBMITTED DATE\n';
      data.applications.forEach((app) => {
        csv += `"${app.id}","${app.applicant.fullName}","${app.applicant.email || ''}","${app.applicant.phone || ''}","${app.chapterName}","${app.applicant.memberCategory || ''}","${app.applicant.currentPosition || ''}","${app.status}","${app.submittedAt.slice(0, 10)}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mybf-district-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid export type.' }, { status: 400 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate export.' },
      { status }
    );
  }
}
