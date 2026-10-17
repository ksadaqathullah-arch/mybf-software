import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Users, Lock, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Organizational Charter | MYBF',
  description: 'Official Terms of Service, Organizational Charter, and member conduct rules for the Malappuram Youth Business Forum.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">Legal & Governance</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Terms of Service & Organizational Charter
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          The Malappuram Youth Business Forum (MYBF) operates as a secular, non-political, youth empowerment community uniting entrepreneurs and professionals across 16 founding chapters in Malappuram district.
        </p>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-8">
        {/* Section 1: Acceptance & Purpose */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#035AFC] flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms & Organizational Charter
              </h2>
              <span className="text-xs text-slate-500">Core Constitution & Member Commitment</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              By applying for membership, accessing the MYBF Digital Management Platform, or participating in chapter initiatives, you agree to adhere unconditionally to this Charter and the operating guidelines established by the MYBF Secretariat.
            </p>
            <p>
              MYBF is committed to fostering transparent youth entrepreneurship, regional industrial synergy, and leadership development across Malappuram district. Any conduct contrary to community integrity, sectarian discord, or unauthorized commercial exploitation is strictly prohibited.
            </p>
          </div>
        </Card>

        {/* Section 2: Membership Eligibility & Verification */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-[#FBC206] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Membership Eligibility & Verification
              </h2>
              <span className="text-xs text-slate-500">Age Standards & Maker-Checker Governance</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Age Criteria:</strong> Standard membership is available to youth aged 18 to 35 residing or operating a business in Malappuram. Applicants above 35 require special Age Exception justification and Super Administrator approval.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>True & Accurate Representation:</strong> All submitted details—including identity, enterprise classification, and contact information—must be genuine. Providing false information leads to immediate rejection or revocation.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Maker-Checker Approval:</strong> Submission of an application creates a pending record. Full membership activation is granted only after review by Chapter Officers and Super Administration.
              </span>
            </div>
          </div>
        </Card>

        {/* Section 3: Decentralized Chapter Governance */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#035AFC] flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Decentralized Chapter Structure
              </h2>
              <span className="text-xs text-slate-500">16 Autonomous Chapters & Local Representation</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              Members are affiliated with one of the 16 founding constituency chapters based on geographic proximity or business locus. Chapter Executive Committees oversee local programming, peer networking, and mentorship activities.
            </p>
            <p>
              Members may request a chapter transfer upon relocation, subject to review and confirmation by the central secretariat, ensuring continuity of their permanent 10-digit membership identity.
            </p>
          </div>
        </Card>

        {/* Section 4: Security, Access & Passports */}
        <Card className="border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Permanent Identity & Digital Passes
              </h2>
              <span className="text-xs text-slate-500">HMAC Cryptographic Security & Anti-Abuse Controls</span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">
            <p>
              Each approved member receives a permanent sequential 10-digit ID and a cryptographically signed Digital ID Card. The digital pass is non-transferable and verifies active credential status via official verification endpoints.
            </p>
            <p>
              Platform users must maintain confidentiality of their access credentials. Automated scraping, unauthorized account sharing, and circumventing server-side authorization controls will result in permanent disqualification.
            </p>
          </div>
        </Card>
      </div>

      {/* Secretariat Contact Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            MYBF Central Secretariat Governance
          </h3>
          <p className="text-xs text-slate-500">
            For governance clarifications or charter appeals, contact the Central Secretariat, Malappuram, Kerala - 676505.
          </p>
        </div>
        <Link href="/membership">
          <Button variant="outline" size="sm" className="shrink-0">
            View Membership Charter <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
