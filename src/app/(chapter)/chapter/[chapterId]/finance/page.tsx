import { notFound } from 'next/navigation';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { ChapterAccessDenied } from '@/features/chapters/components/chapter-access-denied';
import { db } from '@/server/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#035AFC]/10 text-[#035AFC]">
              {chapter.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Financial Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Chapter Finance & Grants
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Financial reporting, NGO activity grants, and treasury oversight for {chapter.name}.
          </p>
        </div>
      </div>

      {/* Mandatory Policy Banner: 100% Free Membership */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">
            MYBF Zero Membership Fee Policy
          </p>
          <p className="mt-0.5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            MYBF membership is 100% free for all qualified entrepreneurs and youth in Malappuram. Chapter executives are strictly prohibited from soliciting, assessing, or collecting membership dues, subscription fees, or processing charges. All operational activities are funded through philanthropic grants and central NGO treasury allocations.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
              NGO Activity Budget
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between mt-1">
              <span>₹0.00</span>
              <Landmark className="h-5 w-5 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="warning" className="text-[10px]">
                Central Allocation Pending
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Annual initiative budget allocation will be assigned by the Central Treasury upon summit proposal approval.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Approved Expenditure
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between mt-1">
              <span>₹0.00</span>
              <Receipt className="h-5 w-5 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="neutral" className="text-[10px]">
                Audited & Cleared
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              No outstanding reimbursement requests or unvouched chapter expenditures for current quarter.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Authorized Chapter Receipts
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-between mt-1">
              <span>{paymentRecords.length}</span>
              <Wallet className="h-5 w-5 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success" className="text-[10px]">
                Event / CSR Sponsorships
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Receipts registered for chapter summits and approved NGO community workshops.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backend Status & Implementation Scope Notice */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#035AFC]" />
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Chapter Treasury & Ledger Architecture
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Status of financial workflows under the MYBF NGO governance charter.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Central Disbursal System
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Chapter operational funds for large assemblies (such as the Malappuram Youth Business Conclave) are disbursed directly by the Central Governing Council upon submission of a formal project charter.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Voucher & Expense Submission (Next Phase)
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Direct chapter expense claim submission, digital bill scanning, and automated auditor sign-off will be integrated into the Central Finance ledger upon final auditor certification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Financial Records Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                Chapter Transaction Records
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authorized receipts and transactions scoped to {chapter.name}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paymentRecords.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileSpreadsheet className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No Financial Transactions Recorded
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No event ticket fees, summit receipts, or CSR sponsorships have been recorded under this chapter code ({chapter.code}).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Reference ID</th>
                    <th className="p-3.5">Contributor / Payer</th>
                    <th className="p-3.5">Purpose</th>
                    <th className="p-3.5">Amount (INR)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paymentRecords.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-6 font-mono text-slate-600 dark:text-slate-400">
                        {p.idempotencyKey.slice(0, 12)}...
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {p.user?.profile?.fullName || 'Anonymous'}
                        </div>
                        <div className="text-[11px] text-slate-500">{p.user?.email}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="neutral" className="text-[10px]">
                          {p.purpose.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        ₹{p.amountINR.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={p.status === 'PAID' ? 'success' : 'warning'}
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 pr-6 text-slate-500">
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
