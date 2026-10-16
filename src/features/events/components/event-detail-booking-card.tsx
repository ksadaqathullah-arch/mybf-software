'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket,
  Check,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Users,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { registerForEventAction } from '../server/event.actions';
import { TicketTier } from '../schemas/event.schema';

interface EventDetailBookingCardProps {
  eventId: string;
  eventTitle: string;
  eventType: string;
  basePriceINR: number;
  capacity: number;
  registeredCount: number;
  ticketTiers: TicketTier[];
}

export function EventDetailBookingCard({
  eventId,
  eventTitle,
  eventType,
  basePriceINR,
  capacity,
  registeredCount,
  ticketTiers,
}: EventDetailBookingCardProps) {
  const [selectedTierId, setSelectedTierId] = React.useState<string>(
    ticketTiers[0]?.id || 'tier_default'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmedTicket, setConfirmedTicket] = React.useState<{
    qrToken: string;
    ticketTierName: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const selectedTier = ticketTiers.find((t) => t.id === selectedTierId) || ticketTiers[0];
  const isFull = registeredCount >= capacity;
  const tierFull = selectedTier ? selectedTier.bookedCount >= selectedTier.capacity : false;

  const handleBook = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await registerForEventAction({
        eventId,
        ticketTierId: selectedTier?.id,
        ticketTierName: selectedTier?.name || 'Free Admission',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to book ticket.');
      }

      setConfirmedTicket({
        qrToken: res.registration?.qrToken || 'CONFIRMED',
        ticketTierName: res.registration?.ticketTierName || 'Admission Pass',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedTicket) {
    return (
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md">
        <CardHeader className="p-6 text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg text-emerald-950 dark:text-emerald-200 font-black">
            Pass Confirmed!
          </CardTitle>
          <CardDescription className="text-xs text-emerald-800 dark:text-emerald-300">
            Your admission ticket for &ldquo;{eventTitle}&rdquo; has been generated with cryptographic QR verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#070A10] border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <Badge variant="primary">{confirmedTicket.ticketTierName}</Badge>
            <div className="h-20 w-20 mx-auto rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[#035AFC]">
              <QrCode className="h-16 w-16" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono font-bold">
              TOKEN: {confirmedTicket.qrToken}
            </div>
          </div>

          <Link href="/member">
            <Button variant="primary" className="w-full text-xs font-semibold">
              View in My Tickets <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="success">
            {eventType === 'FREE' ? '100% FREE NGO PASS' : 'PAID TICKET'}
          </Badge>
          <span className="text-xs font-mono font-bold text-[#035AFC]">
            {capacity - registeredCount} Seats Remaining
          </span>
        </div>
        <CardTitle className="text-xl font-black mt-2">Reserve Admission Pass</CardTitle>
        <CardDescription className="text-xs">
          Select your ticket category below to receive instant QR code admission credentials.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ticket Tiers Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Select Ticket Category:
          </label>
          <div className="space-y-2">
            {ticketTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId;
              const isTierExhausted = tier.bookedCount >= tier.capacity;

              return (
                <div
                  key={tier.id || tier.name}
                  onClick={() => !isTierExhausted && setSelectedTierId(tier.id || tier.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#035AFC] bg-[#035AFC]/5 dark:bg-[#035AFC]/10 ring-1 ring-[#035AFC]'
                      : isTierExhausted
                      ? 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      {tier.name}
                      {tier.priceINR === 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold">(Free)</span>
                      )}
                    </div>
                    {tier.description && (
                      <p className="text-[11px] text-slate-500">{tier.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {tier.priceINR === 0 ? '₹0' : `₹${tier.priceINR}`}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isTierExhausted ? 'Full' : `${tier.capacity - tier.bookedCount} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          onClick={handleBook}
          disabled={isSubmitting || isFull || tierFull}
          className="w-full text-xs font-bold py-2.5 h-auto"
        >
          {isSubmitting ? (
            'Processing Booking...'
          ) : isFull || tierFull ? (
            'Capacity Full'
          ) : selectedTier && selectedTier.priceINR > 0 ? (
            `Book Ticket • ₹${selectedTier.priceINR}`
          ) : (
            <>
              <Ticket className="h-4 w-4 mr-1.5" /> Book Free Admission Pass
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-slate-400">
          MYBF membership remains 100% free. No booking fees or hidden surcharges.
        </p>
      </CardContent>
    </Card>
  );
}
