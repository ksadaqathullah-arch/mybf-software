import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-8">
      {/* Chapter Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {chapter.name} Executive Hub
            </h1>
            <Badge variant="primary">{chapter.code}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Taluk: <strong className="text-slate-800 dark:text-slate-200">{talukName}</strong> • HQ: {headquarters} • Maker-Checker Queue Active
          </p>
        </div>

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
      </div>

      {/* Real Database KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Roster */}
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Active Roster</span>
              <Users className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {metrics.activeMembersCount}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              +{metrics.approvedThisMonthCount} approved this month
            </p>
          </CardHeader>
        </Card>

        {/* Pending Reviews */}
        <Card className="border-amber-500/30">
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Pending Reviews</span>
              <FileCheck className="h-4 w-4 text-[#FBC206]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FBC206] mt-1">
              {metrics.pendingApplicationsCount} Applications
            </div>
            <p className="text-[11px] text-slate-500">
              Awaiting chapter recommendation
            </p>
          </CardHeader>
        </Card>

        {/* Attendance Check-ins */}
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">QR Attendance</span>
              <Award className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {metrics.totalAttendanceCount}
            </div>
            <p className="text-[11px] text-slate-500">Verified meetup check-ins</p>
          </CardHeader>
        </Card>

        {/* NGO Operational Activity Funds */}
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">NGO Activity Budget</span>
              <Landmark className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹0</div>
            <p className="text-[11px] text-slate-500">100% Free Member NGO • State compliance</p>
          </CardHeader>
        </Card>
      </div>

      {/* Maker-Checker Application Review Queue with Real Database Records */}
      <ChapterReviewQueue
        initialApplications={applications as any}
        chapterName={chapter.name}
      />

      {/* Activities, Meetings & Chapter Leadership Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chapter Meetings */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#035AFC]" /> Recent & Scheduled Meetings
              </CardTitle>
            </div>
            <Link href={`/chapter/${chapter.slug}/meetings`} className="text-xs text-[#035AFC] hover:underline font-semibold">
              View All ({metrics.upcomingMeetingsCount})
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {metrics.recentMeetings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No meetings scheduled yet for {chapter.name}.
                <div className="mt-2">
                  <ScheduleMeetingDialog chapterSlug={chapter.slug} chapterName={chapter.name} />
                </div>
              </div>
            ) : (
              metrics.recentMeetings.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{m.title}</h4>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-1">
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
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#FBC206]" /> Verified Chapter Leadership
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {metrics.leadershipRecords.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <p>No verified leadership appointments recorded in database.</p>
                <p className="text-[11px] text-slate-400 mt-1">Officeholder appointments are verified by the District/State Board.</p>
              </div>
            ) : (
              metrics.leadershipRecords.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-[#035AFC]/10 text-[#035AFC] flex items-center justify-center font-bold text-xs">
                      {l.user.profile?.fullName?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {l.user.profile?.fullName || l.user.email}
                      </div>
                      <div className="text-[11px] text-slate-400">{l.title || l.role.replace(/_/g, ' ')}</div>
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
