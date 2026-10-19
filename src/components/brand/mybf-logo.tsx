import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface MybfLogoProps {
  className?: string;
  imageClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const SIZE_MAP = {
  sm: 'h-7',
  md: 'h-9 sm:h-10',
  lg: 'h-12',
  xl: 'h-16',
};

/**
 * Official MYBF (Malappuram Youth Business Forum) Brand Logo
 * Preserves original typography, proportions, white lettering, and vivid green accent.
 */
export function MybfLogo({
  className,
  imageClassName,
  size = 'md',
  priority = false,
}: MybfLogoProps) {
  return (
    <div
      className={cn(
        'relative aspect-[1024/322] flex items-center select-none shrink-0',
        SIZE_MAP[size],
        className
      )}
    >
      <Image
        src="/logos/mybf-logo.png"
        alt="MYBF - Malappuram Youth Business Forum"
        width={1024}
        height={322}
        priority={priority}
        className={cn('h-full w-auto object-contain', imageClassName)}
      />
    </div>
  );
}
