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
  ShieldCheck,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Arrow } from '@/components/arrow';
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
  GENDER_OPTIONS,
  validateYouthAgeEligibility,
  calculateAge,
  type GenderOptionValue,
} from '@/features/memberships/constants/youth-discovery';

export interface YouthRegistrationFormProps {
  className?: string;
  // Legacy optional props preserved as no-ops for backward compatibility
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  triggerLabel?: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Personal Identity & Contact',
    shortLabel: 'Identity',
    subtitle: 'Your official identity, contact details, and youth eligibility verification for chapter enrollment.',
    badge: 'Step 01 • Age 35 or Below',
    color: 'text-blue',
  },
  {
    id: 2,
    title: 'Location & Chapter Selection',
    shortLabel: 'Location',
    subtitle: 'Verify your administrative residence using the PIN code lookup, then choose your constituency chapter.',
    badge: 'Step 02 • 16 Chapters',
    color: 'text-magenta',
  },
  {
    id: 3,
    title: 'Professional Profile & Role',
    shortLabel: 'Profile',
    subtitle: 'Categorize your current professional role to connect with relevant mentors and chapter activities.',
    badge: 'Step 03 • Member Role',
    color: 'text-cyan',
  },
  {
    id: 4,
    title: 'Goals, Talents & Expectations',
    shortLabel: 'Goals',
    subtitle: 'What you walk away with: select collaboration areas and unique skills you bring to the chapter.',
    badge: 'Step 04 • Alignment',
    color: 'text-blue',
  },
  {
    id: 5,
    title: 'Account Credentials & Charter',
    shortLabel: 'Account',
    subtitle: 'Establish your secure digital credentials and agree to the MYBF Organizational Charter.',
    badge: 'Step 05 • DPDP Compliant',
    color: 'text-ink',
  },
];

const STRIP_WORDS = [
  'Startup Founders',
  'Business Owners',
  'Students with an Idea',
  'Professionals',
  'Mentors',
  '16 Chapters',
  '100% Free Membership',
  'Age 35 or Below',
];

export function YouthRegistrationForm({
  className = '',
  asModal = false,
  isOpen = true,
  onClose,
}: YouthRegistrationFormProps) {
  // Step state (1 through 5)
  const [step, setStep] = React.useState(1);
  const formTopRef = React.useRef<HTMLDivElement>(null);
  const formBodyRef = React.useRef<HTMLDivElement>(null);

  // Body overflow locking and escape key handling when rendered as modal
  React.useEffect(() => {
    if (!asModal && onClose === undefined) return;
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, asModal, onClose]);

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

  // Field-wise step validation
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
        if (check.error === 'Date of birth cannot be in the future.') {
          errors.dateOfBirth = 'Date of birth cannot be in the future.';
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

  const scrollToTop = () => {
    if (formBodyRef.current) {
      formBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      scrollToTop();
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        scrollToTop();
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
      scrollToTop();
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

  const formElement = (
    <div
      ref={formTopRef}
      className={cn(
        'w-full border-2 border-ink bg-paper text-ink shadow-[8px_8px_0px_#14161c] overflow-hidden flex flex-col',
        asModal ? 'border-0 shadow-none h-full' : '',
        className
      )}
    >
      {/* ==================================================== */}
      {/* MEMBERSHIP PAGE HERO HEADER (Yellow & Ink Signature Identity) */}
      {/* ==================================================== */}
      <header className="shrink-0 border-b-2 border-ink bg-yellow text-ink">
        <div className="px-5 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Index & Eyebrow like PageHero: "04 —— MEMBERSHIP" */}
            <div className="flex items-center gap-3">
              <p className="flex items-center gap-2.5 font-display text-[0.72rem] font-bold tracking-[0.22em] uppercase text-ink">
                <span>04</span>
                <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
                <span>Membership Application</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Step Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink text-paper font-display text-xs font-black uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                Step 0{step} of 05 <span className="opacity-75 font-mono font-normal">({progressPercent}%)</span>
              </span>

              {/* Close Button when inside modal */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close application modal"
                  className="inline-flex size-9 sm:size-10 items-center justify-center border-2 border-ink bg-paper text-ink font-display text-sm font-black uppercase hover:bg-ink hover:text-paper shadow-[2px_2px_0px_#14161c] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Large Hero Title & Lead like the Membership Page */}
          <div className="mt-3">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-[1.08]">
              {currentStepMeta.title}
            </h2>
            <p className="font-serif text-sm sm:text-base text-ink/90 mt-1.5 leading-relaxed max-w-2xl">
              {currentStepMeta.subtitle}
            </p>
          </div>

          {/* Progress Bar (Ink fill with ink/20 track) */}
          <div className="mt-4 w-full bg-ink/15 h-2 border border-ink/25 overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-300 ease-out shadow-[0_0_8px_rgba(20,22,28,0.3)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Marquee Ticker Strip: Exact replica of the Membership Page Marquee Strip */}
        <div className="overflow-hidden border-t-2 border-ink bg-ink text-paper py-2">
          <ul aria-hidden="true" className="marquee-track flex w-max">
            {[...STRIP_WORDS, ...STRIP_WORDS].map((word, i) => (
              <li
                key={`${word}-${i}`}
                className="flex items-center gap-5 px-5 font-display text-xs font-bold tracking-[0.18em] whitespace-nowrap uppercase text-paper"
              >
                {word}
                <span className="size-1.5 rotate-45 bg-yellow" />
              </li>
            ))}
          </ul>
        </div>

        {/* Step Separations Stepper Navigation */}
        <nav
          aria-label="Registration steps"
          className="grid grid-cols-5 gap-1 sm:gap-2 px-3 sm:px-8 py-2 bg-paper-2 border-t-2 border-ink"
        >
          {STEPS.map((s) => {
            const isCompleted = s.id < step;
            const isCurrent = s.id === step;
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  if (isCompleted) {
                    setStep(s.id);
                    scrollToTop();
                  }
                }}
                disabled={!isCompleted && s.id !== step}
                className={cn(
                  'px-1.5 sm:px-2.5 py-1.5 sm:py-2 text-center transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-display tracking-wider uppercase border-2',
                  isCurrent
                    ? 'bg-ink text-paper border-ink font-black shadow-[2px_2px_0px_#fcc000]'
                    : isCompleted
                    ? 'bg-blue text-paper border-ink font-bold shadow-[1px_1px_0px_#14161c] hover:bg-blue-deep cursor-pointer'
                    : 'bg-paper text-ink/40 border-ink/20 font-medium cursor-not-allowed'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3] text-yellow shrink-0" />
                ) : (
                  <span className="font-mono text-[11px] font-bold opacity-80 shrink-0">0{s.id}.</span>
                )}
                <span className="truncate hidden md:inline">{s.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ==================================================== */}
      {/* FORM BODY */}
      {/* ==================================================== */}
      <div
        ref={formBodyRef}
        className={cn(
          'px-5 py-6 sm:px-8 sm:py-8 space-y-6 bg-paper text-ink',
          asModal ? 'flex-1 overflow-y-auto' : ''
        )}
      >
        {/* Global Error Banner */}
        {fieldErrors.form && (
          <div className="p-4 border-2 border-rose-500 bg-rose-50 text-rose-950 text-xs sm:text-sm flex items-center gap-3 font-semibold shadow-[3px_3px_0px_#14161c]">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{fieldErrors.form}</span>
          </div>
        )}

        {submitted ? (
          /* ==================================================== */
          /* SUBMISSION SUCCESS CONFIRMATION */
          /* ==================================================== */
          <div className="py-8 sm:py-12 text-center space-y-6 max-w-xl mx-auto">
            <div
              className={cn(
                'size-20 mx-auto flex items-center justify-center shadow-[4px_4px_0px_#14161c] border-2 border-ink',
                submissionResult?.isAgeException
                  ? 'bg-yellow text-ink'
                  : 'bg-emerald-400 text-ink'
              )}
            >
              {submissionResult?.isAgeException ? (
                <ShieldCheck className="h-10 w-10 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              )}
            </div>

            <div>
              <span
                className={cn(
                  'inline-flex px-3.5 py-1 text-xs font-display font-extrabold uppercase tracking-widest border-2 border-ink shadow-[2px_2px_0px_#14161c]',
                  submissionResult?.isAgeException
                    ? 'bg-yellow text-ink'
                    : 'bg-emerald-100 text-emerald-950'
                )}
              >
                {submissionResult?.isAgeException ? 'Special Age Exception Pending' : 'Youth Application Enrolled'}
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                {submissionResult?.isAgeException
                  ? 'Submitted for Super Admin Review'
                  : 'Application Registered Successfully'}
              </h2>
              <p className="font-serif text-sm sm:text-base text-muted max-w-md mx-auto mt-2 leading-relaxed">
                {submissionResult?.isAgeException
                  ? 'Standard youth eligibility ends at 35. Because your age exceeds 35, your application has been securely routed to the Super Administrator for exceptional authorization.'
                  : 'Your account credentials have been established. Your registration is now under chapter officer verification. Once approved, you can immediately access your digital member space.'}
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="border-2 border-ink bg-white p-6 text-left text-xs sm:text-sm text-ink space-y-4 shadow-[4px_4px_0px_#14161c]">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-ink/15">
                <div>
                  <span className="text-[10px] uppercase font-display font-bold text-muted block tracking-wider">
                    Applicant & Username
                  </span>
                  <strong className="text-sm font-bold text-ink block mt-0.5">
                    {formData.fullName}
                  </strong>
                  <span className="font-mono text-xs font-bold text-blue block mt-0.5">
                    @{submissionResult?.username || formData.username}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-display font-bold text-muted block tracking-wider">
                    Official Reference ID
                  </span>
                  <span className="font-mono text-xs font-black text-ink bg-yellow px-2.5 py-1 inline-block border-2 border-ink mt-1 shadow-[2px_2px_0px_#14161c]">
                    {submissionResult?.referenceNumber || 'REF-REGISTERED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-ink/15">
                <div>
                  <span className="text-[10px] uppercase font-display font-bold text-muted block tracking-wider">
                    Enrolled Chapter
                  </span>
                  <strong className="text-xs sm:text-sm font-bold text-ink block mt-0.5">
                    {INITIAL_16_CHAPTERS.find((c) => c.slug === formData.chapterId)?.name || formData.chapterId}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-display font-bold text-muted block tracking-wider">
                    Age Standing
                  </span>
                  <span className="text-xs sm:text-sm font-semibold block mt-0.5 text-ink">
                    {submissionResult?.isAgeException
                      ? `Exception Review (${submissionResult.applicantAge} years)`
                      : `Eligible Youth (${submissionResult?.applicantAge} years)`}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs font-bold font-display uppercase tracking-wide">
                <span className="text-muted">Status:</span>
                <span className="text-blue">
                  {submissionResult?.isAgeException ? 'Super Admin Review Queue' : 'Under Chapter Review (Zero Fees)'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline-dark min-h-12 px-6 border-2 border-ink cursor-pointer"
                >
                  Close Window
                </button>
              )}
              <Link
                href="/login"
                className="btn btn-yellow min-h-12 px-6 border-2 border-ink shadow-[3px_3px_0px_#14161c]"
              >
                Sign In to Member Portal <Arrow />
              </Link>
              <Link
                href="/"
                className="btn btn-outline-dark min-h-12 px-6 border-2 border-ink"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* FORM STEPS */
          /* ==================================================== */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ==================================================== */}
            {/* STEP 1: Personal & Contact Identity */}
            {/* ==================================================== */}
            {step === 1 && (
              <div className="border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#14161c] space-y-6 animate-in fade-in duration-200">
                <div className="border-b-2 border-ink/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-blue uppercase">
                        01 &bull; Personal Identity
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink mt-1 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue" />
                        <span>Personal Identity & Contact Information</span>
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 bg-yellow text-ink font-display text-[0.68rem] font-extrabold uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                      Age 35 or Below
                    </span>
                  </div>
                  <p className="font-serif text-sm text-muted mt-1.5 leading-relaxed">
                    Your official identity, contact details, and youth eligibility verification for chapter enrollment.
                  </p>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="field-fullName" className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                      Full Name <span className="text-rose-600 font-bold">*</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.fullName
                          ? 'border-rose-500 bg-rose-50/60 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-primaryPhone" className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                      Mobile Number (10 Digits) <span className="text-rose-600 font-bold">*</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.primaryPhone
                          ? 'border-rose-500 bg-rose-50/60 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.primaryPhone && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.primaryPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Email, Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label htmlFor="field-email" className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                      Email Address <span className="text-rose-600 font-bold">*</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.email
                          ? 'border-rose-500 bg-rose-50/60 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="field-dateOfBirth" className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                        Date of Birth <span className="text-rose-600 font-bold">*</span>
                      </label>
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ink/60">Max Age: 35</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.dateOfBirth
                          ? 'border-rose-500 bg-rose-50/60 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.dateOfBirth && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.dateOfBirth}</span>
                      </p>
                    )}

                    {ageValidation && !fieldErrors.dateOfBirth && (
                      <div className="mt-2 text-xs font-bold">
                        {ageValidation.eligible ? (
                          <div className="p-2.5 border-2 border-ink bg-emerald-50 text-emerald-950 font-display text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#14161c]">
                            <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
                            <span>Eligible Youth ({ageValidation.age} years old) &bull; Standard Age 35 or Below</span>
                          </div>
                        ) : ageValidation.error === 'Date of birth cannot be in the future.' ? (
                          <div className="p-2.5 border-2 border-ink bg-rose-50 text-rose-950 font-display text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#14161c]">
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                            <span>{ageValidation.error}</span>
                          </div>
                        ) : (
                          <div className="p-2.5 border-2 border-ink bg-yellow/30 text-ink font-display text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#14161c]">
                            <AlertCircle className="h-4 w-4 text-ink shrink-0" />
                            <span>Age {ageValidation.age}: Standard limit is 35. Super Admin authorization requested.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="field-gender" className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5">
                      Gender (Optional)
                    </label>
                    <select
                      id="field-gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderOptionValue })}
                      className="w-full border-2 border-ink bg-white px-4 py-3 text-sm text-ink transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                    >
                      <option value="">Select Gender (Optional)</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-muted font-serif block mt-1">Kept confidential; not published</span>
                  </div>
                </div>

                {/* Special Age Exception Request Workflow (Age >= 36) */}
                {ageValidation && ageValidation.requiresAgeException && (
                  <div className="p-5 border-2 border-ink bg-yellow/20 space-y-3 shadow-[4px_4px_0px_#14161c]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-ink shrink-0 mt-0.5" />
                      <div>
                        <p className="font-display text-xs font-extrabold text-ink uppercase tracking-wider">
                          Super Admin Age Exception Review ({ageValidation.age} Years Old)
                        </p>
                        <p className="font-serif text-xs text-ink/85 mt-1 leading-relaxed">
                          Standard MYBF membership is curated for youth up to 35. Applicants aged 36+ require review and exceptional authorization by the Super Administrator before chapter approval.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer pt-2 font-display text-xs font-bold text-ink">
                      <input
                        type="checkbox"
                        checked={formData.requestAgeException}
                        onChange={(e) => {
                          setFormData({ ...formData, requestAgeException: e.target.checked });
                          clearFieldError('requestAgeException');
                        }}
                        className="size-4 border-2 border-ink text-blue focus:ring-yellow"
                      />
                      <span>Request Special Super Admin Approval</span>
                    </label>
                    {fieldErrors.requestAgeException && (
                      <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.requestAgeException}</span>
                      </p>
                    )}

                    {formData.requestAgeException && (
                      <div className="space-y-1.5 pt-2">
                        <label
                          htmlFor="field-ageExceptionReason"
                          className="font-display text-xs font-bold uppercase tracking-wider text-ink block"
                        >
                          Justification for Exception <span className="text-rose-600 font-bold">*</span> (Min 10 Chars)
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
                            'w-full border-2 p-3 text-xs sm:text-sm text-ink transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                            fieldErrors.ageExceptionReason
                              ? 'border-rose-500 bg-rose-50/50'
                              : 'border-ink bg-white focus:ring-2 focus:ring-yellow'
                          )}
                        />
                        {fieldErrors.ageExceptionReason && (
                          <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
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
              <div className="border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#14161c] space-y-6 animate-in fade-in duration-200">
                <div className="border-b-2 border-ink/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-magenta uppercase">
                        02 &bull; Location & Chapter
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink mt-1 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-magenta" />
                        <span>Malappuram Administrative Location & Chapter</span>
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 bg-ink text-paper font-display text-[0.68rem] font-extrabold uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                      16 Chapters
                    </span>
                  </div>
                  <p className="font-serif text-sm text-muted mt-1.5 leading-relaxed">
                    Verify your administrative residence using the PIN code lookup, then choose your constituency chapter.
                  </p>
                </div>

                {/* Location Selector Component */}
                <div className="border-2 border-ink bg-paper/40 p-4 sm:p-6 shadow-[2px_2px_0px_#14161c]">
                  <LocationSelector
                    variant="editorial"
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
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.pinCode}</span>
                  </p>
                )}
                {fieldErrors.taluk && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.taluk}</span>
                  </p>
                )}
                {fieldErrors.localBody && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.localBody}</span>
                  </p>
                )}

                {/* Chapter Select */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-chapterId"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5"
                    >
                      <Building2 className="h-4 w-4 text-blue" />
                      <span>Select Constituency Chapter</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ink/60">16 Chapters in Malappuram</span>
                  </div>
                  <select
                    id="field-chapterId"
                    value={formData.chapterId}
                    onChange={(e) => {
                      setFormData({ ...formData, chapterId: e.target.value });
                      clearFieldError('chapterId');
                    }}
                    className={cn(
                      'w-full border-2 px-4 py-3 text-sm text-ink transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                      fieldErrors.chapterId
                        ? 'border-rose-500 bg-rose-50/60'
                        : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
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
                    <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.chapterId}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted mt-1.5 font-serif leading-relaxed">
                    Choose the chapter closest to your business operations or residence. Chapter transfer requests can be submitted post-approval.
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 3: Professional Profile */}
            {/* ==================================================== */}
            {step === 3 && (
              <div className="border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#14161c] space-y-6 animate-in fade-in duration-200">
                <div className="border-b-2 border-ink/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-cyan uppercase">
                        03 &bull; Professional Profile
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink mt-1 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-cyan" />
                        <span>Professional & Career Profile</span>
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 bg-cyan text-ink font-display text-[0.68rem] font-extrabold uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                      Classification
                    </span>
                  </div>
                  <p className="font-serif text-sm text-muted mt-1.5 leading-relaxed">
                    Categorize your current professional role to connect with relevant mentors and chapter activities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="field-memberCategory"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                    >
                      Member Category / Interest <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <select
                      id="field-memberCategory"
                      value={formData.memberCategory}
                      onChange={(e) => {
                        setFormData({ ...formData, memberCategory: e.target.value as MemberCategoryValue });
                        clearFieldError('memberCategory');
                      }}
                      className="w-full border-2 border-ink bg-white px-4 py-3 text-sm text-ink transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                    >
                      {MEMBER_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted mt-1.5 font-serif leading-relaxed">
                      {MEMBER_CATEGORIES.find((c) => c.value === formData.memberCategory)?.description}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="field-currentPosition"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                    >
                      Current Position <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <select
                      id="field-currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => {
                        setFormData({ ...formData, currentPosition: e.target.value as CurrentPositionValue });
                        clearFieldError('currentPosition');
                      }}
                      className="w-full border-2 border-ink bg-white px-4 py-3 text-sm text-ink transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                    >
                      {CURRENT_POSITIONS.map((pos) => (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted mt-1.5 font-serif leading-relaxed">
                      {CURRENT_POSITIONS.find((p) => p.value === formData.currentPosition)?.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  <div>
                    <label
                      htmlFor="field-occupation"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                    >
                      Occupation / Role <span className="text-rose-600 font-bold">*</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.occupation
                          ? 'border-rose-500 bg-rose-50/60'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.occupation && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.occupation}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-companyName"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                    >
                      Company / Firm / College (Optional)
                    </label>
                    <input
                      id="field-companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Malabar Tech Labs / MES College"
                      className="w-full border-2 border-ink bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="field-businessSector"
                    className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                  >
                    Primary Sector / Industry
                  </label>
                  <select
                    id="field-businessSector"
                    value={formData.businessSector}
                    onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                    className="w-full border-2 border-ink bg-white px-4 py-3 text-sm text-ink transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
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
              <div className="border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#14161c] space-y-6 animate-in fade-in duration-200">
                <div className="border-b-2 border-ink/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-blue uppercase">
                        04 &bull; Goals & Talents
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink mt-1 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue" />
                        <span>What You Walk Away With & Bring In</span>
                        <span className="text-rose-600 font-bold">*</span>
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 bg-yellow text-ink font-display text-[0.68rem] font-extrabold uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                      Alignment
                    </span>
                  </div>
                  <p className="font-serif text-sm text-muted mt-1.5 leading-relaxed">
                    Select the key areas where you want to collaborate and what unique skills you bring to the chapter (at least 1 required).
                  </p>
                </div>

                {fieldErrors.expectations && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.expectations}</span>
                  </p>
                )}

                {/* Expectation Cards (Landing Page Sticker Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {EXPECTATION_OPTIONS.map((exp) => {
                    const isSelected = formData.expectations.includes(exp.key);
                    return (
                      <button
                        key={exp.key}
                        type="button"
                        onClick={() => toggleSelection('expectations', exp.key)}
                        className={cn(
                          'p-4 border-2 text-left transition-all flex items-start gap-3 cursor-pointer',
                          isSelected
                            ? 'border-ink bg-yellow text-ink shadow-[4px_4px_0px_#14161c] font-bold'
                            : 'border-ink bg-paper/40 text-ink hover:bg-yellow/15 shadow-[2px_2px_0px_#14161c]'
                        )}
                      >
                        <div
                          className={cn(
                            'size-5 border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-ink border-ink text-yellow'
                              : 'border-ink bg-white'
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-display font-extrabold leading-tight">
                            {exp.label}
                          </div>
                          <div className="text-xs mt-1 leading-snug font-serif text-muted">
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
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block mb-1.5"
                    >
                      Please Specify Your Other Expectation <span className="text-rose-600 font-bold">*</span>
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
                        'w-full border-2 px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.otherExpectationText
                          ? 'border-rose-500 bg-rose-50/60'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    {fieldErrors.otherExpectationText && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.otherExpectationText}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Optional 3-Year Future Goal */}
                <div className="pt-4 border-t-2 border-ink/15">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-futureGoal"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block"
                    >
                      Biggest 3-Year Vision / Goal (Optional)
                    </label>
                    <span className="text-[10px] text-muted font-mono">{formData.futureGoal.length} / 500</span>
                  </div>
                  <textarea
                    id="field-futureGoal"
                    rows={2}
                    maxLength={500}
                    value={formData.futureGoal}
                    onChange={(e) => setFormData({ ...formData, futureGoal: e.target.value })}
                    placeholder="e.g. Build a 20-person export team from Manjeri; launch our robotics product into GCC markets."
                    className="w-full border-2 border-ink bg-white p-3.5 text-sm text-ink placeholder:text-muted/60 transition-all focus:bg-white focus:ring-2 focus:ring-yellow outline-none font-sans shadow-[2px_2px_0px_#14161c]"
                  />
                  <span className="text-[11px] text-muted block mt-1 font-serif">
                    Kept confidential; shared only with chapter mentors to align programs with your ambition.
                  </span>
                </div>

                {/* Extracurricular Talents & Skills (Optional) */}
                <div className="pt-4 border-t-2 border-ink/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                        <Palette className="h-4 w-4 text-blue" />
                        <span>Extracurricular Talents & Skills (Optional)</span>
                      </h4>
                      <p className="font-serif text-xs text-muted mt-0.5">
                        Share your unique creative, technical, or athletic talents.
                      </p>
                    </div>
                    {formData.talents.length > 0 && (
                      <span className="text-xs font-display font-bold px-2.5 py-1 bg-yellow text-ink border-2 border-ink shadow-[1px_1px_0px_#14161c]">
                        {formData.talents.length} Selected
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {TALENT_CATEGORIES.map((cat) => (
                      <div key={cat.key} className="p-4 border-2 border-ink/20 bg-paper/50 space-y-2.5">
                        <span className="font-display text-xs font-bold text-ink block uppercase tracking-wider">
                          {cat.title}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {cat.options.map((t) => {
                            const isSelected = formData.talents.includes(t.key);
                            return (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => toggleSelection('talents', t.key)}
                                className={cn(
                                  'px-3 py-1.5 text-xs border-2 transition-all flex items-center gap-1.5 cursor-pointer font-sans',
                                  isSelected
                                    ? 'bg-blue text-paper border-ink font-bold shadow-[2px_2px_0px_#14161c]'
                                    : 'bg-white text-ink border-ink/30 hover:border-ink hover:bg-yellow/20'
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
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
              <div className="border-2 border-ink bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#14161c] space-y-6 animate-in fade-in duration-200">
                <div className="border-b-2 border-ink/15 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-ink uppercase">
                        05 &bull; Member Account
                      </p>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-ink mt-1 flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue" />
                        <span>Portal Credentials & Charter Agreement</span>
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 bg-ink text-paper font-display text-[0.68rem] font-extrabold uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_#14161c]">
                      DPDP Compliant
                    </span>
                  </div>
                  <p className="font-serif text-sm text-muted mt-1.5 leading-relaxed">
                    Set up your secure username and password, and agree to the MYBF Organizational Charter.
                  </p>
                </div>

                <div className="p-4 border-2 border-ink bg-blue/10 text-ink text-xs sm:text-sm flex items-center gap-3 shadow-[2px_2px_0px_#14161c]">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-blue" />
                  <span>Your account credentials will be created immediately and activated upon chapter / administrator review.</span>
                </div>

                {/* Username Input with Live Availability Check */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-username"
                      className="font-display text-xs font-bold uppercase tracking-wider text-ink block"
                    >
                      Choose Username <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-muted font-mono">Letters, numbers, underscores and periods (3-30 chars)</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-sm font-bold">@</span>
                    <input
                      id="field-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="e.g. salman_faris"
                      className={cn(
                        'w-full border-2 pl-9 pr-28 py-3 text-sm text-ink font-mono transition-all outline-none shadow-[2px_2px_0px_#14161c]',
                        fieldErrors.username
                          ? 'border-rose-500 bg-rose-50/60'
                          : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                      )}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
                      {usernameChecking ? (
                        <span className="text-muted text-[11px] font-sans">Checking...</span>
                      ) : usernameAvailable === true ? (
                        <span className="text-emerald-900 bg-emerald-100 font-display font-bold flex items-center gap-1 text-[11px] px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#14161c]">
                          <Check className="h-3 w-3 stroke-[3]" /> Available
                        </span>
                      ) : usernameAvailable === false ? (
                        <span className="text-rose-700 bg-rose-100 font-display font-bold text-[11px] px-2 py-0.5 border border-rose-300">
                          Unavailable
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.username}</span>
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="field-password"
                        className="font-display text-xs font-bold uppercase tracking-wider text-ink block"
                      >
                        Password <span className="text-rose-600 font-bold">*</span>
                      </label>
                      <span className="text-[10px] text-muted font-mono">Min 12 characters</span>
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
                          'w-full border-2 px-4 pr-11 py-3 text-sm text-ink transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                          fieldErrors.password
                            ? 'border-rose-500 bg-rose-50/60'
                            : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                        aria-label="Toggle password view"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="field-confirmPassword"
                        className="font-display text-xs font-bold uppercase tracking-wider text-ink block"
                      >
                        Confirm Password <span className="text-rose-600 font-bold">*</span>
                      </label>
                      <span className="text-[10px] text-muted font-mono">Must match password</span>
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
                          'w-full border-2 px-4 pr-11 py-3 text-sm text-ink transition-all outline-none font-sans shadow-[2px_2px_0px_#14161c]',
                          fieldErrors.confirmPassword
                            ? 'border-rose-500 bg-rose-50/60'
                            : 'border-ink bg-white focus:bg-white focus:ring-2 focus:ring-yellow'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                        aria-label="Toggle confirm password view"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* DPDP Privacy Notice & Consent Checkbox */}
                <div className="pt-4 border-t-2 border-ink/15 space-y-4">
                  <div className="p-5 border-2 border-ink bg-paper text-xs text-ink space-y-2 leading-relaxed font-serif shadow-[3px_3px_0px_#14161c]">
                    <p className="font-display font-bold text-ink flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-blue" />
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
                    <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm font-medium text-ink">
                      <input
                        id="field-consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => {
                          setFormData({ ...formData, consent: e.target.checked });
                          clearFieldError('consent');
                        }}
                        className="mt-0.5 size-4.5 border-2 border-ink text-blue focus:ring-yellow"
                      />
                      <span className="leading-snug">
                        I confirm that my submitted information is true and accurate, agree to the MYBF Organizational Charter, and consent to purpose-specific verification under DPDP guidelines.
                      </span>
                    </label>
                    {fieldErrors.consent && (
                      <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
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
      {/* ACTION CONTROLS FOOTER ("NEXT SEPARATIONS") */}
      {/* ==================================================== */}
      {!submitted && (
        <footer className="shrink-0 border-t-2 border-ink bg-paper-2 px-5 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(20,22,28,0.06)]">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-outline-dark min-h-12 px-6 border-2 border-ink cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Previous Step
              </button>
            ) : (
              <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                Step 01 of 05 &bull; Personal Identity
              </span>
            )}
          </div>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1.5 shadow-[1px_1px_0px_#14161c]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Please check required fields</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {step < 5 ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Next up: <strong className="text-ink font-black">0{step + 1}. {STEPS[step].shortLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-yellow min-h-12 px-8 border-2 border-ink shadow-[4px_4px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer font-display text-xs font-black uppercase tracking-wider"
                >
                  <span>Continue to Step 0{step + 1}</span> <Arrow />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-yellow min-h-12 px-9 border-2 border-ink shadow-[4px_4px_0px_#14161c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 cursor-pointer font-display text-xs font-black uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : formData.requestAgeException ? (
                  <>
                    <span>Submit for Super Admin Review</span>
                    <Arrow />
                  </>
                ) : (
                  <>
                    <span>Complete Enrollment</span>
                    <Arrow />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );

  if (asModal || onClose !== undefined) {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-ink/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="MYBF Official Youth Membership Application"
      >
        <div
          className="relative flex flex-col w-full max-w-4xl h-[95vh] sm:h-[90vh] max-h-[880px] border-2 border-ink bg-paper text-ink shadow-[12px_12px_0px_#14161c] overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {formElement}
        </div>
      </div>
    );
  }

  return formElement;
}

// Named alias for backward compatibility
export const YouthRegistrationModal = YouthRegistrationForm;
