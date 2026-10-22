'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMembershipModal } from '@/features/memberships/context/membership-modal-context';

export function LoginForm() {
  const { openModal } = useMembershipModal();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Check role redirection: SUPER_ADMIN can also access /super-admin, normal member to /member
      if (data.user?.roles?.includes('SUPER_ADMIN')) {
        window.location.href = '/super-admin';
      } else {
        window.location.href = '/member';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-2xl">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <Badge variant="primary" className="mx-auto mb-2">Member & Officer Sign In</Badge>
        <CardTitle className="text-2xl font-bold">Access MYBF Workspace</CardTitle>
        <CardDescription className="text-xs">
          Enter your unique username, registered email, or verified mobile number
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Username, Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. anas_manjeri, member@mybf.in, 9847012345"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#035AFC] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-2">
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Server-Side Deny-By-Default Authorization</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-500 text-center">
        <div>
          Received an approval link?{' '}
          <Link href="/activate" className="ml-1 text-[#035AFC] font-semibold hover:underline">
            Activate Account
          </Link>
        </div>
        <div>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={openModal}
            className="ml-1 text-[#035AFC] font-semibold hover:underline cursor-pointer"
          >
            Apply for Youth Membership
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
