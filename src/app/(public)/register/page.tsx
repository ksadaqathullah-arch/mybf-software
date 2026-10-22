import { Metadata } from 'next';
import Link from 'next/link';
import { YouthRegistrationForm } from '@/features/memberships/components/youth-registration-form';
import { Arrow } from '@/components/arrow';

export const metadata: Metadata = {
  title: 'Youth Registration & Chapter Enrollment | MYBF',
  description:
    'Join 16 constituency chapters across Malappuram district. Zero registration fees, tamper-proof digital ID card, democratic chapter voting, and youth leadership discovery.',
};

export default function RegisterPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Page Hero Section */}
      <section className="bg-ink text-paper border-b-4 border-yellow px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block bg-yellow text-ink font-display text-[0.7rem] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 shadow-sm">
                Official Enrollment
              </span>
              <span className="font-display text-[0.72rem] font-bold tracking-[0.2em] uppercase text-paper/75">
                • Mission Malappuram 2050
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-paper tracking-tight">
              Join the forum.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-paper/85 font-serif max-w-2xl leading-relaxed">
              Founders, owners, students, and mentors willing to be useful across 16 chapters in Malappuram. Zero fees, tamper-proof digital ID cards, and democratic chapter governance.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider">
              <span className="px-3 py-1.5 bg-paper/10 border border-paper/20 text-paper">
                ✓ 100% Free Membership
              </span>
              <span className="px-3 py-1.5 bg-paper/10 border border-paper/20 text-paper">
                16 Constituency Chapters
              </span>
              <span className="px-3 py-1.5 bg-yellow text-ink font-black">
                Age 35 or Below (Exception Eligible)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full-Page Registration Form Container */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <YouthRegistrationForm />
        </div>
      </section>
    </div>
  );
}
