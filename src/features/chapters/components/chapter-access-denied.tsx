import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface ChapterAccessDeniedProps {
  chapterName: string;
  chapterSlug?: string;
  reason?: string;
  isUnauthenticated?: boolean;
}

export function ChapterAccessDenied({
  chapterName,
  chapterSlug,
  reason,
  isUnauthenticated,
}: ChapterAccessDeniedProps) {
  const needsAuth = isUnauthenticated || reason?.toLowerCase().includes('authentication required');

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-ink shadow-[8px_8px_0px_#14161c] bg-paper">
        <CardHeader className="text-center pb-2 border-b-2 border-ink">
          <div className="mx-auto w-12 h-12 border-2 border-ink bg-danger/20 flex items-center justify-center mb-3 shadow-[2px_2px_0px_#14161c]">
            <ShieldAlert className="w-6 h-6 text-danger" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-danger font-display">Chapter Boundary</span>
          <CardTitle className="text-xl font-black font-display uppercase tracking-tight text-ink mt-1">
            Access Restricted
          </CardTitle>
          <CardDescription className="text-xs text-ink/70 font-serif mt-1">
            Chapter Executive Boundary Protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center p-6">
          <div className="p-3 border-2 border-danger bg-danger/10 text-xs font-bold text-ink">
            {reason || `You are not authorized to administer ${chapterName}. Chapter leaders may only view and manage their assigned constituency chapter.`}
          </div>

          <p className="text-xs text-ink/70 font-serif leading-relaxed">
            {needsAuth
              ? 'Please sign in with your official MYBF chapter executive or administrator account to access this hub.'
              : 'If you are an appointed chapter officer for this constituency, please ensure you are signed in with your official MYBF officer credentials.'}
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {needsAuth ? (
              <Link href={`/login?callbackUrl=/chapter/${encodeURIComponent(chapterSlug || '')}`}>
                <Button variant="primary" size="sm">
                  Sign In to Chapter Hub
                </Button>
              </Link>
            ) : (
              <Link href="/member">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Member Portal
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="secondary" size="sm">
                <Home className="w-4 h-4 mr-1.5" /> Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
