"use client";

import { useEffect, useRef, useState } from "react";

type SwipeProps = {
  count: number;
  label: string;
  className?: string;
  children: React.ReactNode;
};

export function Swipe({ count, label, className = "", children }: SwipeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const getRow = () => ref.current?.querySelector<HTMLElement>("[data-swipe-row]") ?? null;

  useEffect(() => {
    const row = getRow();
    if (!row) return;
    const onScroll = () => {
      const items = row.children;
      if (items.length < 2) return;
      const first = items[0] as HTMLElement;
      const stepWidth = (items[1] as HTMLElement).offsetLeft - first.offsetLeft;
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      setIndex(atEnd ? count - 1 : Math.min(count - 1, Math.round(row.scrollLeft / stepWidth)));
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => row.removeEventListener("scroll", onScroll);
  }, [count]);

  const go = (target: number) => {
    const row = getRow();
    if (!row) return;
    const clamped = Math.max(0, Math.min(count - 1, target));
    const first = row.children[0] as HTMLElement;
    const item = row.children[clamped] as HTMLElement;
    row.scrollTo({ left: item.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };

  return (
    <div ref={ref} className={className}>
      {children}
      <div className="mt-5 flex items-center gap-4 sm:hidden" aria-label={`${label} navigation`} role="group">
        <span className="font-display text-xs font-bold tracking-[0.16em] tabular-nums" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="flex flex-1 items-center gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 transition-all duration-300 ${i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`}
            />
          ))}
        </span>
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={`Previous ${label}`}
          className="inline-flex size-11 items-center justify-center border-2 border-ink disabled:opacity-30"
        >
          <svg viewBox="0 0 16 16" className="size-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 8h11M9 4l4 4-4 4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === count - 1}
          aria-label={`Next ${label}`}
          className="inline-flex size-11 items-center justify-center border-2 border-ink bg-ink text-paper disabled:opacity-30"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 8h11M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
