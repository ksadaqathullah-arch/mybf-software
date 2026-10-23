'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';

import { MybfLogo } from '@/components/brand/mybf-logo';
import { MissionMalappuramLogo } from '@/components/brand/mission-malappuram-logo';
import { useMembershipModal } from '@/features/memberships/context/membership-modal-context';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [portalsOpen, setPortalsOpen] = React.useState(false);
  const { openModal } = useMembershipModal();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#FBC206] bg-[#035AFC] text-white shadow-md transition-colors">
      {/* Desktop Navbar (3-group CSS Grid: Left, Center, Right) */}
      <div className="mx-auto hidden lg:grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        {/* GROUP 1: LEFT - Official MYBF Logo */}
        <div className="justify-self-start flex items-center">
          <Link
            href="/"
            className="flex items-center group py-1"
            aria-label="MYBF - Malappuram Youth Business Forum"
          >
            <MybfLogo size="md" priority className="hover:opacity-90 transition-opacity" />
          </Link>
        </div>

        {/* GROUP 2: CENTER - Existing Navigation Links */}
        <nav className="justify-self-center flex items-center space-x-4 xl:space-x-6 text-xs xl:text-sm font-medium text-white/90">
          <Link href="/" className="hover:text-[#FBC206] transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-[#FBC206] transition-colors">
            About
          </Link>
          <Link href="/chapters" className="hover:text-[#FBC206] transition-colors whitespace-nowrap">
            16 Chapters
          </Link>
          <Link href="/events" className="hover:text-[#FBC206] transition-colors">
            Events
          </Link>
          <Link href="/membership" className="hover:text-[#FBC206] transition-colors">
            Membership
          </Link>

          {/* Portals Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPortalsOpen(!portalsOpen)}
              className="flex items-center gap-1 hover:text-[#FBC206] transition-colors cursor-pointer"
            >
              <span>Portals</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {portalsOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-2 shadow-xl z-50 text-xs"
                onClick={() => setPortalsOpen(false)}
              >
                <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Authorized Spaces
                </div>
                <Link
                  href="/member"
                  className="block rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                >
                  Member Workspace
                </Link>
                <Link
                  href="/chapter/manjeri"
                  className="block rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                >
                  Chapter Executive (Manjeri)
                </Link>
                <Link
                  href="/district-admin"
                  className="block rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                >
                  District Administration
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* GROUP 3: RIGHT - Mission Malappuram 2050 Logo + Actions */}
        <div className="justify-self-end flex items-center space-x-3 xl:space-x-4">
          {/* Mission Malappuram 2050 Official Logo (exact red-marked position) */}
          <div className="flex items-center" title="Mission Malappuram 2050">
            <MissionMalappuramLogo
              size="sm"
              className="h-7 xl:h-8 hover:opacity-90 transition-opacity"
              priority
            />
          </div>

          {/* Vertical Separator */}
          <div className="h-5 w-px bg-white/20" aria-hidden="true" />

          {/* CTA Actions */}
          <div className="flex items-center space-x-2 xl:space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={openModal}
              className="bg-[#FBC206] text-slate-900 hover:bg-[#E5B005] cursor-pointer"
            >
              Apply for Membership
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Navbar (< lg) */}
      <div className="mx-auto flex lg:hidden h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: MYBF Brand */}
        <Link
          href="/"
          className="flex items-center group py-1"
          aria-label="MYBF - Malappuram Youth Business Forum"
        >
          <MybfLogo size="sm" priority className="h-8 w-auto hover:opacity-90 transition-opacity" />
        </Link>

        {/* Right: Mission Malappuram 2050 Logo + Apply Button + Menu Toggle */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <MissionMalappuramLogo
            size="xs"
            className="h-6 sm:h-7"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={openModal}
            className="hidden sm:inline-flex text-xs px-3 h-8 bg-[#FBC206] text-slate-900 hover:bg-[#E5B005] cursor-pointer"
          >
            Apply
          </Button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/20 bg-[#0246C7] px-4 pt-3 pb-6 space-y-4 shadow-xl text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              An Initiative Under
            </span>
            <MissionMalappuramLogo size="xs" className="h-5" />
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 text-white">
              Home
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 text-white">
              About MYBF
            </Link>
            <Link href="/chapters" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 text-white">
              16 Founding Chapters
            </Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 text-white">
              Events & Summits
            </Link>
            <Link href="/membership" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/10 text-white">
              Membership Categories
            </Link>
            <div className="pt-2 border-t border-white/15">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-3">Portals</span>
              <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
                Member Workspace
              </Link>
              <Link href="/chapter/manjeri" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
                Chapter Executive
              </Link>
              <Link href="/district-admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-white/90 hover:bg-white/10 rounded-lg">
                District Administration
              </Link>
            </div>
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-white/60 text-white hover:bg-white hover:text-[#035AFC]">Sign In</Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => {
                setMobileMenuOpen(false);
                openModal();
              }}
              className="w-full bg-[#FBC206] text-slate-900 hover:bg-[#E5B005] cursor-pointer"
            >
              Apply for Membership
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
