import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VisionMissionSection } from '@/features/organization/components/vision-mission-section';

export const metadata: Metadata = {
  title: 'About MYBF - An Initiative Under Mission Malappuram 2050 | Vision & Mission',
  description:
    'The official Vision and Six Strategic Mission Pillars of Malappuram Youth Business Forum, an initiative under Mission Malappuram 2050, driving youth economic empowerment, women entrepreneurship, AI leadership, and district-wide prosperity.',
  keywords: [
    'Malappuram Youth Business Forum',
    'Mission Malappuram 2050',
    'Youth Entrepreneurship',
    'Women Entrepreneurship',
    'AI-Driven Business Leadership',
    'Malappuram Business Community',
    'Startup Ecosystem',
    'Entrepreneurship Development',
    'MYBF Strategic Pillars',
  ],
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">About MYBF</Badge>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            • An Initiative Under Mission Malappuram 2050
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Empowering Malappuram’s Next Generation of Business Leaders
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          The Malappuram Youth Business Forum (MYBF) was established to connect ambitious entrepreneurs, innovators, and professionals across the district into a unified, high-trust ecosystem.
        </p>
      </div>

      {/* Official Vision & Six Strategic Mission Pillars */}
      <VisionMissionSection />

      {/* 16 Chapters Decentralized Governance */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-8 sm:p-12 space-y-6">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Decentralized Chapter Structure
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-3xl">
          Rather than a centralized top-down committee, MYBF operates through 16 autonomous yet interconnected chapters covering Malappuram’s 7 taluks. Each chapter is led by an elected President, Secretary, and Treasurer who represent local community interests.
        </p>
        <div className="pt-2">
          <Link href="/chapters">
            <Button variant="outline" size="sm">
              Discover All 16 Chapters &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
