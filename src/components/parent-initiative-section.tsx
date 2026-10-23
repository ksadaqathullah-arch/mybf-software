import * as React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ParentInitiativeSectionProps {
  className?: string;
  showWatermark?: boolean;
}

/**
 * Mission Malappuram 2050 Parent Initiative Section
 *
 * Dedicated editorial showcase communicating that MYBF is an initiative under
 * Mission Malappuram 2050, with official logo artwork, institutional blueprint,
 * and a direct link to the official external website.
 */
export function ParentInitiativeSection({
  className,
  showWatermark = true,
}: ParentInitiativeSectionProps) {
  return (
    <section
      className={cn(
        "border-b-2 border-ink bg-paper py-14 sm:py-20 lg:py-24 relative overflow-hidden",
        className
      )}
    >
      {/* Subtle Background Watermark */}
      {showWatermark && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -bottom-14 font-display text-[9rem] sm:text-[14rem] lg:text-[18rem] font-extrabold tracking-tighter text-ink/[0.03] leading-none select-none"
        >
          MM2050
        </span>
      )}

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 relative z-10">
        <div
          style={{ ["--lift-shadow" as string]: "#005bff" }}
          className="group lift relative overflow-hidden border-2 border-ink bg-paper-2 p-8 sm:p-12 lg:p-16 shadow-[8px_8px_0px_#14161c]"
        >
          {/* Top 3-Tone Brand Accent Strip */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue via-yellow to-magenta"
          />

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Left Column: Parent Initiative Narrative & External CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-[0.72rem] font-bold tracking-[0.24em] uppercase text-blue border border-blue/30 bg-blue/10 px-3 py-1">
                  OUR PARENT INITIATIVE
                </span>
                <span className="inline-flex items-center gap-1.5 border border-ink/20 bg-paper px-3 py-1 font-display text-[0.68rem] font-bold tracking-[0.14em] uppercase text-ink">
                  <span className="size-1.5 rounded-full bg-blue animate-pulse" />
                  Official Umbrella Movement
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-ink leading-[0.95] text-balance">
                Mission Malappuram 2050
              </h2>

              {/* Official Logo Banner */}
              <div className="pt-1 pb-2">
                <div className="inline-block p-4 border-2 border-ink bg-paper shadow-[3px_3px_0px_#14161c] max-w-sm">
                  <div className="relative aspect-[607/188] w-full h-auto max-h-16 flex items-center select-none">
                    <Image
                      src="/logos/mission-malappuram-2050-logo.png"
                      alt="Mission Malappuram 2050 Official Logo"
                      width={607}
                      height={188}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Supporting Description */}
              <p className="max-w-xl text-xl sm:text-2xl leading-relaxed text-muted font-serif">
                MYBF is an initiative under Mission Malappuram 2050, connecting young entrepreneurs, aspiring founders and business communities with a larger vision for Malappuram&apos;s future.
              </p>

              {/* External Website Button & Metadata */}
              <div className="pt-4 flex flex-wrap items-center gap-5 max-sm:flex-col max-sm:items-stretch">
                <a
                  href="https://www.missionmalappuram2050.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue text-sm min-h-14 px-8 max-sm:w-full max-sm:justify-center group/btn shadow-[4px_4px_0px_#14161c] hover:shadow-[6px_6px_0px_#14161c] transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue"
                  aria-label="Explore Mission Malappuram 2050 Official Website (opens in a new tab)"
                >
                  <span>Explore Mission Malappuram 2050</span>
                  <ExternalLink className="size-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>

                <div className="flex flex-col text-xs text-muted max-sm:text-center">
                  <span className="font-display font-bold uppercase tracking-wider text-ink flex items-center gap-1.5 max-sm:justify-center">
                    <span>Official External Website</span>
                    <span className="inline-block size-1.5 rounded-full bg-emerald-600" />
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    www.missionmalappuram2050.com
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Parent Initiative Showcase Card */}
            <div className="lg:col-span-5">
              <div className="border-2 border-ink bg-paper p-6 sm:p-7 shadow-[4px_4px_0px_#14161c]">
                <div className="flex items-center justify-between pb-4 border-b border-ink/15">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-yellow" />
                    <span className="font-display text-xs font-bold tracking-[0.18em] uppercase text-ink">
                      District Master Mandate
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-blue uppercase">
                    2050 Horizon
                  </span>
                </div>

                <ul className="mt-4 space-y-4 divide-y divide-ink/10">
                  <li className="pt-2">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-blue bg-blue/10 px-2 py-0.5 border border-blue/20 shrink-0 mt-0.5">
                        01
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-ink">
                          District Economic Blueprint
                        </h4>
                        <p className="mt-1 font-serif text-sm text-muted leading-relaxed">
                          A 25-year roadmap for Malappuram&apos;s commercial, technological, and infrastructure transformation.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-magenta bg-magenta/10 px-2 py-0.5 border border-magenta/20 shrink-0 mt-0.5">
                        02
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-ink">
                          Youth Innovation Catalysis
                        </h4>
                        <p className="mt-1 font-serif text-sm text-muted leading-relaxed">
                          Empowering youth through dedicated forums like MYBF to build generational wealth and local enterprise.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-yellow bg-yellow/20 px-2 py-0.5 border border-yellow/40 shrink-0 mt-0.5">
                        03
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-ink">
                          Global Diaspora Integration
                        </h4>
                        <p className="mt-1 font-serif text-sm text-muted leading-relaxed">
                          Channeling Malappuram&apos;s global NRI network and diaspora capital directly into grassroots ventures.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-ink/15">
                  <a
                    href="https://www.missionmalappuram2050.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-blue hover:text-blue-deep transition-colors"
                  >
                    <span>Visit Official Portal: missionmalappuram2050.com</span>
                    <ExternalLink className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
