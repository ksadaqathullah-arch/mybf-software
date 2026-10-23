import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { PhotoCycle } from "@/components/photo-cycle";
import { Swipe } from "@/components/swipe";
import { forumPhotos } from "@/lib/photos";
import { initiatives, slugify } from "@/lib/site";
import { OpenMembershipModalButton } from "@/features/memberships/components/open-membership-modal-button";
import { ParentInitiativeSection } from "@/components/parent-initiative-section";

const chapters = [
  {
    href: "/about",
    index: "01",
    title: "The forum",
    text: "Who sits in the room, and what Mission Malappuram 2050 has to do with it.",
    fill: "bg-yellow",
    accent: "text-ink",
    hoverText: "group-hover:text-ink",
  },
  {
    href: "/what-we-offer",
    index: "02",
    title: "The work",
    text: "Mentorship, a proper consultation, partnerships, and growth that is not a slogan.",
    fill: "bg-magenta",
    accent: "text-magenta",
    hoverText: "group-hover:text-paper",
  },
  {
    href: "/initiatives",
    index: "03",
    title: "The programme",
    text: "Conclaves, the club, tours, gatherings, and the evenings with investors.",
    fill: "bg-cyan",
    accent: "text-blue",
    hoverText: "group-hover:text-ink",
  },
];

const rowBands = ["bg-yellow", "bg-cyan", "bg-magenta", "bg-yellow", "bg-cyan"];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden bg-blue text-paper">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pt-10 pb-14 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:pt-14 lg:pb-16 max-sm:gap-8 max-sm:pt-8 max-sm:pb-12">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 font-display text-[0.72rem] font-bold tracking-[0.24em] uppercase text-paper/75 max-sm:tracking-[0.16em]">
              <span className="max-sm:hidden">MYBF</span>
              <span aria-hidden="true" className="h-px w-10 bg-paper/50 max-sm:hidden" />
              <span>Malappuram Youth Business Forum</span>
            </p>
            <h1 className="mt-6 max-w-[10ch] text-[3.6rem] text-paper sm:text-7xl lg:text-[6.4rem]">
              Why not Malappuram.
            </h1>
            <p className="mt-7 max-w-md text-xl leading-snug text-paper/90 sm:text-2xl">
              A forum for founders, owners and students building in this district. Mentors in the
              room. Introductions with a name on them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 max-sm:mt-8">
              <a href="#membership" className="btn btn-yellow max-sm:w-full max-sm:justify-center">
                See membership <Arrow />
              </a>
              <Link href="/initiatives" className="btn btn-outline-light max-sm:w-full max-sm:justify-center">
                The programme
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <HeroSlideshow />
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-14">
          <Swipe count={chapters.length} label="section">
            <div data-swipe-row className="grid gap-5 md:grid-cols-3 max-sm:-mx-5 max-sm:gap-4 max-sm:px-5">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.href}
                  href={chapter.href}
                  className="group lift relative isolate flex min-h-64 flex-col justify-between overflow-hidden border-2 border-ink bg-paper p-7 max-sm:min-h-0 max-sm:gap-8 max-sm:p-5"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100 ${chapter.fill}`}
                  />
                  <span className="flex items-start justify-between">
                    <span
                      className={`font-display text-5xl font-extrabold tracking-tighter transition-colors max-sm:text-4xl ${chapter.accent} ${chapter.hoverText}`}
                    >
                      {chapter.index}
                    </span>
                    <span
                      className={`inline-flex size-11 items-center justify-center border-2 border-ink transition-colors duration-300 group-hover:border-current ${chapter.hoverText}`}
                    >
                      <Arrow className="size-5 transition-transform duration-300 group-hover:-rotate-45" />
                    </span>
                  </span>
                  <span className={`transition-colors ${chapter.hoverText}`}>
                    <span className="block font-display text-4xl font-extrabold tracking-tight max-sm:text-3xl">
                      {chapter.title}
                    </span>
                    <span className="mt-3 block max-w-xs text-lg leading-snug transition-transform duration-300 group-hover:-translate-y-1">
                      {chapter.text}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Swipe>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-14">
          <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] text-blue uppercase lg:col-span-3 lg:pt-2">
            A note from the forum
          </p>
          <div className="lg:col-span-9">
            <p className="max-w-4xl text-2xl leading-snug sm:text-3xl sm:leading-snug">
              Malappuram already has the people. Founders, shop owners, students with a stubborn
              idea, and operators who have been through a bad year and stayed. What it has not
              always had is a room where those people owe each other something.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-2xl text-xl leading-relaxed text-muted">
                MYBF is that room. Supported by Mission Malappuram 2050, the forum runs conclaves, a
                club, tours and the quieter work of referrals. Between events, members pass work to
                each other by name across 16 chapters.
              </p>
              <Link href="/about" className="btn btn-outline-dark">
                How it works <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Section: OUR PARENT INITIATIVE — Mission Malappuram 2050 */}
      <ParentInitiativeSection className="border-t-2 border-b-2 border-ink" />

      <section className="bg-paper-2">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-[14ch] text-4xl sm:text-6xl">On the programme</h2>
            <Link href="/initiatives" className="btn btn-ink">
              All ten <Arrow />
            </Link>
          </div>
          <Swipe count={5} label="programme item" className="mt-8">
            <ol
              data-swipe-row
              className="border-t-2 border-ink max-sm:-mx-5 max-sm:gap-4 max-sm:border-t-0 max-sm:px-5"
            >
              {initiatives.slice(0, 5).map((item, index) => (
                <li key={item.title} className="border-b border-ink/20 max-sm:border-2 max-sm:border-ink max-sm:bg-paper">
                  <Link
                    href={`/initiatives#${slugify(item.title)}`}
                    className="group relative isolate grid gap-2 px-2 py-5 sm:grid-cols-12 sm:items-center sm:gap-6 sm:px-4 max-sm:h-full max-sm:content-start max-sm:gap-3 max-sm:p-5"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-x-100 ${rowBands[index]}`}
                    />
                    <span className="font-display text-sm font-bold tracking-[0.16em] text-blue transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-ink sm:col-span-2">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl font-extrabold tracking-tight transition-transform duration-300 group-hover:translate-x-2 sm:col-span-4 sm:text-3xl">
                      {item.title}
                    </span>
                    <span
                      className={`text-lg text-muted transition-colors group-hover:text-ink sm:col-span-5 ${
                        rowBands[index] === "bg-magenta" ? "group-hover:text-paper" : ""
                      }`}
                    >
                      {item.description}
                    </span>
                    <span className="hidden justify-end opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:col-span-1 sm:flex sm:-translate-x-3">
                      <Arrow className="size-6" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Swipe>
        </div>
      </section>

      {/* Membership Section with Embedded Official Application Form */}
      <section id="membership" className="scroll-mt-16 bg-ink text-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20 max-sm:gap-8 max-sm:py-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] text-yellow uppercase">
                Membership
              </p>
              <h2 className="mt-4 max-w-[16ch] text-4xl text-paper sm:text-6xl">
                If you are building here, you already have a reason to be in the room.
              </h2>
              <p className="mt-6 max-w-md text-xl leading-snug text-paper/75">
                Founders, owners, students, and the mentors willing to be useful across 16 chapters in Malappuram. Zero fees. Tamper-proof digital ID cards and democratic chapter governance.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <OpenMembershipModalButton className="btn btn-yellow cursor-pointer">
                  Apply for membership <Arrow />
                </OpenMembershipModalButton>
                <Link href="/membership" className="btn btn-outline-light">
                  How membership works
                </Link>
              </div>
            </div>
            <PhotoCycle
              slides={forumPhotos}
              start={7}
              label="Members in the room"
              tone="on-dark"
              shadow="12px 12px 0 #fcc000"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Official Membership Application Section */}
          <div id="register-form" className="mt-16 scroll-mt-24 border-t border-white/15 pt-12">
            <div className="border-2 border-yellow bg-ink p-6 sm:p-10 text-paper relative overflow-hidden lift">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow text-ink font-display text-[0.7rem] font-extrabold uppercase tracking-[0.18em] px-2.5 py-0.5">
                      Official Chapter Enrollment
                    </span>
                    <span className="text-xs text-yellow/80 font-display font-medium tracking-wider uppercase">
                      • Mission Malappuram 2050
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-paper tracking-tight">
                    MYBF Youth Membership Registration
                  </h3>
                  <p className="mt-2 text-paper/80 font-serif text-sm sm:text-base leading-relaxed">
                    Join 16 constituency chapters across Malappuram district. Zero registration fees, tamper-proof digital ID card, democratic chapter voting, and youth leadership discovery.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider">
                    <span className="px-2.5 py-1 bg-white/10 text-paper border border-white/20">
                      ✓ 100% Free Membership
                    </span>
                    <span className="px-2.5 py-1 bg-white/10 text-paper border border-white/20">
                      16 Chapters
                    </span>
                    <span className="px-2.5 py-1 bg-yellow text-ink">
                      Age 35 or Below
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                  <OpenMembershipModalButton className="btn btn-yellow min-h-12 px-6 text-sm cursor-pointer">
                    Open Application Form <Arrow />
                  </OpenMembershipModalButton>
                  <span className="text-xs text-paper/60 font-sans">
                    Step-by-step application modal · Zero fees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
