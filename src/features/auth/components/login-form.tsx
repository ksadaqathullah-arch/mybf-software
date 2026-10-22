'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useMembershipModal } from '@/features/memberships/context/membership-modal-context';

export function LoginForm() {
  const { openModal } = useMembershipModal();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
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
    <Card className="border-2 border-ink bg-paper text-ink shadow-[4px_4px_0px_#14161c]">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <Badge variant="primary" className="mx-auto mb-2">Member & Officer Sign In</Badge>
        <CardTitle className="text-2xl font-bold">Access MYBF Workspace</CardTitle>
        <CardDescription className="text-xs">
          Enter your unique username, registered email, or verified mobile number
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0">
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="login-identifier"
              className="block text-xs font-bold uppercase tracking-wider text-ink font-display"
            >
              Username, Email or Mobile Number <span className="text-rose-600 font-bold ml-0.5" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/45 pointer-events-none" />
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. anas_manjeri, member@mybf.in, 9847012345"
                className="auth-input w-full h-11 rounded-lg border border-ink/20 hover:border-ink/40 bg-white text-ink text-sm font-medium pl-10 pr-4 placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-ink font-display"
              >
                Password <span className="text-rose-600 font-bold ml-0.5" aria-hidden="true">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-blue hover:text-blue-deep hover:underline tracking-tight transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/45 pointer-events-none" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`auth-input w-full h-11 rounded-lg border border-ink/20 hover:border-ink/40 bg-white text-ink text-sm font-medium pl-10 pr-11 ${showPassword ? 'tracking-normal' : 'tracking-[0.18em]'} placeholder:tracking-normal placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink/45 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-blue rounded transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-2">
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-5 pt-3 border-t border-ink/15 flex items-center justify-center gap-1.5 text-xs text-muted font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Server-Side Deny-By-Default Authorization</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center border-t border-ink/15 p-4 text-xs text-muted text-center bg-paper-2/40">
        <div>
          Received an approval link?{' '}
          <Link href="/activate" className="ml-1 text-blue font-bold hover:text-blue-deep hover:underline">
            Activate Account
          </Link>
        </div>
        <div>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={openModal}
            className="ml-1 text-blue font-bold hover:text-blue-deep hover:underline cursor-pointer"
          >
            Apply for Youth Membership
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

