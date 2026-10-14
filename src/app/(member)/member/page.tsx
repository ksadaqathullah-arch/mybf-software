'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DigitalIdCard } from '@/features/membership-id-cards/components/digital-id-card';
import { MemberClassificationCard } from '@/features/memberships/components/member-classification-card';
import {
  YouthDiscoveryCard,
  type YouthDiscoveryData,
} from '@/features/memberships/components/youth-discovery-card';
import { Building2, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import type { MemberCategoryValue, CurrentPositionValue } from '@/features/memberships/constants/member-classifications';

export default function MemberDashboardPage() {
  const [memberProfile, setMemberProfile] = React.useState({
    fullName: 'Mohammed Anas',
    membershipNumber: 'MYBF-0000000001',
    chapterName: 'Manjeri Chapter',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER' as MemberCategoryValue,
    currentPosition: 'BUSINESS_OWNER' as CurrentPositionValue,
    status: 'ACTIVE' as const,
    issuedAt: 'Jan 2026',
    validUntil: 'Dec 2027',
    verificationToken: 'sample-live-verification-token-389172',
    youthData: {
      expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE', 'MENTORSHIP'],
      futureGoal: 'Establish a regional tech logistics hub in Manjeri and empower 20+ local youth.',
      talents: ['CODING', 'PRODUCT_DESIGN', 'PUBLIC_SPEAKING'],
      participationPreferences: ['PARTICIPATE_EVENTS', 'SHARE_EXPERTISE', 'COLLABORATE_BUSINESS_PROJECTS'],
    } as YouthDiscoveryData,
  });

  const handleClassificationSave = (category: MemberCategoryValue, position: CurrentPositionValue) => {
    setMemberProfile((prev) => ({
      ...prev,
      memberCategory: category,
      currentPosition: position,
    }));
  };

  const handleYouthDiscoverySave = (youthData: YouthDiscoveryData) => {
    setMemberProfile((prev) => ({
      ...prev,
      youthData,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome, {memberProfile.fullName}
            </h1>
            <Badge variant="success">ACTIVE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Permanent Member ID: <span className="font-mono font-bold text-[#035AFC]">{memberProfile.membershipNumber}</span> • {memberProfile.chapterName}
          </p>
        </div>

        <Link href="/member/membership/id-card">
          <Button variant="secondary" size="sm">
            <Award className="h-4 w-4 mr-1.5" /> View Digital ID Card
          </Button>
        </Link>
      </div>

      {/* Member Classification Profile Section */}
      <MemberClassificationCard
        initialCategory={memberProfile.memberCategory}
        initialPosition={memberProfile.currentPosition}
        onSave={handleClassificationSave}
      />

      {/* Youth Expectations, Talents & Participation Card */}
      <YouthDiscoveryCard
        initialData={memberProfile.youthData}
        onSave={handleYouthDiscoverySave}
      />

      {/* Main Grid: Card + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Digital ID Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <DigitalIdCard card={memberProfile} />
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Cryptographic pass recognized at all 16 chapters</span>
          </div>
        </div>

        {/* Member Metrics & Chapter Link */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Chapter</span>
                <CardTitle className="text-sm mt-1 text-[#035AFC]">Manjeri Chapter</CardTitle>
                <p className="text-[11px] text-slate-500">Ernad Taluk</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Membership Standing</span>
                <CardTitle className="text-sm mt-1 text-emerald-600">Active Member</CardTitle>
                <p className="text-[11px] text-slate-500">100% Free NGO Pass</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Event Attendance</span>
                <CardTitle className="text-sm mt-1 text-slate-900 dark:text-white">4 Summits</CardTitle>
                <p className="text-[11px] text-slate-500">100% Verified Scans</p>
              </CardHeader>
            </Card>
          </div>

          {/* Chapter Quick Access */}
          <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-[#035AFC] text-white flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Your Chapter Hub: Manjeri</h3>
                    <p className="text-xs text-slate-500">Next Monthly Executive Session: 24 Oct 2026</p>
                  </div>
                </div>
                <Link href="/chapters/manjeri">
                  <Button variant="outline" size="sm">
                    Chapter Page <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
