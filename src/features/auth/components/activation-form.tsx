'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Lock, User, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

interface VerifiedTokenData {
  applicationId: string;
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  chapterName: string;
  membershipNumber: string;
}

export function ActivationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = React.useState(true);
  const [tokenData, setTokenData] = React.useState<VerifiedTokenData | null>(null);
  const [verificationError, setVerificationError] = React.useState<string | null>(null);

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [activated, setActivated] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setVerifying(false);
      setVerificationError('No activation token found in the URL. Please click the activation link in your approval SMS/Email.');
      return;
    }

    async function checkToken() {
      try {
        setVerifying(true);
        const res = await fetch(`/api/v1/memberships/activate?token=${encodeURIComponent(token!)}`);
        const json = await res.json();

        if (!res.ok || !json.valid) {
          throw new Error(json.error || 'Invalid or expired activation invitation.');
        }

        setTokenData(json.data);
      } catch (err: any) {
        setVerificationError(err.message || 'Failed to verify activation token.');
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing activation token.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/memberships/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          username: username.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate account.');
      }

      setActivated(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Activation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xl p-8 text-center space-y-4">
        <div className="h-10 w-10 border-2 border-[#035AFC] border-t-transparent rounded-full animate-spin mx-auto" />
        <CardTitle className="text-lg">Verifying Activation Invitation...</CardTitle>
        <CardDescription className="text-xs">
          Validating single-use cryptographic invitation token against MYBF membership register.
        </CardDescription>
      </Card>
    );
  }

  if (verificationError) {
    return (
      <Card className="border-rose-500/40 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="warning">Activation Unavailable</Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invalid or Expired Link
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {verificationError}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-left space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Security Guidelines:</p>
          <p>• Account activation links are single-use and expire within 72 hours of approval.</p>
          <p>• If you have already activated your account, you can sign in directly.</p>
          <p>• Contact your chapter secretary or email support@mybf.in if you need a replacement link.</p>
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="sm">Go to Sign In</Button>
          </Link>
          <Link href="/membership">
            <Button variant="outline" size="sm">Membership Information</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (activated) {
    return (
      <Card className="border-emerald-500/40 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="success">Account Activated Successfully</Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to MYBF, {tokenData?.fullName}!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your personal credentials are created and your account is in <span className="font-semibold text-emerald-600">ACTIVE</span> status. You may now sign in using your username or registered email.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-left space-y-2 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-400">Chosen Username:</span>
            <strong className="font-mono text-[#035AFC]">{username}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Permanent Member ID:</span>
            <strong className="font-mono">{tokenData?.membershipNumber}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Chapter:</span>
            <strong>{tokenData?.chapterName}</strong>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/login">
            <Button variant="primary" className="h-11 px-8 text-sm">
              Sign In with Your New Account <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-2xl">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <Badge variant="primary" className="mx-auto mb-2">Member Account Activation</Badge>
        <CardTitle className="text-2xl font-bold">Set Up Your MYBF Credentials</CardTitle>
        <CardDescription className="text-xs max-w-md mx-auto">
          Welcome, <strong className="text-slate-900 dark:text-white">{tokenData?.fullName}</strong>! Choose your unique username and secure password to activate your portal workspace.
        </CardDescription>

        {tokenData && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-left flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent Member ID</span>
              <strong className="font-mono text-[#035AFC] text-sm">{tokenData.membershipNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chapter</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{tokenData.chapterName}</span>
            </div>
          </div>
        )}
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Choose Username *</span>
              <span className="text-[10px] text-slate-400">Letters, numbers, underscores (3-30 chars)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                pattern="^[a-zA-Z0-9_]{3,30}$"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. anas_manjeri"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Create Password *</span>
              <span className="text-[10px] text-slate-400">Min 8 chars, 1 uppercase, 1 number, 1 special</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm Password *
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-3">
            {loading ? 'Securing & Activating Account...' : 'Complete Activation & Set Credentials'}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Scrypt Hash Encryption • Single-Use SHA-256 Token Gate</span>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-500">
        Already activated?{' '}
        <Link href="/login" className="ml-1 text-[#035AFC] font-semibold hover:underline">
          Sign In directly
        </Link>
      </CardFooter>
    </Card>
  );
}
