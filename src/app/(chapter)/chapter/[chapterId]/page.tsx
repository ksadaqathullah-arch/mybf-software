import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  Users,
  FileCheck,
  Landmark,
  Award,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { db } from '@/server/db';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterReviewQueue } from '@/features/memberships/components/chapter-review-queue';
import { ScheduleMeetingDialog } from '@/features/chapters/components/schedule-meeting-dialog';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

export default async function ChapterExecutivePage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;

  // 1. Resolve canonical chapter from PostgreSQL database
  const chapter = await db.chapter.findFirst({
    where: {
      OR: [
        { slug: chapterId.toLowerCase() },
        { id: chapterId },
        { code: chapterId.toUpperCase() },
      ],
    },
    include: {
      district: true,
    },
  });

  if (!chapter) {
    notFound();
  }

  // 2. Resolve authenticated actor
  const actor = await getCurrentActor();
  if (!actor) {
    return null; // Layout renders ChapterAccessDenied
  }

  // Authorize: Super Admin, District Admin, or appointed chapter officer for this chapter
  const isSuperAdmin = actor.roles.includes('SUPER_ADMIN');
  const isDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
  const isChapterOfficer = actor.roles.some((r) =>
    [
      'CHAPTER_PRESIDENT',
      'CHAPTER_SECRETARY',
      'CHAPTER_TREASURER',
      'CHAPTER_COORDINATOR',
      'MEMBERSHIP_OFFICER',
      'EVENT_MANAGER',
    ].includes(r)
  );

  const isAuthorized = isSuperAdmin || isDistrictAdmin || (isChapterOfficer && actor.chapterId === chapter.id);

  if (!isAuthorized) {
    return null; // Layout renders ChapterAccessDenied
  }

  // 3. Fetch real database metrics and pending applications
  const [metrics, applications] = await Promise.all([
    ChapterService.getChapterDashboardMetrics(actor, chapter.id),
    ChapterService.getChapterApplications(actor, chapter.id),
  ]);

  const chapterMeta = INITIAL_16_CHAPTERS.find((c) => c.slug === chapter.slug);
  const talukName = chapterMeta?.taluk || chapter.district?.name || 'Malappuram';
  const headquarters = chapterMeta?.headquarters || chapter.name;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Chapter Overview Header */}
      <PortalPageHeader
        tag={chapter.code}
        badge="Constituency Executive Hub"
        title={`${chapter.name} Executive Hub`}
        description={`Taluk: ${talukName} • HQ: ${headquarters} • Maker-Checker Queue Active.`}
        actions={
          <div className="flex gap-2 items-center">
            <Link href={`/chapters/${chapter.slug}`}>
              <Button variant="outline" size="sm">
                Public Profile
              </Button>
            </Link>
            <ScheduleMeetingDialog
              chapterSlug={chapter.slug}
              chapterName={chapter.name}
            />
          </div>
        }
      />

      {/* Real Database KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Active Roster"
          value={metrics.activeMembersCount}
          subValue={`+${metrics.approvedThisMonthCount} approved this month`}
          icon={Users}
        />

        <PortalStatCard
          label="Pending Reviews"
          value={`${metrics.pendingApplicationsCount} Applications`}
          subValue="Awaiting chapter recommendation"
          icon={FileCheck}
        />

        <PortalStatCard
          label="QR Attendance"
          value={metrics.totalAttendanceCount}
          subValue="Verified meetup check-ins"
          icon={Award}
        />

        <PortalStatCard
          label="NGO Activity Budget"
          value="₹0"
          subValue="100% Free Member NGO"
          icon={Landmark}
        />
      </div>

      {/* Maker-Checker Application Review Queue with Real Database Records */}
      <ChapterReviewQueue
        initialApplications={applications as any}
        chapterName={chapter.name}
      />

      {/* Activities, Meetings & Chapter Leadership Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chapter Meetings */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue" /> Recent & Scheduled Meetings
              </CardTitle>
            </div>
            <Link href={`/chapter/${chapter.slug}/meetings`} className="text-xs text-blue hover:underline font-bold font-display uppercase tracking-wider">
              View All ({metrics.upcomingMeetingsCount})
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {metrics.recentMeetings.length === 0 ? (
              <div className="text-center py-6 text-ink/50 text-xs font-serif italic">
                No meetings scheduled yet for {chapter.name}.
                <div className="mt-3">
                  <ScheduleMeetingDialog chapterSlug={chapter.slug} chapterName={chapter.name} />
                </div>
              </div>
            ) : (
              metrics.recentMeetings.map((m) => (
                <div key={m.id} className="p-3 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c] flex items-start justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-ink font-sans">{m.title}</h4>
                    <div className="text-ink/60 text-[11px] flex items-center gap-2 mt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {m.venue}
                      </span>
                    </div>
                  </div>
                  <Badge variant="neutral" className="text-[10px]">
                    {m.type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chapter Leadership Directory */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-yellow" /> Verified Chapter Leadership
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {metrics.leadershipRecords.length === 0 ? (
              <div className="text-center py-6 text-ink/50 text-xs font-serif italic">
                <p>No verified leadership appointments recorded in database.</p>
                <p className="text-[11px] text-ink/40 mt-1">Officeholder appointments are verified by the District/State Board.</p>
              </div>
            ) : (
              metrics.leadershipRecords.map((l) => (
                <div key={l.id} className="p-3 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 border-2 border-ink bg-blue/10 text-blue flex items-center justify-center font-black font-display text-xs">
                      {l.user.profile?.fullName?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <div className="font-bold text-ink font-sans">
                        {l.user.profile?.fullName || l.user.email}
                      </div>
                      <div className="text-[11px] text-ink/60 font-serif">{l.title || l.role.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-[10px]">
                    {l.role}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
