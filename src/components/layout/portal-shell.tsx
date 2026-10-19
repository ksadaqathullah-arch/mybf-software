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
    <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-bold text-sm">{portalTitle}</span>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {roleBadgeText}
        </Badge>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex flex-col space-y-1.5 group" aria-label="MYBF - Malappuram Youth Business Forum">
            <MybfLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{portalTitle}</span>
              <span className="text-[8px] text-amber-500/80 font-medium tracking-tight">• Mission 2050</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scope Indicators */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Role:</span>
            <Badge variant="primary" className="text-[10px] px-2">
              {roleBadgeText}
            </Badge>
          </div>
          {scopeBadgeText && (
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Scope:</span>
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {scopeBadgeText}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#035AFC] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                      isActive ? 'bg-white text-[#035AFC]' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                U
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate">Current Session</p>
                <p className="text-[10px] text-slate-400 truncate">Secured</p>
              </div>
            </div>
            <Link href="/" className="text-slate-400 hover:text-red-500 p-1.5" title="Exit to Public Site">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
