"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PhotoSlide } from "@/lib/photos";

const SLIDE_MS = 5000;
const SWIPE_PX = 40;

const tagClass = [
  "bg-yellow px-3 py-1 font-display text-sm font-extrabold tracking-tight text-ink sm:text-base max-sm:px-2 max-sm:py-0.5 max-sm:text-[0.7rem]",
  "ml-6 bg-magenta px-3 py-1 font-display text-sm font-extrabold tracking-tight text-paper sm:text-base max-sm:ml-3 max-sm:px-2 max-sm:py-0.5 max-sm:text-[0.7rem]",
  "ml-2 bg-cyan px-3 py-1 font-display text-sm font-extrabold tracking-tight text-ink sm:text-base max-sm:px-2 max-sm:py-0.5 max-sm:text-[0.7rem]",
] as const;

type PhotoCycleProps = {
  slides: readonly PhotoSlide[];
  start?: number;
  label?: string;
  tone?: "on-dark" | "on-light";
  shadow?: string;
  sizes?: string;
  className?: string;
  controls?: boolean;
  priority?: boolean;
};

export function PhotoCycle({
  slides,
  start = 0,
  label = "Moments from the forum",
  tone = "on-dark",
  shadow = "14px 14px 0 #14161c",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className = "",
  controls = true,
  priority = false,
}: PhotoCycleProps) {
  const origin = ((start % slides.length) + slides.length) % slides.length;
  const [active, setActive] = useState(origin);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onDark = tone === "on-dark";
  const current = slides[active];

  const step = (direction: 1 | -1) =>
    setActive((index) => (index + direction + slides.length) % slides.length);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const startPoint = touchStart.current;
    touchStart.current = null;
    if (!startPoint) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startPoint.x;
    const dy = touch.clientY - startPoint.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    step(dx < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (paused || held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setActive((index) => (index + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, held, slides.length]);

  return (
    <div
      aria-roledescription="carousel"
      aria-label={label}
      className={className}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="relative">
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ boxShadow: shadow }}
          className="relative aspect-[4/3] touch-pan-y overflow-hidden max-sm:aspect-[16/10] max-sm:[box-shadow:8px_8px_0_#14161c]"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.caption}
              aria-roledescription="slide"
              aria-label={`${slide.caption}, ${index + 1} of ${slides.length}`}
              aria-hidden={index !== active}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
                index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            >
              <Image
                src={slide.src}
                alt={index === active ? slide.alt : ""}
                fill
                sizes={sizes}
                priority={priority && index === origin}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <ul
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-5 left-3 flex max-w-[90%] -rotate-[4deg] flex-col items-start gap-1.5 sm:left-6 max-sm:-bottom-4 max-sm:left-2 max-sm:gap-1"
        >
          {current.tags.map((tag, index) => (
            <li key={`${active}-${tag}`} className={tagClass[index]}>
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {controls ? (
        <div className={`mt-10 flex items-end gap-3 max-sm:mt-8 ${onDark ? "text-paper" : "text-ink"}`}>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.75rem] font-bold tracking-[0.16em] uppercase max-sm:tracking-[0.12em]">
              {current.caption}
            </p>
            <span className={`relative mt-2 block h-[3px] w-full overflow-hidden ${onDark ? "bg-paper/25" : "bg-ink/20"}`}>
              <span
                key={active}
                data-paused={paused || held}
                style={{ ["--slide-duration" as string]: `${SLIDE_MS}ms` }}
                className="slide-progress absolute inset-0 bg-yellow"
              />
            </span>
          </div>
          <p className="pb-1 font-display text-xs font-bold tracking-[0.14em] tabular-nums sm:hidden">
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
          <div className="hidden gap-1 pb-1 sm:flex">
            {slides.map((slide, index) => (
              <button
                key={slide.caption}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}: ${slide.caption}`}
                aria-current={index === active ? "true" : undefined}
                className={`size-2 ${index === active ? "bg-yellow" : onDark ? "bg-paper/35" : "bg-ink/30"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className={`inline-flex size-11 shrink-0 items-center justify-center border transition-colors ${
              onDark
                ? "border-paper/40 text-paper hover:bg-paper hover:text-blue"
                : "border-ink/40 text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
              </svg>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
