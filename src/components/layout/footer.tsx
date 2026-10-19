import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

import { MybfLogo } from '@/components/brand/mybf-logo';
import { MissionMalappuramLogo } from '@/components/brand/mission-malappuram-logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070A10] text-slate-600 dark:text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="MYBF - Malappuram Youth Business Forum">
              <MybfLogo size="md" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Malappuram Youth Business Forum is a unified digital platform uniting youth entrepreneurs, professionals, and business owners across 16 chapters.
            </p>

            {/* Parent Initiative Attribution */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Parent Initiative
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Vision 2050</span>
              </div>
              <MissionMalappuramLogo size="sm" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                MYBF is an initiative under Mission Malappuram 2050.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified Digital Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Founding Chapters
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/chapters/manjeri" className="hover:text-[#035AFC]">Manjeri Chapter</Link></li>
              <li><Link href="/chapters/malappuram" className="hover:text-[#035AFC]">Malappuram Chapter</Link></li>
              <li><Link href="/chapters/perinthalmanna" className="hover:text-[#035AFC]">Perinthalmanna</Link></li>
              <li><Link href="/chapters/tirur" className="hover:text-[#035AFC]">Tirur</Link></li>
              <li><Link href="/chapters/kottakkal" className="hover:text-[#035AFC]">Kottakkal</Link></li>
              <li><Link href="/chapters" className="text-[#035AFC] font-medium">View all 16 chapters &rarr;</Link></li>
            </ul>
          </div>

          {/* Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Governance & Policies
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/membership" className="hover:text-[#035AFC]">Membership Charter</Link></li>
              <li><Link href="/verify/id/sample" className="hover:text-[#035AFC]">Public ID Verification</Link></li>
              <li><Link href="/privacy" className="hover:text-[#035AFC]">DPDP Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#035AFC]">Terms of Service</Link></li>
              <li><Link href="/district-admin" className="hover:text-[#035AFC]">District Administration</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Secretariat
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-[#035AFC] shrink-0 mt-0.5" />
                <span>MYBF Central Secretariat, Malappuram, Kerala - 676505</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#035AFC] shrink-0" />
                <span>secretariat@mybf.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#035AFC] shrink-0" />
                <span>+91 483 273 0000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Malappuram Youth Business Forum (MYBF) — An Initiative Under Mission Malappuram 2050. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Chapter Architecture Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
