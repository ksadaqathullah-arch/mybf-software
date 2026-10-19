'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  User,
  Briefcase,
  MapPin,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Target,
  Palette,
  Users2,
  ShieldCheck,
  Check,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import { LocationSelector } from '@/features/geography/components/location-selector';
import {
  EXPECTATION_OPTIONS,
  TALENT_CATEGORIES,
  PARTICIPATION_PREFERENCES,
  GENDER_OPTIONS,
  validateYouthAgeEligibility,
  calculateAge,
  getExpectationLabel,
  getTalentLabel,
  type GenderOptionValue,
} from '@/features/memberships/constants/youth-discovery';

export function YouthRegistrationForm() {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    primaryPhone: '',
    dateOfBirth: '',
    gender: '' as GenderOptionValue | '',
    chapterId: INITIAL_16_CHAPTERS[0].slug,
    memberCategory: MEMBER_CATEGORIES[0].value as MemberCategoryValue,
    currentPosition: CURRENT_POSITIONS[0].value as CurrentPositionValue,
    occupation: '',
    companyName: '',
    businessSector: 'Information Technology',
    expectations: [] as string[],
    otherExpectationText: '',
    futureGoal: '',
    talents: [] as string[],
    otherTalentDescription: '',
    participationPreferences: [] as string[],
    district: 'Malappuram',
    taluk: 'Ernad',
    localBody: 'Manjeri Municipality',
    ward: '',
    postOffice: '',
    pinCode: '676121',
    username: '',
    password: '',
    confirmPassword: '',
    consent: false,
    requestAgeException: false,
    ageExceptionReason: '',
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const checkUsernameTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = React.useState<{
    referenceNumber: string;
    isAgeException: boolean;
    applicantAge: number;
    status: string;
    username: string;
  } | null>(null);

  // Age eligibility verification state
  const ageValidation = React.useMemo(() => {
    if (!formData.dateOfBirth) return null;
    return validateYouthAgeEligibility(formData.dateOfBirth);
  }, [formData.dateOfBirth]);

  const handleUsernameChange = (val: string) => {
    setFormData((prev) => ({ ...prev, username: val }));
    setUsernameAvailable(null);

    if (checkUsernameTimerRef.current) {
      clearTimeout(checkUsernameTimerRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length >= 3 && /^[a-zA-Z0-9_.]+$/.test(trimmed)) {
      setUsernameChecking(true);
      checkUsernameTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/v1/auth/check-username?username=${encodeURIComponent(trimmed)}`);
          const data = await res.json();
          setUsernameAvailable(Boolean(data.available));
        } catch {
          setUsernameAvailable(null);
        } finally {
          setUsernameChecking(false);
        }
      }, 400);
    } else {
      setUsernameChecking(false);
      setUsernameAvailable(null);
    }
  };

  // Toggle helper for multi-select arrays
  const toggleSelection = (field: 'expectations' | 'talents' | 'participationPreferences', key: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const exists = current.includes(key);
      const updated = exists ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Date of Birth and Youth Age Eligibility
    if (!formData.dateOfBirth) {
      setErrorMessage('Date of birth is required for youth registration.');
      return;
    }

    const ageCheck = validateYouthAgeEligibility(formData.dateOfBirth);

    if (ageCheck.isUnderAge) {
      setErrorMessage('MYBF membership registration requires applicants to be at least 18 years of age.');
      return;
    }

    if (ageCheck.requiresAgeException) {
      if (!formData.requestAgeException) {
        setErrorMessage(
          'Standard MYBF membership eligibility is for youth up to 35. Since you are 36 or above, please check "Request Special Super Admin Approval".'
        );
        return;
      }
      if (!formData.ageExceptionReason || formData.ageExceptionReason.trim().length < 10) {
        setErrorMessage(
          'Please provide a clear justification (minimum 10 characters) explaining why an age exception should be granted.'
        );
        return;
      }
    }

    // 2. Validate Expectations (at least 1 required)
    if (formData.expectations.length === 0) {
      setErrorMessage('Please select at least one expectation from MYBF.');
      return;
    }

    // 3. Validate Credentials
    if (!formData.username || formData.username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(formData.username.trim())) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and periods (3-30 characters).');
      return;
    }
    if (!formData.password || formData.password.length < 12) {
      setErrorMessage('Password must be at least 12 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // 4. Validate Consent
    if (!formData.consent) {
      setErrorMessage('Please acknowledge the youth charter and DPDP privacy terms.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/memberships/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          primaryPhone: formData.primaryPhone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender ? formData.gender : undefined,
          chapterId: formData.chapterId,
          memberCategory: formData.memberCategory,
          currentPosition: formData.currentPosition,
          occupation: formData.occupation || 'Professional / Entrepreneur',
          companyName: formData.companyName || undefined,
          businessSector: formData.businessSector || undefined,
          expectations: formData.expectations,
          otherExpectationText: formData.otherExpectationText || undefined,
          futureGoal: formData.futureGoal || undefined,
          talents: formData.talents,
          otherTalentDescription: formData.otherTalentDescription || undefined,
          participationPreferences: formData.participationPreferences,
          district: formData.district || 'Malappuram',
          taluk: formData.taluk,
          localBody: formData.localBody,
          ward: formData.ward || undefined,
          postOffice: formData.postOffice || undefined,
          pinCode: formData.pinCode || '676121',
          username: formData.username.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          consentAcknowledged: formData.consent,
          requestAgeException: formData.requestAgeException,
          ageExceptionReason: formData.ageExceptionReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit membership application.');
      }

      setSubmissionResult({
        referenceNumber: data.referenceNumber,
        isAgeException: Boolean(data.isAgeException),
        applicantAge: data.applicantAge ?? (formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : 0),
        status: data.status,
        username: data.username || formData.username.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your application.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const age = submissionResult?.applicantAge ?? (formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null);
    const isException = submissionResult?.isAgeException;

    return (
      <Card className={`shadow-2xl p-6 sm:p-8 text-center space-y-6 ${isException ? 'border-amber-500/40' : 'border-emerald-500/40'}`}>
        <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center ${
          isException
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
        }`}>
          {isException ? <ShieldCheck className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
        </div>
        <div className="space-y-2">
          <Badge variant={isException ? 'warning' : 'success'}>
            {isException ? 'SPECIAL AGE EXCEPTION REVIEW PENDING' : 'YOUTH APPLICATION RECEIVED'}
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isException ? 'Age Exception Application Submitted' : 'Application Submitted Successfully'}
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            {isException
              ? 'Standard MYBF membership eligibility ends at 35. Because your age exceeds 35, your application has been securely routed to the Super Administrator for exceptional review. Your membership account will be activated after approval by the MYBF Super Administrator.'
              : 'Your membership account has been registered with your chosen username and password. Your account will be activated after approval by the MYBF Super Administrator. Once approved, you can immediately sign in to your personal member dashboard.'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400 text-left space-y-3 max-w-2xl mx-auto border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant & Username</span>
              <strong className="text-sm text-slate-900 dark:text-white">{formData.fullName}</strong>
              <span className="font-mono text-xs font-semibold text-[#035AFC] dark:text-blue-400 block mt-0.5">
                @{submissionResult?.username || formData.username}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Reference</span>
              <span className="text-xs font-mono font-bold text-[#035AFC]">
                {submissionResult?.referenceNumber || 'REF-REGISTERED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Age Standing</span>
              <span className={`text-sm font-semibold ${isException ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isException ? `Exception Review (${age} years old)` : `Eligible Youth (${age} years old)`}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Chapter</span>
              <strong className="text-slate-900 dark:text-white">
                {INITIAL_16_CHAPTERS.find((c) => c.slug === formData.chapterId)?.name || formData.chapterId}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Member Classification</span>
              <div className="space-y-0.5">
                <span className="block text-slate-800 dark:text-slate-200">
                  {getMemberCategoryLabel(formData.memberCategory)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Position: {getCurrentPositionLabel(formData.currentPosition)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Approval Authority</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                MYBF Super Administrator Review Queue
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Selected Expectations ({formData.expectations.length})
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.expectations.map((exp) => (
                  <Badge key={exp} variant="primary" className="text-[10px] py-0 px-2">
                    {getExpectationLabel(exp)}
                  </Badge>
                ))}
              </div>
            </div>

            {formData.talents.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Talents & Skills ({formData.talents.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.talents.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] py-0 px-2">
                      {getTalentLabel(t)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 text-[11px] font-medium border-t border-slate-200 dark:border-slate-800">
            <span>Registration Standing:</span>
            <span className={isException ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
              {isException ? 'SUPER ADMIN EXCEPTION QUEUE (ZERO FEES)' : 'UNDER CHAPTER REVIEW (ZERO FEES)'}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">Go to Member Sign In</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-2xl">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <Badge variant="primary">Youth Registration</Badge>
          <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            100% Free Membership • Max 35 Years
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">MYBF Youth Membership & Talent Discovery</CardTitle>
        <CardDescription className="text-xs max-w-xl mx-auto">
          Join 16 chapters across Malappuram district. Share your background, what you hope to achieve, and discover opportunities to connect with like-minded youth.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Personal & Contact Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#035AFC]" />
                1. Personal & Contact Identity
              </h4>
              <span className="text-[10px] text-slate-400">Eligibility: Up to 35 Years</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="reg-full-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  id="reg-full-name"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Mohammed Anas"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  id="reg-phone"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. anas@enterprise.in"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              {/* Date of Birth Field with Youth Eligibility Check */}
              <div className="space-y-1 sm:col-span-1">
                <label htmlFor="reg-dob" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Date of Birth *</span>
                  <span className="text-[10px] text-slate-400">Max age: 35</span>
                </label>
                <input
                  id="reg-dob"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs focus:ring-2 bg-white dark:bg-[#070A10] ${
                    ageValidation
                      ? ageValidation.eligible
                        ? 'border-emerald-500/50 focus:ring-emerald-500'
                        : 'border-rose-500/50 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-[#035AFC]'
                  }`}
                />
                {ageValidation && (
                  <div className="mt-1">
                    {ageValidation.eligible ? (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3 inline" /> Eligible Youth ({ageValidation.age} years old)
                      </span>
                    ) : ageValidation.isUnderAge ? (
                      <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block leading-tight">
                        {ageValidation.error}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block leading-tight">
                        Standard youth eligibility ends at 35 (Applicant is {ageValidation.age} years old). Requires Super Admin review.
                      </span>
                    )}
                  </div>
                )}

                {/* Special Super Admin Age Exception Section */}
                {ageValidation && ageValidation.requiresAgeException && (
                  <div className="mt-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs space-y-2.5 sm:col-span-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-300">
                          Super Admin Age Exception Review Required ({ageValidation.age} Years Old)
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 text-[11px] mt-0.5">
                          Standard MYBF membership eligibility is for youth up to 35 years of age. Applicants aged 36 and above require special review and authorization by the Super Administrator before chapter approval.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.requestAgeException}
                        onChange={(e) => setFormData({ ...formData, requestAgeException: e.target.checked })}
                        className="h-4 w-4 rounded border-amber-400 text-[#035AFC] focus:ring-[#035AFC]"
                      />
                      <span>Request Special Super Admin Approval</span>
                    </label>

                    {formData.requestAgeException && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                          Justification for Special Age Exception * (Minimum 10 characters)
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={formData.ageExceptionReason}
                          onChange={(e) => setFormData({ ...formData, ageExceptionReason: e.target.value })}
                          placeholder="Please explain your professional background, mentorship capability, or contribution to the MYBF youth community..."
                          className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] p-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gender Dropdown (Configurable & Optional) */}
              <div className="space-y-1 sm:col-span-1">
                <label htmlFor="reg-gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Gender (Optional)
                </label>
                <select
                  id="reg-gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderOptionValue })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  <option value="">Select Gender (Optional)</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">Kept private; not published</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Chapter & Member Classification */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#035AFC]" />
              2. Chapter & Member Classification
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="reg-chapter" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Chapter (16 Constituency Chapters in Malappuram) *
                </label>
                <select
                  id="reg-chapter"
                  required
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  {INITIAL_16_CHAPTERS.map((ch) => (
                    <option key={ch.slug} value={ch.slug}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="reg-member-category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Member Category / Interest *
                  </label>
                  <select
                    id="reg-member-category"
                    required
                    value={formData.memberCategory}
                    onChange={(e) => setFormData({ ...formData, memberCategory: e.target.value as MemberCategoryValue })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  >
                    {MEMBER_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    {MEMBER_CATEGORIES.find((c) => c.value === formData.memberCategory)?.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-current-position" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Position *
                  </label>
                  <select
                    id="reg-current-position"
                    required
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value as CurrentPositionValue })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  >
                    {CURRENT_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    {CURRENT_POSITIONS.find((p) => p.value === formData.currentPosition)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Business or Professional Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-[#035AFC]" />
              3. Business or Professional Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="reg-occupation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Occupation / Role *
                </label>
                <input
                  id="reg-occupation"
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Founder / Software Engineer / Student"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-company" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company / Firm / Institution Name
                </label>
                <input
                  id="reg-company"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Malabar Green Logistics or College Name"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Expectations from MYBF */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-[#035AFC]" />
                  4. What Do You Expect from MYBF? *
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tell us what you hope to achieve through the MYBF community. (Select all that apply, at least 1 required)
                </p>
              </div>
              <Badge variant={formData.expectations.length > 0 ? 'success' : 'neutral'} className="text-[10px] w-fit">
                {formData.expectations.length} Selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {EXPECTATION_OPTIONS.map((exp) => {
                const isSelected = formData.expectations.includes(exp.key);
                return (
                  <button
                    key={exp.key}
                    type="button"
                    onClick={() => toggleSelection('expectations', exp.key)}
                    className={`flex items-start text-left p-2.5 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-[#035AFC] bg-[#035AFC]/10 text-slate-900 dark:text-white font-medium ring-1 ring-[#035AFC]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#070A10] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded mr-2 mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#035AFC] border-[#035AFC] text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-snug">{exp.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{exp.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Conditional "Other Expectation" input */}
            {formData.expectations.includes('OTHER') && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Please specify your expectation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.otherExpectationText}
                  onChange={(e) => setFormData({ ...formData, otherExpectationText: e.target.value })}
                  placeholder="e.g. Cross-border trade guidance, sustainable energy mentorship..."
                  maxLength={300}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                />
              </div>
            )}

            {/* Optional 3-Year Future Goal */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  What is your biggest goal for the next 3 years? (Optional)
                </label>
                <span className="text-[10px] text-slate-400">
                  {formData.futureGoal.length} / 500
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                value={formData.futureGoal}
                onChange={(e) => setFormData({ ...formData, futureGoal: e.target.value })}
                placeholder="e.g. Launch a technology brand from Manjeri reaching 50+ clients across GCC; learn export trade and build a team of 10 youth."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Kept confidential; shared only with chapter mentors to align programs with your goals.
              </span>
            </div>
          </div>

          {/* SECTION 5: Skills, Talents & Extracurricular Interests */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#035AFC]" />
                  5. Skills, Talents & Extracurricular Interests
                </h4>
                <p className="text-[11px] text-slate-500">
                  Share your talents and discover opportunities to connect with like-minded members. (Optional)
                </p>
              </div>
              <Badge variant={formData.talents.length > 0 ? 'secondary' : 'neutral'} className="text-[10px] w-fit">
                {formData.talents.length} Talents Selected
              </Badge>
            </div>

            <div className="space-y-3 pt-1">
              {TALENT_CATEGORIES.map((category) => (
                <div
                  key={category.key}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {category.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{category.description}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.options.map((t) => {
                      const isSelected = formData.talents.includes(t.key);
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => toggleSelection('talents', t.key)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-[#035AFC] text-white border-[#035AFC] shadow-sm'
                              : 'bg-white dark:bg-[#070A10] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Other Talent Option */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Other Special Talent
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSelection('talents', 'OTHER_TALENT')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      formData.talents.includes('OTHER_TALENT')
                        ? 'bg-[#035AFC] text-white border-[#035AFC]'
                        : 'bg-white dark:bg-[#070A10] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {formData.talents.includes('OTHER_TALENT') && <Check className="h-3 w-3" />}
                    Add Other Talent
                  </button>
                </div>
                {formData.talents.includes('OTHER_TALENT') && (
                  <input
                    type="text"
                    value={formData.otherTalentDescription}
                    onChange={(e) => setFormData({ ...formData, otherTalentDescription: e.target.value })}
                    placeholder="Describe your talent (e.g., Calligraphy, Drone piloting, Culinary arts...)"
                    maxLength={300}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6: Participation Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-[#035AFC]" />
                  6. How Would You Like to Participate in MYBF?
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select activities you are open to contributing to or taking part in. (Optional)
                </p>
              </div>
              <Badge variant={formData.participationPreferences.length > 0 ? 'secondary' : 'neutral'} className="text-[10px] w-fit">
                {formData.participationPreferences.length} Selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {PARTICIPATION_PREFERENCES.map((pref) => {
                const isSelected = formData.participationPreferences.includes(pref.key);
                return (
                  <button
                    key={pref.key}
                    type="button"
                    onClick={() => toggleSelection('participationPreferences', pref.key)}
                    className={`flex items-start text-left p-2.5 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-[#035AFC] bg-[#035AFC]/10 text-slate-900 dark:text-white font-medium ring-1 ring-[#035AFC]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#070A10] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded mr-2 mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#035AFC] border-[#035AFC] text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs">{pref.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{pref.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: Malappuram Location */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#035AFC]" />
                7. Malappuram Location
              </h4>
              <span className="text-[10px] text-slate-400">
                Verified Administrative Master
              </span>
            </div>

            <LocationSelector
              value={{
                district: formData.district || 'Malappuram',
                taluk: formData.taluk,
                localBody: formData.localBody,
                ward: formData.ward,
                postOffice: formData.postOffice,
                pinCode: formData.pinCode,
              }}
              onChange={(loc) => {
                setFormData((prev) => ({
                  ...prev,
                  district: loc.district,
                  taluk: loc.taluk,
                  localBody: loc.localBody,
                  ward: loc.ward || '',
                  postOffice: loc.postOffice || '',
                  pinCode: loc.pinCode || '',
                }));
              }}
            />
          </div>

          {/* SECTION: CREATE YOUR LOGIN CREDENTIALS */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#035AFC]" />
                8. Create Your Login Credentials
              </h4>
              <p className="text-xs text-slate-500">
                Choose a unique username and strong password for your personal MYBF account.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#035AFC] dark:text-blue-400 font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Your membership account will be activated after approval by the MYBF Super Administrator.</span>
            </div>

            <div className="space-y-3">
              {/* Username Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Username *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Letters, numbers, underscores and periods (3-30 chars)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="e.g. salman_faris"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] pl-8 pr-24 py-2 text-xs focus:ring-2 focus:ring-[#035AFC] font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]">
                    {usernameChecking ? (
                      <span className="text-slate-400">Checking...</span>
                    ) : usernameAvailable === true ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Available
                      </span>
                    ) : usernameAvailable === false ? (
                      <span className="text-rose-500 font-bold">Taken</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    <span className="text-[10px] text-slate-400">Min 12 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={12}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Confirm Password *
                    </label>
                    <span className="text-[10px] text-slate-400">Must match password</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={12}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-medium">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: DPDP Privacy Notice & Consent */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-[#035AFC]" />
                Youth Privacy & Purpose-Specific Data Protection
              </div>
              <p>
                • <strong>Age Eligibility:</strong> MYBF is an NGO youth community. Registration is available exclusively to applicants aged 35 or below.
              </p>
              <p>
                • <strong>Restricted Visibility:</strong> Your Date of Birth, gender, and 3-year personal goals are securely stored and will <em>never</em> be made publicly visible on the member directory.
              </p>
              <p>
                • <strong>Talent Discovery:</strong> Extracurricular talents and participation preferences help chapter leadership invite you to relevant programs. Enrolling in an activity remains strictly voluntary.
              </p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                required
                checked={formData.consent}
                onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-[#035AFC] focus:ring-[#035AFC]"
              />
              <span>
                I confirm that my submitted information is true and accurate, agree to the MYBF Organizational Charter, and consent to purpose-specific verification under DPDP guidelines.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={
              loading ||
              (ageValidation !== null &&
                (ageValidation.isUnderAge || (!ageValidation.eligible && !formData.requestAgeException)))
            }
            className="w-full h-11 text-sm mt-3"
          >
            {loading
              ? 'Submitting Application...'
              : formData.requestAgeException
              ? 'Submit for Super Admin Age Exception Review'
              : 'Submit Youth Application for Review'}
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
