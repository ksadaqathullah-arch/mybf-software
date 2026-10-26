'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, Menu, X, Globe, ShieldCheck } from 'lucide-react';
import { MybfLogo } from '@/components/brand/mybf-logo';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface PortalShellProps {
  portalTitle: string;
  roleBadgeText: string;
  scopeBadgeText?: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function PortalShell({
  portalTitle,
  roleBadgeText,
  scopeBadgeText,
  navItems,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:flex-row font-sans selection:bg-yellow selection:text-ink">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-3 text-paper sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 border border-white/20 text-paper hover:bg-yellow hover:text-ink transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-sans font-bold text-sm tracking-tight text-paper">
            {portalTitle}
          </span>
        </div>
        <span className="bg-yellow text-ink font-sans font-bold text-xs tracking-wide px-2.5 py-0.5 border border-ink shadow-[2px_2px_0px_#14161c]">
          {roleBadgeText}
        </span>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r-2 border-ink bg-ink text-paper flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b-2 border-white/10 flex items-center justify-between bg-black/20">
          <Link href="/" className="flex flex-col space-y-1.5 group" aria-label="MYBF - Malappuram Youth Business Forum">
            <MybfLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-xs font-sans font-bold text-yellow tracking-wide">
                {portalTitle}
              </span>
              <span className="text-xs font-sans font-medium text-paper/60">
                • 2050
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-paper/70 hover:text-yellow cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scope & Role Badge Box */}
        <div className="p-4 mx-3 my-3 border-2 border-white/15 bg-white/[0.04] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-paper/60 font-sans text-xs font-semibold">
              Access Role
            </span>
            <span className="bg-yellow text-ink font-sans font-bold text-xs px-2.5 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
              {roleBadgeText}
            </span>
          </div>
          {scopeBadgeText && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
              <span className="text-paper/60 font-sans text-xs font-semibold">
                Scope
              </span>
              <span className="text-xs font-mono font-semibold text-paper truncate max-w-[150px]" title={scopeBadgeText}>
                {scopeBadgeText}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isRootPortalPath =
              ['/member', '/district-admin', '/super-admin'].includes(item.href) ||
              item.href.startsWith('/chapter/');
            const isActive = isRootPortalPath
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 text-sm font-sans font-medium tracking-normal transition-all border-2',
                  isActive
                    ? 'bg-blue text-paper font-semibold border-ink shadow-[3px_3px_0px_#fcc000]'
                    : 'border-transparent text-paper/80 hover:bg-white/10 hover:text-yellow hover:border-white/20'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-yellow' : 'text-paper/60')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 font-mono font-semibold border border-ink',
                      isActive ? 'bg-yellow text-ink' : 'bg-white/15 text-paper'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Session Footer */}
        <div className="p-4 border-t-2 border-white/10 bg-black/25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="h-8 w-8 shrink-0 bg-yellow text-ink border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[2px_2px_0px_#14161c]">
                MY
              </div>
              <div className="truncate">
                <p className="text-xs font-sans font-semibold text-paper truncate">Authenticated</p>
                <p className="text-xs text-paper/60 truncate font-mono">Mission Malappuram 2050</p>
              </div>
            </div>
            <Link
              href="/"
              className="text-paper/70 hover:text-yellow hover:bg-white/10 p-2 border border-white/20 transition-colors"
              title="Exit to Public Site"
              aria-label="Exit to Public Site"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col bg-paper">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 border-b-2 border-ink bg-paper-2/60 sticky top-0 z-30">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-display font-bold uppercase tracking-[0.14em] text-muted">
              MYBF Platform
            </span>
            <span className="text-muted/60">•</span>
            <span className="font-display font-extrabold text-ink uppercase tracking-wider">
              {portalTitle}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-800 font-display text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>PostgreSQL Live</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-ink border-2 border-ink bg-paper hover:bg-ink hover:text-paper shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Public Website</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
