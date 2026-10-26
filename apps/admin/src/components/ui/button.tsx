'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-semibold tracking-normal border-2 border-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-[2px_2px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5';

    const variants = {
      default: 'bg-blue text-paper hover:bg-blue-deep',
      primary: 'bg-blue text-paper hover:bg-blue-deep',
      secondary: 'bg-yellow text-ink hover:bg-yellow/90',
      outline: 'bg-paper text-ink hover:bg-ink hover:text-paper',
      ghost: 'bg-transparent border-transparent shadow-none hover:bg-ink/10 hover:border-ink/20 text-ink',
      danger: 'bg-rose-600 text-paper hover:bg-rose-700',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
