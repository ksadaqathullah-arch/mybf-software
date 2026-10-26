'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LogOut,
  Menu,
  X,
  Globe,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { MybfLogo } from '@/components/brand/mybf-logo';

export interface NavSubItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  subItems?: NavSubItem[];
}

export interface PortalShellProps {
  portalTitle: string;
  roleBadgeText: string;
  scopeBadgeText?: string;
  navItems: NavItem[];
  children: React.ReactNode;
  onLogout?: () => void;
}

const STORAGE_KEY = 'mybf_portal_sidebar_collapsed';

export function PortalShell({
  portalTitle,
  roleBadgeText,
  scopeBadgeText,
  navItems,
  children,
  onLogout,
}: PortalShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = React.useState<Record<string, boolean>>({});
  const mobileTriggerRef = React.useRef<HTMLButtonElement>(null);
  const prevMobileOpenRef = React.useRef(mobileOpen);

  // Sync with localStorage on client mount (avoids hydration mismatch)
  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {
      // localStorage not accessible
    }
  }, []);

  // Toggle desktop collapsed state and persist preference
  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Global keyboard shortcut: Ctrl+B / Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Manage mobile drawer open/close side effects (body scroll lock & focus restoration)
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (prevMobileOpenRef.current && mobileTriggerRef.current) {
        mobileTriggerRef.current.focus();
      }
    }
    prevMobileOpenRef.current = mobileOpen;
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  // Close mobile drawer when route changes
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Auto-expand submenus if the current path matches a sub-item
  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems?.some((sub) => pathname === sub.href || pathname?.startsWith(`${sub.href}/`))) {
        setExpandedSubmenus((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [pathname, navItems]);

  // Active route checking helper
  const isItemActive = (item: NavItem) => {
    const isRootPortalPath =
      ['/member', '/district-admin', '/super-admin', '/'].includes(item.href) ||
      item.href.startsWith('/chapter/');

    if (isRootPortalPath) {
      if (pathname === item.href) return true;
    } else if (pathname === item.href || pathname?.startsWith(`${item.href}/`)) {
      return true;
    }

    if (item.subItems?.some((sub) => pathname === sub.href || pathname?.startsWith(`${sub.href}/`))) {
      return true;
    }

    return false;
  };

  const renderLogoutButton = (label: string, isCompact = false) => {
    if (onLogout) {
      return (
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'text-paper/70 hover:text-yellow hover:bg-white/10 p-2 border border-white/20 transition-colors cursor-pointer',
            isCompact && 'mx-auto'
          )}
          title={label}
          aria-label={label}
        >
          <LogOut className="h-4 w-4" />
        </button>
      );
    }
    return (
      <Link
        href="/"
        className={cn(
          'text-paper/70 hover:text-yellow hover:bg-white/10 p-2 border border-white/20 transition-colors',
          isCompact && 'mx-auto'
        )}
        title={label}
        aria-label={label}
      >
        <LogOut className="h-4 w-4" />
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:flex-row font-sans selection:bg-yellow selection:text-ink">
      {/* ========================================================= */}
      {/* MOBILE TOP HEADER BAR (< md) */}
      {/* ========================================================= */}
      <div className="md:hidden flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-3 text-paper sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <button
            ref={mobileTriggerRef}
            onClick={() => setMobileOpen(true)}
            className="p-1.5 border border-white/20 text-paper hover:bg-yellow hover:text-ink transition-colors cursor-pointer"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-sans font-bold text-sm tracking-tight text-paper truncate max-w-[190px]">
            {portalTitle}
          </span>
        </div>
        <span className="bg-yellow text-ink font-sans font-bold text-xs tracking-wide px-2.5 py-0.5 border border-ink shadow-[2px_2px_0px_#14161c]">
          {roleBadgeText}
        </span>
      </div>

      {/* ========================================================= */}
      {/* MOBILE SLIDE-IN NAVIGATION DRAWER (< md) */}
      {/* ========================================================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/75 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r-2 border-ink bg-ink text-paper flex flex-col md:hidden transition-transform duration-300 ease-in-out motion-reduce:transition-none shadow-[8px_0px_0px_#14161c]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Brand Header */}
        <div className="p-4 border-b-2 border-white/10 flex items-center justify-between bg-black/20">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex flex-col space-y-1 group"
            aria-label="MYBF - Malappuram Youth Business Forum"
          >
            <MybfLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-xs font-sans font-bold text-yellow tracking-wide truncate max-w-[160px]">
                {portalTitle}
              </span>
              <span className="text-xs font-sans font-medium text-paper/60">• 2050</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 border border-white/20 text-paper/80 hover:text-yellow hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scope & Role Badge Box */}
        <div className="p-3.5 mx-3 my-3 border-2 border-white/15 bg-white/[0.04] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-paper/60 font-sans text-xs font-semibold">Access Role</span>
            <span className="bg-yellow text-ink font-sans font-bold text-xs px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
              {roleBadgeText}
            </span>
          </div>
          {scopeBadgeText && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
              <span className="text-paper/60 font-sans text-xs font-semibold">Scope</span>
              <span className="text-xs font-mono font-semibold text-paper truncate max-w-[140px]" title={scopeBadgeText}>
                {scopeBadgeText}
              </span>
            </div>
          )}
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            const isSubmenuOpen = Boolean(expandedSubmenus[item.id]);

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex-1 flex items-center justify-between px-3 py-2.5 text-sm font-sans font-medium tracking-normal transition-all border-2',
                      active && !hasSubItems
                        ? 'bg-blue text-paper font-semibold border-ink shadow-[3px_3px_0px_#fcc000]'
                        : active && hasSubItems
                        ? 'bg-white/10 text-yellow font-semibold border-white/20'
                        : 'border-transparent text-paper/80 hover:bg-white/10 hover:text-yellow hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-yellow' : 'text-paper/60')} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 font-mono font-semibold border border-ink shrink-0',
                          active ? 'bg-yellow text-ink' : 'bg-white/15 text-paper'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {hasSubItems && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSubmenus((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      aria-expanded={isSubmenuOpen}
                      aria-label={`Toggle ${item.label} sub-routes`}
                      className="p-2 border-2 border-transparent hover:border-white/20 hover:bg-white/10 text-paper/70 hover:text-yellow transition-all"
                    >
                      {isSubmenuOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>

                {hasSubItems && isSubmenuOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-white/10 ml-5">
                    {item.subItems?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center justify-between px-3 py-1.5 text-xs font-sans transition-all border-2',
                            isSubActive
                              ? 'bg-blue text-paper font-semibold border-ink shadow-[2px_2px_0px_#fcc000]'
                              : 'border-transparent text-paper/70 hover:bg-white/10 hover:text-yellow'
                          )}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[10px] font-mono px-1 py-0.2 bg-white/20 text-paper">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t-2 border-white/10 bg-black/25 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="h-8 w-8 shrink-0 bg-yellow text-ink border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[2px_2px_0px_#14161c]">
                MY
              </div>
              <div className="truncate">
                <p className="text-xs font-sans font-semibold text-paper truncate">Authenticated</p>
                <p className="text-[11px] text-paper/60 truncate font-mono">Mission 2050</p>
              </div>
            </div>
            {renderLogoutButton('Exit / Sign Out')}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (md:flex) - EXPANDABLE & COLLAPSIBLE */}
      {/* ========================================================= */}
      <aside
        aria-label="Main sidebar navigation"
        className={cn(
          'hidden md:flex flex-col border-r-2 border-ink bg-ink text-paper shrink-0 sticky top-0 h-screen z-30 transition-[width] duration-300 ease-in-out motion-reduce:transition-none select-none',
          mounted && isCollapsed ? 'w-[72px]' : 'w-72'
        )}
      >
        {/* Desktop Brand Header */}
        {mounted && isCollapsed ? (
          <div className="p-2 border-b-2 border-white/10 flex flex-col items-center justify-center bg-black/20 h-16 shrink-0 relative group">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 border-2 border-yellow bg-yellow text-ink hover:bg-yellow-deep transition-all cursor-pointer shadow-[2px_2px_0px_#14161c] active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Expand sidebar (Ctrl+B)"
              title="Expand sidebar (Ctrl+B)"
              aria-expanded="false"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <div
              role="tooltip"
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex items-center gap-1.5 whitespace-nowrap bg-ink text-paper text-xs font-sans font-semibold px-2.5 py-1.5 border-2 border-yellow shadow-[3px_3px_0px_#fcc000] animate-in fade-in zoom-in-95 duration-100"
            >
              <span>Expand sidebar</span>
              <kbd className="font-mono text-[10px] bg-white/20 px-1 py-0.5 border border-white/20">Ctrl+B</kbd>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b-2 border-white/10 flex items-center justify-between bg-black/20 h-16 shrink-0">
            <Link href="/" className="flex flex-col space-y-1 group" aria-label="MYBF - Malappuram Youth Business Forum">
              <MybfLogo size="sm" className="group-hover:opacity-90 transition-opacity" />
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-xs font-sans font-bold text-yellow tracking-wide truncate max-w-[140px]">
                  {portalTitle}
                </span>
                <span className="text-[10px] font-sans font-medium text-paper/60">• 2050</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 border border-white/20 text-paper/80 hover:text-yellow hover:bg-white/10 hover:border-yellow transition-all cursor-pointer shadow-[1px_1px_0px_#fcc000] active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Collapse sidebar (Ctrl+B)"
              title="Collapse sidebar (Ctrl+B)"
              aria-expanded="true"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scope & Role Badge Indicator */}
        {mounted && isCollapsed ? (
          <div className="my-2 flex flex-col items-center justify-center shrink-0 relative group">
            <div
              tabIndex={0}
              aria-label={`Role: ${roleBadgeText}${scopeBadgeText ? `, Scope: ${scopeBadgeText}` : ''}`}
              className="h-8 w-11 bg-white/[0.06] border border-white/20 flex items-center justify-center cursor-default hover:border-yellow transition-colors"
            >
              <span className="font-sans font-bold text-[10px] text-yellow tracking-wider">
                {roleBadgeText.slice(0, 3)}
              </span>
            </div>
            <div
              role="tooltip"
              className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex group-focus-within:flex flex-col whitespace-nowrap bg-ink text-paper text-xs font-sans px-3 py-2 border-2 border-yellow shadow-[4px_4px_0px_#fcc000] animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center gap-2">
                <span className="text-paper/60 text-[10px] uppercase">Role:</span>
                <span className="font-bold text-yellow">{roleBadgeText}</span>
              </div>
              {scopeBadgeText && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 mt-1">
                  <span className="text-paper/60 text-[10px] uppercase">Scope:</span>
                  <span className="font-mono text-paper text-[11px]">{scopeBadgeText}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 mx-3 my-3 border-2 border-white/15 bg-white/[0.04] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper/60 font-sans text-xs font-semibold">Access Role</span>
              <span className="bg-yellow text-ink font-sans font-bold text-xs px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
                {roleBadgeText}
              </span>
            </div>
            {scopeBadgeText && (
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
                <span className="text-paper/60 font-sans text-xs font-semibold">Scope</span>
                <span className="text-xs font-mono font-semibold text-paper truncate max-w-[140px]" title={scopeBadgeText}>
                  {scopeBadgeText}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Desktop Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

            // Collapsed Desktop View
            if (mounted && isCollapsed) {
              return (
                <div key={item.id} className="relative group flex justify-center py-0.5">
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      'relative h-11 w-11 flex items-center justify-center transition-all border-2 rounded-none cursor-pointer',
                      active
                        ? 'bg-blue text-paper font-semibold border-ink shadow-[2px_2px_0px_#fcc000]'
                        : 'border-transparent text-paper/70 hover:bg-white/10 hover:text-yellow hover:border-white/20'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-yellow' : 'text-paper/70')} />
                    {/* Badge count positioned in corner, not overlapping icon */}
                    {item.badge && (
                      <span
                        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold bg-yellow text-ink border border-ink shadow-[1px_1px_0px_#14161c]"
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Flyout menu if has sub-items, otherwise standard tooltip */}
                  {hasSubItems ? (
                    <div
                      role="menu"
                      className="absolute left-full ml-3 top-0 z-50 hidden group-hover:block group-focus-within:block min-w-[220px] bg-ink text-paper border-2 border-yellow shadow-[6px_6px_0px_#14161c] py-2 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="px-3 py-1.5 border-b border-white/10 text-xs font-sans font-bold text-yellow flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="bg-yellow text-ink text-[10px] font-mono font-bold px-1.5 py-0.5 border border-ink">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href={item.href}
                          className="block px-3 py-1.5 text-xs font-sans font-semibold text-paper hover:bg-white/10 hover:text-yellow"
                        >
                          Overview &rarr;
                        </Link>
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              className={cn(
                                'flex items-center justify-between px-3 py-1.5 text-xs font-sans transition-colors',
                                isSubActive
                                  ? 'bg-blue text-paper font-semibold'
                                  : 'text-paper/80 hover:bg-white/10 hover:text-yellow'
                              )}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span className="text-[10px] font-mono bg-white/20 px-1 py-0.5">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex group-focus-within:flex items-center gap-2 whitespace-nowrap bg-ink text-paper text-xs font-sans font-semibold px-3 py-1.5 border-2 border-yellow shadow-[4px_4px_0px_#14161c] animate-in fade-in zoom-in-95 duration-100"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-yellow text-ink text-[10px] font-mono font-bold px-1.5 py-0.5 border border-ink">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Expanded Desktop View
            const isSubmenuOpen = Boolean(expandedSubmenus[item.id]);

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex-1 flex items-center justify-between px-3 py-2 text-sm font-sans font-medium tracking-normal transition-all border-2',
                      active && !hasSubItems
                        ? 'bg-blue text-paper font-semibold border-ink shadow-[3px_3px_0px_#fcc000]'
                        : active && hasSubItems
                        ? 'bg-white/10 text-yellow font-semibold border-white/20'
                        : 'border-transparent text-paper/80 hover:bg-white/10 hover:text-yellow hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-yellow' : 'text-paper/60')} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 font-mono font-semibold border border-ink shrink-0',
                          active ? 'bg-yellow text-ink' : 'bg-white/15 text-paper'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {hasSubItems && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSubmenus((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      aria-expanded={isSubmenuOpen}
                      aria-label={`Toggle ${item.label} sub-routes`}
                      className="p-2 border-2 border-transparent hover:border-white/20 hover:bg-white/10 text-paper/70 hover:text-yellow transition-all"
                    >
                      {isSubmenuOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>

                {hasSubItems && isSubmenuOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-white/10 ml-5 animate-in slide-in-from-top-2 duration-150">
                    {item.subItems?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={cn(
                            'flex items-center justify-between px-3 py-1.5 text-xs font-sans transition-all border-2',
                            isSubActive
                              ? 'bg-blue text-paper font-semibold border-ink shadow-[2px_2px_0px_#fcc000]'
                              : 'border-transparent text-paper/70 hover:bg-white/10 hover:text-yellow'
                          )}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[10px] font-mono px-1 py-0.2 bg-white/20 text-paper">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        {mounted && isCollapsed ? (
          <div className="p-2 border-t-2 border-white/10 bg-black/25 flex flex-col items-center gap-2 shrink-0">
            <div
              className="h-8 w-8 shrink-0 bg-yellow text-ink border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[2px_2px_0px_#14161c]"
              title="Authenticated User • Mission Malappuram 2050"
            >
              MY
            </div>
            {renderLogoutButton('Exit to Public Site', true)}
          </div>
        ) : (
          <div className="p-3.5 border-t-2 border-white/10 bg-black/25 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="h-8 w-8 shrink-0 bg-yellow text-ink border-2 border-ink flex items-center justify-center font-sans font-bold text-xs shadow-[2px_2px_0px_#14161c]">
                  MY
                </div>
                <div className="truncate">
                  <p className="text-xs font-sans font-semibold text-paper truncate">Authenticated</p>
                  <p className="text-[11px] text-paper/60 truncate font-mono">Mission 2050</p>
                </div>
              </div>
              {renderLogoutButton('Exit to Public Site')}
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT VIEWPORT (RESPONSIVE FLUID WIDTH) */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col bg-paper">
        {/* Desktop Top Header Bar with Quick Toggle */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 border-b-2 border-ink bg-paper-2/60 sticky top-0 z-20">
          <div className="flex items-center space-x-3 text-xs">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 border-2 border-ink bg-paper text-ink hover:bg-yellow shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              aria-label={mounted && isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              title={mounted && isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            >
              {mounted && isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <span className="font-sans font-bold uppercase tracking-[0.14em] text-muted text-[11px]">
              MYBF Platform
            </span>
            <span className="text-muted/60">•</span>
            <span className="font-sans font-bold text-ink tracking-tight text-xs">
              {portalTitle}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-950 border border-emerald-800 font-sans text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>Live System</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1 font-sans text-xs font-semibold text-ink border-2 border-ink bg-paper hover:bg-ink hover:text-paper shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
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
