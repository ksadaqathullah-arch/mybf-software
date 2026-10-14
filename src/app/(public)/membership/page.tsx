import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Award,
  Briefcase,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
} from '@/features/memberships/constants/member-classifications';

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Charter & Member Classification</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MYBF Member Classification System
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Join a trusted community across 16 chapters in Malappuram district. Members are classified by independent interest categories and professional positions, free from payment-tier constraints.
        </p>
      </div>

      {/* Field A: Member Categories / Interests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-[#035AFC]" /> Field A: Member Category / Interest
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflects your engagement focus within the Malappuram business ecosystem.
            </p>
          </div>
          <Badge variant="primary">4 CATEGORIES</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MEMBER_CATEGORIES.map((cat) => (
            <Card key={cat.value} className="flex flex-col justify-between border-slate-200 dark:border-slate-800 shadow-md hover:border-blue-500/40 transition-colors">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" className="text-[10px]">
                    INTEREST FOCUS
                  </Badge>
                  <span className="text-[11px] font-mono font-bold text-[#035AFC]">
                    MYBF
                  </span>
                </div>
                <CardTitle className="text-lg mt-3 font-bold">{cat.label}</CardTitle>
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
                    <span>Cross-Chapter Networking</span>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="p-6 pt-0">
                <Link href="/register" className="w-full">
                  <Button className="w-full" size="sm">
                    Apply in this Category <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Field B: Current Positions Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#FBC206]" /> Field B: Current Position
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Independent vocational designation representing your operational profession or role.
            </p>
          </div>
          <Badge variant="secondary">7 POSITIONS</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CURRENT_POSITIONS.map((pos) => (
            <div
              key={pos.value}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{pos.label}</span>
                <Briefcase className="h-3.5 w-3.5 text-[#FBC206]" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {pos.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules & Governance FAQ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-8 sm:p-10 space-y-6">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-[#035AFC]" /> Key Membership Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Dual Independent Classification</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every member chooses an interest category and a professional position independently. A member can be an Employee interested in starting a business, or a Student operating a company.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Maker-Checker Chapter Approval</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Applications are reviewed by elected chapter officers. Account creation does not automatically grant active privileges until verified.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Permanent Identifier (10 Digits)</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your member number (e.g. <span className="font-mono text-[#035AFC]">MYBF-0000000001</span>) is sequentially generated upon approval and never changes, even if you relocate or transfer chapters.
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
