"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import logoMark from "../../public/logo-mark.png";
import { useMembershipModal } from "@/features/memberships/context/membership-modal-context";

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const { openModal } = useMembershipModal();

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
    <header className="sticky top-0 z-50 border-b-2 border-yellow bg-blue text-paper max-sm:pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="shrink-0 flex items-center py-1 hover:opacity-90 transition-opacity"
        >
          <Image src={logoMark} alt={site.name} priority className="h-8 w-auto sm:h-9" />
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden min-w-0 items-center justify-end gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-2 font-sans text-sm tracking-normal transition-colors ${
                  active ? "text-yellow font-bold" : "text-paper/90 font-medium hover:text-yellow"
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
            className="hidden sm:inline-flex px-3.5 py-2 font-sans text-sm font-semibold tracking-normal text-paper/90 hover:text-yellow transition-colors"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={openModal}
            className="btn btn-yellow min-h-10 px-4 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => setOpenPath(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center font-sans text-xs font-bold uppercase tracking-wider text-paper hover:text-yellow transition-colors lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain border-t border-paper/15 bg-blue px-4 py-4 sm:h-[calc(100dvh-4.5rem)] sm:px-6 sm:py-6 lg:hidden text-paper"
        >
          <ul className="flex flex-col">
            <li>
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={`flex min-h-12 items-center font-sans text-2xl font-bold tracking-tight sm:min-h-14 sm:text-3xl transition-colors ${
                  pathname === "/" ? "text-yellow" : "text-paper hover:text-yellow"
                }`}
              >
                Home
              </Link>
            </li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`flex min-h-12 items-center font-sans text-2xl font-bold tracking-tight sm:min-h-14 sm:text-3xl transition-colors ${
                    pathname === link.href ? "text-yellow" : "text-paper hover:text-yellow"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpenPath(null);
              openModal();
            }}
            className="mt-6 flex min-h-12 w-full items-center justify-center bg-yellow px-5 font-display text-sm font-extrabold tracking-[0.14em] text-ink uppercase hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            Join the forum
          </button>
          <Link
            href="/login"
            className="mt-3 flex min-h-11 items-center justify-center border-2 border-paper/80 bg-transparent px-5 font-display text-xs font-bold tracking-[0.14em] text-paper uppercase hover:bg-paper hover:text-blue transition-colors"
          >
            Portal Login
          </Link>
          <div className="mt-8 flex flex-col gap-1 border-t border-paper/20 pt-6 text-paper/80">
            <a href={`tel:${site.phoneHref}`} className="flex min-h-11 items-center hover:text-yellow transition-colors">
              {site.phoneDisplay}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-11 items-center hover:text-yellow transition-colors">
              {site.email}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
