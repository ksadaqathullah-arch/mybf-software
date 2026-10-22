'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Compass, Lightbulb, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface CommunityOpportunitiesCardProps {
  chapterName?: string;
}

export function CommunityOpportunitiesCard({ chapterName = 'Manjeri Chapter' }: CommunityOpportunitiesCardProps) {
  const opportunities = [
    {
      id: 'opp-1',
      title: 'Youth Mentorship Circle: Export & GCC Cross-Border Trade',
      category: 'Mentorship',
      icon: Compass,
      description: 'Connect 1-on-1 with senior Malappuram exporters who have scaled retail and logistics across Dubai, Saudi Arabia, and Qatar.',
      actionLabel: 'Connect with Mentor',
      badge: 'Active Opportunity',
    },
    {
      id: 'opp-2',
      title: 'MYBF Talent Incubator: Tech & Digital Venture Launchpad',
      category: 'Entrepreneurship',
      icon: Lightbulb,
      description: 'Prototype development and peer founder circle for young tech entrepreneurs in Malappuram. Access server credits and pitch feedback.',
      actionLabel: 'Apply for Incubator',
      badge: 'Applications Open',
    },
    {
      id: 'opp-3',
      title: 'Executive Skills Lab: Financial Modeling & Tax Compliance',
      category: 'Skill Development',
      icon: BookOpen,
      description: 'Weekend practical masterclass led by charter accountants on GST, cash flow forecasting, and company compliance for first-time founders.',
      actionLabel: 'Join Workshop',
      badge: 'Free Member Lab',
    },
    {
      id: 'opp-4',
      title: 'Chapter B2B Referral & Networking Breakfast',
      category: 'Networking',
      icon: Users,
      description: `Monthly in-person business referral exchange with fellow entrepreneurs of ${chapterName}. Share leads and explore joint projects.`,
      actionLabel: 'RSVP Next Session',
      badge: `${chapterName} Hub`,
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#035AFC]" />
            <CardTitle className="text-lg">Community Opportunities & Programs</CardTitle>
          </div>
          <Badge variant="primary">TAILORED FOR YOUTH</Badge>
        </div>
        <CardDescription className="text-xs">
          Exclusive programs, founder circles, and skill development opportunities across all 16 chapters of Malappuram district.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => {
            const Icon = opp.icon;
            return (
              <div
                key={opp.id}
                className="border-2 border-ink p-4 bg-paper flex flex-col justify-between space-y-3 shadow-[3px_3px_0px_#14161c]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="neutral" className="text-[10px]">{opp.category}</Badge>
                    <span className="text-[10px] font-mono font-bold text-blue uppercase">
                      {opp.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 border border-ink bg-yellow text-ink flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#14161c]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm text-ink uppercase tracking-tight leading-snug">
                        {opp.title}
                      </h4>
                      <p className="font-serif italic text-xs text-ink/70 mt-1 leading-relaxed">
                        {opp.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-ink/20 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-ink/60 uppercase">100% Free Member Access</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 font-display uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                    {opp.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
