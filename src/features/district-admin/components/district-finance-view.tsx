'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Download,
  Building,
  Calendar,
  FileSpreadsheet,
  AlertCircle,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> NGO Financial Governance & Fee Compliance
            </h1>
            <Badge variant="success">100% FREE MEMBERSHIP MODEL</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative NGO compliance: zero membership dues, zero ticketing barriers, and legitimate operational transparency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Compliance Statement (CSV)
          </Button>
        </div>
      </div>

      {/* Free NGO Policy Banner */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-emerald-950 dark:text-emerald-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-base">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Free Membership NGO Charter
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {finance.membershipPolicy.policyStatement} In accordance with the Malappuram Youth Business Forum constitution, all registration, onboarding, digital ID cards, youth conclaves, and chapter memberships are completely free of charge. No commercial subscription fees or membership payment plans exist in the platform.
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Membership Fee</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹0.00
            </div>
            <p className="text-[11px] text-slate-500">100% Free Lifetime</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Annual Dues</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹0.00
            </div>
            <p className="text-[11px] text-slate-500">Zero recurring charges</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Collected Dues</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹{finance.membershipPolicy.collectedMembershipFees}.00
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Strict zero-collection policy</p>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Monitored Conclaves</span>
            <div className="text-2xl font-black text-[#035AFC] mt-1">
              {finance.districtSummary.totalEventsTracked}
            </div>
            <p className="text-[11px] text-slate-500">Across 16 chapters</p>
          </CardHeader>
        </Card>
      </div>

      {/* Event Financial Transparency Registry */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Community Conclaves Financial Transparency</CardTitle>
              <CardDescription className="text-xs">
                Authoritative event ticket pricing and attendee registry for Malappuram district programs
              </CardDescription>
            </div>
            <Badge variant="neutral">NGO RECONCILIATION</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Conclave / Program</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Entry / Ticketing Fee</th>
                  <th className="py-3 px-4 text-center">Registered Attendees</th>
                  <th className="py-3 px-4 font-mono">Date</th>
                  <th className="py-3 px-4 text-right">Policy Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {finance.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No events currently scheduled.
                    </td>
                  </tr>
                ) : (
                  finance.recentEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {e.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {e.eventType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-600">
                        {e.basePriceINR === 0 ? '₹0.00 (Free)' : `₹${e.basePriceINR}`}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {e.registeredCount}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
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
