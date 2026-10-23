'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageHeader } from '@/components/ui/portal-elements';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PortalPageHeader
        tag={`${districtCode} CANONICAL SCOPE`}
        badge="District Administration"
        title="District Governance & Administrative Settings"
        description="Official district registry details, constituency coordination parameters, and RBAC boundary oversight."
      />

      {/* RBAC Boundary Lock Notice */}
      <div className="border-2 border-ink bg-blue/10 p-4 text-xs text-ink shadow-[3px_3px_0px_#14161c] flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-display font-black uppercase tracking-wider text-xs">Strict Role & Boundary Guardrails</div>
          <p className="text-ink/80 font-serif leading-relaxed">
            District Administrators manage constituency coordination and review applications across Malappuram’s 16 chapters. System role assignments, database security schemas, global fee policy, and final membership approvals are strictly reserved under Super Admin authority.
          </p>
        </div>
      </div>

      {/* District Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Identity */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <Building className="h-5 w-5 text-blue" /> District Authority Metadata
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Authoritative geographical and administrative parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="p-4 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c] space-y-2.5">
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60 font-serif">District Name</span>
                <span className="font-bold text-ink font-sans">{districtName}</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60 font-serif">District Code</span>
                <span className="font-mono font-bold text-blue">{districtCode}</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60 font-serif">Headquarters</span>
                <span className="font-bold text-ink">Civil Station, Malappuram</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60 font-serif">Constituency Chapters</span>
                <span className="font-bold text-ink">16 Assembly Chapters</span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-2">
                <span className="text-ink/60 font-serif">Administrative Taluks</span>
                <span className="font-bold text-ink">7 Taluks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60 font-serif">Urban Municipalities</span>
                <span className="font-bold text-ink">12 Municipalities</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-ink/60 font-mono">
              Session Authenticated as: <strong className="text-ink">{adminEmail}</strong>
            </div>
          </CardContent>
        </Card>

        {/* Coordination Preferences */}
        <Card>
          <CardHeader className="p-5 pb-3 border-b-2 border-ink">
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow" /> Chapter Coordination Preferences
            </CardTitle>
            <CardDescription className="text-xs text-ink/70 font-serif mt-1">
              Configure communication cadence and district meeting protocols
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink">
                  District Official Contact Email:
                </label>
                <input
                  type="email"
                  defaultValue="district.admin@mybf.in"
                  className="w-full px-3 py-1.5 border-2 border-ink bg-paper text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-wider text-ink">
                  Official Phone / Helpline:
                </label>
                <input
                  type="text"
                  defaultValue="+91 483 273 0000"
                  className="w-full px-3 py-1.5 border-2 border-ink bg-paper text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-ink/10">
                <label className="flex items-center gap-2 text-ink font-serif cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blue h-4 w-4 border-2 border-ink rounded-none" />
                  <span>Notify District Admin when chapter applications exceed 10 pending</span>
                </label>
                <label className="flex items-center gap-2 text-ink font-serif cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blue h-4 w-4 border-2 border-ink rounded-none" />
                  <span>Enable automatic monthly constituency progress digests</span>
                </label>
              </div>

              {saveStatus && (
                <div className="p-2.5 border-2 border-ink bg-emerald-100 text-emerald-950 font-bold text-xs">
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
