import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/arrow";
import { PageHero } from "@/components/page-hero";
import { members } from "@/lib/members";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Portraits of people in Malappuram Youth Business Forum. The gallery fills as member photos are collected.",
};

export default function MembersPage() {
  const empty = members.length === 0;

  return (
    <>
      <PageHero
        index="05"
        eyebrow="Members"
        title="The people in the room."
        lead="Portraits of the forum. This page is ready — photos go up as they are collected, one person at a time, not a dump of every event shot."
        theme="blue"
        imageLabel="The chapter together"
        photoStart={3}
        strip={["Founders", "Owners", "Students", "Mentors", "Operators"]}
      >
        <Link href="/contact" className="btn btn-yellow">
          Ask to join <Arrow />
        </Link>
        <Link href="/membership" className="btn btn-outline-light">
          How membership works
        </Link>
      </PageHero>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-16">
          {empty ? (
            <div className="mx-auto max-w-xl border-2 border-dashed border-ink/30 px-6 py-16 text-center sm:px-10 max-sm:px-5 max-sm:py-12">
              <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] text-blue uppercase">
                Gallery
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl">Portraits coming.</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Member photos will sit in a quiet grid here — name, a short line of work, one
                picture. Nothing from the event dump. When the portraits are ready, they go in.
              </p>
              <Link href="/contact" className="btn btn-blue mt-8 max-sm:w-full max-sm:justify-center">
                Write to us <Arrow />
              </Link>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <li key={member.photo} className="border-2 border-ink bg-paper">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={`/members/${member.photo}`}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="border-t-2 border-ink p-4">
                    <h2 className="font-display text-xl font-extrabold tracking-tight">{member.name}</h2>
                    {member.role ? (
                      <p className="mt-1 text-sm leading-snug text-muted">{member.role}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
