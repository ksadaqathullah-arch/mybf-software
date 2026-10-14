import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileCheck,
  Landmark,
  Award,
  Calendar,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import {
  ChapterReviewQueue,
  type ChapterApplicationItem,
} from '@/features/memberships/components/chapter-review-queue';

export function generateStaticParams() {
  return INITIAL_16_CHAPTERS.map((ch) => ({
    chapterId: ch.slug,
  }));
}

export default async function ChapterExecutivePage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = INITIAL_16_CHAPTERS.find((c) => c.slug === chapterId);

  if (!chapter) {
    notFound();
  }

  const samplePendingApplications: ChapterApplicationItem[] = [
    {
      id: 'app-1',
      fullName: 'Sufiyan K.P',
      email: 'sufiyan@manjeri-textiles.com',
      phone: '9847112233',
      memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
      currentPosition: 'BUSINESS_OWNER',
      submittedAt: 'Today, 11:30 AM',
      businessSector: 'Textiles & Retail',
    },
    {
      id: 'app-2',
      fullName: 'Dr. Fathima Zahra',
      email: 'fathima.dental@gmail.com',
      phone: '9744221100',
      memberCategory: 'ASPIRING_ENTREPRENEUR',
      currentPosition: 'EMPLOYEE',
      submittedAt: 'Yesterday, 04:15 PM',
      businessSector: 'Healthcare & Dentistry',
    },
    {
      id: 'app-3',
      fullName: 'Rashid K.',
      email: 'rashid.tech@gmail.com',
      phone: '9846001122',
      memberCategory: 'STUDENT',
      currentPosition: 'STUDENT',
      submittedAt: '2 days ago',
      businessSector: 'Computer Engineering & IoT',
    },
    {
      id: 'app-4',
      fullName: 'Hameed C.V',
      email: 'hameed@malabarconsult.in',
      phone: '9447334455',
      memberCategory: 'OTHER',
      currentPosition: 'SELF_EMPLOYED',
      submittedAt: '3 days ago',
      businessSector: 'Tax Consultancy & Advisory',
    },
  ];

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
            Taluk: <strong className="text-slate-800 dark:text-slate-200">{chapter.taluk}</strong> • HQ: {chapter.headquarters} • Maker-Checker Queue Active
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/chapters/${chapter.slug}`}>
            <Button variant="outline" size="sm">
              Public Profile
            </Button>
          </Link>
          <Button variant="secondary" size="sm">
            <Calendar className="h-4 w-4 mr-1.5" /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Active Roster</span>
              <Users className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">142</div>
            <p className="text-[11px] text-emerald-600 font-medium">+8 approved this month</p>
          </CardHeader>
        </Card>

        <Card className="border-amber-500/30">
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Pending Reviews</span>
              <FileCheck className="h-4 w-4 text-[#FBC206]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FBC206] mt-1">{samplePendingApplications.length} Applications</div>
            <p className="text-[11px] text-slate-500">Awaiting chapter sign-off</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Monthly Attendance</span>
              <Award className="h-4 w-4 text-[#035AFC]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">89%</div>
            <p className="text-[11px] text-slate-500">QR scanned meetups</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">NGO Activity Budget</span>
              <Landmark className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹4,26,000</div>
            <p className="text-[11px] text-slate-500">Approved community initiatives</p>
          </CardHeader>
        </Card>
      </div>

      {/* Maker-Checker Application Review Queue with Combined Filters */}
      <ChapterReviewQueue
        initialApplications={samplePendingApplications}
        chapterName={chapter.name}
      />
    </div>
  );
}
