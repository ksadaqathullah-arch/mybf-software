import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Compass, Award, ShieldCheck, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">About MYBF</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Empowering Malappuram’s Next Generation of Business Leaders
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          The Malappuram Youth Business Forum (MYBF) was established to connect ambitious entrepreneurs, innovators, and professionals across the district into a unified, high-trust ecosystem.
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#035AFC] flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Strategic Vision</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Build an inclusive, measurable, and digitally connected ecosystem for youth entrepreneurship and professional collaboration across Malappuram and beyond.
          </p>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-[#FBC206] flex items-center justify-center">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Equip MYBF chapters and members with trusted identities, accessible programmes, useful business connections, and transparent organizational administration.
          </p>
        </Card>
      </div>

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
