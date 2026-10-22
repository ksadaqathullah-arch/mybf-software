import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterAccessDenied } from '@/features/chapters/components/chapter-access-denied';
import { db } from '@/server/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortalPageHeader, PortalStatCard } from '@/components/ui/portal-elements';
import {
  Wallet,
  ShieldCheck,
  Info,
  Receipt,
  Landmark,
  FileSpreadsheet,
} from 'lucide-react';

interface FinancePageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export default async function ChapterFinancePage({ params }: FinancePageProps) {
  const { chapterId: rawChapterId } = await params;
  const actor = await getCurrentActor();

  const chapter = await ChapterService.getChapterBySlugOrId(rawChapterId);
  if (!chapter) {
    notFound();
  }

  // Authorize: Chapter Leadership or Super Admin
  const isSuperAdmin = actor?.roles.includes('SUPER_ADMIN');
  const isChapterAuthorized = actor && (isSuperAdmin || actor.chapterId === chapter.id);

  if (!actor || !isChapterAuthorized) {
    return null;
  }

  // Query authorized event ticket receipts / sponsorships associated with this chapter
  const paymentRecords = await db.paymentIntent.findMany({
    where: {
      chapterId: chapter.id,
      purpose: { in: ['EVENT_TICKET', 'SPONSORSHIP'] },
    },
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
      transaction: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PortalPageHeader
        tag={chapter.code}
        badge="Financial Governance"
        title="Chapter Finance & Grants"
        description={`Financial reporting, NGO activity grants, and treasury oversight for ${chapter.name}.`}
      />

      {/* Mandatory Policy Banner: 100% Free Membership */}
      <div className="border-2 border-ink bg-emerald-50 text-ink p-4 shadow-[3px_3px_0px_#14161c] flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-display font-black uppercase tracking-wider text-emerald-950">
            MYBF Zero Membership Fee Policy
          </p>
          <p className="mt-1 text-ink/80 font-serif leading-relaxed">
            MYBF membership is 100% free for all qualified entrepreneurs and youth in Malappuram. Chapter executives are strictly prohibited from soliciting, assessing, or collecting membership dues, subscription fees, or processing charges. All operational activities are funded through philanthropic grants and central NGO treasury allocations.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PortalStatCard
          label="NGO Activity Budget"
          value="₹0.00"
          subValue="Central Allocation Pending"
          icon={Landmark}
        />

        <PortalStatCard
          label="Approved Expenditure"
          value="₹0.00"
          subValue="Audited & Cleared"
          icon={Receipt}
        />

        <PortalStatCard
          label="Authorized Chapter Receipts"
          value={paymentRecords.length}
          subValue="Event / CSR Sponsorships"
          icon={Wallet}
        />
      </div>

      {/* Backend Status & Implementation Scope Notice */}
      <Card>
        <CardHeader className="p-6 border-b-2 border-ink">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue" />
            <CardTitle className="text-base font-black font-display uppercase tracking-wider text-ink">
              Chapter Treasury & Ledger Architecture
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-ink/70 font-serif mt-1">
            Status of financial workflows under the MYBF NGO governance charter.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c]">
              <p className="font-display font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-600 border border-ink"></span>
                Central Disbursal System
              </p>
              <p className="text-ink/80 font-serif mt-1.5 leading-relaxed">
                Chapter operational funds for large assemblies (such as the Malappuram Youth Business Conclave) are disbursed directly by the Central Governing Council upon submission of a formal project charter.
              </p>
            </div>

            <div className="p-4 bg-paper border-2 border-ink shadow-[2px_2px_0px_#14161c]">
              <p className="font-display font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-yellow border border-ink"></span>
                Voucher & Expense Submission (Next Phase)
              </p>
              <p className="text-ink/80 font-serif mt-1.5 leading-relaxed">
                Direct chapter expense claim submission, digital bill scanning, and automated auditor sign-off will be integrated into the Central Finance ledger upon final auditor certification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Financial Records Table */}
      <Card>
        <CardHeader className="p-6 border-b-2 border-ink">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black font-display uppercase tracking-wider text-ink">
                Chapter Transaction Records
              </CardTitle>
              <CardDescription className="text-xs text-ink/70 font-serif mt-1">
                Authorized receipts and transactions scoped to {chapter.name}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paymentRecords.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileSpreadsheet className="h-10 w-10 text-ink/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-ink font-display uppercase tracking-wider">
                No Financial Transactions Recorded
              </p>
              <p className="text-xs text-ink/60 font-serif mt-1 max-w-md mx-auto">
                No event ticket fees, summit receipts, or CSR sponsorships have been recorded under this chapter code ({chapter.code}).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-paper-sunken text-ink font-display font-extrabold uppercase text-[10px] tracking-wider border-b-2 border-ink">
                  <tr>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Contributor / Payer</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Amount (INR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 font-mono text-[11px]">
                  {paymentRecords.map((p) => (
                    <tr key={p.id} className="hover:bg-yellow/10 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue">
                        {p.idempotencyKey.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-ink">
                          {p.user?.profile?.fullName || 'Anonymous'}
                        </div>
                        <div className="text-[10px] text-ink/60">{p.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" className="text-[10px]">
                          {p.purpose.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-black text-ink">
                        ₹{p.amountINR.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={p.status === 'PAID' ? 'success' : 'warning'}
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-ink/70">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
