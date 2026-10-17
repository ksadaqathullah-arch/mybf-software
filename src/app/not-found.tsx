import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-[#035AFC] flex items-center justify-center shadow-sm">
          <Compass className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="primary" className="mx-auto">404 NOT FOUND</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Resource Not Located</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The requested page or verification endpoint does not exist or has moved within the MYBF Digital Management Platform.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto text-xs h-10 gap-2">
              <Home className="h-4 w-4" />
              Return to Homepage
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-full sm:w-auto text-xs h-10 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Member Sign In
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 pt-4">
          © {new Date().getFullYear()} Malappuram Youth Business Forum. Secure Access Gateway.
        </p>
      </div>
    </div>
  );
}
