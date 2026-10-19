'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DigitalIdCard } from '@/features/membership-id-cards/components/digital-id-card';
import { MemberClassificationCard } from '@/features/memberships/components/member-classification-card';
import {
  YouthDiscoveryCard,
  type YouthDiscoveryData,
} from '@/features/memberships/components/youth-discovery-card';
import { EventBookingCard } from '@/features/events/components/event-booking-card';
import { MyTicketsCard, type TicketItem } from '@/features/events/components/my-tickets-card';
import { CommunityOpportunitiesCard } from '@/features/memberships/components/community-opportunities-card';
import { Building2, Award, ArrowRight, ShieldCheck, LogOut, Ticket, User } from 'lucide-react';
import type { MemberCategoryValue, CurrentPositionValue } from '@/features/memberships/constants/member-classifications';

export default function MemberDashboardPage() {
  const [memberProfile, setMemberProfile] = React.useState({
    fullName: 'Mohammed Anas',
    membershipNumber: 'MYBF-0000000001',
    chapterName: 'Manjeri Chapter',
    chapterSlug: 'manjeri',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER' as MemberCategoryValue,
    currentPosition: 'BUSINESS_OWNER' as CurrentPositionValue,
    status: 'ACTIVE' as const,
    issuedAt: 'Jan 2026',
    validUntil: 'Dec 2027',
    verificationToken: 'live-hmac-sha256-verified-token',
    youthData: {
      expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE', 'MENTORSHIP'],
      futureGoal: 'Establish a regional tech logistics hub in Manjeri and empower 20+ local youth.',
      talents: ['CODING', 'PRODUCT_DESIGN', 'PUBLIC_SPEAKING'],
      participationPreferences: ['PARTICIPATE_EVENTS', 'SHARE_EXPERTISE', 'COLLABORATE_BUSINESS_PROJECTS'],
    } as YouthDiscoveryData,
  });

  const [registeredTickets, setRegisteredTickets] = React.useState<TicketItem[]>([]);
  const [ticketRefreshTrigger, setTicketRefreshTrigger] = React.useState(0);

  // Load real authenticated member profile if available
  React.useEffect(() => {
    async function loadCurrentMember() {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.profile) {
            setMemberProfile((prev) => ({
              ...prev,
              fullName: data.profile.fullName || prev.fullName,
              membershipNumber: data.membership?.membershipNumber || prev.membershipNumber,
              chapterName: data.profile.chapter?.name || prev.chapterName,
              chapterSlug: data.profile.chapter?.slug || prev.chapterSlug,
              memberCategory: (data.profile.memberCategory as MemberCategoryValue) || prev.memberCategory,
              currentPosition: (data.profile.currentPosition as CurrentPositionValue) || prev.currentPosition,
              verificationToken: data.membership?.card?.verificationToken || prev.verificationToken,
              validUntil: data.membership?.validUntil
                ? new Date(data.membership.validUntil).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : prev.validUntil,
              youthData: {
                expectations: data.profile.expectations || prev.youthData.expectations,
                futureGoal: data.profile.futureGoal || prev.youthData.futureGoal,
                talents: data.profile.talents || prev.youthData.talents,
                participationPreferences: data.profile.participationPreferences || prev.youthData.participationPreferences,
              },
            }));
          }
        }
      } catch {
        // Fall back to pre-seeded state
      }
    }

    loadCurrentMember();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  };

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

  const handleTicketBooked = () => {
    setTicketRefreshTrigger((prev) => prev + 1);
  };

  const registeredEventIds = registeredTickets.map((t) => t.event.id);

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

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/member/profile">
            <Button variant="primary" size="sm" className="bg-[#035AFC] hover:bg-[#0248ca] text-white">
              <User className="h-4 w-4 mr-1.5" /> Manage Profile
            </Button>
          </Link>
          <Link href="/member/membership/id-card">
            <Button variant="secondary" size="sm">
              <Award className="h-4 w-4 mr-1.5" /> View Digital ID Card
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-rose-600">
            <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Grid: Digital ID Card + Member Metrics */}
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
                <CardTitle className="text-sm mt-1 text-[#035AFC]">{memberProfile.chapterName}</CardTitle>
                <p className="text-[11px] text-slate-500">Malappuram Constituency</p>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Tickets</span>
                <CardTitle className="text-sm mt-1 text-slate-900 dark:text-white">
                  {registeredTickets.length} Confirmed
                </CardTitle>
                <p className="text-[11px] text-slate-500">Free Event Passes</p>
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
                    <h3 className="font-bold text-base">Your Chapter Hub: {memberProfile.chapterName}</h3>
                    <p className="text-xs text-slate-500">Constituency Chapter • Monthly Executive Meeting</p>
                  </div>
                </div>
                <Link href={`/chapters/${memberProfile.chapterSlug}`}>
                  <Button variant="outline" size="sm">
                    Chapter Page <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
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

      {/* Upcoming Events & Free Ticket Booking */}
      <EventBookingCard
        registeredEventIds={registeredEventIds}
        onTicketBooked={handleTicketBooked}
      />

      {/* My Event Tickets */}
      <MyTicketsCard
        refreshTrigger={ticketRefreshTrigger}
        onTicketsLoaded={setRegisteredTickets}
      />

      {/* Community Opportunities & Programs */}
      <CommunityOpportunitiesCard chapterName={memberProfile.chapterName} />
    </div>
  );
}
