import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, EyeOff, QrCode, Lock, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DPDP Privacy Policy & Data Protection | MYBF',
  description: 'Data privacy policy and purpose-specific personal data protection standards for the Malappuram Youth Business Forum.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">Data Privacy & Security</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          DPDP Privacy Policy & Youth Data Protection
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          The Malappuram Youth Business Forum (MYBF) enforces purpose-specific personal data protection in strict compliance with the Digital Personal Data Protection (DPDP) standards.
        </p>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-8">
        {/* Section 1: Purpose-Specific Data Collection */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#035AFC] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Purpose-Specific Personal Data Protection
              </h2>
              <span className="text-xs text-slate-500">Lawful Purpose & Digital Youth Privacy</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              MYBF collects and processes personal data solely for legitimate membership governance, chapter administration, event admission, and verified business directory networking across Malappuram district.
            </p>
            <p>
              Data is never sold, leased, or distributed to third-party commercial marketing agencies. Processing is strictly limited to organizational operations authorized by the Data Principal during registration.
            </p>
          </div>
        </Card>

        {/* Section 2: Restricted Visibility & Sensitive Attributes */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-[#FBC206] flex items-center justify-center">
              <EyeOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Restricted Visibility Safeguards
              </h2>
              <span className="text-xs text-slate-500">Confidential Personal Attributes</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Date of Birth & Age:</strong> Used exclusively for youth eligibility verification (aged 35 years or below) and is never displayed publicly on member rosters or search directories.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Personal Goals & Aspirations:</strong> Stored securely in your private profile for internal chapter mentorship matching and remains completely hidden from public listings.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Gender & Demographic Data:</strong> Utilized solely for aggregate forum analytics and diversity tracking, protected behind server-side authorization boundaries.
              </span>
            </div>
          </div>
        </Card>

        {/* Section 3: Public QR Verification Safeguards */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Public QR Verification Privacy Standards
              </h2>
              <span className="text-xs text-slate-500">Zero Leakage on Public Scanning Endpoints</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              In strict adherence to DPDP privacy principles, our public QR credential verification endpoint (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">/verify/id/[token]</code>) validates card legitimacy, chapter affiliation, and membership status without exposing sensitive personal identifiers.
            </p>
            <p>
              Private phone numbers, personal email addresses, home addresses, and financial transaction records are intentionally excluded from the public verification payload to prevent automated harvesting and identity exposure.
            </p>
          </div>
        </Card>

        {/* Section 4: Data Principal Rights & Secretariat Redressal */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Data Principal Rights & Governance
              </h2>
              <span className="text-xs text-slate-500">Access, Correction & Grievance Redressal</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              As a Data Principal, you have the right to access your stored profile, update classification records, and request profile deactivation through your member dashboard or via direct notice to the MYBF Data Protection Officer.
            </p>
            <p>
              Platform sessions employ secure HTTP-only cookies with Lax SameSite attributes and strict transport security (HSTS), preventing cross-site scripting (XSS) and token hijacking.
            </p>
          </div>
        </Card>
      </div>

      {/* Secretariat Contact Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#035AFC]" />
            MYBF Data Protection Grievance Officer
          </h3>
          <p className="text-xs text-slate-500">
            DPDP Inquiries: secretariat@mybf.in | MYBF Central Secretariat, Malappuram, Kerala - 676505.
          </p>
        </div>
        <Link href="/register">
          <Button className="shrink-0" size="sm">
            Apply for Youth Membership <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
