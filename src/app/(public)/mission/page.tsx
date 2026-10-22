import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Rocket,
  Cpu,
  Network,
  Globe,
  Building2,
  Users,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
  Info,
  Layers,
  Award,
  Compass,
} from "lucide-react";
import { Arrow } from "@/components/arrow";
import { PhotoCycle } from "@/components/photo-cycle";
import { Swipe } from "@/components/swipe";
import { forumPhotos } from "@/lib/photos";
import { INITIAL_16_CHAPTERS } from "@/features/chapters/constants/founding-chapters";
import {
  MYBF_OFFICIAL_VISION,
  MYBF_MISSION_FRAMEWORK,
} from "@/features/organization/constants/strategic-framework";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Mission & Official Vision",
  description:
    "Official Vision and Six Strategic Mission Pillars of Malappuram Youth Business Forum under Mission Malappuram 2050 — building youth economic empowerment, women entrepreneurship, ₹100 crore mindset, AI-driven leaders, grassroots chapters, and global scale.",
  openGraph: {
    title: "MYBF Vision & Mission — Mission Malappuram 2050",
    description:
      "A collective youth entrepreneurship movement across 16 assembly constituencies in Malappuram district.",
    url: `${site.url}/mission`,
  },
};

const pillarBands = [
  {
    theme: "blue",
    shadow: "#005bff",
    bar: "bg-blue",
    badgeBg: "bg-blue/10 text-blue border-blue/30",
    iconBg: "bg-blue text-paper",
    number: "01",
    tagline: "High-Value Economic Mobility",
    disclaimer:
      "Aspirational Target: This represents an ecosystem benchmark and economic aspiration, not an income guarantee. MYBF equips youth with high-value skills, networks, and commercial pathways.",
  },
  {
    theme: "magenta",
    shadow: "#e11d74",
    bar: "bg-magenta",
    badgeBg: "bg-magenta/10 text-magenta border-magenta/30",
    iconBg: "bg-magenta text-paper",
    number: "02",
    tagline: "“Create Women Entrepreneurs in Malappuram, She’s Ready.”",
    disclaimer: null,
  },
  {
    theme: "yellow",
    shadow: "#fcc000",
    bar: "bg-yellow",
    badgeBg: "bg-yellow/20 text-ink border-yellow/60",
    iconBg: "bg-yellow text-ink",
    number: "03",
    tagline: "“Think ₹100 crore. Build ₹100 crore. Become ₹100 crore.”",
    disclaimer:
      "Scale Mindset: Normalising institutional systems, governance, and recurring revenue. Commercial outcomes depend on market execution.",
  },
  {
    theme: "cyan",
    shadow: "#3aadf2",
    bar: "bg-cyan",
    badgeBg: "bg-cyan/15 text-blue-deep border-cyan/40",
    iconBg: "bg-cyan text-ink",
    number: "04",
    tagline: "“Create AI-driven business leaders, the architects of tomorrow’s economy.”",
    disclaimer: null,
  },
  {
    theme: "blue",
    shadow: "#005bff",
    bar: "bg-blue",
    badgeBg: "bg-blue/10 text-blue border-blue/30",
    iconBg: "bg-blue text-paper",
    number: "05",
    tagline: "Constituency-Level Decentralisation",
    disclaimer: null,
  },
  {
    theme: "ink",
    shadow: "#14161c",
    bar: "bg-ink",
    badgeBg: "bg-ink/10 text-ink border-ink/30",
    iconBg: "bg-ink text-paper",
    number: "06",
    tagline: "Beyond Local Boundaries",
    disclaimer: null,
  },
] as const;

const pillarIcons = [TrendingUp, Sparkles, Rocket, Cpu, Network, Globe];

const marqueeWords = [
  "Youth Economic Empowerment",
  "Women Entrepreneurship",
  "₹100 Crore Mindset",
  "AI-Driven Business Leaders",
  "Grassroots Chapter Network",
  "National & Global Thinking",
  "Mission Malappuram 2050",
  "16 Assembly Chapters",
  "Why Not Malappuram",
];

export default function MissionPage() {
  const marqueeLoop = [...marqueeWords, ...marqueeWords];

  return (
    <>
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-blue text-paper">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pt-10 pb-14 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:pt-14 lg:pb-16 max-sm:gap-8 max-sm:pt-8 max-sm:pb-12">
          {/* Left Column: Institutional Identity & Mission Headlines */}
          <div className="lg:col-span-7">
            {/* Top Parent Initiative & Identity Strip */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mission Malappuram 2050 Official Logo */}
              <div className="inline-flex items-center gap-2 rounded-full border border-paper/30 bg-paper/10 px-3.5 py-1.5 backdrop-blur-sm">
                <div className="relative h-5 w-auto aspect-[607/188] shrink-0">
                  <Image
                    src="/logos/mission-malappuram-2050-logo.png"
                    alt="Mission Malappuram 2050"
                    width={607}
                    height={188}
                    priority
                    className="h-full w-auto object-contain"
                  />
                </div>
                <span className="h-3 w-px bg-paper/30" aria-hidden="true" />
                <span className="font-display text-[0.68rem] font-bold tracking-[0.16em] uppercase text-paper">
                  Parent Initiative
                </span>
              </div>

              {/* MYBF Institutional Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow/50 bg-yellow/15 px-3 py-1 text-yellow">
                <span className="size-2 rounded-full bg-yellow animate-pulse" />
                <span className="font-display text-[0.68rem] font-bold tracking-[0.16em] uppercase">
                  MYBF Official DPR Mandate
                </span>
              </div>
            </div>

            {/* Eyebrow */}
            <p className="mt-6 flex items-center gap-3 font-display text-[0.72rem] font-bold tracking-[0.24em] uppercase text-paper/80 max-sm:tracking-[0.16em]">
              <span>06</span>
              <span aria-hidden="true" className="h-px w-10 bg-paper/50" />
              <span>An Initiative Under Mission Malappuram 2050</span>
            </p>

            {/* Main Title */}
            <h1 className="mt-5 max-w-[14ch] text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-[5.5rem] max-sm:text-[2.6rem] leading-[0.92] text-balance">
              Building Malappuram’s Future, Together.
            </h1>

            {/* Lead Narrative */}
            <p className="mt-6 max-w-xl text-xl leading-snug text-paper/90 sm:text-2xl max-sm:text-lg">
              MYBF is not a private podium or an individual brand. It is Malappuram’s collective
              youth entrepreneurship movement — operational across 16 assembly constituencies to
              turn raw district ambition into globally competitive, AI-ready enterprises.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3 max-sm:mt-8 max-sm:flex-col max-sm:[&>a]:w-full max-sm:[&>a]:justify-center">
              <a href="#vision" className="btn btn-yellow">
                Our Official Vision <Arrow />
              </a>
              <a href="#pillars" className="btn btn-outline-light">
                Six Mission Pillars
              </a>
              <Link href="/chapters" className="btn btn-outline-light">
                16 Chapters Network
              </Link>
            </div>
          </div>

          {/* Right Column: Collective Movement Photography */}
          <div className="lg:col-span-5">
            <PhotoCycle
              slides={forumPhotos}
              start={8} // starts at 'group' photo showing collective members together
              label="Collective youth entrepreneurship in Malappuram"
              tone="on-dark"
              shadow="12px 12px 0 #14161c"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </div>
        </div>

        {/* Marquee Ticker: Institutional Pillars & Vision Values (Zero Individual Names) */}
        <div className="overflow-hidden border-y border-black/30 bg-ink text-paper">
          <ul aria-hidden="true" className="marquee-track flex w-max py-3">
            {marqueeLoop.map((word, i) => (
              <li
                key={`${word}-${i}`}
                className="flex items-center gap-6 px-6 font-display text-sm font-bold tracking-[0.18em] whitespace-nowrap uppercase"
              >
                <span>{word}</span>
                <span className="size-1.5 rotate-45 bg-yellow" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 2: OUR OFFICIAL VISION */}
      <section id="vision" className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Vision Header & DPR Attribution */}
            <div className="lg:col-span-4 space-y-5">
              <p className="font-display text-[0.72rem] font-bold tracking-[0.24em] text-blue uppercase">
                Approved DPR Mandate
              </p>
              <h2 className="text-4xl sm:text-6xl text-ink">Our Official Vision</h2>
              <p className="text-lg leading-relaxed text-muted">
                Documented in the approved Detailed Project Report (DPR) for Malappuram Youth Business
                Forum, under the parent framework of Mission Malappuram 2050.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-3 border-2 border-ink bg-paper-2 p-3">
                  <div className="relative h-6 w-auto aspect-[1024/322] shrink-0">
                    <Image
                      src="/logos/mybf-logo.png"
                      alt="MYBF Official"
                      width={1024}
                      height={322}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <span className="h-4 w-px bg-ink/30" />
                  <span className="font-display text-[0.7rem] font-bold tracking-[0.12em] uppercase text-ink">
                    Mission Malappuram 2050
                  </span>
                </div>
              </div>
            </div>

            {/* Vision Statement Editorial Block */}
            <div className="lg:col-span-8">
              <div
                style={{ ["--lift-shadow" as string]: "#005bff" }}
                className="group lift relative border-2 border-ink bg-white p-8 sm:p-12"
              >
                {/* Decorative Top Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue via-yellow to-magenta" />

                {/* Eyebrow Label */}
                <div className="flex items-center justify-between pb-6 border-b border-ink/10">
                  <span className="font-display text-xs font-bold tracking-[0.2em] uppercase text-blue">
                    Official DPR Statement
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted">
                    Exact Approved Text
                  </span>
                </div>

                {/* EXACT Vision Statement from DPR */}
                <blockquote className="mt-8 font-serif text-2xl sm:text-3xl lg:text-[2.2rem] leading-relaxed text-ink font-medium">
                  &ldquo;{MYBF_OFFICIAL_VISION.statement}&rdquo;
                </blockquote>

                {/* Strategic Pillars Anchors */}
                <div className="mt-10 pt-8 border-t-2 border-ink/10 grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue font-display text-xs font-bold uppercase tracking-wider">
                      <Building2 className="size-4 shrink-0" />
                      <span>Benchmark</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">Singapore &amp; Dubai</h3>
                    <p className="text-xs leading-relaxed text-muted">
                      Emulating the ambition, infrastructure mindset, and economic dynamism of global trading hubs.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-magenta font-display text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="size-4 shrink-0" />
                      <span>Inclusivity</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">AI-Ready &amp; Women</h3>
                    <p className="text-xs leading-relaxed text-muted">
                      Preparing the upcoming generation of women and youth to lead technological innovation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-display text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Outcome</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">District Prosperity</h3>
                    <p className="text-xs leading-relaxed text-muted">
                      Creating scalable enterprises, sustainable high-value employment, and generational wealth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SIX MISSION PILLARS */}
      <section id="pillars" className="bg-paper-2 border-b-2 border-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          {/* Section Header */}
          <div className="max-w-3xl space-y-4">
            <p className="font-display text-[0.72rem] font-bold tracking-[0.24em] text-magenta uppercase">
              Strategic Execution
            </p>
            <h2 className="text-4xl sm:text-6xl text-ink">
              {MYBF_MISSION_FRAMEWORK.sectionTitle}
            </h2>
            <p className="text-xl sm:text-2xl font-serif italic text-muted">
              {MYBF_MISSION_FRAMEWORK.sectionSubtitle}
            </p>
            <p className="text-lg leading-relaxed text-muted">
              {MYBF_MISSION_FRAMEWORK.description}
            </p>
          </div>

          {/* Six Pillar Cards Grid */}
          <div className="mt-12">
            <Swipe count={MYBF_MISSION_FRAMEWORK.pillars.length} label="mission pillar">
              <div
                data-swipe-row
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-sm:-mx-5 max-sm:gap-4 max-sm:px-5"
              >
                {MYBF_MISSION_FRAMEWORK.pillars.map((pillar, index) => {
                  const meta = pillarBands[index];
                  const Icon = pillarIcons[index] || Compass;
                  const paragraphs = pillar.strategicIntent.split("\n\n");

                  return (
                    <article
                      key={pillar.id}
                      style={{ ["--lift-shadow" as string]: meta.shadow }}
                      className="group lift relative flex flex-col justify-between border-2 border-ink bg-paper p-8 max-sm:p-6"
                    >
                      {/* Top Header Strip */}
                      <div>
                        {/* Animated Bar */}
                        <span
                          aria-hidden="true"
                          className={`block h-2 w-14 transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-full ${meta.bar}`}
                        />

                        {/* Top Meta Row */}
                        <div className="mt-6 flex items-center justify-between">
                          <span className="font-display text-5xl font-extrabold tracking-tighter text-ink">
                            {meta.number}
                          </span>
                          <div className={`inline-flex size-12 items-center justify-center border-2 border-ink ${meta.iconBg}`}>
                            <Icon className="size-6" />
                          </div>
                        </div>

                        {/* Pillar Title */}
                        <p className="mt-4 font-display text-[0.72rem] font-bold tracking-[0.22em] text-muted uppercase">
                          Pillar {meta.number}
                        </p>
                        <h3 className="mt-2 text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-ink">
                          {pillar.title}
                        </h3>

                        {/* Tagline / Highlight Quote */}
                        <div className="mt-4 rounded-none border-l-4 border-ink bg-white/70 p-3">
                          <p className="font-serif text-base italic font-semibold text-ink">
                            {meta.tagline}
                          </p>
                        </div>

                        {/* Detailed Intent Text */}
                        <div className="mt-5 space-y-3 text-base leading-relaxed text-muted">
                          {paragraphs.map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      </div>

                      {/* Disclaimers & Notes */}
                      {meta.disclaimer && (
                        <div className="mt-6 pt-4 border-t-2 border-ink/10 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-ink">
                          <Info className="size-4 shrink-0 text-amber-700 mt-0.5" />
                          <p className="leading-snug">{meta.disclaimer}</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </Swipe>
          </div>
        </div>
      </section>

      {/* SECTION 4: GRASSROOTS MOVEMENT (16 CONSTITUENCY CHAPTERS) */}
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <p className="font-display text-[0.72rem] font-bold tracking-[0.24em] text-blue uppercase">
                Pillar 5 in Action
              </p>
              <h2 className="text-4xl sm:text-6xl text-ink">
                Decentralised Across 16 Constituencies
              </h2>
              <p className="text-xl leading-relaxed text-muted">
                MYBF is deliberately structured to prevent concentration in a single city or elite club.
                Permanent youth business forums operate across all 16 Assembly Constituencies of
                Malappuram.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="size-6 shrink-0 rounded-none border-2 border-ink bg-yellow flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">
                      Constituency Infrastructure
                    </h3>
                    <p className="text-sm text-muted">
                      From Nilambur forests to Ponnani coastline, local chapters run continuous meets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-6 shrink-0 rounded-none border-2 border-ink bg-cyan flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">
                      Democratic Chapter Governance
                    </h3>
                    <p className="text-sm text-muted">
                      Led by local youth executive committees, not controlled by any single individual.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-6 shrink-0 rounded-none border-2 border-ink bg-magenta text-paper flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">
                      District-Wide Cross Referral
                    </h3>
                    <p className="text-sm text-muted">
                      Over 16 chapters collaborate to trade goods, services, mentorship, and investments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/chapters" className="btn btn-ink">
                  Explore All 16 Chapters Directory <Arrow />
                </Link>
              </div>
            </div>

            {/* Right: Interactive 16 Chapters Grid Showcase */}
            <div className="lg:col-span-7">
              <div className="border-2 border-ink bg-paper-2 p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-ink/20">
                  <span className="font-display text-xs font-bold tracking-[0.2em] uppercase text-ink">
                    16 Founding Assembly Chapters
                  </span>
                  <span className="font-mono text-xs font-bold text-blue">
                    7 Taluks of Malappuram
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INITIAL_16_CHAPTERS.map((ch) => (
                    <Link
                      key={ch.code}
                      href={`/chapters/${ch.slug}`}
                      className="group border border-ink bg-paper p-3 transition-colors hover:bg-yellow hover:border-ink"
                    >
                      <span className="font-mono text-[10px] font-bold text-muted block group-hover:text-ink">
                        {ch.constituency}
                      </span>
                      <h4 className="mt-1 font-display text-sm font-extrabold text-ink leading-tight">
                        {ch.name.replace(" Chapter", "")}
                      </h4>
                      <span className="mt-2 text-[10px] text-muted flex items-center gap-1 group-hover:text-ink">
                        <MapPin className="size-3 text-blue group-hover:text-ink" />
                        <span>{ch.taluk}</span>
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-ink/20 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
                  <span>Zero membership fees for verified youth.</span>
                  <Link
                    href="/chapters"
                    className="inline-flex items-center gap-1 font-display text-xs font-bold tracking-wider text-blue uppercase hover:underline"
                  >
                    <span>View Chapter Executives &amp; Events</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: JOIN THE MISSION (COLLECTIVE CTAS) */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="font-display text-[0.72rem] font-bold tracking-[0.24em] text-yellow uppercase">
              Get Involved
            </p>
            <h2 className="mt-3 text-4xl sm:text-6xl text-paper">
              Build Malappuram’s Economic Future With Us.
            </h2>
            <p className="mt-4 text-xl leading-relaxed text-paper/80">
              MYBF is built by and for Malappuram’s youth. Whether you are running an established
              company, building a tech product, freelancing, or starting up your first idea — this forum
              is your room.
            </p>
          </div>

          {/* 3 Action Pillars */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Membership */}
            <div
              style={{ ["--lift-shadow" as string]: "#fcc000" }}
              className="group lift border-2 border-paper/30 bg-ink p-8 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex size-12 items-center justify-center border-2 border-yellow bg-yellow text-ink">
                  <Users className="size-6" />
                </div>
                <h3 className="mt-6 text-2xl font-display font-extrabold text-paper">
                  Apply for Membership
                </h3>
                <p className="mt-3 text-base text-paper/70 leading-relaxed">
                  100% Free Membership. Obtain your official digital ID card, connect with verified
                  peers, and access district-level business referrals.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-paper/15">
                <Link href="/register" className="btn btn-yellow w-full justify-center">
                  Join the forum <Arrow />
                </Link>
              </div>
            </div>

            {/* Card 2: 16 Chapters */}
            <div
              style={{ ["--lift-shadow" as string]: "#005bff" }}
              className="group lift border-2 border-paper/30 bg-ink p-8 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex size-12 items-center justify-center border-2 border-blue bg-blue text-paper">
                  <Network className="size-6" />
                </div>
                <h3 className="mt-6 text-2xl font-display font-extrabold text-paper">
                  Explore 16 Chapters
                </h3>
                <p className="mt-3 text-base text-paper/70 leading-relaxed">
                  Locate your legislative constituency chapter, meet local business committee leaders,
                  and participate in grassroots working sessions.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-paper/15">
                <Link href="/chapters" className="btn btn-outline-light w-full justify-center">
                  Find your chapter <Arrow />
                </Link>
              </div>
            </div>

            {/* Card 3: Events & Conclaves */}
            <div
              style={{ ["--lift-shadow" as string]: "#e11d74" }}
              className="group lift border-2 border-paper/30 bg-ink p-8 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex size-12 items-center justify-center border-2 border-magenta bg-magenta text-paper">
                  <Award className="size-6" />
                </div>
                <h3 className="mt-6 text-2xl font-display font-extrabold text-paper">
                  Discover Programs &amp; Events
                </h3>
                <p className="mt-3 text-base text-paper/70 leading-relaxed">
                  Attend district conclaves, corporate tours, investor evenings, and AI masterclasses
                  curated specifically for Malappuram founders.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-paper/15">
                <Link href="/events" className="btn btn-outline-light w-full justify-center">
                  Upcoming events <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
