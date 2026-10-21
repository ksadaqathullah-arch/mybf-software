import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { Swipe } from "@/components/swipe";
import { values } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Malappuram Youth Business Forum gathers founders, owners, students and mentors across the district, with the backing of Mission Malappuram 2050.",
};

const pillars = [
  {
    label: "Vision",
    title: "A district that keeps its builders.",
    body: "Malappuram as a place where young entrepreneurs work together, try things, and run companies that leave both money and a social mark.",
    bar: "bg-yellow",
    shadow: "#fcc000",
  },
  {
    label: "Mission",
    title: "The network, the teaching, the next introduction.",
    body: "Give entrepreneurs the people, the learning and the access they need to start a business and keep it standing.",
    bar: "bg-blue",
    shadow: "#005bff",
  },
];

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

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <p className="font-serif text-3xl leading-tight italic sm:text-4xl lg:col-span-5">
            “Connecting entrepreneurs. Creating opportunities.”
          </p>
          <div className="grid gap-5 text-lg leading-relaxed sm:grid-cols-2 lg:col-span-7">
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

      <section className="border-t border-ink/10 bg-paper-2">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 sm:px-8 md:grid-cols-2 lg:py-14">
          {pillars.map((pillar) => (
            <article
              key={pillar.label}
              style={{ ["--lift-shadow" as string]: pillar.shadow }}
              className="group lift relative overflow-hidden border-2 border-ink bg-paper p-8 sm:p-10 max-sm:p-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 -bottom-8 font-display text-[7rem] leading-none font-extrabold tracking-tighter text-ink/[0.05] transition-transform duration-500 group-hover:-translate-x-6 sm:text-[9rem]"
              >
                {pillar.label}
              </span>
              <span
                aria-hidden="true"
                className={`block h-2 w-14 transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-full ${pillar.bar}`}
              />
              <p className="mt-6 font-display text-[0.72rem] font-bold tracking-[0.22em] uppercase">
                {pillar.label}
              </p>
              <h2 className="relative mt-3 max-w-[16ch] text-4xl sm:text-5xl">{pillar.title}</h2>
              <p className="relative mt-5 max-w-md text-xl leading-snug text-muted">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-4">
            <h2 className="text-4xl sm:text-6xl">How we behave</h2>
            <Link href="/what-we-offer" className="btn btn-magenta mt-8">
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
                <dd className="text-lg leading-relaxed text-muted transition-colors group-hover:text-ink sm:col-span-7">
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
