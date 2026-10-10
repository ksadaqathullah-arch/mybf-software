'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [portalsOpen, setPortalsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-[#FBFDFD]/90 dark:bg-[#030405]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#035AFC] text-white shadow-md font-black text-xl tracking-tighter group-hover:bg-[#0246C7] transition-all">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MYBF
              <span className="inline-block h-2 w-2 rounded-full bg-[#FBC206]" />
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Malappuram Youth Business Forum
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
            About
          </Link>
          <Link href="/chapters" className="hover:text-[#035AFC] dark:hover:text-[#3B82F6] transition-colors">
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

        {/* CTA Actions */}
        <div className="hidden md:flex items-center space-x-3">
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

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030405] px-4 pt-2 pb-6 space-y-3">
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
