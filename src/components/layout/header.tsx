'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';

import { MybfLogo } from '@/components/brand/mybf-logo';
import { MissionMalappuramLogo } from '@/components/brand/mission-malappuram-logo';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [portalsOpen, setPortalsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-[#FBFDFD]/90 dark:bg-[#030405]/90 backdrop-blur-md transition-colors">
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
        <nav className="justify-self-center flex items-center space-x-4 xl:space-x-6 text-xs xl:text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            About
          </Link>
          <Link href="/chapters" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors whitespace-nowrap">
            16 Chapters
          </Link>
          <Link href="/events" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            Events
          </Link>
          <Link href="/membership" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            Membership
          </Link>

          {/* Portals Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPortalsOpen(!portalsOpen)}
              className="flex items-center gap-1 hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors cursor-pointer"
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
                <Link
                  href="/super-admin"
                  className="block rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
                >
                  Super Admin Governance
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
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

          {/* CTA Actions */}
          <div className="flex items-center space-x-2 xl:space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Apply for Membership
              </Button>
            </Link>
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

          <Link href="/register" className="hidden sm:inline-flex">
            <Button variant="primary" size="sm" className="text-xs px-3 h-8">
              Apply
            </Button>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030405] px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              An Initiative Under
            </span>
            <MissionMalappuramLogo size="xs" className="h-5" />
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Home
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              About MYBF
            </Link>
            <Link href="/chapters" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              16 Founding Chapters
            </Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Events & Summits
            </Link>
            <Link href="/membership" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              Membership Categories
            </Link>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">Portals</span>
              <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 dark:text-slate-200">
                Member Workspace
              </Link>
              <Link href="/chapter/manjeri" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 dark:text-slate-200">
                Chapter Executive
              </Link>
              <Link href="/district-admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 dark:text-slate-200">
                District Administration
              </Link>
              <Link href="/super-admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 dark:text-slate-200">
                Super Admin Governance
              </Link>
            </div>
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">Apply for Membership</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
