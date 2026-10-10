import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  MapPin,
  CheckCircle2,
  QrCode,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { MEMBERSHIP_CATEGORIES } from '@/features/memberships/constants/categories';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-[#035AFC]/10 via-transparent to-transparent">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-[#035AFC]/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-[#FBC206]/10 blur-[90px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-[#035AFC] dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-[#FBC206] animate-pulse" />
              <span>Uniting Youth Business Leaders across 16 Malappuram Chapters</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl">
              The Digital Operating System for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#035AFC] via-blue-500 to-[#FBC206]">
                Youth Entrepreneurship
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Empowering next-generation founders, professionals, and enterprises with verifiable digital identities, chapter governance, business matchmaking, and transparent collaboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-13 px-8 text-base shadow-lg shadow-blue-500/25">
                  Apply for Membership <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/chapters">
                <Button variant="outline" size="lg" className="h-13 px-8 text-base">
                  Explore 16 Chapters
                </Button>
              </Link>
            </div>

            {/* Quick Proof Pills */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Tamper-Proof Cryptographic ID
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#035AFC]" /> 16 Founding Chapters
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#FBC206]" /> Audited Governance
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-8 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/80">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#035AFC]">16</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Founding Chapters</div>
              <p className="text-[11px] text-slate-400">Covering all 7 Taluks</p>
            </div>
            <div className="space-y-1 pt-6 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FBC206]">5,000,000</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Architecture Scale</div>
              <p className="text-[11px] text-slate-400">10-Digit Immutable IDs</p>
            </div>
            <div className="space-y-1 pt-6 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">100%</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Maker-Checker Approvals</div>
              <p className="text-[11px] text-slate-400">Zero Unverified Members</p>
            </div>
            <div className="space-y-1 pt-6 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-500">₹0 Dues Leak</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Audited Financials</div>
              <p className="text-[11px] text-slate-400">Reconciled Webhook Ledgers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Grid Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">Geographic Network</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The 16 Founding Chapters of Malappuram
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Distributed chapter leadership ensuring hyper-local community development and peer mentorship.
            </p>
          </div>
          <Link href="/chapters">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              View All 16 Chapters &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_16_CHAPTERS.slice(0, 8).map((ch) => (
            <Link key={ch.code} href={`/chapters/${ch.slug}`}>
              <Card className="h-full hover:border-[#035AFC] hover:shadow-md transition-all group">
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{ch.code}</span>
                    <Badge variant="neutral" className="text-[9px]">{ch.taluk}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2 group-hover:text-[#035AFC] transition-colors">
                    {ch.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {ch.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center sm:hidden">
          <Link href="/chapters">
            <Button variant="outline" className="w-full">
              Explore All 16 Chapters &rarr;
            </Button>
          </Link>
        </div>
      </section>

      {/* Digital ID Card & Security Architecture */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#035AFC]/30 blur-3xl pointer-events-none" />

          <div className="lg:col-span-7 space-y-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FBC206]/20 px-3 py-1 text-xs font-bold text-[#FBC206]">
              <QrCode className="h-3.5 w-3.5" /> High-Trust Identity
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Cryptographically Verifiable Digital Membership Pass
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every approved MYBF member receives an immutable sequential ID (<span className="font-mono text-[#FBC206]">MYBF-0000000001</span>) that never changes upon chapter transfer. The card incorporates HMAC-SHA256 signed QR tokens for instant offline/online credential verification.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero Private Data Exposure: QR resolves to an opaque validation token.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant Revocation: Expiry or suspension immediately invalidates verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Print-Optimized & Mobile Wallet Ready with official MYBF seals.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/membership">
                <Button variant="secondary" size="md">
                  Review Membership Guidelines
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            {/* Live Interactive Card Sample */}
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#035AFC] via-[#0240B8] to-[#012269] p-6 text-white shadow-2xl border border-blue-400/30">
              <div className="flex items-start justify-between border-b border-white/15 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#035AFC] font-black text-lg">
                    MYBF
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold tracking-widest text-[#FBC206] uppercase">
                      Malappuram Youth Business Forum
                    </h4>
                    <p className="text-[9px] text-blue-100 font-medium">Digital Identity Pass</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#FBC206] text-[#030405] text-[9px] px-2">
                  ACTIVE
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 items-center">
                <div className="h-20 w-20 rounded-xl bg-slate-900 border-2 border-[#FBC206] flex items-center justify-center font-bold text-2xl text-blue-200">
                  M
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-blue-200">Member</p>
                  <h4 className="font-bold text-base text-white">Anas Mohammed</h4>
                  <p className="font-mono text-xs font-bold text-[#FBC206]">MYBF-0000000001</p>
                  <p className="text-[10px] text-blue-100">Manjeri Chapter</p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/15 pt-3 flex items-center justify-between text-[10px]">
                <span className="text-blue-100">Valid Until: Dec 2027</span>
                <div className="flex items-center gap-1 text-[#FBC206] font-bold">
                  <QrCode className="h-4 w-4" /> VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="primary">Categories</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Structured for Diverse Business Profiles
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every category has tailored eligibility criteria, annual dues, and community networking privileges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MEMBERSHIP_CATEGORIES.map((cat) => (
            <Card key={cat.code} className="flex flex-col justify-between hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    ₹{cat.annualFeeINR.toLocaleString('en-IN')}/yr
                  </Badge>
                  <span className="text-xs text-slate-400">Age {cat.minAge}-{cat.maxAge}</span>
                </div>
                <CardTitle className="text-lg mt-3">{cat.name}</CardTitle>
                <CardDescription className="text-xs">{cat.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Apply in this Category
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
