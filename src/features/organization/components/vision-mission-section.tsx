import * as React from 'react';
import {
  TrendingUp,
  Sparkles,
  Rocket,
  Cpu,
  Network,
  Globe,
  Target,
  Compass,
  Info,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MYBF_OFFICIAL_VISION,
  MYBF_MISSION_FRAMEWORK,
  type StrategicPillar,
} from '../constants/strategic-framework';

const PILLAR_ICONS = {
  TrendingUp,
  Sparkles,
  Rocket,
  Cpu,
  Network,
  Globe,
} as const;

/**
 * Official MYBF Strategic Vision Presentation Section
 */
export function VisionSection({ className = '' }: { className?: string }) {
  return (
    <section id="vision" className={`space-y-6 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-50/70 via-white to-amber-50/20 dark:from-[#0B132B] dark:via-[#070D1F] dark:to-[#040711] p-8 sm:p-12 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#035AFC]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-[#FBC206]/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary" className="px-3 py-1 text-xs">
              Official Vision
            </Badge>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Malappuram Youth Business Forum
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {MYBF_OFFICIAL_VISION.heading}
            </h2>
            <div className="h-1 w-16 bg-[#035AFC] rounded-full" />
          </div>

          <blockquote className="text-lg sm:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed tracking-normal">
            &ldquo;{MYBF_OFFICIAL_VISION.statement}&rdquo;
          </blockquote>

          {/* Strategic Anchors */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Building2 className="h-4 w-4 text-[#035AFC] shrink-0" />
              <span>Singapore &amp; Dubai Dynamism</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-[#FBC206] shrink-0" />
              <span>AI-Ready Youth &amp; Women Founders</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Scalable Enterprise &amp; Prosperity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Individual Strategic Mission Pillar Card
 */
export function MissionPillarCard({ pillar }: { pillar: StrategicPillar }) {
  const IconComponent = PILLAR_ICONS[pillar.iconName] || Compass;
  const paragraphs = pillar.strategicIntent.split('\n\n');

  return (
    <Card className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0A0F1D] shadow-sm hover:border-[#035AFC] dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 h-full group">
      <CardHeader className="p-6 pb-4 space-y-4">
        {/* Top Header Row: Icon + Pillar Number */}
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#035AFC] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#035AFC] group-hover:text-white transition-all">
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            {pillar.highlightBadge && (
              <Badge variant="secondary" className="text-[10px] py-0.5 px-2">
                {pillar.highlightBadge}
              </Badge>
            )}
            <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              PILLAR {String(pillar.number).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Pillar Title */}
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#035AFC] dark:group-hover:text-blue-400 transition-colors">
          {pillar.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
        {/* Strategic Intent Text */}
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p key={idx} className={idx === 0 && pillar.id === 'women-entrepreneurship' ? 'font-semibold text-slate-900 dark:text-white' : ''}>
              {p}
            </p>
          ))}
        </div>

        {/* Visible Disclaimer for Pillar 1 */}
        {pillar.disclaimer && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400/90 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium">{pillar.disclaimer}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Six Strategic Pillars Mission Grid Section
 */
export function MissionPillarsSection({ className = '' }: { className?: string }) {
  return (
    <section id="mission" className={`space-y-8 ${className}`}>
      {/* Section Title & Subtitle */}
      <div className="space-y-3 max-w-3xl">
        <Badge variant="primary">Strategic Framework</Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {MYBF_MISSION_FRAMEWORK.sectionTitle}
        </h2>
        <p className="text-base sm:text-lg font-medium text-[#035AFC] dark:text-blue-400">
          {MYBF_MISSION_FRAMEWORK.sectionSubtitle}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {MYBF_MISSION_FRAMEWORK.description}
        </p>
      </div>

      {/* 6 Strategic Pillars Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {MYBF_MISSION_FRAMEWORK.pillars.map((pillar) => (
          <MissionPillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}

/**
 * Consolidated Vision & Mission Section Component
 */
export function VisionMissionSection({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-16 ${className}`}>
      <VisionSection />
      <MissionPillarsSection />
    </div>
  );
}
