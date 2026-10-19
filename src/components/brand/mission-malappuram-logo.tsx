import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface MissionMalappuramLogoProps {
  className?: string;
  imageClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const SIZE_MAP = {
  xs: 'h-4',
  sm: 'h-6',
  md: 'h-9',
  lg: 'h-12',
  xl: 'h-16',
};

/**
 * Official Mission Malappuram 2050 Parent Initiative Logo
 * Preserves gold emblem, English "MISSION", and Malayalam "മലപ്പുറം 2050" typography.
 */
export function MissionMalappuramLogo({
  className,
  imageClassName,
  size = 'md',
  priority = false,
}: MissionMalappuramLogoProps) {
  return (
    <div
      className={cn(
        'relative aspect-[607/188] flex items-center select-none shrink-0',
        SIZE_MAP[size],
        className
      )}
    >
      <Image
        src="/logos/mission-malappuram-2050-logo.png"
        alt="Mission Malappuram 2050 - Official Parent Initiative"
        width={607}
        height={188}
        priority={priority}
        className={cn('h-full w-auto object-contain', imageClassName)}
      />
    </div>
  );
}
