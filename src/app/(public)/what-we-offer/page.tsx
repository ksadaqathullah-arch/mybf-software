import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { Swipe } from "@/components/swipe";
import { offerings } from "@/lib/site";

export const metadata: Metadata = {
  title: "What we offer",
  description:
    "Mentorship, learning, networking, business consultation, partnerships and growth — what MYBF members actually get from the forum.",
};

const accents = [
  { bar: "bg-blue", shadow: "#005bff" },
  { bar: "bg-magenta", shadow: "#e11d74" },
  { bar: "bg-cyan", shadow: "#3aadf2" },
];

export default function OfferPage() {
  return (
    <>
      <PageHero
        index="02"
        eyebrow="What we offer"
        title="Six ways the forum is useful."
        lead="Whatever stage the business is in — a first idea, or a company that already has staff and a problem. This is the help. It is not a content calendar."
        theme="magenta"
        imageLabel="A mentor and a founder, mid-conversation"
        photoStart={5}
        strip={offerings.map((item) => item.title)}
      />

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-14">
        <Swipe count={offerings.length} label="offering">
        <ol
          data-swipe-row
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-sm:-mx-5 max-sm:gap-4 max-sm:px-5"
        >
          {offerings.map((item, index) => {
            const accent = accents[index % accents.length];
            return (
              <li
                key={item.title}
                style={{
                  ["--lift-shadow" as string]: accent.shadow,
                  ["--accent" as string]: accent.shadow,
                }}
                className="group lift relative flex flex-col overflow-hidden border-2 border-ink bg-paper p-7 max-sm:p-5"
              >
                <span className="font-display text-7xl leading-none font-extrabold tracking-tighter text-transparent transition-colors duration-300 [-webkit-text-stroke:2px_var(--accent)] group-hover:text-[var(--accent)] max-sm:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-6 text-3xl sm:text-4xl max-sm:mt-4">{item.title}</h2>
                <p className="mt-3 text-lg leading-relaxed text-muted">{item.description}</p>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-x-100 ${accent.bar}`}
                />
              </li>
            );
          })}
        </ol>
        </Swipe>
        </div>
      </section>

      <section className="bg-yellow">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <p className="max-w-lg text-2xl leading-snug">
            The programme is where most of this shows up in public. The rest happens between
            members, off the poster.
          </p>
          <Link href="/initiatives" className="btn btn-ink">
            See the programme <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
