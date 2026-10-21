import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { Swipe } from "@/components/swipe";
import { founders } from "@/lib/founders";

export const metadata: Metadata = {
  title: "Founders who made an impact",
  description:
    "Founders recognised by Malappuram Youth Business Forum at Kakkadampoyil — people building in public, named in one room.",
};

export default function FoundersPage() {
  return (
    <>
      <PageHero
        index="06"
        eyebrow="Founders"
        title="Founders who made an impact."
        lead="Named at Kakkadampoyil. Not a hall of fame for the feed — a short list of people the forum asked the district to meet."
        theme="magenta"
        imageLabel="Founders the forum has named"
        photoStart={0}
        strip={founders.map((person) => person.name)}
      >
        <Link href="/initiatives" className="btn btn-yellow">
          The programme <Arrow />
        </Link>
        <Link href="/members" className="btn btn-outline-light">
          Member portraits
        </Link>
      </PageHero>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-16">
          <p className="max-w-2xl text-xl leading-relaxed text-muted">
            Ten people. One series. The posters stay as they were issued; the names sit underneath
            so the page does not turn into a wall of Instagram.
          </p>
          <Swipe count={founders.length} label="founder" className="mt-10">
            <ul
              data-swipe-row
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-sm:-mx-5 max-sm:gap-4 max-sm:px-5"
            >
              {founders.map((person) => (
                <li key={person.name} className="group lift border-2 border-ink bg-paper" style={{ ["--lift-shadow" as string]: "#e11d74" }}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={person.poster}
                      alt={`${person.name} — Founder who made an impact.`}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="border-t-2 border-ink p-4 max-sm:p-3">
                    <h2 className="font-display text-lg font-extrabold tracking-tight">{person.name}</h2>
                    <p className="mt-1 text-sm leading-snug text-muted">{person.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Swipe>
        </div>
      </section>
    </>
  );
}
