import type { Metadata } from "next";
import { JoinForm } from "@/components/join-form";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Write to Malappuram Youth Business Forum — email mybfcommunity@gmail.com or call +91 85929 56370.",
};

export default function ContactPage() {
  return (
    <div className="bg-paper">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
        <header className="bg-magenta px-5 py-16 text-paper sm:px-8 lg:col-span-5 lg:px-12 lg:py-24 max-sm:py-12">
          <p className="font-display text-[0.72rem] font-bold tracking-[0.22em] uppercase text-paper/70">
            Contact
          </p>
          <h1 className="mt-4 text-5xl text-paper sm:text-6xl max-sm:text-4xl">Talk to someone at the forum.</h1>
          <p className="mt-6 max-w-sm text-xl leading-snug text-paper/85">
            Membership, a gathering, a speaker, a partnership. Write the way you actually write.
          </p>

          <dl className="mt-12 space-y-6">
            <div>
              <dt className="font-display text-[0.68rem] font-bold tracking-[0.18em] uppercase text-paper/60">
                Email
              </dt>
              <dd>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center text-lg underline decoration-yellow decoration-2 underline-offset-4">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.68rem] font-bold tracking-[0.18em] uppercase text-paper/60">
                Phone
              </dt>
              <dd>
                <a href={`tel:${site.phoneHref}`} className="inline-flex min-h-11 items-center text-lg underline decoration-yellow decoration-2 underline-offset-4">
                  {site.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-display text-[0.68rem] font-bold tracking-[0.18em] uppercase text-paper/60">
                Where
              </dt>
              <dd className="text-lg">{site.location}</dd>
            </div>
          </dl>

          <div className="mt-8 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${site.instagramHandle}`}
              className="inline-flex size-11 items-center justify-center border border-paper/40 hover:bg-paper hover:text-magenta"
            >
              <InstagramIcon />
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Facebook ${site.facebookHandle}`}
              className="inline-flex size-11 items-center justify-center border border-paper/40 hover:bg-paper hover:text-magenta"
            >
              <FacebookIcon />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn ${site.fullName}`}
              className="inline-flex size-11 items-center justify-center border border-paper/40 hover:bg-paper hover:text-magenta"
            >
              <LinkedInIcon />
            </a>
          </div>
        </header>

        <section className="px-5 py-14 sm:px-8 lg:col-span-7 lg:px-14 lg:py-24 max-sm:py-12">
          <h2 className="text-3xl sm:text-4xl">Ask to join</h2>
          <p className="mt-3 mb-10 max-w-md text-lg text-muted">
            A few lines is enough. The team replies about membership and whatever is coming up.
          </p>
          <JoinForm />
        </section>
      </div>
    </div>
  );
}
