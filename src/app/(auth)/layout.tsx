import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-[#035AFC] text-white flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div className="text-left">
            <span className="font-extrabold text-base tracking-tight block">MYBF</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">
              Malappuram Youth Business Forum
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 mx-auto w-full max-w-xl">{children}</div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Malappuram Youth Business Forum. Secure Access Layer.</p>
      </div>
    </div>
  );
}
