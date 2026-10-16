'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  RotateCcw,
  Building2,
  MapPin,
  Award,
  Briefcase,
  Layers,
  Target,
  Palette,
  Users2,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';
import {
  EXPECTATION_OPTIONS,
  ALL_TALENT_OPTIONS,
  PARTICIPATION_PREFERENCES,
  getExpectationLabel,
  getTalentLabel,
  getParticipationPreferenceLabel,
} from '@/features/memberships/constants/youth-discovery';

export interface DistrictMemberRecord {
  id: string;
  membershipNumber: string;
  fullName: string;
  chapterSlug: string;
  chapterName: string;
  taluk: string;
  memberCategory: MemberCategoryValue | null;
  currentPosition: CurrentPositionValue | null;
  expectations: string[];
  talents: string[];
  participationPreferences: string[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joinedDate: string;
}

// Representative district roster dataset across 16 chapters and 7 taluks
const INITIAL_DISTRICT_MEMBERS: DistrictMemberRecord[] = [
  {
    id: 'm-1',
    membershipNumber: 'MYBF-0000000001',
    fullName: 'Mohammed Anas',
    chapterSlug: 'manjeri',
    chapterName: 'Manjeri Chapter',
    taluk: 'Ernad',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
    currentPosition: 'BUSINESS_OWNER',
    expectations: ['NETWORKING_CONNECTIONS', 'STARTUP_GUIDANCE', 'MENTORSHIP'],
    talents: ['CODING', 'PRODUCT_DESIGN', 'PUBLIC_SPEAKING'],
    participationPreferences: ['COLLABORATE_BUSINESS_PROJECTS', 'SHARE_EXPERTISE', 'PARTICIPATE_EVENTS'],
    status: 'ACTIVE',
    joinedDate: '2026-01-15',
  },
  {
    id: 'm-2',
    membershipNumber: 'MYBF-0000000002',
    fullName: 'Dr. Fathima Zahra',
    chapterSlug: 'perinthalmanna',
    chapterName: 'Perinthalmanna Chapter',
    taluk: 'Perinthalmanna',
    memberCategory: 'ASPIRING_ENTREPRENEUR',
    currentPosition: 'EMPLOYEE',
    expectations: ['STARTUP_GUIDANCE', 'INVESTOR_FUNDING', 'FIND_LIKE_MINDED_YOUTH'],
    talents: ['PUBLIC_SPEAKING', 'LEADERSHIP'],
    participationPreferences: ['LEARN_FROM_PROFESSIONALS', 'JOIN_NETWORKING_COMMUNITIES'],
    status: 'ACTIVE',
    joinedDate: '2026-02-10',
  },
  {
    id: 'm-3',
    membershipNumber: 'MYBF-0000000003',
    fullName: 'Rashid K.',
    chapterSlug: 'malappuram',
    chapterName: 'Malappuram Chapter',
    taluk: 'Ernad',
    memberCategory: 'STUDENT',
    currentPosition: 'STUDENT',
    expectations: ['CAREER_GUIDANCE_JOBS', 'SKILL_DEVELOPMENT_TRAINING'],
    talents: ['CODING', 'ROBOTICS', 'FOOTBALL'],
    participationPreferences: ['VOLUNTEER_ACTIVITIES', 'JOIN_SPORTS_RECREATION'],
    status: 'ACTIVE',
    joinedDate: '2026-03-01',
  },
  {
    id: 'm-4',
    membershipNumber: 'MYBF-0000000004',
    fullName: 'Sufiyan K.P',
    chapterSlug: 'tirur',
    chapterName: 'Tirur Chapter',
    taluk: 'Tirur',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
    currentPosition: 'ENTREPRENEUR',
    expectations: ['BUSINESS_LEADS_COLLABORATION', 'INVESTOR_FUNDING'],
    talents: ['DIGITAL_MARKETING', 'CONTENT_CREATION'],
    participationPreferences: ['COLLABORATE_BUSINESS_PROJECTS', 'ORGANIZE_PROGRAMS_EVENTS'],
    status: 'ACTIVE',
    joinedDate: '2026-01-20',
  },
  {
    id: 'm-5',
    membershipNumber: 'MYBF-0000000005',
    fullName: 'Hameed C.V',
    chapterSlug: 'kondotty',
    chapterName: 'Kondotty Chapter',
    taluk: 'Kondotty',
    memberCategory: 'OTHER',
    currentPosition: 'SELF_EMPLOYED',
    expectations: ['NETWORKING_CONNECTIONS', 'COMMUNITY_SOCIAL_IMPACT'],
    talents: ['COMMUNITY_VOLUNTEERING', 'EVENT_ORGANIZING'],
    participationPreferences: ['VOLUNTEER_ACTIVITIES', 'SOCIAL_IMPACT_INITIATIVES'],
    status: 'ACTIVE',
    joinedDate: '2026-02-18',
  },
  {
    id: 'm-6',
    membershipNumber: 'MYBF-0000000006',
    fullName: 'Zainab Thasneem',
    chapterSlug: 'ponnani',
    chapterName: 'Ponnani Chapter',
    taluk: 'Ponnani',
    memberCategory: 'ASPIRING_ENTREPRENEUR',
    currentPosition: 'WORKER',
    expectations: ['STARTUP_GUIDANCE', 'MENTORSHIP', 'CREATIVE_TALENT_OPPORTUNITIES'],
    talents: ['SINGING', 'WRITING', 'PHOTOGRAPHY'],
    participationPreferences: ['PERFORM_CULTURAL_TALENT', 'PARTICIPATE_EVENTS'],
    status: 'ACTIVE',
    joinedDate: '2026-03-12',
  },
  {
    id: 'm-7',
    membershipNumber: 'MYBF-0000000007',
    fullName: 'Nabeel P.T',
    chapterSlug: 'nilambur',
    chapterName: 'Nilambur Chapter',
    taluk: 'Nilambur',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
    currentPosition: 'BUSINESS_OWNER',
    expectations: ['NETWORKING_CONNECTIONS', 'BUSINESS_LEADS_COLLABORATION'],
    talents: ['BADMINTON', 'LEADERSHIP'],
    participationPreferences: ['JOIN_SPORTS_RECREATION', 'SHARE_EXPERTISE'],
    status: 'ACTIVE',
    joinedDate: '2026-01-25',
  },
  {
    id: 'm-8',
    membershipNumber: 'MYBF-0000000008',
    fullName: 'Aiswarya Menon',
    chapterSlug: 'tirurangadi',
    chapterName: 'Tirurangadi Chapter',
    taluk: 'Tirurangadi',
    memberCategory: 'STUDENT',
    currentPosition: 'STUDENT',
    expectations: ['SKILL_DEVELOPMENT_TRAINING', 'EVENTS_WORKSHOPS_EXPOSURE'],
    talents: ['DANCE', 'PUBLIC_SPEAKING', 'EVENT_HOSTING'],
    participationPreferences: ['PERFORM_CULTURAL_TALENT', 'PARTICIPATE_EVENTS'],
    status: 'ACTIVE',
    joinedDate: '2026-02-28',
  },
  {
    id: 'm-9',
    membershipNumber: 'MYBF-0000000009',
    fullName: 'Abdul Kareem (Historical Record)',
    chapterSlug: 'kottakkal',
    chapterName: 'Kottakkal Chapter',
    taluk: 'Tirur',
    memberCategory: null, // Historical unclassified
    currentPosition: null, // Historical unclassified
    expectations: [],
    talents: [],
    participationPreferences: [],
    status: 'ACTIVE',
    joinedDate: '2025-11-05',
  },
  {
    id: 'm-10',
    membershipNumber: 'MYBF-0000000010',
    fullName: 'Vipin Das',
    chapterSlug: 'thavanur',
    chapterName: 'Thavanur Chapter',
    taluk: 'Ponnani',
    memberCategory: 'OTHER',
    currentPosition: 'OTHER',
    expectations: ['FIND_LIKE_MINDED_YOUTH', 'COMMUNITY_SOCIAL_IMPACT'],
    talents: ['VIDEOGRAPHY', 'GRAPHIC_DESIGN'],
    participationPreferences: ['VOLUNTEER_ACTIVITIES', 'SOCIAL_IMPACT_INITIATIVES'],
    status: 'ACTIVE',
    joinedDate: '2026-03-05',
  },
];

export interface DistrictClassificationAnalyticsProps {
  initialMembers?: DistrictMemberRecord[];
}

export function DistrictClassificationAnalytics({ initialMembers }: DistrictClassificationAnalyticsProps = {}) {
  const [members] = React.useState<DistrictMemberRecord[]>(() => {
    if (initialMembers && initialMembers.length > 0) return initialMembers;
    return INITIAL_DISTRICT_MEMBERS;
  });
  const [chapterFilter, setChapterFilter] = React.useState<string>('ALL');
  const [talukFilter, setTalukFilter] = React.useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [positionFilter, setPositionFilter] = React.useState<string>('ALL');
  const [expectationFilter, setExpectationFilter] = React.useState<string>('ALL');
  const [talentFilter, setTalentFilter] = React.useState<string>('ALL');
  const [participationFilter, setParticipationFilter] = React.useState<string>('ALL');

  // Filtered dataset
  const filteredMembers = React.useMemo(() => {
    return members.filter((m) => {
      if (chapterFilter !== 'ALL' && m.chapterSlug !== chapterFilter) return false;
      if (talukFilter !== 'ALL' && m.taluk !== talukFilter) return false;
      if (categoryFilter !== 'ALL') {
        if (categoryFilter === 'UNCLASSIFIED') {
          if (m.memberCategory !== null) return false;
        } else if (m.memberCategory !== categoryFilter) {
          return false;
        }
      }
      if (positionFilter !== 'ALL') {
        if (positionFilter === 'UNCLASSIFIED') {
          if (m.currentPosition !== null) return false;
        } else if (m.currentPosition !== positionFilter) {
          return false;
        }
      }
      if (expectationFilter !== 'ALL' && !m.expectations.includes(expectationFilter)) return false;
      if (talentFilter !== 'ALL' && !m.talents.includes(talentFilter)) return false;
      if (participationFilter !== 'ALL' && !m.participationPreferences.includes(participationFilter)) return false;
      return true;
    });
  }, [
    members,
    chapterFilter,
    talukFilter,
    categoryFilter,
    positionFilter,
    expectationFilter,
    talentFilter,
    participationFilter,
  ]);

  // Aggregate Category Distribution
  const categoryStats = React.useMemo(() => {
    const counts: Record<string, number> = {
      STUDENT: 0,
      ASPIRING_ENTREPRENEUR: 0,
      ENTREPRENEUR_BUSINESS_OWNER: 0,
      OTHER: 0,
      UNCLASSIFIED: 0,
    };
    for (const m of filteredMembers) {
      if (m.memberCategory) {
        counts[m.memberCategory] = (counts[m.memberCategory] || 0) + 1;
      } else {
        counts.UNCLASSIFIED += 1;
      }
    }
    const total = filteredMembers.length;
    return [
      { key: 'STUDENT', label: 'Students', count: counts.STUDENT, pct: total ? Math.round((counts.STUDENT / total) * 100) : 0, color: 'bg-blue-500' },
      { key: 'ASPIRING_ENTREPRENEUR', label: 'Interested in Starting a Business', count: counts.ASPIRING_ENTREPRENEUR, pct: total ? Math.round((counts.ASPIRING_ENTREPRENEUR / total) * 100) : 0, color: 'bg-emerald-500' },
      { key: 'ENTREPRENEUR_BUSINESS_OWNER', label: 'Entrepreneurs / Business Owners', count: counts.ENTREPRENEUR_BUSINESS_OWNER, pct: total ? Math.round((counts.ENTREPRENEUR_BUSINESS_OWNER / total) * 100) : 0, color: 'bg-amber-500' },
      { key: 'OTHER', label: 'Other', count: counts.OTHER, pct: total ? Math.round((counts.OTHER / total) * 100) : 0, color: 'bg-purple-500' },
      { key: 'UNCLASSIFIED', label: 'Unclassified (Historical)', count: counts.UNCLASSIFIED, pct: total ? Math.round((counts.UNCLASSIFIED / total) * 100) : 0, color: 'bg-slate-400' },
    ];
  }, [filteredMembers]);

  // Aggregate Position Distribution
  const positionStats = React.useMemo(() => {
    const counts: Record<string, number> = {
      STUDENT: 0,
      EMPLOYEE: 0,
      WORKER: 0,
      BUSINESS_OWNER: 0,
      ENTREPRENEUR: 0,
      SELF_EMPLOYED: 0,
      OTHER: 0,
      UNCLASSIFIED: 0,
    };
    for (const m of filteredMembers) {
      if (m.currentPosition) {
        counts[m.currentPosition] = (counts[m.currentPosition] || 0) + 1;
      } else {
        counts.UNCLASSIFIED += 1;
      }
    }
    const total = filteredMembers.length;
    return [
      { key: 'STUDENT', label: 'Students', count: counts.STUDENT, pct: total ? Math.round((counts.STUDENT / total) * 100) : 0 },
      { key: 'EMPLOYEE', label: 'Employees', count: counts.EMPLOYEE, pct: total ? Math.round((counts.EMPLOYEE / total) * 100) : 0 },
      { key: 'WORKER', label: 'Workers', count: counts.WORKER, pct: total ? Math.round((counts.WORKER / total) * 100) : 0 },
      { key: 'BUSINESS_OWNER', label: 'Business Owners', count: counts.BUSINESS_OWNER, pct: total ? Math.round((counts.BUSINESS_OWNER / total) * 100) : 0 },
      { key: 'ENTREPRENEUR', label: 'Entrepreneurs', count: counts.ENTREPRENEUR, pct: total ? Math.round((counts.ENTREPRENEUR / total) * 100) : 0 },
      { key: 'SELF_EMPLOYED', label: 'Self-Employed', count: counts.SELF_EMPLOYED, pct: total ? Math.round((counts.SELF_EMPLOYED / total) * 100) : 0 },
      { key: 'OTHER', label: 'Other', count: counts.OTHER, pct: total ? Math.round((counts.OTHER / total) * 100) : 0 },
      { key: 'UNCLASSIFIED', label: 'Unclassified (Historical)', count: counts.UNCLASSIFIED, pct: total ? Math.round((counts.UNCLASSIFIED / total) * 100) : 0 },
    ];
  }, [filteredMembers]);

  // Youth Discovery Stats (Expectations & Talents Aggregation)
  const youthStats = React.useMemo(() => {
    const expectationCounts: Record<string, number> = {};
    const talentCounts: Record<string, number> = {};
    const prefCounts: Record<string, number> = {};

    for (const m of filteredMembers) {
      for (const exp of m.expectations) {
        expectationCounts[exp] = (expectationCounts[exp] || 0) + 1;
      }
      for (const t of m.talents) {
        talentCounts[t] = (talentCounts[t] || 0) + 1;
      }
      for (const p of m.participationPreferences) {
        prefCounts[p] = (prefCounts[p] || 0) + 1;
      }
    }

    const topExpectations = Object.entries(expectationCounts)
      .map(([key, count]) => ({ key, label: getExpectationLabel(key), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTalents = Object.entries(talentCounts)
      .map(([key, count]) => ({ key, label: getTalentLabel(key), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topPrefs = Object.entries(prefCounts)
      .map(([key, count]) => ({ key, label: getParticipationPreferenceLabel(key), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topExpectations, topTalents, topPrefs };
  }, [filteredMembers]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = [
      'Member ID',
      'Full Name',
      'Chapter',
      'Taluk',
      'Member Category / Interest',
      'Current Position',
      'Expectations',
      'Talents',
      'Participation Preferences',
      'Status',
      'Joined Date',
    ];

    const rows = filteredMembers.map((m) => [
      m.membershipNumber,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.chapterName}"`,
      m.taluk,
      `"${getMemberCategoryLabel(m.memberCategory)}"`,
      `"${getCurrentPositionLabel(m.currentPosition)}"`,
      `"${m.expectations.map(getExpectationLabel).join('; ')}"`,
      `"${m.talents.map(getTalentLabel).join('; ')}"`,
      `"${m.participationPreferences.map(getParticipationPreferenceLabel).join('; ')}"`,
      m.status,
      m.joinedDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MYBF_Youth_Talent_Classification_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAllFilters = () => {
    setChapterFilter('ALL');
    setTalukFilter('ALL');
    setCategoryFilter('ALL');
    setPositionFilter('ALL');
    setExpectationFilter('ALL');
    setTalentFilter('ALL');
    setParticipationFilter('ALL');
  };

  const isFiltered =
    chapterFilter !== 'ALL' ||
    talukFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    positionFilter !== 'ALL' ||
    expectationFilter !== 'ALL' ||
    talentFilter !== 'ALL' ||
    participationFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Analytics Toolbar & Multi-Dimensional Filters */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#035AFC]" /> Member Classification & Youth Discovery Intelligence
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time filtering across Chapter, Classification, Member Expectations, and Extracurricular Talents.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="h-8 text-xs text-slate-500"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-8 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export Report (CSV)
              </Button>
            </div>
          </div>

          {/* Multi-Dimensional Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Chapter Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-chapter" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" /> Chapter Scope
              </label>
              <select
                id="dist-filter-chapter"
                value={chapterFilter}
                onChange={(e) => setChapterFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All 16 Chapters</option>
                {INITIAL_16_CHAPTERS.map((ch) => (
                  <option key={ch.slug} value={ch.slug}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluk Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-taluk" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> Taluk Geography
              </label>
              <select
                id="dist-filter-taluk"
                value={talukFilter}
                onChange={(e) => setTalukFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All 7 Taluks</option>
                {TALUKS_OF_MALAPPURAM.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>

            {/* Member Category Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-category" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Award className="h-3 w-3 text-[#035AFC]" /> Member Category
              </label>
              <select
                id="dist-filter-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All Categories</option>
                {MEMBER_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                <option value="UNCLASSIFIED">Unclassified Historical</option>
              </select>
            </div>

            {/* Current Position Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-position" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-[#FBC206]" /> Current Position
              </label>
              <select
                id="dist-filter-position"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All Positions</option>
                {CURRENT_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
                <option value="UNCLASSIFIED">Unclassified Historical</option>
              </select>
            </div>

            {/* Expectations Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-expectation" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Target className="h-3 w-3 text-[#035AFC]" /> Member Expectation
              </label>
              <select
                id="dist-filter-expectation"
                value={expectationFilter}
                onChange={(e) => setExpectationFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All Expectations</option>
                {EXPECTATION_OPTIONS.map((exp) => (
                  <option key={exp.key} value={exp.key}>
                    {exp.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Talent Discovery Filter */}
            <div className="space-y-1">
              <label htmlFor="dist-filter-talent" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Palette className="h-3 w-3 text-purple-500" /> Talent / Skill
              </label>
              <select
                id="dist-filter-talent"
                value={talentFilter}
                onChange={(e) => setTalentFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All Talents & Skills</option>
                {ALL_TALENT_OPTIONS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label} ({t.category.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Participation Preference Filter */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="dist-filter-pref" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Users2 className="h-3 w-3 text-emerald-500" /> Participation Preference
              </label>
              <select
                id="dist-filter-pref"
                value={participationFilter}
                onChange={(e) => setParticipationFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#035AFC]"
              >
                <option value="ALL">All Participation Preferences</option>
                {PARTICIPATION_PREFERENCES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Youth Discovery Highlights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Expectations */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[#035AFC]" /> Top Community Expectations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {youthStats.topExpectations.length === 0 ? (
              <span className="text-xs text-slate-400">No expectations recorded.</span>
            ) : (
              youthStats.topExpectations.map((exp) => (
                <div key={exp.key} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {exp.label}
                  </span>
                  <Badge variant="primary" className="text-[10px] py-0">
                    {exp.count} members
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Talents */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-purple-500" /> Discovered Talents & Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {youthStats.topTalents.length === 0 ? (
              <span className="text-xs text-slate-400">No talents recorded.</span>
            ) : (
              youthStats.topTalents.map((t) => (
                <div key={t.key} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {t.label}
                  </span>
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {t.count} members
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Participation Channels */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users2 className="h-3.5 w-3.5 text-emerald-500" /> Participation Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            {youthStats.topPrefs.length === 0 ? (
              <span className="text-xs text-slate-400">No preferences recorded.</span>
            ) : (
              youthStats.topPrefs.map((p) => (
                <div key={p.key} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {p.label}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    {p.count} members
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aggregate Classification Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field A: Member Category Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Field A: Member Category / Interest</span>
              <span className="text-xs text-slate-400 font-normal">
                {filteredMembers.length} active in scope
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {categoryStats.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-500">
                    <strong>{item.count}</strong> ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-300`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Field B: Current Position Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Field B: Current Position</span>
              <span className="text-xs text-slate-400 font-normal">
                {filteredMembers.length} active in scope
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {positionStats.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-500">
                    <strong>{item.count}</strong> ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filtered Members Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Authorized District Member & Talent Roster</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredMembers.length} records matching the active multi-attribute filters.
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Scoping: Malappuram District (MLP)
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Member ID</th>
                  <th className="py-3 px-2">Full Name</th>
                  <th className="py-3 px-2">Chapter</th>
                  <th className="py-3 px-2">Classification</th>
                  <th className="py-3 px-2">Key Expectations</th>
                  <th className="py-3 px-2">Talents & Skills</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No members match the current filter selection.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-2 font-mono font-bold text-[#035AFC]">
                        {m.membershipNumber}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                        {m.fullName}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                        <div>{m.chapterName}</div>
                        <div className="text-[10px] text-slate-400">{m.taluk}</div>
                      </td>
                      <td className="py-3 px-2 space-y-1">
                        <div>
                          {m.memberCategory ? (
                            <Badge variant="primary" className="text-[9px]">
                              {getMemberCategoryLabel(m.memberCategory)}
                            </Badge>
                          ) : (
                            <span className="text-amber-600 font-medium italic text-[10px]">
                              Not provided
                            </span>
                          )}
                        </div>
                        <div>
                          {m.currentPosition ? (
                            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {getCurrentPositionLabel(m.currentPosition)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {m.expectations.length > 0 ? (
                            m.expectations.slice(0, 2).map((exp) => (
                              <span
                                key={exp}
                                className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-[#035AFC] dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 px-1.5 py-0.5 rounded"
                              >
                                {getExpectationLabel(exp)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">None logged</span>
                          )}
                          {m.expectations.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{m.expectations.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {m.talents.length > 0 ? (
                            m.talents.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[9px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 px-1.5 py-0.5 rounded"
                              >
                                {getTalentLabel(t)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">None logged</span>
                          )}
                          {m.talents.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{m.talents.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Badge variant="success" className="text-[9px]">
                          {m.status}
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
