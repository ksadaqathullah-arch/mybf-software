import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Award,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

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
  const chapter = INITIAL_16_CHAPTERS.find((c) => c.slug === slug);

  if (!chapter) {
    notFound();
  }

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
              <Badge variant="primary">{chapter.code}</Badge>
              <Badge variant="secondary">{chapter.taluk} Taluk</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {chapter.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-base leading-relaxed">
              {chapter.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#035AFC]" /> Secretariat HQ: {chapter.headquarters}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Active Governance Status
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Apply for Chapter Membership
              </Button>
            </Link>
            <Link href={`/chapter/${chapter.slug}`}>
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
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#035AFC]" /> Chapter Leadership Roster
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-5">
                <Badge variant="primary" className="w-fit text-[9px]">Chapter President</Badge>
                <CardTitle className="text-base mt-2">Executive Lead</CardTitle>
                <CardDescription className="text-xs">Appointed by Central Forum</CardDescription>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  Oversees chapter vision, meetings, and business summits.
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="p-5">
                <Badge variant="primary" className="w-fit text-[9px]">Chapter Secretary</Badge>
                <CardTitle className="text-base mt-2">Operations Lead</CardTitle>
                <CardDescription className="text-xs">Elected Chapter Officer</CardDescription>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  Manages member communications and official meeting minutes.
                </div>
              </CardHeader>
            </Card>
          </div>
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
                <span className="text-xs font-bold">Malappuram</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Taluk Jurisdiction</span>
                <span className="text-xs font-bold">{chapter.taluk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Meeting Cadence</span>
                <span className="text-xs font-bold">Monthly Executive</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <Badge variant="success" className="text-[10px]">OPERATIONAL</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
