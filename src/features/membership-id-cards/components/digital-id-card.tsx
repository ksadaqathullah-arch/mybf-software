'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, QrCode, Building2, Calendar, Award, Briefcase, Sparkles } from 'lucide-react';
import { DigitalIdCardPayload } from '../types/card.types';
import {
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  MemberCategoryValue,
  CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';

interface DigitalIdCardProps {
  card: DigitalIdCardPayload;
  className?: string;
}

/**
 * Redesigned MYBF Digital Membership ID Card (Vertical Badge Layout)
 * Inspired by executive conference and modern digital membership credentials.
 * Photo section has been removed to prioritize clear typography and balanced credential hierarchy.
 */
export function DigitalIdCard({ card, className }: DigitalIdCardProps) {
  const verifyUrl = `/verify/id/${card.verificationToken}`;

  const categoryLabel = card.memberCategory
    ? getMemberCategoryLabel(card.memberCategory as MemberCategoryValue)
    : card.categoryName || 'General Youth Member';

  const positionLabel = card.currentPosition
    ? getCurrentPositionLabel(card.currentPosition as CurrentPositionValue)
    : 'Community Member';

  return (
    <div
      id="mybf-digital-id-card"
      className={`relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#07173E] via-[#03236A] to-[#02102E] text-white shadow-2xl border border-blue-400/30 ring-1 ring-white/10 p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-blue-500/10 ${className || ''}`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Decorative Gold & Blue Accent Background Glows */}
      <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#035AFC]/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#FBC206]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-[#FBC206] to-blue-500" />

      {/* Top Lanyard Slot Accent */}
      <div className="flex justify-center -mt-2 mb-3">
        <div className="h-1.5 w-14 rounded-full bg-slate-950/70 border border-white/20 shadow-inner" />
      </div>

      {/* Header: Organization Emblem & Branding */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 text-[#035AFC] shadow-lg font-black text-lg tracking-tighter border border-white/40">
            MYBF
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-extrabold tracking-[0.14em] text-[#FBC206] uppercase leading-tight truncate">
              Malappuram Youth Business Forum
            </h4>
            <p className="text-[10px] text-blue-200 font-medium tracking-wide">
              Digital Identity & Membership Pass
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="shrink-0 bg-[#FBC206] text-[#030405] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm"
        >
          {card.status}
        </Badge>
      </div>

      {/* Member Identity & Name Section (Photo Removed) */}
      <div className="my-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-300/80 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#FBC206]" />
            Official Member Pass
          </span>
          <span className="text-[10px] font-mono text-blue-300/70">
            16 Chapters Valid
          </span>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight leading-tight break-words">
          {card.fullName}
        </h3>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30">
          <span className="text-[10px] uppercase font-bold text-amber-200/90 tracking-wider">ID:</span>
          <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-[#FBC206]">
            {card.membershipNumber}
          </span>
        </div>
      </div>

      {/* Structured Credential Details Block (2x2 Clean Grid) */}
      <div className="grid grid-cols-2 gap-2.5 my-1">
        {/* Assigned Chapter */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
            <Building2 className="h-3 w-3 text-[#FBC206] shrink-0" />
            <span>Assigned Chapter</span>
          </div>
          <p className="text-xs font-bold text-white truncate" title={card.chapterName}>
            {card.chapterName}
          </p>
        </div>

        {/* Member Classification */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
            <Award className="h-3 w-3 text-[#FBC206] shrink-0" />
            <span>Classification</span>
          </div>
          <p className="text-xs font-bold text-white truncate" title={categoryLabel}>
            {categoryLabel}
          </p>
        </div>

        {/* Current Position */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
            <Briefcase className="h-3 w-3 text-[#FBC206] shrink-0" />
            <span>Position</span>
          </div>
          <p className="text-xs font-bold text-white truncate" title={positionLabel}>
            {positionLabel}
          </p>
        </div>

        {/* Validity Period */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-200 uppercase tracking-wider mb-1">
            <Calendar className="h-3 w-3 text-[#FBC206] shrink-0" />
            <span>Valid Through</span>
          </div>
          <p className="text-xs font-bold text-white truncate">
            {card.validUntil}
          </p>
        </div>
      </div>

      {/* QR Code Verification Centerpiece */}
      <div className="mt-4 pt-3 border-t border-white/15 flex flex-col items-center">
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-2xl bg-white p-3 shadow-xl hover:shadow-amber-400/20 transition-all hover:scale-[1.02]"
          title="Click to test live public credential verification"
        >
          <div className="p-0.5">
            <QrCode className="h-20 w-20 text-slate-950 transition-transform group-hover:scale-105" />
          </div>
          <span className="mt-1 text-[9px] font-mono font-bold tracking-wider text-slate-900 uppercase flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Scan to Verify Pass
          </span>
        </a>
      </div>

      {/* Official Security Footer & Watermark */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-blue-200/90">
        <div className="flex items-center space-x-1">
          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Cryptographically Secured</span>
        </div>
        <span className="text-[9px] font-mono text-slate-300">
          MYBF SEC-PASS V2
        </span>
      </div>
    </div>
  );
}
