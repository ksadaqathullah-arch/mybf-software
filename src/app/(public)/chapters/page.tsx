'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, Calendar, ArrowRight, Search } from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';

export default function ChaptersPage() {
  const [selectedTaluk, setSelectedTaluk] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const filteredChapters = INITIAL_16_CHAPTERS.filter((ch) => {
    const matchesTaluk = selectedTaluk === 'ALL' || ch.taluk.toLowerCase() === selectedTaluk.toLowerCase();
    const matchesSearch =
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.taluk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTaluk && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="primary">16 Founding Chapters</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MYBF Chapter Network
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-sm sm:text-base">
          Our chapters operate across all 7 taluks of Malappuram district, offering local youth entrepreneurs peer networks, leadership opportunities, and business summits.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        {/* Taluk Filter Chips */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedTaluk('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedTaluk === 'ALL'
                ? 'bg-[#035AFC] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All 16 Chapters
          </button>
          {TALUKS_OF_MALAPPURAM.map((t) => (
            <button
              key={t.code}
              onClick={() => setSelectedTaluk(t.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedTaluk.toLowerCase() === t.name.toLowerCase()
                  ? 'bg-[#035AFC] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search chapter or town..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
          />
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredChapters.map((ch) => (
          <Link key={ch.code} href={`/chapters/${ch.slug}`} className="group">
            <Card className="h-full flex flex-col justify-between group-hover:border-[#035AFC] group-hover:shadow-md transition-all">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400 font-bold">{ch.code}</span>
                  <Badge variant="secondary" className="text-xs">{ch.taluk}</Badge>
                </div>
                <CardTitle className="text-lg mt-3 group-hover:text-[#035AFC] transition-colors">
                  {ch.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#035AFC]" />
                  <span>HQ: {ch.headquarters}</span>
                </div>
                <CardDescription className="text-xs mt-3 line-clamp-3">
                  {ch.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-between text-xs font-semibold text-[#035AFC]">
                  <span>Explore Chapter</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredChapters.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">No chapters match your search query.</p>
        </div>
      )}
    </div>
  );
}
