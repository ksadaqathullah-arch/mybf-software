import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Briefcase,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { MEMBERSHIP_CATEGORIES } from '@/features/memberships/constants/categories';

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Charter & Entitlements</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MYBF Membership Structure
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Join a trusted community of young founders, business operators, and professionals across Malappuram with transparent governance and verifiable credentials.
        </p>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MEMBERSHIP_CATEGORIES.map((cat) => (
          <Card key={cat.code} className="flex flex-col justify-between border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  ₹{cat.annualFeeINR.toLocaleString('en-IN')}/yr
                </Badge>
                <span className="text-xs text-slate-400">Age: {cat.minAge}-{cat.maxAge}</span>
              </div>
              <CardTitle className="text-xl mt-3">{cat.name}</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-2">
                {cat.description}
              </CardDescription>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Permanent 10-Digit ID Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Chapter Voting & Governance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Opt-in Business Directory</span>
                </div>
              </div>
            </CardHeader>

            <CardFooter className="p-6 pt-0">
              <Link href="/register" className="w-full">
                <Button className="w-full" size="sm">
                  Apply Now <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Rules & Governance FAQ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-8 sm:p-10 space-y-6">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-[#035AFC]" /> Key Membership Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Permanent Identifier (10 Digits)</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your member number (e.g. <span className="font-mono text-[#035AFC]">MYBF-0000000001</span>) is sequentially generated upon approval and never changes, even if you relocate or transfer chapters.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Maker-Checker Chapter Approval</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Applications are reviewed by elected chapter officers. Account creation does not automatically grant active privileges until verified.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Seamless Chapter Transfer</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              If your business or residence moves to another Taluk, you can request a transfer without re-registering or paying duplicate entry fees.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Tamper-Proof Verification</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              The digital ID card features signed QR codes that verify authenticity in real-time, preventing fraudulent representation at business forums.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
