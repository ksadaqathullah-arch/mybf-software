'use client';

import * as React from 'react';
import { Arrow } from '@/components/arrow';
import { PageHero } from '@/components/page-hero';
import { Swipe } from '@/components/swipe';
import { audience, benefits } from '@/lib/site';
import { useMembershipModal } from '@/features/memberships/context/membership-modal-context';

const shadows = ['#005bff', '#e11d74', '#3aadf2', '#14161c'];

export function MembershipPageView() {
  const { openModal } = useMembershipModal();

  return (
    <>
      <PageHero
        index="04"
        eyebrow="Membership"
        title="Come in if you are willing to be useful."
        lead="For people in and around Malappuram who are serious about a business — starting one, running one, or helping one survive its second year."
        theme="yellow"
        imageLabel="New members being introduced at a gathering"
        photoStart={8}
        strip={['Startup founders', 'Business owners', 'Students with an idea', 'Professionals', 'Mentors']}
      >
        <button
          type="button"
          onClick={openModal}
          className="btn btn-ink cursor-pointer"
        >
          Apply to join <Arrow />
        </button>
        <a href="#benefits" className="btn btn-outline-dark">
          What you get
        </a>
      </PageHero>

      {/* Audience Section */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">Who it is for</h2>
          <Swipe count={audience.length} label="member type" className="mt-8">
            <ol
              data-swipe-row
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-sm:-mx-5 max-sm:gap-4 max-sm:px-5"
            >
              {audience.map((person, index) => (
                <li
                  key={person.title}
                  style={{ ['--lift-shadow' as string]: shadows[index % shadows.length] }}
                  className="group lift flex flex-col border-2 border-ink bg-paper p-6 max-sm:p-5"
                >
                  <p className="font-sans text-sm font-bold tracking-wider text-blue">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-2xl sm:text-3xl font-sans font-bold tracking-tight text-ink">
                    {person.title}
                  </h3>
                  <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted font-sans">
                    {person.description}
                  </p>
                </li>
              ))}
            </ol>
          </Swipe>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="scroll-mt-20 bg-blue text-paper">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-12 lg:py-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper lg:col-span-5 leading-[1.1]">What you walk away with</h2>
          <ul className="border-b border-white/25 lg:col-span-7">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="group flex items-center gap-4 border-t border-white/25 py-4 text-lg sm:text-xl leading-relaxed font-sans"
              >
                <span
                  aria-hidden="true"
                  className="h-0.5 w-4 shrink-0 bg-yellow transition-[width] duration-300 ease-out group-hover:w-10"
                />
                <span className="transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-yellow">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Official Membership Application Callout Section */}
      <section id="register-form" className="scroll-mt-20 border-t border-ink/10 bg-paper-2 py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="max-w-4xl mx-auto border-2 border-ink bg-paper p-8 sm:p-12 shadow-[8px_8px_0px_#14161c] lift">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <span className="inline-block bg-yellow text-ink font-sans text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 border border-ink/20">
                  Official Chapter Enrollment
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  Ready to apply for MYBF membership?
                </h3>
                <p className="text-muted font-sans text-base sm:text-lg leading-relaxed">
                  Enroll in one of 16 constituency chapters across Malappuram district. Zero fees, tamper-proof digital ID card, and youth leadership discovery. Membership is open to applicants aged 35 years or below.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs font-sans font-semibold">
                  <span className="px-2.5 py-1 bg-ink/10 text-ink border border-ink/20">
                    ✓ 100% Free Membership
                  </span>
                  <span className="px-2.5 py-1 bg-ink/10 text-ink border border-ink/20">
                    16 Chapters
                  </span>
                  <span className="px-2.5 py-1 bg-yellow text-ink border border-ink">
                    Age 35 or Below
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button
                  type="button"
                  onClick={openModal}
                  className="btn btn-yellow min-h-12 px-8 text-sm cursor-pointer shadow-sm"
                >
                  Start Application <Arrow />
                </button>
                <span className="text-xs text-muted font-sans">
                  Step-by-step application modal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
