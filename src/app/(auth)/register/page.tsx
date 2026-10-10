'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Phone, Mail, Briefcase, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { MEMBERSHIP_CATEGORIES } from '@/features/memberships/constants/categories';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';

export default function RegisterPage() {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    primaryPhone: '',
    chapterId: INITIAL_16_CHAPTERS[0].slug,
    categoryCode: MEMBERSHIP_CATEGORIES[0].code,
    occupation: '',
    companyName: '',
    businessSector: 'Information Technology',
    taluk: 'Ernad',
    ward: '',
    pinCode: '676121',
    consent: false,
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please acknowledge the DPDP consent and charter agreement.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <Card className="border-emerald-500/40 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="success">Application Received</Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Submission Successful
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your application has been routed to the elected chapter officers for verification. In accordance with MYBF governance, you will receive an SMS/Email notification upon status update.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400 text-left space-y-2">
          <div className="flex justify-between">
            <span>Applicant:</span>
            <strong className="text-slate-900 dark:text-white">{formData.fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span>Selected Chapter:</span>
            <strong className="text-slate-900 dark:text-white">{formData.chapterId.toUpperCase()}</strong>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-amber-600 font-semibold">SUBMITTED (UNDER REVIEW)</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
          <Link href="/member">
            <Button variant="primary" size="sm">View Member Portal</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-2xl">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <Badge variant="primary" className="mx-auto mb-2">Join MYBF Community</Badge>
        <CardTitle className="text-2xl font-bold">Membership Application</CardTitle>
        <CardDescription className="text-xs">
          Connect your business with 16 chapters across Malappuram district
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Personal & Contact Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Mohammed Anas"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="e.g. 9847012345"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. anas@enterprise.in"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
              />
            </div>
          </div>

          {/* Chapter & Category Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Chapter & Membership Tier
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Chapter (16 Chapters) *
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  {INITIAL_16_CHAPTERS.map((ch) => (
                    <option key={ch.slug} value={ch.slug}>
                      {ch.name} ({ch.taluk})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Membership Tier *
                </label>
                <select
                  value={formData.categoryCode}
                  onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  {MEMBERSHIP_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name} (₹{cat.annualFeeINR}/yr)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Business or Professional Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Occupation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Managing Director / CA"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company / Firm Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Malabar Green Logistics"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>
            </div>
          </div>

          {/* Geography */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Malappuram Location
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Taluk</label>
                <select
                  value={formData.taluk}
                  onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs"
                >
                  {TALUKS_OF_MALAPPURAM.map((t) => (
                    <option key={t.code} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ward / Area</label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="e.g. Ward 14, Pandikkad Road"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">PIN Code</label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="676121"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                required
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-[#035AFC] focus:ring-[#035AFC]"
              />
              <span>
                I agree to the MYBF Organizational Charter and acknowledge DPDP privacy terms for verified member directory publishing.
              </span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-3">
            {loading ? 'Submitting Application...' : 'Submit Application for Review'}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800 p-4 text-xs text-slate-500">
        Already a member?{' '}
        <Link href="/login" className="ml-1 text-[#035AFC] font-semibold hover:underline">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
