import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral' | 'danger';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-[#EBF2FF] dark:bg-[#035AFC]/20 text-[#035AFC] dark:text-[#3B82F6] border border-[#035AFC]/20',
    secondary: 'bg-[#FEF8E6] dark:bg-[#FBC206]/15 text-[#946800] dark:text-[#FBC206] border border-[#FBC206]/30',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
