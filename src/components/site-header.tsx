"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import logoMark from "../../public/logo-mark.png";

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-yellow bg-sky text-ink max-sm:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${site.name} home`} className="shrink-0 bg-blue px-2.5 py-1.5">
          <Image src={logoMark} alt="" priority className="h-8 w-auto sm:h-9" />
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden min-w-0 items-center justify-end gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-2 py-3 font-display text-[0.72rem] font-semibold tracking-[0.08em] uppercase transition-colors ${
                  active ? "text-blue" : "text-ink/70 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-2 font-display text-[0.72rem] font-bold tracking-[0.08em] uppercase text-ink/70 hover:text-blue transition-colors"
          >
            Login
          </Link>
          <Link
            href="/membership#register-form"
            className="btn btn-yellow min-h-11 px-4 max-sm:min-h-10 max-sm:px-3 max-sm:text-[0.72rem]"
          >
            Join
          </Link>
          <button
            type="button"
            onClick={() => setOpenPath(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center font-display text-[0.7rem] font-bold tracking-[0.14em] uppercase lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain border-t border-ink/10 bg-sky px-4 py-4 sm:h-[calc(100dvh-4.5rem)] sm:px-6 sm:py-6 lg:hidden"
        >
          <ul className="flex flex-col">
            <li>
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className="flex min-h-12 items-center font-display text-[1.85rem] font-extrabold tracking-tight sm:min-h-14 sm:text-4xl"
              >
                Home
              </Link>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`flex min-h-12 items-center font-display text-[1.85rem] font-extrabold tracking-tight sm:min-h-14 sm:text-4xl ${
                    pathname === link.href ? "text-blue" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/membership#register-form"
            className="mt-6 flex min-h-12 items-center justify-center bg-yellow px-5 font-display text-sm font-extrabold tracking-[0.14em] text-ink uppercase"
          >
            Join the forum
          </Link>
          <Link
            href="/login"
            className="mt-3 flex min-h-11 items-center justify-center border-2 border-ink bg-transparent px-5 font-display text-xs font-bold tracking-[0.14em] text-ink uppercase hover:bg-ink hover:text-paper"
          >
            Portal Login
          </Link>
          <div className="mt-8 flex flex-col gap-1 border-t border-ink/10 pt-6 text-ink/70">
            <a href={`tel:${site.phoneHref}`} className="flex min-h-11 items-center">
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-11 items-center">
              {site.email}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
