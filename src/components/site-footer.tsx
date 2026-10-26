import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { navLinks, site } from "@/lib/site";
import logoMark from "../../public/logo-mark.png";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:py-16 max-sm:gap-10 max-sm:py-12 max-sm:pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="lg:col-span-5">
          <Image src={logoMark} alt="MYBF" className="h-14 w-auto" />
          <p className="mt-6 max-w-sm text-lg leading-snug text-paper/75">
            A forum for people building businesses in Malappuram. Supported by Mission Malappuram
            2050.
          </p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3">
          <p className="font-sans text-xs font-bold tracking-wider uppercase text-paper/60">
            Pages
          </p>
          <ul className="mt-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center font-sans text-sm font-medium tracking-normal text-paper/90 hover:text-yellow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/chapters"
                className="inline-flex min-h-10 items-center font-sans text-sm font-medium tracking-normal text-paper/90 hover:text-yellow"
              >
                Chapters
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="inline-flex min-h-10 items-center font-sans text-sm font-medium tracking-normal text-paper/90 hover:text-yellow"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center font-sans text-sm font-semibold tracking-normal text-yellow hover:underline"
              >
                Portal Login →
              </Link>
            </li>
            <li>
              <Link
                href="/verify"
                className="inline-flex min-h-10 items-center font-sans text-sm font-medium tracking-normal text-paper/70 hover:text-yellow"
              >
                Verify Member ID
              </Link>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className="font-sans text-xs font-bold tracking-wider uppercase text-paper/60">
            The desk
          </p>
          <ul className="mt-4">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-11 items-center text-paper/90 hover:text-yellow"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phoneHref}`}
                className="inline-flex min-h-11 items-center text-paper/90 hover:text-yellow"
              >
                {site.phoneDisplay}
              </a>
            </li>
          </ul>
          <div className="mt-3 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${site.instagramHandle}`}
              className="inline-flex size-11 items-center justify-center border border-white/20 hover:border-yellow hover:text-yellow"
            >
              <InstagramIcon />
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Facebook ${site.facebookHandle}`}
              className="inline-flex size-11 items-center justify-center border border-white/20 hover:border-yellow hover:text-yellow"
            >
              <FacebookIcon />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn ${site.fullName}`}
              className="inline-flex size-11 items-center justify-center border border-white/20 hover:border-yellow hover:text-yellow"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-paper/60">
            © {year} {site.fullName}
          </p>
          <p className="font-display text-sm font-semibold tracking-wide text-paper">
            Site credits{" "}
            <a
              href={site.credit}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-yellow decoration-2 underline-offset-4 hover:text-yellow max-sm:inline-block max-sm:py-3"
            >
              {site.creditLabel}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
