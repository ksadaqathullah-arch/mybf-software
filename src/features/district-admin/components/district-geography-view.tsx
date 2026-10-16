'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Building,
  Search,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  TALUKS_OF_MALAPPURAM,
  MUNICIPALITIES_OF_MALAPPURAM,
  NOTABLE_PIN_CODES,
  type LocalBodyGeo,
} from '@/features/geography/constants/malappuram-geo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

interface DistrictGeographyViewProps {
  distribution: Array<{ taluk: string; memberCount: number }>;
}

export function DistrictGeographyView({ distribution }: DistrictGeographyViewProps) {
  const [selectedTaluk, setSelectedTaluk] = React.useState<string>('ALL');
  const [pinInput, setPinInput] = React.useState<string>('');
  const [pinResult, setPinResult] = React.useState<{
    found: boolean;
    pinCode: string;
    locality?: string;
    taluk?: string;
    message?: string;
  } | null>(null);

  // Map taluk distribution counts
  const countMap = React.useMemo(() => {
    const map = new Map<string, number>();
    distribution.forEach((d) => {
      map.set(d.taluk.toLowerCase(), d.memberCount);
    });
    return map;
  }, [distribution]);

  // Filter municipalities
  const filteredLocalBodies = React.useMemo(() => {
    if (selectedTaluk === 'ALL') return MUNICIPALITIES_OF_MALAPPURAM;
    return MUNICIPALITIES_OF_MALAPPURAM.filter(
      (m) => m.taluk.toLowerCase() === selectedTaluk.toLowerCase()
    );
  }, [selectedTaluk]);

  // Lookup PIN
  const handlePinLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!trimmed) return;

    const info = NOTABLE_PIN_CODES[trimmed];
    if (info) {
      setPinResult({
        found: true,
        pinCode: trimmed,
        locality: info.locality,
        taluk: info.taluk,
      });
    } else {
      setPinResult({
        found: false,
        pinCode: trimmed,
        message: 'Postal code not in verified Malappuram database. Local body and ward require manual administrative verification.',
      });
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Taluk Name', 'Code', 'Headquarters', 'Constituency Chapters', 'Local Municipalities', 'Verified Members'];
    const rows = TALUKS_OF_MALAPPURAM.map((t) => {
      const chaptersInTaluk = INITIAL_16_CHAPTERS.filter((c) => c.taluk.toLowerCase() === t.name.toLowerCase()).map((c) => c.name);
      const municipalities = MUNICIPALITIES_OF_MALAPPURAM.filter((m) => m.taluk.toLowerCase() === t.name.toLowerCase()).map((m) => m.name);
      const members = countMap.get(t.name.toLowerCase()) || 0;
      return [
        t.name,
        t.code,
        t.headquarters,
        `"${chaptersInTaluk.join(', ')}"`,
        `"${municipalities.join(', ')}"`,
        members,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Malappuram_Geography_Report_${Date.now()}.csv`);
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
              <MapPin className="h-6 w-6 text-[#035AFC]" /> Taluk Geography & Administrative Boundaries
            </h1>
            <Badge variant="primary">MALAPPURAM DISTRICT</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative geographical hierarchy: Country &rarr; State &rarr; District &rarr; 7 Taluks &rarr; Municipalities/Local Bodies &rarr; 16 Constituencies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Geography (CSV)
          </Button>
        </div>
      </div>

      {/* 7 Taluks Summary Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#035AFC]" /> 7 Administrative Taluks of Malappuram
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {TALUKS_OF_MALAPPURAM.map((t) => {
            const memberCount = countMap.get(t.name.toLowerCase()) || 0;
            const chaptersInTaluk = INITIAL_16_CHAPTERS.filter(
              (c) => c.taluk.toLowerCase() === t.name.toLowerCase()
            );
            const isSelected = selectedTaluk.toLowerCase() === t.name.toLowerCase();

            return (
              <div
                key={t.code}
                onClick={() => setSelectedTaluk(isSelected ? 'ALL' : t.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'border-[#035AFC] bg-[#035AFC]/5 dark:bg-[#035AFC]/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] hover:border-slate-300'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t.code}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  HQ: {t.headquarters}
                </span>
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="font-extrabold text-[#035AFC]">{memberCount}</span>
                  <span className="text-[9px] text-slate-400 block">Members</span>
                </div>
                <div className="mt-1 text-[9px] text-slate-500 font-medium">
                  {chaptersInTaluk.length} {chaptersInTaluk.length === 1 ? 'Chapter' : 'Chapters'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIN Code Verification Intelligence & Safe Boundary Guideline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Safe Postal Verification Form */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="h-4 w-4 text-[#035AFC]" /> Postal PIN Code Resolver
            </CardTitle>
            <CardDescription className="text-xs">
              Verify locality and taluk for postal code without assuming unique ward association.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <form onSubmit={handlePinLookup} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 676121"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
                />
                <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold px-3">
                  Verify
                </Button>
              </div>

              {pinResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    pinResult.found
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                      : 'border-amber-200 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {pinResult.found ? (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> PIN {pinResult.pinCode} Verified
                      </div>
                      <div>Locality: <strong>{pinResult.locality}</strong></div>
                      <div>Assigned Taluk: <strong>{pinResult.taluk}</strong></div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        Ward must be assigned through verified residential documentation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" /> {pinResult.message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Geographic Integrity Policy Box */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-500" /> Geographic Governance & Integrity Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p>
              <strong>1. Hierarchy Integrity:</strong> All members belong strictly to one of the 16 Assembly Constituency chapters in Malappuram. Each chapter maps deterministically to its administrative taluk.
            </p>
            <p>
              <strong>2. PIN Code Boundary Rules:</strong> Postal PIN codes may cross local body boundaries and cover multiple panchayats or wards. A PIN code cannot be used to automatically fabricate or infer a ward assignment.
            </p>
            <p>
              <strong>3. Municipality / Local Body Oversight:</strong> Malappuram comprises 12 statutory municipalities and 94 grama panchayats. Ward-level corrections may only be verified through authorized administrative review.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Local Bodies & Chapter Mapping Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">12 Municipalities & Urban Local Bodies</CardTitle>
              <CardDescription className="text-xs">
                Authoritative urban local bodies across the 7 taluks of Malappuram district
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                aria-label="Filter Municipalities by Taluk"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1 text-xs text-slate-900 dark:text-white"
              >
                <option value="ALL">All Taluks (7)</option>
                {TALUKS_OF_MALAPPURAM.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Local Body Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Taluk</th>
                  <th className="py-3 px-4">Primary Postal PINs</th>
                  <th className="py-3 px-4 text-right">Related Chapter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLocalBodies.map((lb) => {
                  const matchingChapter = INITIAL_16_CHAPTERS.find(
                    (c) => lb.name.toLowerCase().includes(c.name.toLowerCase().replace(' chapter', ''))
                  ) || INITIAL_16_CHAPTERS.find((c) => c.taluk.toLowerCase() === lb.taluk.toLowerCase());

                  return (
                    <tr key={lb.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {lb.name}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {lb.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {lb.taluk}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {lb.majorPinCodes.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {matchingChapter ? (
                          <Link href={`/district-admin/chapters`}>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-[#035AFC]">
                              {matchingChapter.name} <ArrowRight className="h-2.5 w-2.5 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Constituency Mapped</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
