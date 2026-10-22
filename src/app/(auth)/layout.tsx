import Link from 'next/link';
import { MybfLogo } from '@/components/brand/mybf-logo';
import { MembershipModalProvider } from '@/features/memberships/context/membership-modal-context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MembershipModalProvider>
      <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md text-center flex flex-col items-center">
          <Link
            href="/"
            className="inline-flex flex-col items-center group space-y-1.5"
            aria-label="MYBF - Malappuram Youth Business Forum"
          >
            <MybfLogo size="lg" priority className="group-hover:opacity-90 transition-opacity" />
            <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
              An Initiative Under Mission Malappuram 2050
            </span>
          </Link>
        </div>

        <div className="mt-8 mx-auto w-full max-w-xl">{children}</div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Malappuram Youth Business Forum (MYBF) · Mission Malappuram 2050. Secure Access Layer.</p>
        </div>
      </div>
    </MembershipModalProvider>
  );
}
