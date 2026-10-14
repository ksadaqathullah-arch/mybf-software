'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, QrCode, Building2, Calendar, Award, Briefcase } from 'lucide-react';
import { DigitalIdCardPayload } from '../types/card.types';
import {
  getMemberCategoryLabel,
  getCurrentPositionLabel,
} from '@/features/memberships/constants/member-classifications';

interface DigitalIdCardProps {
  card: DigitalIdCardPayload;
  className?: string;
}

export function DigitalIdCard({ card, className }: DigitalIdCardProps) {
  const verifyUrl = `/verify/id/${card.verificationToken}`;

  return (
    <div
      className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#035AFC] via-[#0240B8] to-[#012269] p-6 text-white shadow-2xl border border-blue-400/30 ${className || ''}`}
    >
      {/* Decorative Gold Accent Bar */}
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#FBC206]/20 blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FBC206] via-amber-300 to-[#FBC206]" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/15 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#035AFC] shadow-md font-black text-xl tracking-tighter">
            MYBF
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#FBC206] uppercase">
              Malappuram Youth Business Forum
            </h4>
            <p className="text-[10px] text-blue-100 font-medium">Digital Identity & Membership Pass</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-[#FBC206] text-[#030405] text-[10px] px-2 py-0.5">
          {card.status}
        </Badge>
      </div>

      {/* Main Body */}
      <div className="mt-5 grid grid-cols-3 gap-4 items-center">
        {/* Photo or Avatar */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[#FBC206] bg-slate-900 shadow-md flex items-center justify-center">
            {card.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.photoUrl} alt={card.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-blue-200">
                <span className="text-2xl font-bold">{card.fullName.charAt(0)}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Member</span>
              </div>
            )}
          </div>
        </div>

        {/* Member Details */}
        <div className="col-span-2 space-y-1.5 pl-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Full Name</p>
            <h3 className="text-lg font-bold text-white tracking-tight truncate">{card.fullName}</h3>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-blue-200 font-medium">Member ID</p>
            <div className="font-mono text-sm font-black tracking-wider text-[#FBC206]">
              {card.membershipNumber}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-blue-100">
            <Building2 className="h-3.5 w-3.5 text-[#FBC206] shrink-0" />
            <span className="truncate font-medium">{card.chapterName}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-blue-100">
            <Award className="h-3.5 w-3.5 text-[#FBC206] shrink-0" />
            <span className="truncate font-medium">
              {card.memberCategory
                ? getMemberCategoryLabel(card.memberCategory)
                : (card.categoryName || 'Not provided')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-blue-100">
            <Briefcase className="h-3.5 w-3.5 text-[#FBC206] shrink-0" />
            <span className="truncate font-medium">
              {getCurrentPositionLabel(card.currentPosition)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & QR Verification preview */}
      <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-3">
        <div className="space-y-1 text-[11px] text-blue-100">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-blue-300" />
            <span>Valid Until: <strong className="text-white">{card.validUntil}</strong></span>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-blue-200">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Cryptographically Verified</span>
          </div>
        </div>

        {/* QR Code link */}
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center hover:opacity-90 transition-opacity"
          title="Verify ID pass"
        >
          <div className="h-14 w-14 rounded-lg bg-white p-1 shadow-inner flex items-center justify-center">
            <QrCode className="h-12 w-12 text-[#030405]" />
          </div>
          <span className="mt-1 text-[9px] text-[#FBC206] font-mono">SCAN TO VERIFY</span>
        </a>
      </div>
    </div>
  );
}
