import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DigitalIdCard } from '@/features/membership-id-cards/components/digital-id-card';
import { IdCardActions } from '@/features/membership-id-cards/components/id-card-actions';
import { getCurrentActor } from '@/server/auth/session';
import { db } from '@/server/db';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { DigitalIdCardPayload } from '@/features/membership-id-cards/types/card.types';

export default async function MemberIdCardPage() {
  const sampleCard: DigitalIdCardPayload = {
    membershipNumber: 'MYBF-0000000001',
    fullName: 'Mohammed Anas',
    memberCategory: 'ENTREPRENEUR_BUSINESS_OWNER',
    currentPosition: 'BUSINESS_OWNER',
    chapterName: 'Manjeri Chapter',
    status: 'ACTIVE',
    issuedAt: 'Jan 2026',
    validUntil: 'Dec 2027',
    verificationToken: 'sample-live-verification-token-389172',
  };

  let cardData: DigitalIdCardPayload = sampleCard;

  try {
    const actor = await getCurrentActor();
    if (actor) {
      const user = await db.user.findUnique({
        where: { id: actor.userId },
        include: {
          profile: {
            include: {
              chapter: true,
              memberships: {
                where: { status: 'ACTIVE' },
                include: {
                  idCards: {
                    where: { status: 'ACTIVE' },
                    orderBy: { cardVersion: 'desc' },
                    take: 1,
                  },
                },
                take: 1,
              },
            },
          },
        },
      });

      const activeMembership = user?.profile?.memberships[0];
      const activeCard = activeMembership?.idCards[0];

      if (user?.profile && activeMembership && activeCard) {
        cardData = {
          membershipNumber: activeMembership.membershipNumber,
          fullName: user.profile.fullName,
          memberCategory: user.profile.memberCategory,
          currentPosition: user.profile.currentPosition,
          chapterName: user.profile.chapter.name,
          status: activeMembership.status as DigitalIdCardPayload['status'],
          issuedAt: new Date(activeMembership.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          validUntil: new Date(activeMembership.validUntil).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          verificationToken: activeCard.verificationToken,
        };
      }
    }
  } catch {
    // Fall back to sampleCard
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="print:hidden">
        <Link
          href="/member"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#035AFC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <Badge variant="primary" className="mb-1.5">Official Credential</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Digital Membership Pass
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographically signed identity pass with live QR status resolution
          </p>
        </div>

        <IdCardActions
          verificationToken={cardData.verificationToken}
          membershipNumber={cardData.membershipNumber}
        />
      </div>

      <div className="flex flex-col items-center justify-center py-4 print:py-0 print:m-0">
        <DigitalIdCard card={cardData} className="max-w-[380px]" />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-6 text-xs text-slate-500 space-y-3 print:hidden">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Security & Governance Policies</span>
        </div>
        <p>
          • <strong>Transfer Policy:</strong> If you transfer chapters, your permanent 10-digit ID (<span className="font-mono text-[#035AFC]">{cardData.membershipNumber}</span>) remains identical. Only the assigned chapter and QR token version are updated.
        </p>
        <p>
          • <strong>Event Admission:</strong> Event organizers scan the QR code using any modern camera. Attendance check-ins are idempotent to prevent duplicate scanning.
        </p>
      </div>
    </div>
  );
}
