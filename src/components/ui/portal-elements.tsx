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
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-ink/60 block">
            {eyebrow}
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {displayBadge && (
            <span className="px-2.5 py-0.5 bg-yellow text-ink border border-ink font-display text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#14161c]">
              {displayBadge}
            </span>
          )}
          {tag && <Badge variant="primary">{tag}</Badge>}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink uppercase">
          {title}
        </h1>
        {description && (
          <p className="font-serif text-sm sm:text-base text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  );
}

interface PortalStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subtext?: string;
  detail?: string;
  icon?: React.ElementType;
  className?: string;
  color?: string;
  accent?: 'blue' | 'yellow' | 'ink' | 'emerald';
}

export function PortalStatCard({
  label,
  value,
  subValue,
  subtext,
  detail,
  icon: Icon,
  className,
  color,
  accent = 'ink',
}: PortalStatCardProps) {
  const activeDetail = detail || subtext;
  const accentBorder = {
    ink: 'border-ink',
    blue: 'border-blue',
    yellow: 'border-yellow',
    emerald: 'border-emerald-700',
  }[accent];

  return (
    <div
      className={cn(
        'p-5 border-2 border-ink bg-paper text-ink shadow-[4px_4px_0px_#14161c] transition-all hover:translate-x-0.5 hover:translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-ink shrink-0" />}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="font-display text-3xl sm:text-4xl font-black text-ink tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="font-display text-xs font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-700">
            {subValue}
          </span>
        )}
      </div>
      {activeDetail && (
        <p className="font-serif text-xs text-muted mt-2 border-t border-ink/10 pt-1.5">
          {activeDetail}
        </p>
      )}
    </div>
  );
}
