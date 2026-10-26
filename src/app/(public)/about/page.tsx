import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, Rocket, Cpu, Network, Globe } from "lucide-react";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { ParentInitiativeSection } from "@/components/parent-initiative-section";
import { Swipe } from "@/components/swipe";
import { values } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Forum",
  description:
    "Malappuram Youth Business Forum gathers founders, owners, students and mentors across the district, operating under Mission Malappuram 2050.",
};

const strategicPillarsPreview = [
  { number: "01", title: "Youth Economic Empowerment", icon: TrendingUp, tag: "Aspirational Income" },
  { number: "02", title: "Women Entrepreneurship", icon: Sparkles, tag: "She’s Ready" },
  { number: "03", title: "₹100 Crore Mindset", icon: Rocket, tag: "Scale & Systems" },
  { number: "04", title: "AI-Driven Business Leaders", icon: Cpu, tag: "Tomorrow’s Economy" },
  { number: "05", title: "Grassroots Chapter Network", icon: Network, tag: "16 Constituencies" },
  { number: "06", title: "National & Global Thinking", icon: Globe, tag: "Beyond Borders" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="01"
        eyebrow="About the forum"
        title="The district, in one room."
        lead="Not a feed and not a conference brand. A standing group of people in Malappuram who are building something, and who have agreed to help each other do it."
        theme="blue"
        imageLabel="The forum together"
        photoStart={3}
        strip={["Founders", "Business owners", "Students", "Mentors", "Innovators", "Mission Malappuram 2050"]}
      />

      {/* Narrative Section */}
      <section className="bg-paper border-b-2 border-ink">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-16">
          <p className="font-sans text-2xl sm:text-3xl font-medium leading-relaxed sm:leading-snug lg:col-span-5 text-ink text-balance">
            “Connecting entrepreneurs. Creating opportunities.”
          </p>
          <div className="grid gap-6 text-base sm:text-lg leading-relaxed sm:grid-cols-2 lg:col-span-7 text-muted font-sans">
            <p>
              The forum brings together aspiring entrepreneurs, startup founders, business owners,
              professionals, mentors and innovators from across the district. The job is to make
              those relationships useful: knowledge passed without a stage, and opportunities handed
              on by name.
            </p>
            <p>
              Mission Malappuram 2050 stands behind the forum. That support is practical — it is how
              a local circle of business people stays connected to a longer plan for the district,
              and gives a builder a reason to stay here.
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated Section: OUR PARENT INITIATIVE — Mission Malappuram 2050 */}
      <ParentInitiativeSection />

      {/* Unified Premium Futuristic Vision & Mission CTA Section */}
      <section className="border-b-2 border-ink bg-paper-2 py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div
            style={{ ["--lift-shadow" as string]: "#005bff" }}
            className="group lift relative overflow-hidden border-2 border-ink bg-paper p-8 sm:p-12 lg:p-16 shadow-[8px_8px_0px_#14161c]"
          >
            {/* Top 3-Tone Brand Accent Strip */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue via-yellow to-magenta"
            />

            {/* Giant Background Watermark Accent */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-10 font-sans text-[9rem] sm:text-[14rem] lg:text-[17rem] font-extrabold tracking-tighter text-ink/[0.035] leading-none select-none"
            >
              2050
            </span>

            <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
              {/* Left Column: Purpose Narrative & Main CTA */}
              <div className="lg:col-span-7 space-y-6">
                {/* Section Eyebrow & Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-sans text-xs font-bold tracking-wider uppercase text-blue border border-blue/30 bg-blue/10 px-3 py-1">
                    OUR PURPOSE
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-ink/20 bg-paper-2 px-3 py-1 font-sans text-xs font-semibold text-ink">
                    <span className="size-1.5 rotate-45 bg-yellow" />
                    Mission Malappuram 2050
                  </span>
                </div>

                {/* Main Headline */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-ink leading-tight text-balance">
                  One Vision. Six Missions. A Better Tomorrow.
                </h2>

                {/* Description */}
                <p className="max-w-xl text-lg sm:text-xl leading-relaxed text-muted font-sans">
                  Discover the official vision and six strategic pillars guiding MYBF’s collective
                  entrepreneurship movement under Mission Malappuram 2050.
                </p>

                {/* Main CTA Button & Metadata */}
                <div className="pt-4 flex flex-wrap items-center gap-5 max-sm:flex-col max-sm:items-stretch">
                  <Link
                    href="/mission"
                    className="btn btn-yellow text-sm min-h-12 px-6 max-sm:w-full max-sm:justify-center group/btn shadow-sm font-semibold"
                  >
                    <span>Explore Our Vision &amp; Mission</span>
                    <Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                  </Link>

                  <div className="flex flex-col text-xs text-muted max-sm:text-center">
                    <span className="font-sans font-semibold uppercase tracking-wider text-ink">
                      Official DPR Mandate
                    </span>
                    <span className="font-mono text-xs">
                      16 Chapters · 6 Strategic Pillars
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Art-Directed Architectural Pillar Preview Card */}
              <div className="lg:col-span-5">
                <div className="border-2 border-ink bg-paper-2 p-6 sm:p-7 shadow-[4px_4px_0px_#14161c]">
                  <div className="flex items-center justify-between pb-4 border-b border-ink/15">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-blue" />
                      <span className="font-sans text-xs font-bold tracking-wide uppercase text-ink">
                        Six Strategic Pillars
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-muted uppercase">
                      Overview
                    </span>
                  </div>

                  <ul className="mt-4 divide-y divide-ink/10">
                    {strategicPillarsPreview.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.number} className="py-2.5 flex items-center justify-between gap-3 text-ink">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs font-bold text-blue shrink-0">
                              {item.number}
                            </span>
                            <span className="font-sans text-sm font-semibold tracking-normal truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wider text-muted bg-paper px-2 py-0.5 border border-ink/15">
                            {item.tag}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 pt-4 border-t border-ink/15">
                    <Link
                      href="/mission"
                      className="group/link inline-flex items-center gap-1.5 font-sans text-xs font-bold text-blue hover:text-blue-deep transition-colors"
                    >
                      <span>Read Full DPR Vision &amp; Strategic Framework</span>
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-4">
            <h2 className="text-4xl sm:text-6xl text-ink">How we behave</h2>
            <p className="mt-4 text-lg text-muted font-serif leading-relaxed">
              Ethical standards, mutual trust, and collective generosity that every MYBF member agrees to live by.
            </p>
            <Link href="/what-we-offer" className="btn btn-magenta mt-8 max-sm:w-full max-sm:justify-center">
              What we offer <Arrow />
            </Link>
          </div>
          <Swipe count={values.length} label="value" className="lg:col-span-8 max-sm:min-w-0">
            <dl
              data-swipe-row
              className="border-t-2 border-ink max-sm:-mx-5 max-sm:gap-4 max-sm:border-t-0 max-sm:px-5"
            >
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="group relative isolate grid gap-2 border-b border-ink/15 px-2 py-5 sm:grid-cols-12 sm:gap-6 sm:px-4 max-sm:content-start max-sm:gap-3 max-sm:border-2 max-sm:border-ink max-sm:bg-paper max-sm:p-5 max-sm:pl-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 -z-10 w-1.5 bg-blue transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-full group-hover:bg-paper-2"
                  />
                  <dt className="flex items-baseline gap-4 font-display text-xl font-extrabold tracking-tight transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-blue sm:col-span-5">
                    <span className="text-sm font-bold tracking-[0.16em] text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {value.title}
                  </dt>
                  <dd className="text-lg leading-relaxed text-muted transition-colors group-hover:text-ink sm:col-span-7 font-serif">
                    {value.description}
                  </dd>
                </div>
              ))}
            </dl>
          </Swipe>
        </div>
      </section>
    </>
  );
}
