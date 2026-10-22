import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { Swipe } from "@/components/swipe";
import { initiatives, slugify } from "@/lib/site";
import kakkadampoyil from "../../../../public/posters/kakkadampoyil.jpg";

export const metadata: Metadata = {
  title: "Initiatives",
  description:
    "MYBF conclaves, the club, business tours, gatherings, panels, webinars, investor meetups, awards and writing.",
};

const bands = ["bg-yellow", "bg-cyan", "bg-magenta"];

export default function InitiativesPage() {
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Initiatives"
        title="What we put on the calendar."
        lead="Ten kinds of gathering. Some fill a hall. Some are a table. All of them are meant to end with a next step, not a group photo."
        theme="cyan"
        imageLabel="A conclave — speakers on stage, a full hall"
        photoStart={6}
        strip={initiatives.map((item) => item.title)}
      />

      <section className="border-b border-ink/10 bg-paper-2">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-10 sm:grid-cols-[auto_1fr] sm:px-8 lg:gap-12 lg:py-12">
          <div className="lift w-40 sm:w-48 lg:w-56" style={{ ["--lift-shadow" as string]: "#e11d74" }}>
            <Image
              src={kakkadampoyil}
              alt="MYBF poster for Kakkadampoyil: Building ideas, Creating connections, Designing the future."
              sizes="224px"
              className="h-auto w-full border-2 border-ink"
            />
          </div>
          <div>
            <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] text-magenta uppercase">
              Out in the district
            </p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Kakkadampoyil</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed">
              Not every MYBF day is a hotel ballroom. The Kakkadampoyil poster carries the three
              lines the forum keeps returning to: building ideas, creating connections, designing
              the future. The place changes. The brief does not.
            </p>
            <Link href="/mission" className="btn btn-magenta mt-6 max-sm:w-full max-sm:justify-center">
              Our Vision &amp; Mission <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:py-12">
          <Swipe count={initiatives.length} label="initiative">
            <ol data-swipe-row className="max-sm:-mx-5 max-sm:gap-4 max-sm:px-5">
              {initiatives.map((item, index) => {
                const band = bands[index % bands.length];
                return (
                  <li
                    key={item.title}
                    id={slugify(item.title)}
                    style={{ scrollMarginTop: "5rem" }}
                    className="group relative isolate grid scroll-mt-24 gap-3 border-b border-ink/15 px-2 py-6 first:border-t-2 first:border-t-ink sm:grid-cols-12 sm:items-center sm:gap-8 sm:px-4 max-sm:content-start max-sm:border-2 max-sm:border-ink max-sm:bg-paper max-sm:p-5"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-x-100 ${band}`}
                    />
                    <span className="font-display text-sm font-bold tracking-[0.18em] text-blue transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-ink sm:col-span-2">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className={`text-3xl tracking-tight transition-[transform,color] duration-300 group-hover:translate-x-2 sm:col-span-4 sm:text-4xl ${
                        band === "bg-magenta" ? "group-hover:text-paper" : ""
                      }`}
                    >
                      {item.title}
                    </h2>
                    <p
                      className={`text-lg leading-relaxed text-muted transition-colors sm:col-span-6 ${
                        band === "bg-magenta" ? "group-hover:text-paper" : "group-hover:text-ink"
                      }`}
                    >
                      {item.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Swipe>
        </div>
        <div className="mx-auto max-w-[1440px] px-5 pb-14 sm:px-8">
          <Link href="/membership" className="btn btn-blue">
            Who the programme is for <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
