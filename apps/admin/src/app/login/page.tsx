import { Metadata } from 'next';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { MybfLogo } from '@/components/brand/mybf-logo';

export const metadata: Metadata = {
  title: 'Sign In | MYBF Central Administration',
  description: 'Official Administrative Sign In for MYBF Central Workspace and Super Administrators.',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#030405] text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md text-center flex flex-col items-center">
        <div className="inline-flex flex-col items-center space-y-1.5">
          <MybfLogo size="lg" priority />
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-display">
            Central System Workspace · Subdomain Authority
          </span>
        </div>
      </div>

      <div className="mt-8 mx-auto w-full max-w-xl">
        <AdminLoginForm />
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Malappuram Youth Business Forum (MYBF) · Central Administrative Gateway.</p>
      </div>
    </div>
  );
}
