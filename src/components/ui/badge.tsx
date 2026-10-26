import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral' | 'danger';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-blue text-paper border border-ink',
    secondary: 'bg-yellow text-ink border border-ink',
    success: 'bg-emerald-100 text-emerald-950 border border-emerald-900',
    warning: 'bg-amber-100 text-amber-950 border border-amber-900',
    danger: 'bg-rose-100 text-rose-950 border border-rose-900',
    neutral: 'bg-paper-2 text-ink border border-ink/40',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 font-sans text-xs font-semibold tracking-wide shadow-[1px_1px_0px_#14161c]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
