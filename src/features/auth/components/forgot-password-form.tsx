'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok && res.status >= 500) {
        throw new Error(data.error || 'Password recovery service is temporarily unavailable. Please try again later.');
      }

      // Always show uniform response to prevent user enumeration attacks
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-2xl">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <Badge variant="primary" className="mx-auto mb-2">Member Support & Security</Badge>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-xs">
          Enter your registered username, email address, or verified mobile number
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>Recovery Request Received</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                If an active membership account is associated with <strong>{identifier}</strong>, password reset instructions or verification tokens will be transmitted via SMS or authorized Secretariat communication.
              </p>
            </div>

            <Link href="/login" className="block w-full">
              <Button type="button" className="w-full h-11 text-sm mt-2">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
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

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-2">
              {loading ? 'Submitting Request...' : 'Send Recovery Instructions'}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encrypted Identity Protection & Verification</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 justify-center border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-500 text-center">
        <div>
          Remembered your password?{' '}
          <Link href="/login" className="ml-1 text-[#035AFC] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
        <div>
          Received an approval link?{' '}
          <Link href="/activate" className="ml-1 text-[#035AFC] font-semibold hover:underline">
            Activate Account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
