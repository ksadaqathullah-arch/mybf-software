import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PortalPageHeaderProps {
  badge?: string;
  badgeText?: string;
  eyebrow?: string;
  tag?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PortalPageHeader({
  badge,
  badgeText,
  eyebrow,
  tag,
  title,
  description,
  actions,
  className,
}: PortalPageHeaderProps) {
  const displayBadge = badge || badgeText;
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-6',
        className
      )}
    >
      <div className="space-y-1.5 max-w-3xl">
        {eyebrow && (
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-ink/60 block">
            {eyebrow}
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {displayBadge && (
            <span className="px-2.5 py-0.5 bg-yellow text-ink border border-ink font-sans text-xs font-bold tracking-wide shadow-[1px_1px_0px_#14161c]">
              {displayBadge}
            </span>
          )}
          {tag && <Badge variant="primary">{tag}</Badge>}
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="font-sans text-sm sm:text-base text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}

import Link from 'next/link';

interface PortalStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subtext?: string;
  detail?: string;
  description?: string;
  unit?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral' | 'danger';
  icon?: React.ElementType;
  className?: string;
  color?: string;
  accent?: 'blue' | 'yellow' | 'ink' | 'emerald';
  href?: string;
}

export function PortalStatCard({
  label,
  value,
  subValue,
  subtext,
  detail,
  description,
  unit,
  badge,
  badgeVariant,
  icon: Icon,
  className,
  color,
  accent = 'ink',
  href,
}: PortalStatCardProps) {
  // If subValue is a long sentence, treat it as detail/description so it does not overflow the number line
  const isLongSubValue = Boolean(subValue && subValue.length > 22);
  const activeDetail = detail || description || subtext || (isLongSubValue ? subValue : undefined);
  const activeBadge = badge || (!isLongSubValue ? subValue : undefined);

  const cardContent = (
    <div
      className={cn(
        'p-5 border-2 border-ink bg-paper text-ink shadow-[4px_4px_0px_#14161c] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex flex-col justify-between h-full min-h-[165px]',
        href && 'hover:bg-yellow/5 cursor-pointer',
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted line-clamp-1">
            {label}
          </span>
          {Icon && (
            <div className="p-1 border border-ink/20 bg-paper-2 text-ink shrink-0 shadow-[1px_1px_0px_#14161c]">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="font-sans text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="font-sans text-xs font-semibold text-ink/70 tracking-wide">
              {unit}
            </span>
          )}
          {activeBadge && (
            <span
              className={cn(
                'font-sans text-xs font-semibold px-2 py-0.5 border shadow-[1px_1px_0px_#14161c] whitespace-nowrap',
                badgeVariant === 'warning'
                  ? 'bg-amber-100 text-amber-950 border-amber-900'
                  : badgeVariant === 'primary'
                  ? 'bg-blue text-paper border-ink'
                  : badgeVariant === 'neutral'
                  ? 'bg-paper-2 text-ink border-ink/40'
                  : badgeVariant === 'danger'
                  ? 'bg-rose-100 text-rose-950 border-rose-900'
                  : 'bg-emerald-100 text-emerald-950 border-emerald-900'
              )}
            >
              {activeBadge}
            </span>
          )}
        </div>
      </div>

      {activeDetail && (
        <p className="font-sans text-xs text-muted mt-3 border-t border-ink/10 pt-2 leading-relaxed line-clamp-2">
          {activeDetail}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus:outline-none focus:ring-2 focus:ring-blue">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
