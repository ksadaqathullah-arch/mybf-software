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

import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';

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
      {/* Editorial Page Header */}
      <PortalPageHeader
        eyebrow="Mission Malappuram 2050 • Official Member Pass"
        title={`Welcome, ${memberProfile.fullName}`}
        description={`Permanent Member ID: ${memberProfile.membershipNumber} • Assigned to ${memberProfile.chapterName} • 100% Free Non-Profit Pass`}
        badgeText="ACTIVE MEMBER"
        actions={
          <>
            <Link href="/member/profile">
              <Button variant="default" size="sm" className="bg-blue hover:bg-blue/90 text-paper font-display uppercase tracking-wider text-xs">
                <User className="h-4 w-4 mr-1.5" /> Manage Profile
              </Button>
            </Link>
            <Link href="/member/membership/id-card">
              <Button variant="secondary" size="sm" className="font-display uppercase tracking-wider text-xs bg-yellow text-ink border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                <Award className="h-4 w-4 mr-1.5" /> Digital ID Card
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-display uppercase tracking-wider text-xs border-2 border-ink text-ink hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
          </>
        }
      />

      {/* Main Grid: Digital ID Card + Member Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Digital ID Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex justify-center p-6 border-2 border-ink bg-paper shadow-[6px_6px_0px_#14161c]">
            <DigitalIdCard card={memberProfile} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold text-ink/70 uppercase">
            <ShieldCheck className="h-4 w-4 text-blue" />
            <span>Cryptographic pass recognized across all 16 chapters</span>
          </div>
        </div>

        {/* Member Metrics & Chapter Link */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PortalStatCard
              label="Assigned Chapter"
              value={memberProfile.chapterName.replace(' Chapter', '')}
              subtext="Malappuram Constituency"
              color="blue"
            />
            <PortalStatCard
              label="Membership Standing"
              value="Active"
              subtext="100% Free NGO Pass"
              color="yellow"
            />
            <PortalStatCard
              label="Active Passes"
              value={registeredTickets.length}
              subtext="Confirmed Event Tickets"
              color="default"
            />
          </div>

          {/* Chapter Quick Access Editorial Banner */}
          <div className="border-2 border-ink bg-blue text-paper p-6 shadow-[6px_6px_0px_#14161c]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 border-2 border-ink bg-yellow text-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#14161c]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-yellow">Constituency Chapter</span>
                  <h3 className="font-display font-black text-xl text-paper uppercase tracking-tight">
                    {memberProfile.chapterName}
                  </h3>
                  <p className="font-serif italic text-xs text-paper/80 mt-0.5">
                    Monthly executive meetings & youth networking sessions
                  </p>
                </div>
              </div>
              <Link href={`/chapters/${memberProfile.chapterSlug}`}>
                <Button variant="secondary" size="sm" className="bg-yellow hover:bg-yellow/90 text-ink border-2 border-ink font-display uppercase tracking-wider text-xs whitespace-nowrap shadow-[2px_2px_0px_#14161c]">
                  Chapter Hub <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
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
