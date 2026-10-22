'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Download,
  Building,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
  Coins,
} from 'lucide-react';

export interface DistrictFinanceData {
  membershipPolicy: {
    isFree: boolean;
    policyStatement: string;
    collectedMembershipFees: number;
  };
  districtSummary: {
    districtName: string;
    districtCode: string;
    totalChapters: number;
    totalEventsTracked: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    eventType: string;
    basePriceINR: number;
    registeredCount: number;
    startsAt: string;
  }>;
}

interface DistrictFinanceViewProps {
  finance: DistrictFinanceData;
}

export function DistrictFinanceView({ finance }: DistrictFinanceViewProps) {
  const handleExportCsv = () => {
    const lines = [
      `"MYBF Malappuram District NGO Financial & Fee Compliance Statement"`,
      `"District: ${finance.districtSummary.districtName} (${finance.districtSummary.districtCode})"`,
      `"Policy: 100% Free Membership NGO Model. Zero membership dues."`,
      `"Generated At: ${new Date().toISOString()}"`,
      ``,
      `"Policy Audits"`,
      `"Parameter","Value","Compliance"`,
      `"Membership Application Fee","0.00 INR","100% Compliant (Free)"`,
      `"Annual Membership Dues","0.00 INR","100% Compliant (Free)"`,
      `"Digital ID Card Generation Fee","0.00 INR","100% Compliant (Free)"`,
      `"Total Collected Membership Dues","${finance.membershipPolicy.collectedMembershipFees}.00 INR","Verified Zero"`,
      ``,
      `"Tracked Conclaves & Community Programs"`,
      `"Event Title","Type","Ticketing Price (INR)","Registered Attendees","Schedule"`,
      ...finance.recentEvents.map(
        (e) => `"${e.title}","${e.eventType}",${e.basePriceINR},${e.registeredCount},"${e.startsAt}"`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_NGO_Finance_Compliance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag="100% FREE MEMBERSHIP MODEL"
        badge="Financial Governance"
        title="NGO Financial Governance & Fee Compliance"
        description="Authoritative NGO compliance: zero membership dues, zero ticketing barriers, and operational transparency."
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Compliance Statement (CSV)
          </Button>
        }
      />

      {/* Free NGO Policy Banner */}
      <div className="border-2 border-ink bg-emerald-50 text-ink p-5 shadow-[4px_4px_0px_#14161c] space-y-2">
        <div className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-wider text-emerald-950">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" /> Free Membership NGO Charter
        </div>
        <p className="text-xs text-ink/80 font-serif leading-relaxed">
          {finance.membershipPolicy.policyStatement} In accordance with the Malappuram Youth Business Forum constitution, all registration, onboarding, digital ID cards, youth conclaves, and chapter memberships are completely free of charge. No commercial subscription fees or membership payment plans exist in the platform.
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Membership Fee"
          value="₹0.00"
          subValue="100% Free Lifetime"
          icon={Coins}
        />

        <PortalStatCard
          label="Annual Dues"
          value="₹0.00"
          subValue="Zero recurring charges"
          icon={Coins}
        />

        <PortalStatCard
          label="Collected Dues"
          value={`₹${finance.membershipPolicy.collectedMembershipFees}.00`}
          subValue="Strict zero-collection policy"
          icon={ShieldCheck}
        />

        <PortalStatCard
          label="Monitored Conclaves"
          value={finance.districtSummary.totalEventsTracked}
          subValue="Across 16 chapters"
          icon={Calendar}
        />
      </div>

      {/* Event Financial Transparency Registry */}
      <Card>
        <CardHeader className="p-5 pb-3 border-b-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">Community Conclaves Financial Transparency</CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Authoritative event ticket pricing and attendee registry for Malappuram district programs
            </CardDescription>
          </div>
          <Badge variant="neutral">NGO RECONCILIATION</Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="border-b-2 border-ink bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Conclave / Program</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Entry / Ticketing Fee</th>
                  <th className="py-3 px-4 text-center">Registered Attendees</th>
                  <th className="py-3 px-4 font-mono">Date</th>
                  <th className="py-3 px-4 text-right">Policy Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                {finance.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink/50 font-serif italic text-sm">
                      No events currently scheduled.
                    </td>
                  </tr>
                ) : (
                  finance.recentEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-yellow/10 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink font-sans text-xs">
                        {e.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {e.eventType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-800 font-mono">
                        {e.basePriceINR === 0 ? '₹0.00 (Free)' : `₹${e.basePriceINR}`}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-ink font-mono">
                        {e.registeredCount}
                      </td>
                      <td className="py-3 px-4 text-ink/70 font-mono text-[11px]">
                        {e.startsAt.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="success" className="text-[10px]">
                          NGO COMPLIANT
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
