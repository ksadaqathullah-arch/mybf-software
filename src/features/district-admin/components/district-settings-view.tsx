'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DistrictSettingsViewProps {
  districtName: string;
  districtCode: string;
  adminEmail: string;
}

export function DistrictSettingsView({
  districtName,
  districtCode,
  adminEmail,
}: DistrictSettingsViewProps) {
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('District coordination preferences saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#035AFC]" /> District Governance & Administrative Settings
            </h1>
            <Badge variant="primary">{districtCode} CANONICAL SCOPE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official district registry details, constituency coordination parameters, and RBAC boundary oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/super-admin">
            <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Super Admin Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* RBAC Boundary Lock Notice */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Lock className="h-5 w-5 text-[#035AFC] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Strict Role & Boundary Guardrails</div>
          <p className="text-slate-600 dark:text-slate-300">
            District Administrators manage constituency coordination and review applications across Malappuram’s 16 chapters. System role assignments, database security schemas, global fee policy, and final membership approvals are strictly reserved under Super Admin authority.
          </p>
        </div>
      </div>

      {/* District Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Identity */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-[#035AFC]" /> District Authority Metadata
            </CardTitle>
            <CardDescription className="text-xs">
              Authoritative geographical and administrative parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">District Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{districtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">District Code</span>
                <span className="font-mono font-bold text-[#035AFC]">{districtCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Headquarters</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Civil Station, Malappuram</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Constituency Chapters</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">16 Assembly Chapters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Administrative Taluks</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">7 Taluks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Urban Municipalities</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">12 Municipalities</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              Session Authenticated as: <strong className="text-slate-700 dark:text-slate-300">{adminEmail}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Coordination Preferences */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#FBC206]" /> Chapter Coordination Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Configure communication cadence and district meeting protocols
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  District Official Contact Email:
                </label>
                <input
                  type="email"
                  defaultValue="district.admin@mybf.in"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Official Phone / Helpline:
                </label>
                <input
                  type="text"
                  defaultValue="+91 483 273 0000"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#035AFC] focus:ring-[#035AFC]" />
                  <span>Notify District Admin when chapter applications exceed 10 pending</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#035AFC] focus:ring-[#035AFC]" />
                  <span>Enable automatic monthly constituency progress digests</span>
                </label>
              </div>

              {saveStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 font-medium">
                  {saveStatus}
                </div>
              )}

              <div className="pt-2 text-right">
                <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold">
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
