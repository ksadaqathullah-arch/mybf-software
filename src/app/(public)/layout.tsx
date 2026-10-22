import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MembershipModalProvider } from '@/features/memberships/context/membership-modal-context';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MembershipModalProvider>
      <div className="public-portal flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-yellow focus:px-4 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:text-ink"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </MembershipModalProvider>
  );
}
