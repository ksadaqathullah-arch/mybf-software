import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileCheck,
  Calendar,
  CreditCard,
  Building2,
  ShieldCheck,
  Check,
  X,
  Clock,
  Award,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

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

  const samplePendingApplications = [
    {
      id: 'app-1',
      fullName: 'Sufiyan K.P',
      email: 'sufiyan@manjeri-textiles.com',
      phone: '9847112233',
      category: 'Youth Entrepreneur',
      submittedAt: 'Today, 11:30 AM',
      businessSector: 'Textiles & Retail',
    },
    {
      id: 'app-2',
      fullName: 'Dr. Fathima Zahra',
      email: 'fathima.dental@gmail.com',
      phone: '9744221100',
      category: 'Professional Member',
      submittedAt: 'Yesterday, 04:15 PM',
      businessSector: 'Healthcare & Dentistry',
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
            <div className="text-2xl font-extrabold text-[#FBC206] mt-1">2 Applications</div>
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
              <span className="text-xs text-slate-500 font-semibold uppercase">Chapter Fund Balance</span>
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹4,26,000</div>
            <p className="text-[11px] text-slate-500">Audited dual ledger</p>
          </CardHeader>
        </Card>
      </div>

      {/* Maker-Checker Application Review Queue */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Membership Review Queue (Maker-Checker)</CardTitle>
              <CardDescription className="text-xs">
                Chapter officers verify identity and trade legitimacy before permanent ID pass generation.
              </CardDescription>
            </div>
            <Badge variant="warning">2 ACTION REQUIRED</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Applicant</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Business / Firm</th>
                  <th className="py-3 px-2">Submitted</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {samplePendingApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">{app.email} • {app.phone}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge variant="primary" className="text-[10px]">{app.category}</Badge>
                    </td>
                    <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">
                      {app.businessSector}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {app.submittedAt}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button variant="primary" size="sm" className="h-7 text-xs px-2.5">
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
