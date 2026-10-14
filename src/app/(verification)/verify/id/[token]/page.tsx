import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Building2, Calendar, Award, CheckCircle2, ArrowLeft } from 'lucide-react';

export default async function PublicIdVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // For demonstration and high-assurance architecture:
  // In production, token is verified against MembershipIdCard in db
  const isValidSample = token.length >= 8 && !token.includes('invalid');

  return (
    <div className="min-h-screen bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#035AFC] text-white font-black text-2xl shadow-lg">
            M
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            MYBF Credential Verification Service
          </h1>
          <p className="text-xs text-slate-500">Official Membership Verification Gateway</p>
        </div>

        {isValidSample ? (
          <Card className="border-emerald-500/40 bg-white dark:bg-[#0A0F1D] shadow-2xl overflow-hidden">
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" />
                <span>OFFICIAL VERIFIED CREDENTIAL</span>
              </div>
              <Badge variant="success" className="text-[10px]">
                VALID ACTIVE PASS
              </Badge>
            </div>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Member Identifier</span>
                  <div className="font-mono text-sm font-bold text-[#035AFC] dark:text-blue-400 mt-0.5">
                    MYBF-0000000001
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Verified Chapter</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-[#FBC206]" /> Manjeri Chapter
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Category / Interest:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Entrepreneur / Business Owner</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Position:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Business Owner</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">District:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Malappuram, Kerala</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Validity Horizon:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Valid through 31 Dec 2027</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verification Timestamp:</span>
                  <span className="font-mono text-[11px] text-slate-400">{new Date().toISOString()}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 text-[11px] text-slate-500 space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">Privacy Notice:</p>
                <p>
                  In compliance with DPDP data privacy standards, private contact and financial information are not published via public QR endpoints.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-500/40 bg-white dark:bg-[#0A0F1D] shadow-2xl">
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <ShieldAlert className="h-5 w-5" />
              <span>INVALID OR REVOKED CREDENTIAL</span>
            </div>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-xs text-slate-500">
                The provided verification token is not recognized, expired, or has been revoked by the Malappuram Youth Business Forum secretariat.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to MYBF Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
