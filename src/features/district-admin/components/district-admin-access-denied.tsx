import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogIn, Home } from 'lucide-react';

interface DistrictAdminAccessDeniedProps {
  reason?: string;
}

export function DistrictAdminAccessDenied({ reason }: DistrictAdminAccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-500/30 shadow-xl bg-white dark:bg-[#0A0F1D]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            District Administration Authorization Required
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Malappuram District (MLP) Governance Boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-700 dark:text-red-400">
            {reason ||
              'Access Restricted: Your current account does not hold the DISTRICT_ADMIN privilege required to manage Malappuram District operations.'}
          </div>

          <p className="text-xs text-slate-500">
            District administration access is restricted to appointed district coordinators and secretariat officers. All access attempts are recorded in the immutable audit trail.
          </p>

          <div className="flex gap-2 justify-center pt-2">
            <Link href="/login">
              <Button variant="primary" size="sm">
                <LogIn className="w-4 h-4 mr-1.5" /> Sign In
              </Button>
            </Link>
            <Link href="/member">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Member Portal
              </Button>
            </Link>
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
