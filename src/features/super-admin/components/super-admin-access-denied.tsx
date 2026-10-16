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
    <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-500/30 shadow-xl bg-white dark:bg-[#0A0F1D]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Super Administrator Authorization Required
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Global Governance & Infrastructure Boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-700 dark:text-red-400">
            {reason ||
              'Access Restricted: Your current account does not hold the SUPER_ADMIN privilege required to access this portal.'}
          </div>

          <p className="text-xs text-slate-500">
            All administrative access attempts, role checks, and unauthorized traversals are monitored and recorded in the audit trail.
          </p>

          <div className="flex gap-2 justify-center pt-2">
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
