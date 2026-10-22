import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface SuperAdminAccessDeniedProps {
  reason?: string;
}

export function SuperAdminAccessDenied({ reason }: SuperAdminAccessDeniedProps) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-ink shadow-[8px_8px_0px_#14161c] bg-paper">
        <CardHeader className="text-center pb-2 border-b-2 border-ink">
          <div className="mx-auto w-12 h-12 border-2 border-ink bg-danger/20 flex items-center justify-center mb-3 shadow-[2px_2px_0px_#14161c]">
            <ShieldAlert className="w-6 h-6 text-danger" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-danger font-display">Security Boundary</span>
          <CardTitle className="text-xl font-black font-display uppercase tracking-tight text-ink mt-1">
            Super Administrator Authorization Required
          </CardTitle>
          <CardDescription className="text-xs text-ink/70 font-serif mt-1">
            Global Governance & Infrastructure Boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center p-6">
          <div className="p-3 border-2 border-danger bg-danger/10 text-xs font-bold text-ink">
            {reason ||
              'Access Restricted: Your current account does not hold the SUPER_ADMIN privilege required to access this portal.'}
          </div>

          <p className="text-xs text-ink/70 font-serif leading-relaxed">
            All administrative access attempts, role checks, and unauthorized traversals are monitored and recorded in the immutable audit trail.
          </p>

          <div className="flex gap-3 justify-center pt-2">
            <Link href="/login">
              <Button variant="primary" size="sm">
                <LogIn className="w-4 h-4 mr-1.5" /> Sign In as Admin
              </Button>
            </Link>
            <Link href="/member">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Member Portal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
