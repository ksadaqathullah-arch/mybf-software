import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpenMembershipModalButton } from '@/features/memberships/components/open-membership-modal-button';
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Award,
  UserCheck,
  Clock,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return INITIAL_16_CHAPTERS.map((ch) => ({
    slug: ch.slug,
  }));
}

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const staticChapter = INITIAL_16_CHAPTERS.find((c) => c.slug === slug);

  // Fetch real PostgreSQL chapter record with active leadership appointments
  const dbChapter = await db.chapter.findFirst({
    where: {
      OR: [
        { slug: slug.toLowerCase() },
        { code: slug.toUpperCase() },
        { id: slug },
      ],
    },
    include: {
      leadership: {
        where: { isActive: true },
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { startDate: 'asc' },
      },
      district: true,
      _count: {
        select: {
          memberships: { where: { status: 'ACTIVE' } },
        },
      },
    },
  });

  if (!staticChapter && !dbChapter) {
    notFound();
  }

  const chapterName = dbChapter?.name || staticChapter?.name || slug;
  const chapterCode = dbChapter?.code || staticChapter?.code || 'CHP';
  const taluk = staticChapter?.taluk || 'Malappuram';
  const description = staticChapter?.description || `Official MYBF Assembly Constituency Chapter for ${chapterName}.`;
  const headquarters = staticChapter?.headquarters || `${chapterName} Secretariat`;
  const activeLeadership = dbChapter?.leadership || [];
  const activeMembersCount = dbChapter?._count.memberships ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/chapters"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#035AFC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to 16 Chapters
        </Link>
      </div>

      {/* Chapter Hero */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-8 sm:p-12 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{chapterCode}</Badge>
              <Badge variant="secondary">{taluk} Taluk</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {chapterName}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-base leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#035AFC]" /> Secretariat HQ: {headquarters}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Active Governance Status
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <OpenMembershipModalButton className="btn btn-yellow min-h-12 px-6 text-sm font-sans font-semibold cursor-pointer justify-center">
              Apply for Chapter Membership
            </OpenMembershipModalButton>
            <Link href={`/chapter/${dbChapter?.slug || staticChapter?.slug || slug}`}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Chapter Executive Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Leadership & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Leadership */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#035AFC]" /> Chapter Leadership Roster
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {activeLeadership.length} Verified {activeLeadership.length === 1 ? 'Officer' : 'Officers'}
            </span>
          </div>

          {activeLeadership.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A10]/50 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Central Appointment in Progress
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                The Malappuram Youth Business Forum Secretariat is currently appointing verified chapter executive officers for {chapterName}.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeLeadership.map((leader) => {
                const fullName = leader.user.profile?.fullName || leader.user.username || leader.user.email || 'Appointed Officer';
                const initial = fullName.charAt(0).toUpperCase();
                const roleLabel = leader.role.replace(/_/g, ' ');

                return (
                  <Card key={leader.id} className="border-2 border-slate-200 dark:border-slate-800 hover:border-[#035AFC] transition-colors">
                    <CardHeader className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#035AFC] font-bold text-sm flex items-center justify-center font-sans border border-blue-200 dark:border-blue-800">
                            {initial}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                              {fullName}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 mt-0.5">
                              {leader.title || roleLabel}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="primary" className="text-[9px] uppercase shrink-0">
                          {leader.role}
                        </Badge>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <UserCheck className="h-3.5 w-3.5" /> Central Appointment
                        </span>
                        <span>
                          Since {new Date(leader.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Chapter Stats */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-[#FBC206]" /> Chapter Performance
          </h3>

          <Card className="bg-slate-50/50 dark:bg-[#070A10]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Chapter District</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Malappuram</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Taluk Jurisdiction</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{taluk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active Verified Roster</span>
                <span className="text-xs font-bold text-[#035AFC] font-mono">
                  {activeMembersCount} {activeMembersCount === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Governance Cadence</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Monthly Executive</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Operational Status</span>
                <Badge variant="success" className="text-[10px]">OPERATIONAL</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
