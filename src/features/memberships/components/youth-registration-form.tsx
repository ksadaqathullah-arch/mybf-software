'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  Briefcase,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Target,
  Palette,
  Users2,
  ShieldCheck,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MybfLogo } from '@/components/brand/mybf-logo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';
import { LocationSelector } from '@/features/geography/components/location-selector';
import {
  EXPECTATION_OPTIONS,
  TALENT_CATEGORIES,
  PARTICIPATION_PREFERENCES,
  GENDER_OPTIONS,
  validateYouthAgeEligibility,
  calculateAge,
  type GenderOptionValue,
} from '@/features/memberships/constants/youth-discovery';

export interface YouthRegistrationFormProps {
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  triggerLabel?: string;
  className?: string;
}

const STEPS = [
  { id: 1, title: 'Personal Identity', shortLabel: 'Identity', subtitle: 'Name, contact details & youth age eligibility' },
  { id: 2, title: 'Location & Chapter', shortLabel: 'Location', subtitle: 'Malappuram residence & constituency chapter' },
  { id: 3, title: 'Professional Profile', shortLabel: 'Profile', subtitle: 'Current position, occupation & classification' },
  { id: 4, title: 'Goals & Talents', shortLabel: 'Interests', subtitle: 'Community expectations & extracurricular skills' },
  { id: 5, title: 'Account Credentials', shortLabel: 'Account', subtitle: 'Portal credentials & DPDP compliance' },
];

export function YouthRegistrationForm({
  asModal = true,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  triggerLabel = 'Apply for Membership Now',
  className = '',
}: YouthRegistrationFormProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleClose = React.useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
    if (typeof window !== 'undefined' && (window.location.hash === '#register-form' || window.location.hash === '#register-modal')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [controlledOnClose]);

  // Open modal via hash change or global custom event
  React.useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash === '#register-form' || hash === '#register-modal' || hash === '#register') {
          setInternalOpen(true);
        }
      }
    };

    const handleCustomOpen = () => {
      setInternalOpen(true);
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('open-registration-modal', handleCustomOpen);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('open-registration-modal', handleCustomOpen);
    };
  }, []);

  // Lock background scroll when modal is open
  React.useEffect(() => {
    if (asModal && isModalOpen) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [asModal, isModalOpen, handleClose]);

  // Step state (1 through 5)
  const [step, setStep] = React.useState(1);
  const modalScrollRef = React.useRef<HTMLDivElement>(null);

  // Form data state
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

  // UI state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [usernameChecking, setUsernameChecking] = React.useState(false);
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const checkUsernameTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
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

  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleUsernameChange = (val: string) => {
    setFormData((prev) => ({ ...prev, username: val }));
    clearFieldError('username');
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
          if (!data.available) {
            setFieldErrors((prev) => ({
              ...prev,
              username: 'This username is already taken. Please choose another.',
            }));
          }
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

  const toggleSelection = (field: 'expectations' | 'talents' | 'participationPreferences', key: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const exists = current.includes(key);
      const updated = exists ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, [field]: updated };
    });
    if (field === 'expectations') {
      clearFieldError('expectations');
    }
  };

  // Field-wise step validation (WITHOUT HTML5 required attribute)
  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        errors.fullName = 'Please enter your full name (minimum 2 characters).';
      }
      if (!/^[6-9]\d{9}$/.test(formData.primaryPhone.trim())) {
        errors.primaryPhone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Please select your date of birth.';
      } else {
        const check = validateYouthAgeEligibility(formData.dateOfBirth);
        if (check.isUnderAge) {
          errors.dateOfBirth = 'MYBF membership requires applicants to be at least 18 years of age.';
        } else if (check.requiresAgeException) {
          if (!formData.requestAgeException) {
            errors.requestAgeException = 'Applicants 36 and above must check "Request Special Super Admin Approval".';
          }
          if (!formData.ageExceptionReason || formData.ageExceptionReason.trim().length < 10) {
            errors.ageExceptionReason = 'Please provide a justification (minimum 10 characters) explaining why an age exception should be granted.';
          }
        }
      }
    }

    if (stepNumber === 2) {
      if (!formData.pinCode || !/^\d{6}$/.test(formData.pinCode.trim())) {
        errors.pinCode = 'Please enter a valid 6-digit Malappuram PIN code.';
      }
      if (!formData.taluk || formData.taluk.trim().length === 0) {
        errors.taluk = 'Please select your taluk in Malappuram.';
      }
      if (!formData.localBody || formData.localBody.trim().length === 0) {
        errors.localBody = 'Please select your municipality or grama panchayat.';
      }
      if (!formData.chapterId || formData.chapterId.trim().length === 0) {
        errors.chapterId = 'Please select your constituency chapter.';
      }
    }

    if (stepNumber === 3) {
      if (!formData.memberCategory) {
        errors.memberCategory = 'Please select your member category.';
      }
      if (!formData.currentPosition) {
        errors.currentPosition = 'Please select your current position.';
      }
      if (!formData.occupation || formData.occupation.trim().length < 2) {
        errors.occupation = 'Please enter your occupation or profession (at least 2 characters).';
      }
    }

    if (stepNumber === 4) {
      if (!formData.expectations || formData.expectations.length === 0) {
        errors.expectations = 'Please select at least one expectation from MYBF.';
      }
      if (
        formData.expectations.includes('OTHER') &&
        (!formData.otherExpectationText || formData.otherExpectationText.trim().length === 0)
      ) {
        errors.otherExpectationText = 'Please describe your other expectation.';
      }
    }

    if (stepNumber === 5) {
      const cleanUser = formData.username.trim();
      if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 30) {
        errors.username = 'Username must be between 3 and 30 characters.';
      } else if (!/^[a-zA-Z0-9_.]+$/.test(cleanUser)) {
        errors.username = 'Username can only contain letters, numbers, underscores, and periods.';
      } else if (usernameAvailable === false) {
        errors.username = 'This username is already taken. Please choose another.';
      }

      if (!formData.password || formData.password.length < 12) {
        errors.password = 'Password must be at least 12 characters long.';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
      if (!formData.consent) {
        errors.consent = 'You must agree to the MYBF charter and consent to DPDP verification.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const targetElement = document.getElementById(`field-${firstErrorKey}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.focus();
      }
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/memberships/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          primaryPhone: formData.primaryPhone.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender ? formData.gender : undefined,
          chapterId: formData.chapterId,
          memberCategory: formData.memberCategory,
          currentPosition: formData.currentPosition,
          occupation: formData.occupation.trim() || 'Professional / Entrepreneur',
          companyName: formData.companyName.trim() || undefined,
          businessSector: formData.businessSector || undefined,
          expectations: formData.expectations,
          otherExpectationText: formData.otherExpectationText.trim() || undefined,
          futureGoal: formData.futureGoal.trim() || undefined,
          talents: formData.talents,
          otherTalentDescription: formData.otherTalentDescription.trim() || undefined,
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
          ageExceptionReason: formData.ageExceptionReason.trim() || undefined,
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
      setFieldErrors((prev) => ({
        ...prev,
        form: err.message || 'An error occurred while submitting your application.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.round((step / 5) * 100);
  const currentStepMeta = STEPS[step - 1];

  // Inner form view (shared between modal and standalone)
  const formContent = (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100',
        asModal ? 'h-full w-full min-h-0 flex-1 overflow-hidden' : 'w-full'
      )}
    >
      {/* ==================================================== */}
      {/* STICKY / FIXED-HEIGHT HEADER */}
      {/* ==================================================== */}
      <header className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0A0F1D]/95 px-5 py-4 sm:px-6 sm:py-4.5 backdrop-blur-md z-10">
        <div className="flex items-center justify-between gap-3">
          {/* Brand logo & attribution */}
          <div className="flex items-center gap-3">
            <MybfLogo size="sm" className="h-6 w-auto" priority />
            <div className="hidden sm:flex flex-col border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Membership Portal
              </span>
              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                An Initiative Under Mission Malappuram 2050
              </span>
            </div>
          </div>

          {/* Step badge & close button */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#035AFC] dark:text-blue-400 text-xs font-semibold border border-blue-200/60 dark:border-blue-900/60">
              Step {step} of 5 <span className="opacity-60 font-normal">({progressPercent}%)</span>
            </span>
            {asModal && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & subtitle */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h2 id="registration-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentStepMeta.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentStepMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Elegant Progress bar */}
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#035AFC] transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(3,90,252,0.4)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Desktop Compact Stepper */}
        <nav aria-label="Registration steps" className="hidden sm:grid grid-cols-5 gap-1.5 mt-3 pt-1">
          {STEPS.map((s) => {
            const isCompleted = s.id < step;
            const isCurrent = s.id === step;
            return (
              <div
                key={s.id}
                className={cn(
                  'px-2 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 text-xs',
                  isCurrent
                    ? 'bg-[#035AFC] text-white font-semibold shadow-sm'
                    : isCompleted
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 text-[#035AFC] dark:text-blue-400 font-medium border border-blue-200/50 dark:border-blue-900/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <span className="text-[10px] font-mono opacity-80">{s.id}.</span>
                )}
                <span className="truncate">{s.shortLabel}</span>
              </div>
            );
          })}
        </nav>
      </header>

      {/* ==================================================== */}
      {/* INDEPENDENTLY SCROLLABLE FORM BODY (min-h-0 is essential) */}
      {/* ==================================================== */}
      <div
        ref={modalScrollRef}
        className={cn(
          'px-5 py-5 sm:px-6 sm:py-6 space-y-6',
          asModal ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain' : ''
        )}
      >
        {/* Global Error Banner */}
        {fieldErrors.form && (
          <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{fieldErrors.form}</span>
          </div>
        )}

        {submitted ? (
          /* Submission Confirmation View */
          <div className="py-8 sm:py-10 text-center space-y-6 max-w-lg mx-auto">
            <div
              className={cn(
                'h-16 w-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg',
                submissionResult?.isAgeException
                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
              )}
            >
              {submissionResult?.isAgeException ? (
                <ShieldCheck className="h-9 w-9" />
              ) : (
                <CheckCircle2 className="h-9 w-9" />
              )}
            </div>

            <div>
              <span
                className={cn(
                  'inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase',
                  submissionResult?.isAgeException
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                )}
              >
                {submissionResult?.isAgeException ? 'Special Age Exception Pending' : 'Youth Application Received'}
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {submissionResult?.isAgeException
                  ? 'Application Submitted for Super Admin Review'
                  : 'Application Registered Successfully'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                {submissionResult?.isAgeException
                  ? 'Standard youth eligibility ends at 35. Because your age exceeds 35, your application has been securely routed to the Super Administrator for exceptional authorization.'
                  : 'Your account credentials have been created. Your registration is now under chapter officer verification. Once approved, you can immediately access your digital member space.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-5 text-left text-xs text-slate-700 dark:text-slate-300 space-y-3.5 shadow-sm">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Applicant & Username
                  </span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                    {formData.fullName}
                  </strong>
                  <span className="font-mono text-xs font-semibold text-[#035AFC] dark:text-blue-400 block mt-0.5">
                    @{submissionResult?.username || formData.username}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Reference ID
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-1 inline-block rounded-lg border border-slate-200 dark:border-slate-700 mt-1">
                    {submissionResult?.referenceNumber || 'REF-REGISTERED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Enrolled Chapter
                  </span>
                  <strong className="text-xs font-semibold text-slate-900 dark:text-white block mt-0.5">
                    {INITIAL_16_CHAPTERS.find((c) => c.slug === formData.chapterId)?.name || formData.chapterId}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Age Standing
                  </span>
                  <span className="text-xs font-semibold block mt-0.5 text-slate-900 dark:text-white">
                    {submissionResult?.isAgeException
                      ? `Exception Review (${submissionResult.applicantAge} years)`
                      : `Eligible Youth (${submissionResult?.applicantAge} years)`}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Registration Status:</span>
                <span className="text-[#035AFC] dark:text-blue-400 uppercase tracking-wide">
                  {submissionResult?.isAgeException ? 'Super Admin Review Queue' : 'Under Chapter Review (Zero Fees)'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {asModal && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              )}
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl bg-[#035AFC] hover:bg-[#0246C7] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Member Sign In →
              </Link>
            </div>
          </div>
        ) : (
          /* Form Sections */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ==================================================== */}
            {/* STEP 1: Personal & Contact Identity */}
            {/* ==================================================== */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-[#035AFC]" />
                    <span>Personal Identity & Contact Information</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your official identity, contact details, and youth eligibility verification.
                  </p>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="field-fullName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="field-fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        clearFieldError('fullName');
                      }}
                      placeholder="e.g. Mohammed Anas"
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none',
                        fieldErrors.fullName
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-primaryPhone" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="field-primaryPhone"
                      type="tel"
                      value={formData.primaryPhone}
                      onChange={(e) => {
                        setFormData({ ...formData, primaryPhone: e.target.value });
                        clearFieldError('primaryPhone');
                      }}
                      placeholder="e.g. 9847012345"
                      maxLength={10}
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none',
                        fieldErrors.primaryPhone
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.primaryPhone && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.primaryPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Email, Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label htmlFor="field-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="field-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        clearFieldError('email');
                      }}
                      placeholder="e.g. anas@enterprise.in"
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none',
                        fieldErrors.email
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="field-dateOfBirth" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Max Age: 35</span>
                    </div>
                    <input
                      id="field-dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => {
                        setFormData({ ...formData, dateOfBirth: e.target.value });
                        clearFieldError('dateOfBirth');
                      }}
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all outline-none',
                        fieldErrors.dateOfBirth
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.dateOfBirth && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.dateOfBirth}</span>
                      </p>
                    )}

                    {ageValidation && !fieldErrors.dateOfBirth && (
                      <div className="mt-1.5 text-xs font-semibold">
                        {ageValidation.eligible ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Eligible Youth ({ageValidation.age} years old)
                          </span>
                        ) : ageValidation.isUnderAge ? (
                          <span className="text-rose-600 dark:text-rose-400">{ageValidation.error}</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">
                            Age {ageValidation.age} (Standard limit is 35. Super Admin review required).
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="field-gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Gender (Optional)
                    </label>
                    <select
                      id="field-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderOptionValue })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                    >
                      <option value="">Select Gender (Optional)</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 block mt-1">Kept confidential; not published</span>
                  </div>
                </div>

                {/* Special Age Exception Request Workflow (Age >= 36) */}
                {ageValidation && ageValidation.requiresAgeException && (
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                          Super Admin Age Exception Review ({ageValidation.age} Years Old)
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5 leading-relaxed">
                          Standard MYBF membership is curated for youth up to 35. Applicants aged 36+ require review and exceptional authorization by the Super Administrator before chapter approval.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer pt-1 font-semibold text-xs text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.requestAgeException}
                        onChange={(e) => {
                          setFormData({ ...formData, requestAgeException: e.target.checked });
                          clearFieldError('requestAgeException');
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[#035AFC] focus:ring-[#035AFC]"
                      />
                      <span>Request Special Super Admin Approval</span>
                    </label>
                    {fieldErrors.requestAgeException && (
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.requestAgeException}</span>
                      </p>
                    )}

                    {formData.requestAgeException && (
                      <div className="space-y-1.5 pt-1">
                        <label
                          htmlFor="field-ageExceptionReason"
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                        >
                          Justification for Exception <span className="text-rose-500">*</span> (Minimum 10 Characters)
                        </label>
                        <textarea
                          id="field-ageExceptionReason"
                          rows={2}
                          value={formData.ageExceptionReason}
                          onChange={(e) => {
                            setFormData({ ...formData, ageExceptionReason: e.target.value });
                            clearFieldError('ageExceptionReason');
                          }}
                          placeholder="Please explain your professional background, mentorship capacity, or contribution to Malappuram youth leadership..."
                          className={cn(
                            'w-full rounded-xl border bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white transition-all outline-none',
                            fieldErrors.ageExceptionReason
                              ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                          )}
                        />
                        {fieldErrors.ageExceptionReason && (
                          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{fieldErrors.ageExceptionReason}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 2: Location & Chapter Selection */}
            {/* ==================================================== */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#035AFC]" />
                    <span>Malappuram Administrative Location & Chapter</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verify your administrative residence using the PIN code lookup, then choose your constituency chapter.
                  </p>
                </div>

                {/* Location Selector Component */}
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-4.5">
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
                      clearFieldError('pinCode');
                      clearFieldError('taluk');
                      clearFieldError('localBody');
                    }}
                  />
                </div>

                {fieldErrors.pinCode && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.pinCode}</span>
                  </p>
                )}
                {fieldErrors.taluk && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.taluk}</span>
                  </p>
                )}
                {fieldErrors.localBody && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.localBody}</span>
                  </p>
                )}

                {/* Chapter Select */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-chapterId"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Building2 className="h-3.5 w-3.5 text-[#035AFC]" />
                      <span>Select Constituency Chapter</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">16 Chapters in Malappuram</span>
                  </div>
                  <select
                    id="field-chapterId"
                    value={formData.chapterId}
                    onChange={(e) => {
                      setFormData({ ...formData, chapterId: e.target.value });
                      clearFieldError('chapterId');
                    }}
                    className={cn(
                      'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all outline-none',
                      fieldErrors.chapterId
                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                    )}
                  >
                    <option value="">Select your Constituency Chapter...</option>
                    {INITIAL_16_CHAPTERS.map((ch) => (
                      <option key={ch.slug} value={ch.slug}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.chapterId && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.chapterId}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Choose the chapter closest to your business operations or residence. Chapter transfer requests can be submitted post-approval.
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 3: Professional Profile */}
            {/* ==================================================== */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#035AFC]" />
                    <span>Professional & Career Profile</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Categorize your current professional role to connect with relevant mentors and chapter activities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-memberCategory"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                    >
                      Member Category / Interest <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-memberCategory"
                      value={formData.memberCategory}
                      onChange={(e) => {
                        setFormData({ ...formData, memberCategory: e.target.value as MemberCategoryValue });
                        clearFieldError('memberCategory');
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                    >
                      {MEMBER_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {MEMBER_CATEGORIES.find((c) => c.value === formData.memberCategory)?.description}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="field-currentPosition"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                    >
                      Current Position <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="field-currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => {
                        setFormData({ ...formData, currentPosition: e.target.value as CurrentPositionValue });
                        clearFieldError('currentPosition');
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                    >
                      {CURRENT_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {CURRENT_POSITIONS.find((p) => p.value === formData.currentPosition)?.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label
                      htmlFor="field-occupation"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                    >
                      Occupation / Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="field-occupation"
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => {
                        setFormData({ ...formData, occupation: e.target.value });
                        clearFieldError('occupation');
                      }}
                      placeholder="e.g. Founder, Freelancer, Engineer, Student"
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none',
                        fieldErrors.occupation
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.occupation && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.occupation}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-companyName"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                    >
                      Company / Firm / College (Optional)
                    </label>
                    <input
                      id="field-companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Malabar Tech Labs / MES College"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-businessSector"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                  >
                    Primary Sector / Industry
                  </label>
                  <select
                    id="field-businessSector"
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                  >
                    <option value="Information Technology">Information Technology & Software</option>
                    <option value="Retail & Commerce">Retail, Wholesale & E-Commerce</option>
                    <option value="Manufacturing & Food Processing">Manufacturing & Food Processing</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Construction & Real Estate">Construction & Infrastructure</option>
                    <option value="Education & EdTech">Education & Skills Development</option>
                    <option value="Agriculture & Food Tech">Agriculture, Dairy & Food Tech</option>
                    <option value="Creative & Media">Creative Arts, Media & Entertainment</option>
                    <option value="Other">Other Diverse Sector</option>
                  </select>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 4: Goals, Talents & Interests */}
            {/* ==================================================== */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#035AFC]" />
                    <span>What Do You Expect from MYBF?</span>
                    <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select the key areas where you want to collaborate and grow (at least 1 required).
                  </p>
                </div>

                {fieldErrors.expectations && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.expectations}</span>
                  </p>
                )}

                {/* Expectation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {EXPECTATION_OPTIONS.map((exp) => {
                    const isSelected = formData.expectations.includes(exp.key);
                    return (
                      <button
                        key={exp.key}
                        type="button"
                        onClick={() => toggleSelection('expectations', exp.key)}
                        className={cn(
                          'p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer',
                          isSelected
                            ? 'border-[#035AFC] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#035AFC]/40 shadow-sm'
                            : 'border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        )}
                      >
                        <div
                          className={cn(
                            'size-4 rounded-md border mt-0.5 shrink-0 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-[#035AFC] border-[#035AFC] text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                            {exp.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {exp.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* If Other expectation is chosen */}
                {formData.expectations.includes('OTHER') && (
                  <div className="pt-2">
                    <label
                      htmlFor="field-otherExpectationText"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                    >
                      Please Specify Your Other Expectation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="field-otherExpectationText"
                      type="text"
                      value={formData.otherExpectationText}
                      onChange={(e) => {
                        setFormData({ ...formData, otherExpectationText: e.target.value });
                        clearFieldError('otherExpectationText');
                      }}
                      placeholder="e.g. Cross-border trade guidance, clean technology mentorship..."
                      maxLength={300}
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none',
                        fieldErrors.otherExpectationText
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    {fieldErrors.otherExpectationText && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.otherExpectationText}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Optional 3-Year Future Goal */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-futureGoal"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                    >
                      Biggest 3-Year Vision / Goal (Optional)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">{formData.futureGoal.length} / 500</span>
                  </div>
                  <textarea
                    id="field-futureGoal"
                    rows={2}
                    maxLength={500}
                    value={formData.futureGoal}
                    onChange={(e) => setFormData({ ...formData, futureGoal: e.target.value })}
                    placeholder="e.g. Build a 20-person export team from Manjeri; launch our robotics product into GCC markets."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Kept confidential; shared only with chapter mentors to align programs with your ambition.
                  </span>
                </div>

                {/* Extracurricular Talents & Skills (Optional) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-[#035AFC]" />
                        <span>Extracurricular Talents & Skills (Optional)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Share your unique creative, technical, or athletic talents.
                      </p>
                    </div>
                    {formData.talents.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#035AFC] dark:text-blue-400 border border-blue-200/60">
                        {formData.talents.length} Selected
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {TALENT_CATEGORIES.map((cat) => (
                      <div key={cat.key} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          {cat.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.options.map((t) => {
                            const isSelected = formData.talents.includes(t.key);
                            return (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => toggleSelection('talents', t.key)}
                                className={cn(
                                  'px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer',
                                  isSelected
                                    ? 'bg-[#035AFC] text-white border-[#035AFC] font-medium shadow-sm'
                                    : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[2.5]" />}
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 5: Account Credentials & Consent */}
            {/* ==================================================== */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#035AFC]" />
                    <span>Create Your Login Credentials</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Set up your secure username and password for the MYBF member portal.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#035AFC] dark:text-blue-400" />
                  <span>Your account credentials will be created immediately and activated upon Super Administrator review.</span>
                </div>

                {/* Username Input with Live Availability Check */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-username"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                    >
                      Choose Username <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Letters, numbers, underscores and periods (3-30 chars)</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      id="field-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="e.g. salman_faris"
                      className={cn(
                        'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 pl-8 pr-24 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono transition-all outline-none',
                        fieldErrors.username
                          ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      {usernameChecking ? (
                        <span className="text-slate-400 text-[11px]">Checking...</span>
                      ) : usernameAvailable === true ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-[11px]">
                          <Check className="h-3 w-3 stroke-[2.5]" /> Available
                        </span>
                      ) : usernameAvailable === false ? (
                        <span className="text-rose-500 font-bold text-[11px]">Unavailable</span>
                      ) : null}
                    </div>
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.username}</span>
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="field-password"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                      >
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Min 12 characters</span>
                    </div>
                    <div className="relative">
                      <input
                        id="field-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          clearFieldError('password');
                        }}
                        placeholder="••••••••••••"
                        className={cn(
                          'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all outline-none',
                          fieldErrors.password
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                            : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Toggle password view"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="field-confirmPassword"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                      >
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Must match password</span>
                    </div>
                    <div className="relative">
                      <input
                        id="field-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          clearFieldError('confirmPassword');
                        }}
                        placeholder="••••••••••••"
                        className={cn(
                          'w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/40 px-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white transition-all outline-none',
                          fieldErrors.confirmPassword
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                            : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Toggle confirm password view"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* DPDP Privacy Notice & Consent Checkbox */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#035AFC]" />
                      <span>DPDP Data Protection & Charter Acknowledgment</span>
                    </p>
                    <p>
                      • <strong>Age Policy:</strong> MYBF is an NGO youth community. Registration is available exclusively to applicants aged 35 or below (or authorized via super admin age exception).
                    </p>
                    <p>
                      • <strong>Privacy:</strong> Your Date of Birth, gender, and personal goals are never made publicly visible in the public member directory.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                      <input
                        id="field-consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => {
                          setFormData({ ...formData, consent: e.target.checked });
                          clearFieldError('consent');
                        }}
                        className="mt-0.5 size-4 rounded border-slate-300 text-[#035AFC] focus:ring-[#035AFC]"
                      />
                      <span className="leading-snug">
                        I confirm that my submitted information is true and accurate, agree to the MYBF Organizational Charter, and consent to purpose-specific verification under DPDP guidelines.
                      </span>
                    </label>
                    {fieldErrors.consent && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.consent}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* ==================================================== */}
      {/* ALWAYS-VISIBLE STICKY FOOTER CONTROLS (shrink-0) */}
      {/* ==================================================== */}
      {!submitted && (
        <footer className="shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0A0F1D]/95 px-5 py-3.5 sm:px-6 sm:py-4 backdrop-blur-md z-10 flex items-center justify-between gap-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          {/* Left: Previous / Cancel */}
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </button>
            ) : asModal ? (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            ) : null}
          </div>

          {/* Center validation hint (visible on desktop) */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Please fill in required fields to continue</span>
            </div>
          )}

          {/* Right: Continue / Submit */}
          <div>
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#035AFC] hover:bg-[#0246C7] active:scale-[0.99] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#035AFC] hover:bg-[#0246C7] active:scale-[0.99] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : formData.requestAgeException ? (
                  <>
                    <span>Submit for Super Admin Review</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );

  // Standalone page render mode (e.g. on /register)
  if (!asModal) {
    return (
      <div className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] shadow-xl overflow-hidden ${className}`}>
        {formContent}
      </div>
    );
  }

  // Modal Render Mode: Page Invitation Trigger Card + Fullscreen Accessible Modal
  return (
    <div className={className}>
      {/* On-page Editorial Invitation Card replacing the plain form */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-6 sm:p-10 shadow-xl text-slate-900 dark:text-white relative overflow-hidden">
        {/* Subtle ambient futuristic glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#035AFC] dark:text-blue-400 text-xs font-semibold border border-blue-200/60 dark:border-blue-900/60">
                Official Chapter Enrollment
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                • Mission Malappuram 2050
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MYBF Youth Membership Registration
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Join 16 constituency chapters across Malappuram district. Zero registration fees, tamper-proof digital ID card, democratic chapter voting, and youth leadership discovery.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                <Check className="h-3 w-3 stroke-[2.5]" /> 100% Free Membership
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                16 Constituency Chapters
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                Ages 18–35 (Exception Eligible)
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setInternalOpen(true);
                setStep(1);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#035AFC] hover:bg-[#0246C7] active:scale-[0.99] text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{triggerLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-[11px] text-slate-500 text-center">
              Opens 5-step application modal
            </span>
          </div>
        </div>
      </div>

      {/* Modal Dialog Overlay */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl h-[100dvh] sm:h-[88vh] sm:max-h-[820px] bg-white dark:bg-[#0A0F1D] rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {formContent}
          </div>
        </div>
      )}
    </div>
  );
}

// Export named alias for explicit modal usage
export const YouthRegistrationModal = YouthRegistrationForm;
