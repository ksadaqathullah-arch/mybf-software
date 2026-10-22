'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LogOut, Menu, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#080C14] text-paper flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b-2 border-yellow bg-ink px-4 py-3 text-paper">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-paper hover:bg-white/10 hover:text-yellow transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-display font-bold text-sm tracking-tight text-paper">{portalTitle}</span>
        </div>
        <span className="bg-yellow text-ink font-display font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
          {roleBadgeText}
        </span>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r-2 border-white/10 bg-ink text-paper flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex flex-col space-y-1 group" aria-label="MYBF - Malappuram Youth Business Forum">
            <MybfLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-display font-bold text-paper/85 uppercase tracking-wider">{portalTitle}</span>
              <span className="text-[9px] font-display font-bold text-yellow uppercase tracking-widest">• Mission 2050</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-paper/60 hover:text-yellow"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scope Indicators */}
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-paper/60 font-display text-[10px] uppercase tracking-wider font-semibold">Role:</span>
            <span className="bg-yellow text-ink font-display font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              {roleBadgeText}
            </span>
          </div>
          {scopeBadgeText && (
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-paper/60 font-display text-[10px] uppercase tracking-wider font-semibold">Scope:</span>
              <span className="text-[11px] font-mono font-semibold text-paper/90 truncate max-w-[140px]">
                {scopeBadgeText}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue text-paper font-display font-bold shadow-md border-l-4 border-yellow'
                    : 'text-paper/75 hover:bg-white/10 hover:text-yellow'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-yellow' : 'text-paper/50')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-mono font-bold',
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

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-full bg-yellow text-ink flex items-center justify-center font-display font-black text-xs shadow-sm">
                U
              </div>
              <div className="truncate">
                <p className="text-xs font-display font-bold text-paper truncate">Current Session</p>
                <p className="text-[10px] text-paper/60 truncate font-mono">Secured Layer</p>
              </div>
            </div>
            <Link href="/" className="text-paper/60 hover:text-yellow p-1.5 transition-colors" title="Exit to Public Site">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-paper dark:bg-[#080C14] text-ink dark:text-paper">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
