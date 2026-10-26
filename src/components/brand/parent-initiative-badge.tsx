import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ParentInitiativeBadgeProps {
  className?: string;
  showLogo?: boolean;
}

/**
 * Refined Brand Attribution Badge:
 * "AN INITIATIVE UNDER MISSION MALAPPURAM 2050"
 */
export function ParentInitiativeBadge({
  className,
  showLogo = true,
}: ParentInitiativeBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm transition-all hover:border-amber-500/40',
        className
      )}
    >
      {showLogo && (
        <div className="relative h-4 w-auto aspect-[607/188] shrink-0">
          <Image
            src="/logos/mission-malappuram-2050-logo.png"
            alt="Mission Malappuram 2050"
            width={607}
            height={188}
            className="h-full w-auto object-contain"
          />
        </div>
      )}
      {showLogo && <span className="h-3 w-px bg-amber-500/30" aria-hidden="true" />}
      <span className="tracking-wide uppercase font-semibold text-xs text-amber-600 dark:text-amber-300">
        An Initiative Under Mission Malappuram 2050
      </span>
    </div>
  );
}
