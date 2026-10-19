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
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  Check,
  Mail,
} from 'lucide-react';
import {
  VERIFIED_TALUKS,
  ALL_RESIDENTIAL_LOCAL_BODIES,
  VERIFIED_MUNICIPALITIES,
  VERIFIED_GRAMA_PANCHAYATS,
  VERIFIED_BLOCK_PANCHAYATS,
  DISTRICT_PANCHAYAT,
  type VerifiedLocalBody,
} from '@/features/geography/constants/malappuram-master-dataset';
import {
  VERIFIED_POSTAL_OFFICES,
  UNIQUE_MALAPPURAM_PIN_CODES,
  VERIFIED_LOCAL_BODY_PIN_LINKS,
  type VerifiedPostOffice,
} from '@/features/geography/constants/malappuram-postal-dataset';
import { NOTABLE_PIN_CODES } from '@/features/geography/constants/malappuram-geo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

interface DistrictGeographyViewProps {
  distribution: Array<{ taluk: string; memberCount: number }>;
}

export function DistrictGeographyView({ distribution }: DistrictGeographyViewProps) {
  const [selectedTaluk, setSelectedTaluk] = React.useState<string>('ALL');
  const [activeTab, setActiveTab] = React.useState<
    'ALL_LB' | 'MUNICIPALITIES' | 'PANCHAYATS' | 'BLOCKS' | 'POSTAL' | 'DUPLICATES' | 'AUDIT'
  >('ALL_LB');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
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

  const unassignedMembers = React.useMemo(() => {
    const unassigned = distribution.find((d) =>
      d.taluk.toLowerCase().includes('unassigned') || d.taluk.toLowerCase().includes('pending')
    );
    return unassigned ? unassigned.memberCount : 0;
  }, [distribution]);

  // Filtered residential local bodies
  const filteredLocalBodies = React.useMemo(() => {
    let list: VerifiedLocalBody[] = ALL_RESIDENTIAL_LOCAL_BODIES;

    if (activeTab === 'MUNICIPALITIES') {
      list = VERIFIED_MUNICIPALITIES;
    } else if (activeTab === 'PANCHAYATS') {
      list = VERIFIED_GRAMA_PANCHAYATS;
    }

    if (selectedTaluk !== 'ALL') {
      const normSelected = selectedTaluk.toLowerCase();
      const altSelected =
        normSelected === 'eranad' ? 'ernad' : normSelected === 'ernad' ? 'eranad' : normSelected;
      list = list.filter(
        (lb) =>
          lb.talukName.toLowerCase() === normSelected ||
          lb.talukName.toLowerCase() === altSelected
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (lb) =>
          lb.name.toLowerCase().includes(q) ||
          lb.talukName.toLowerCase().includes(q) ||
          (lb.blockPanchayat && lb.blockPanchayat.toLowerCase().includes(q)) ||
          lb.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, selectedTaluk, searchQuery]);

  // Filtered post offices
  const filteredPostOffices = React.useMemo(() => {
    let list = VERIFIED_POSTAL_OFFICES;

    if (selectedTaluk !== 'ALL') {
      const normSelected = selectedTaluk.toLowerCase();
      const altSelected =
        normSelected === 'eranad' ? 'ernad' : normSelected === 'ernad' ? 'eranad' : normSelected;
      list = list.filter(
        (po) =>
          po.talukName.toLowerCase() === normSelected ||
          po.talukName.toLowerCase() === altSelected
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (po) =>
          po.name.toLowerCase().includes(q) ||
          po.pinCode.includes(q) ||
          po.talukName.toLowerCase().includes(q) ||
          (po.localBodyName && po.localBodyName.toLowerCase().includes(q)) ||
          po.postalDivision.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedTaluk, searchQuery]);

  // Lookup PIN
  const handlePinLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!trimmed) return;

    const info = NOTABLE_PIN_CODES[trimmed];
    const poMatches = VERIFIED_POSTAL_OFFICES.filter((p) => p.pinCode === trimmed);

    if (poMatches.length > 0) {
      setPinResult({
        found: true,
        pinCode: trimmed,
        locality: poMatches.map((p) => p.name).join(', '),
        taluk: poMatches[0].talukName,
      });
    } else if (info) {
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
        message:
          'Postal code not in pre-indexed Malappuram registry. Manual verification permitted.',
      });
    }
  };

  // Export Local Bodies CSV
  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Local Body Name',
      'Local Body Type',
      'Taluk Coverage',
      'Block Panchayat',
      'Category',
      'Ward Status',
      'Verification Notes',
    ];
    const rows = ALL_RESIDENTIAL_LOCAL_BODIES.map((lb) => [
      lb.code,
      `"${lb.name}"`,
      lb.type,
      `"${lb.talukName}"`,
      `"${lb.blockPanchayat || 'None (Urban)'}"`,
      `"${lb.category}"`,
      '"Delimitation Pending"',
      `"${lb.notes || 'Verified Master Record'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Malappuram_Verified_Local_Bodies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Postal CSV
  const handleExportPostalCsv = () => {
    const headers = [
      'Post Office Code',
      'Post Office Name',
      'PIN Code',
      'Office Type',
      'Delivery Status',
      'Postal Division',
      'Taluk',
      'Mapped Local Body',
    ];
    const rows = VERIFIED_POSTAL_OFFICES.map((po) => [
      po.code,
      `"${po.name}"`,
      po.pinCode,
      po.officeType,
      po.deliveryStatus,
      `"${po.postalDivision}"`,
      `"${po.talukName}"`,
      `"${po.localBodyName || 'Cross-boundary / Multi-Locality'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Malappuram_Verified_Postal_Directory_${Date.now()}.csv`);
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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#035AFC]" /> Malappuram Location & Postal Management
            </h1>
            <Badge variant="primary">MALAPPURAM DISTRICT</Badge>
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            >
              <ShieldCheck className="h-3 w-3 mr-1 inline" /> 100% Database Driven
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative administrative hierarchy: District &rarr; 7 Taluks &rarr; 106 Residential Local Bodies &rarr; Wards (Pending Delimitation) &rarr; Postal Locality &rarr; PIN Code
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'POSTAL' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPostalCsv}
              className="h-8 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Postal Directory (CSV)
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-8 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Verified Master (CSV)
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Administrative Taluks
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {VERIFIED_TALUKS.length}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
            100% Verified in Database
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Residential Local Bodies
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {ALL_RESIDENTIAL_LOCAL_BODIES.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            12 Municipalities + 94 Panchayats
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Post Offices
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {VERIFIED_POSTAL_OFFICES.length}
          </span>
          <span className="text-[10px] text-[#035AFC] font-medium mt-0.5 block">
            {UNIQUE_MALAPPURAM_PIN_CODES.length} PIN Codes Mapped
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Postal Divisions
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">2</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Manjeri Div & Tirur Div
          </span>
        </div>
      </div>

      {/* 7 Taluks Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#035AFC]" /> 7 Administrative Taluks of Malappuram
          </h2>
          {selectedTaluk !== 'ALL' && (
            <button
              onClick={() => setSelectedTaluk('ALL')}
              className="text-[11px] font-semibold text-[#035AFC] hover:underline"
            >
              Show All Taluks
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {VERIFIED_TALUKS.map((t) => {
            const memberCount = countMap.get(t.name.toLowerCase()) || 0;
            const chaptersInTaluk = INITIAL_16_CHAPTERS.filter(
              (c) => c.taluk.toLowerCase() === t.name.toLowerCase()
            );
            const localBodiesInTaluk = ALL_RESIDENTIAL_LOCAL_BODIES.filter(
              (lb) => lb.talukName.toLowerCase() === t.name.toLowerCase()
            );
            const postOfficesInTaluk = VERIFIED_POSTAL_OFFICES.filter(
              (po) => po.talukName.toLowerCase() === t.name.toLowerCase()
            );
            const isSelected = selectedTaluk.toLowerCase() === t.name.toLowerCase();

            return (
              <div
                key={t.code}
                onClick={() => setSelectedTaluk(isSelected ? 'ALL' : t.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'border-[#035AFC] bg-[#035AFC]/5 dark:bg-[#035AFC]/10 shadow-sm ring-1 ring-[#035AFC]'
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
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-around text-[10px]">
                  <div>
                    <span className="font-bold text-[#035AFC] block">{localBodiesInTaluk.length}</span>
                    <span className="text-slate-400 text-[9px]">LBs</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      {postOfficesInTaluk.length}
                    </span>
                    <span className="text-slate-400 text-[9px]">POs</span>
                  </div>
                </div>
                <div className="mt-1 text-[9px] text-slate-500 font-medium">
                  {memberCount} Members
                </div>
              </div>
            );
          })}
        </div>

        {unassignedMembers > 0 && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <strong>{unassignedMembers} Member(s)</strong> have unassigned or pending taluk verification.
            </span>
            <Link href="/district-admin/members?taluk=ALL">
              <span className="text-[11px] font-semibold text-[#035AFC] hover:underline cursor-pointer">
                Review in Member Directory &rarr;
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant={activeTab === 'ALL_LB' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ALL_LB')}
            className="text-xs font-semibold"
          >
            All Local Bodies ({ALL_RESIDENTIAL_LOCAL_BODIES.length})
          </Button>
          <Button
            variant={activeTab === 'MUNICIPALITIES' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('MUNICIPALITIES')}
            className="text-xs font-semibold"
          >
            Municipalities ({VERIFIED_MUNICIPALITIES.length})
          </Button>
          <Button
            variant={activeTab === 'PANCHAYATS' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('PANCHAYATS')}
            className="text-xs font-semibold"
          >
            Panchayats ({VERIFIED_GRAMA_PANCHAYATS.length})
          </Button>
          <Button
            variant={activeTab === 'POSTAL' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('POSTAL')}
            className="text-xs font-semibold text-[#035AFC]"
          >
            <Mail className="h-3 w-3 mr-1 inline" /> Post Offices & PINs ({VERIFIED_POSTAL_OFFICES.length})
          </Button>
          <Button
            variant={activeTab === 'BLOCKS' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('BLOCKS')}
            className="text-xs font-semibold"
          >
            Blocks ({VERIFIED_BLOCK_PANCHAYATS.length})
          </Button>
          <Button
            variant={activeTab === 'DUPLICATES' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('DUPLICATES')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400"
          >
            <AlertCircle className="h-3 w-3 mr-1 inline" /> Duplicate Audit (1)
          </Button>
          <Button
            variant={activeTab === 'AUDIT' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('AUDIT')}
            className="text-xs font-semibold"
          >
            <Info className="h-3 w-3 mr-1 inline" /> Policies & Notes
          </Button>
        </div>

        {/* Real-time search */}
        {(activeTab === 'ALL_LB' ||
          activeTab === 'MUNICIPALITIES' ||
          activeTab === 'PANCHAYATS' ||
          activeTab === 'POSTAL') && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'POSTAL'
                  ? 'Search post office, PIN...'
                  : 'Search local body, taluk...'
              }
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#035AFC]"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT: POST OFFICES & PIN DIRECTORY */}
      {activeTab === 'POSTAL' && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#035AFC]" />
                  Verified India Post Directory of Malappuram
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredPostOffices.length} verified post offices across Manjeri & Tirur Postal Divisions
                </CardDescription>
              </div>

              {selectedTaluk !== 'ALL' && (
                <Badge variant="neutral" className="text-[10px] w-fit">
                  Filtered by: {selectedTaluk} Taluk
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Post Office Name</th>
                    <th className="py-2.5 px-4">PIN Code</th>
                    <th className="py-2.5 px-4">Office Type</th>
                    <th className="py-2.5 px-4">Postal Division</th>
                    <th className="py-2.5 px-4">Taluk</th>
                    <th className="py-2.5 px-4">Mapped Local Body</th>
                    <th className="py-2.5 px-4 text-right">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPostOffices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No post offices found matching &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredPostOffices.map((po) => (
                      <tr key={po.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div>{po.name}</div>
                          <div className="text-[9px] font-mono text-slate-400">{po.code}</div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-[#035AFC]">
                          {po.pinCode}
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge
                            variant={po.officeType === 'HO' ? 'primary' : 'secondary'}
                            className="text-[10px]"
                          >
                            {po.officeType === 'HO'
                              ? 'Head Office'
                              : po.officeType === 'SO'
                              ? 'Sub Office'
                              : 'Branch Office'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                          {po.postalDivision}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {po.talukName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {po.localBodyName || (
                            <span className="italic text-slate-400 text-[10px]">
                              Cross-boundary
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Badge
                            variant={po.deliveryStatus === 'Delivery' ? 'success' : 'neutral'}
                            className="text-[9px]"
                          >
                            {po.deliveryStatus}
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
      )}

      {/* TAB CONTENT: Residential Local Bodies */}
      {(activeTab === 'ALL_LB' || activeTab === 'MUNICIPALITIES' || activeTab === 'PANCHAYATS') && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#035AFC]" />
                  {activeTab === 'MUNICIPALITIES'
                    ? '12 Statutory Municipalities'
                    : activeTab === 'PANCHAYATS'
                    ? '94 Grama Panchayats'
                    : '106 Residential Local Bodies of Malappuram'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredLocalBodies.length} verified administrative units{' '}
                  {selectedTaluk !== 'ALL' ? `under ${selectedTaluk} Taluk` : 'across all 7 taluks'}
                </CardDescription>
              </div>

              {selectedTaluk !== 'ALL' && (
                <Badge variant="neutral" className="text-[10px] w-fit">
                  Filtered by: {selectedTaluk} Taluk
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Local Body Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Taluk Coverage</th>
                    <th className="py-2.5 px-4">Block Panchayat</th>
                    <th className="py-2.5 px-4">Ward Delimitation</th>
                    <th className="py-2.5 px-4 text-right">Related Chapter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLocalBodies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No local bodies found matching &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredLocalBodies.map((lb) => {
                      const matchingChapter =
                        INITIAL_16_CHAPTERS.find((c) =>
                          lb.name.toLowerCase().includes(c.name.toLowerCase().replace(' chapter', ''))
                        ) ||
                        INITIAL_16_CHAPTERS.find(
                          (c) => c.taluk.toLowerCase() === lb.talukName.toLowerCase()
                        );

                      return (
                        <tr key={lb.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{lb.name}</div>
                            <div className="text-[9px] font-mono text-slate-400">{lb.code}</div>
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant={lb.type === 'MUNICIPALITY' ? 'primary' : 'secondary'}
                              className="text-[10px]"
                            >
                              {lb.type === 'MUNICIPALITY' ? 'Municipality' : 'Grama Panchayat'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                            {lb.talukName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {lb.blockPanchayat ? (
                              <span className="text-[11px]">{lb.blockPanchayat}</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">None (Urban Body)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant="warning"
                              className="text-[9px] border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                            >
                              Pending Delimitation
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: Block Panchayats */}
      {activeTab === 'BLOCKS' && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#035AFC]" /> 15 Rural Development Block Panchayats
            </CardTitle>
            <CardDescription className="text-xs">
              Block Panchayats serve as intermediate rural local government tiers and are strictly separated from citizen residential address selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Block Code</th>
                    <th className="py-2.5 px-4">Block Panchayat Name</th>
                    <th className="py-2.5 px-4">Administrative Tier</th>
                    <th className="py-2.5 px-4">Constituent Panchayats</th>
                    <th className="py-2.5 px-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {VERIFIED_BLOCK_PANCHAYATS.map((bp) => {
                    const gpsUnderBlock = VERIFIED_GRAMA_PANCHAYATS.filter(
                      (gp) => gp.blockPanchayat?.toLowerCase() === bp.name.toLowerCase()
                    );
                    return (
                      <tr key={bp.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{bp.code}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{bp.name}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="secondary" className="text-[10px]">Intermediate Rural Tier</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                          <strong>{gpsUnderBlock.length}</strong> Grama Panchayats
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="h-3 w-3" /> Source Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: Duplicate Candidate Audit */}
      {activeTab === 'DUPLICATES' && (
        <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Source Duplicate Candidate Audit & Resolution
            </CardTitle>
            <CardDescription className="text-xs text-amber-700 dark:text-amber-400">
              Analysis of anomalous duplicate entries detected in the source workbook &quot;Malappuram_Local_Bodies_by_Taluk(1).xlsx&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-[#070A10] space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Candidate 1: Edappatta Grama Panchayat (Perinthalmanna Taluk)
                </div>
                <Badge variant="success" className="border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
                  Idempotently Resolved
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Source Workbook Rows</span>
                  <p className="mt-1 font-mono text-[11px]">
                    Row 39 & Row 40 in &quot;All Local Bodies&quot; sheet.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Listed twice under Perinthalmanna Taluk under different block references (Mankada vs Perinthalmanna Block).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">MYBF Database Resolution</span>
                  <p className="mt-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                    Canonical Code: LB-GP-EDAPPATTA
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Idempotent deduplication applied during import. Stored as exactly 1 residential local body record with Mankada Block coverage, preventing duplicate member registrations or foreign key collisions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: Source Notes & Integrity Policies */}
      {activeTab === 'AUDIT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-[#035AFC]" /> Source Verification Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="font-bold text-slate-900 dark:text-white">Kottakkal Municipality Note:</div>
                <p className="mt-1 text-slate-500">
                  Assigned to Tirur Taluk in official administrative revenue division records. Source notes verify that while parts of Kottakkal historically bordered Ernad and Tirurangadi revenue limits, its statutory local governance is verified under Tirur Taluk.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="font-bold text-slate-900 dark:text-white">Postal & Revenue Hierarchy:</div>
                <p className="mt-1 text-slate-500">
                  India Post operates Manjeri Postal Division and Tirur Postal Division across Malappuram district. Postal beats frequently cross panchayat boundaries, which MYBF respects by separating postal delivery lookups from statutory local bodies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-600">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Geographic Integrity Constraints
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                <strong>1. No Fabricated Wards:</strong> The Excel workbook does not contain ward delimitations. MYBF explicitly prevents inventing fake ward sequences (1 to 20) until authoritative State Election Commission delimitation data is imported.
              </p>
              <p>
                <strong>2. Postal Geography Disjunction:</strong> A PIN code represents an India Post sorting beat and does not strictly align with village or panchayat boundaries. A PIN code cannot automatically determine a local body or ward.
              </p>
              <p>
                <strong>3. Chapter vs Taluk Separation:</strong> MYBF chapters represent the 16 Kerala Legislative Assembly (MLA) constituencies. While every chapter is geographically mapped to a taluk, members are assigned to chapters via membership rules, not derived blindly from taluk.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Postal PIN Code Verification Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      <div>Post Office(s): <strong>{pinResult.locality}</strong></div>
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
              <Info className="h-4 w-4 text-amber-500" /> Administrative Governance & Location Audit Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p>
              <strong>1. Hierarchy Integrity:</strong> All members belong strictly to one of the 16 Assembly Constituency chapters in Malappuram. Each chapter maps deterministically to its administrative taluk.
            </p>
            <p>
              <strong>2. PIN Code Boundary Rules:</strong> Postal PIN codes cross local body boundaries and cover multiple panchayats or wards. A PIN code cannot be used to automatically fabricate or infer a ward assignment.
            </p>
            <p>
              <strong>3. Municipality / Local Body Oversight:</strong> Malappuram comprises 12 statutory municipalities and 94 grama panchayats. Ward-level corrections may only be verified through authorized administrative review.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
