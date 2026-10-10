import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DigitalIdCard } from '@/features/membership-id-cards/components/digital-id-card';
import { Download, ArrowLeft, ShieldCheck, Share2, QrCode } from 'lucide-react';

export default function MemberIdCardPage() {
  const sampleCard = {
    membershipNumber: 'MYBF-0000000001',
    fullName: 'Mohammed Anas',
    categoryName: 'Youth Entrepreneur',
    chapterName: 'Manjeri Chapter',
    status: 'ACTIVE' as const,
    issuedAt: 'Jan 2026',
    validUntil: 'Dec 2027',
    verificationToken: 'sample-live-verification-token-389172',
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link
          href="/member"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#035AFC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Badge variant="primary" className="mb-1.5">Official Credential</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Digital Membership Pass
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographically signed identity pass with live QR status resolution
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/verify/id/${sampleCard.verificationToken}`} target="_blank">
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-1.5" /> Test Public QR
            </Button>
          </Link>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1.5" /> Save PDF / Image
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <DigitalIdCard card={sampleCard} className="max-w-lg" />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-6 text-xs text-slate-500 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Security & Governance Policies</span>
        </div>
        <p>
          • <strong>Transfer Policy:</strong> If you transfer from Manjeri to another chapter, your permanent 10-digit ID (<span className="font-mono text-[#035AFC]">MYBF-0000000001</span>) remains identical. Only the assigned chapter and QR token version are updated.
        </p>
        <p>
          • <strong>Event Admission:</strong> Event organizers scan the QR code using any modern camera. Attendance check-ins are idempotent to prevent duplicate scanning.
        </p>
      </div>
    </div>
  );
}
