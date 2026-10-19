'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowLeftRight,
  KeyRound,
  FileCheck,
  Upload,
  Lock,
} from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  MemberCategoryValue,
  CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import {
  EXPECTATION_OPTIONS,
  TALENT_CATEGORIES,
  PARTICIPATION_PREFERENCES,
} from '@/features/memberships/constants/youth-discovery';

const ALL_TALENT_OPTIONS = TALENT_CATEGORIES.flatMap((c) => c.options);

export interface CompleteMemberProfileData {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    emailVerified: string | null;
    phoneVerified: string | null;
    roles: string[];
    status: string;
  };
  profile: {
    id: string;
    fullName: string;
    photoUrl?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    primaryPhone: string;
    alternatePhone?: string | null;
    email: string;
    bloodGroup?: string | null;
    memberCategory?: MemberCategoryValue | null;
    currentPosition?: CurrentPositionValue | null;
    occupation?: string | null;
    companyName?: string | null;
    businessSector?: string | null;
    yearsInBusiness?: number | null;
    isStudent?: boolean;
    institutionName?: string | null;
    courseName?: string | null;
    district: string;
    taluk?: string | null;
    addressLine?: string | null;
    ward?: string | null;
    pinCode?: string | null;
    futureGoal?: string | null;
    chapter: {
      id: string;
      name: string;
      code: string;
      slug: string;
    };
    expectations: string[];
    talents: string[];
    participationPreferences: string[];
  };
  membership: {
    id: string;
    membershipNumber: string;
    status: string;
    startDate: string;
    validUntil: string;
    card?: {
      verificationToken: string;
      cardVersion: number;
      expiresAt: string;
    } | null;
  } | null;
  correctionRequests: Array<{
    id: string;
    field: string;
    oldValue: string | null;
    requestedValue: string;
    reason: string;
    documentUrl?: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
    reviewedAt?: string | null;
    reviewNotes?: string | null;
    createdAt: string;
  }>;
  transfers: Array<{
    id: string;
    fromChapter: { id: string; name: string; code: string; slug: string };
    toChapter: { id: string; name: string; code: string; slug: string };
    status: 'REQUESTED' | 'CURRENT_APPROVED' | 'DESTINATION_APPROVED' | 'COMPLETED' | 'REJECTED';
    reason: string;
    currentReviewNotes?: string | null;
    destinationReviewNotes?: string | null;
    districtReviewNotes?: string | null;
    requestedAt: string;
    completedAt?: string | null;
    rejectionReason?: string | null;
  }>;
  chapterHistory: Array<{
    id: string;
    chapter: { id: string; name: string; code: string };
    assignedAt: string;
    endedAt?: string | null;
    reason?: string | null;
  }>;
}

export function MemberProfileManagement({
  initialData,
}: {
  initialData: CompleteMemberProfileData;
}) {
  const [data, setData] = React.useState<CompleteMemberProfileData>(initialData);
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'personal' | 'contact' | 'professional' | 'location' | 'chapter' | 'documents' | 'security' | 'requests'
  >('overview');

  // Loading & notification states
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Editable form states
  const [personalForm, setPersonalForm] = React.useState({
    gender: data.profile.gender || 'MALE',
    alternatePhone: data.profile.alternatePhone || '',
    bloodGroup: data.profile.bloodGroup || '',
    photoUrl: data.profile.photoUrl || '',
  });

  const [professionalForm, setProfessionalForm] = React.useState({
    memberCategory: data.profile.memberCategory || 'ENTREPRENEUR_BUSINESS_OWNER',
    currentPosition: data.profile.currentPosition || 'BUSINESS_OWNER',
    occupation: data.profile.occupation || '',
    companyName: data.profile.companyName || '',
    businessSector: data.profile.businessSector || '',
    yearsInBusiness: data.profile.yearsInBusiness || 0,
    isStudent: data.profile.isStudent || false,
    institutionName: data.profile.institutionName || '',
    courseName: data.profile.courseName || '',
    futureGoal: data.profile.futureGoal || '',
    expectations: data.profile.expectations || [],
    talents: data.profile.talents || [],
    participationPreferences: data.profile.participationPreferences || [],
  });

  const [locationForm, setLocationForm] = React.useState({
    district: data.profile.district || 'Malappuram',
    taluk: data.profile.taluk || 'Ernad',
    addressLine: data.profile.addressLine || '',
    ward: data.profile.ward || '',
    pinCode: data.profile.pinCode || '676121',
  });

  // Phone Change Workflow State
  const [phoneStep, setPhoneStep] = React.useState<'input' | 'otp'>('input');
  const [newPhone, setNewPhone] = React.useState('');
  const [phoneOtp, setPhoneOtp] = React.useState('');
  const [phoneCooldown, setPhoneCooldown] = React.useState(0);
  const [phoneNotice, setPhoneNotice] = React.useState<string | null>(null);

  // Email Change Workflow State
  const [emailStep, setEmailStep] = React.useState<'input' | 'token'>('input');
  const [newEmail, setNewEmail] = React.useState('');
  const [emailToken, setEmailToken] = React.useState('');
  const [emailCooldown, setEmailCooldown] = React.useState(0);
  const [emailNotice, setEmailNotice] = React.useState<string | null>(null);

  // Identity Correction Modal State
  const [correctionForm, setCorrectionForm] = React.useState({
    field: 'fullName' as 'fullName' | 'dateOfBirth' | 'gender' | 'other',
    requestedValue: '',
    reason: '',
    documentUrl: '',
  });

  // Chapter Transfer Modal State
  const [transferForm, setTransferForm] = React.useState({
    destinationChapterId: '',
    reason: '',
  });

  // Auto-dismiss banners
  React.useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  React.useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Cooldown timers
  React.useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCooldown]);

  React.useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  // Refresh profile data from API
  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/v1/member/profile');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch {
      // Ignore background refresh failure
    }
  };

  // 1. Save Personal Details
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'personal', data: personalForm }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update personal details.');
      }
      setSuccessMsg('Personal information updated successfully.');
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Save Professional Details
  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'professional', data: professionalForm }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update professional details.');
      }
      setSuccessMsg('Professional and youth discovery details saved successfully.');
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Save Location Details
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'location', data: locationForm }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update location.');
      }
      setSuccessMsg('Verified residential location saved.');
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Request Phone OTP
  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setPhoneNotice(null);
    try {
      const res = await fetch('/api/v1/member/contact/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send verification OTP.');
      }
      setPhoneStep('otp');
      setPhoneCooldown(60);
      setPhoneNotice(json.devOtpNotice || `OTP sent to ${json.maskedTarget}`);
      setSuccessMsg('Verification code sent to your new mobile number.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/contact/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhone, otp: phoneOtp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid OTP code.');
      }
      setSuccessMsg('Mobile number verified and updated successfully!');
      setPhoneStep('input');
      setNewPhone('');
      setPhoneOtp('');
      setPhoneNotice(null);
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Request Email Verification
  const handleRequestEmailToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setEmailNotice(null);
    try {
      const res = await fetch('/api/v1/member/contact/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send email verification.');
      }
      setEmailStep('token');
      setEmailCooldown(60);
      setEmailNotice(json.devOtpNotice || `Verification code dispatched to ${json.maskedTarget}`);
      setSuccessMsg('Verification code sent to your new email.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Verify Email Token
  const handleVerifyEmailToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/contact/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, token: emailToken }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid verification token.');
      }
      setSuccessMsg('Login email address verified and updated successfully!');
      setEmailStep('input');
      setNewEmail('');
      setEmailToken('');
      setEmailNotice(null);
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Submit Identity Correction Request
  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correctionForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit correction request.');
      }
      setSuccessMsg('Formal correction request submitted to District Administration.');
      setCorrectionForm({
        field: 'fullName',
        requestedValue: '',
        reason: '',
        documentUrl: '',
      });
      await refreshProfile();
      setActiveTab('requests');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 9. Submit Chapter Transfer Request
  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/member/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit chapter transfer request.');
      }
      setSuccessMsg('Chapter transfer request submitted for chapter and district review.');
      setTransferForm({ destinationChapterId: '', reason: '' });
      await refreshProfile();
      setActiveTab('requests');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTransfer = data.transfers.find(
    (t) => t.status === 'REQUESTED' || t.status === 'CURRENT_APPROVED' || t.status === 'DESTINATION_APPROVED'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Notifications Toast */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header Profile Identity Strip */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0F1D] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#035AFC] to-[#022D80] text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/10 border-2 border-white dark:border-slate-800">
                {data.profile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0A0F1D] flex items-center justify-center text-white" title="Active Verified Member">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {data.profile.fullName}
                </h1>
                <Badge variant="success">ACTIVE PASS</Badge>
                {data.membership && (
                  <Badge variant="secondary" className="font-mono">
                    {data.membership.membershipNumber}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#035AFC]" /> {data.profile.chapter.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" /> {data.profile.taluk || 'Malappuram'} Taluk
                </span>
                <span>•</span>
                <span className="text-slate-400">100% Free NGO Membership</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
            <Link href="/member/membership/id-card">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <KeyRound className="h-4 w-4" /> View Digital ID
              </Button>
            </Link>
            <Link href="/member">
              <Button variant="secondary" size="sm" className="gap-2 text-xs">
                Dashboard Overview
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Strip Indicators */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${data.user.phoneVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Mobile Verified</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {data.user.phoneVerified ? 'Verified Phone' : 'Pending Verification'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${data.user.emailVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Email Verified</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {data.user.emailVerified ? 'Verified Email' : 'Pending Verification'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-[#035AFC] flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Chapter Status</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {data.profile.chapter.name}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Classification</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                {data.profile.currentPosition?.replace(/_/g, ' ') || 'Member'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'personal', label: 'Personal Details', icon: FileText },
          { id: 'contact', label: 'Contact Verification', icon: Phone },
          { id: 'professional', label: 'Professional & Youth', icon: Briefcase },
          { id: 'location', label: 'Location Details', icon: MapPin },
          { id: 'chapter', label: 'Membership & Chapter', icon: Building2 },
          { id: 'documents', label: 'Documents', icon: Upload },
          { id: 'security', label: 'Security & Access', icon: ShieldCheck },
          { id: 'requests', label: 'Requests & History', icon: Clock, count: data.correctionRequests.length + data.transfers.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#035AFC] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Profile Completeness</CardTitle>
                <CardDescription>Verified member credentials and data consistency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-[#035AFC] to-emerald-500 h-2.5 rounded-full w-[92%]" />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Profile Strength: 92% (High Integrity)</span>
                  <span className="text-emerald-600 font-bold">Good Standing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Primary Mobile</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>{data.profile.primaryPhone}</span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('contact')} className="h-6 text-[10px] text-[#035AFC]">Change</Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Login Email</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{data.profile.email}</span>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('contact')} className="h-6 text-[10px] text-[#035AFC]">Change</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chapter Standing</CardTitle>
                <CardDescription>Official constituency jurisdiction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-[#035AFC] flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{data.profile.chapter.name}</h4>
                    <p className="text-xs text-slate-500">Code: {data.profile.chapter.code}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <p>Members can transfer to any of the 16 Assembly Constituency chapters in Malappuram through approved governance.</p>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={() => setActiveTab('chapter')}>
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Request Chapter Transfer
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => setActiveTab('personal')}>
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-[#035AFC] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h4>
                  <p className="text-xs text-slate-500">Gender, Blood Group, Display Info</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => setActiveTab('professional')}>
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Professional & Goals</h4>
                  <p className="text-xs text-slate-500">Category, Business, Talents, Future Goal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => setActiveTab('location')}>
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Location Details</h4>
                  <p className="text-xs text-slate-500">PIN Code, Taluk, Local Body, Ward</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL DETAILS */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Identity Protection Callout */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <Lock className="h-5 w-5 text-[#035AFC] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Protected Legal Identity</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Legal Full Name ({data.profile.fullName}) and Date of Birth ({data.profile.dateOfBirth || 'Verified'}) are protected identity records. To correct errors, submit a formal request.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCorrectionForm((prev) => ({ ...prev, field: 'fullName' }));
                setActiveTab('documents');
              }}
              className="text-xs shrink-0 text-[#035AFC] border-blue-500/30"
            >
              Request Identity Correction
            </Button>
          </div>

          {/* Editable Personal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permitted Profile Details</CardTitle>
              <CardDescription>Self-editable personal information governed by MYBF Member policy</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
                    <select
                      value={personalForm.bloodGroup || ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    >
                      <option value="">Select Blood Group (Optional)</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alternate Phone (Optional)</label>
                    <input
                      type="tel"
                      value={personalForm.alternatePhone || ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, alternatePhone: e.target.value })}
                      placeholder="e.g. 9847000222"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Avatar / Photo URL</label>
                    <input
                      type="url"
                      value={personalForm.photoUrl || ''}
                      onChange={(e) => setPersonalForm({ ...personalForm, photoUrl: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving Changes...' : 'Save Personal Details'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: CONTACT VERIFICATION (PHONE & EMAIL) */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mobile Number Change Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-[#035AFC] flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Mobile Number</CardTitle>
                  <CardDescription>Verified OTP authentication required</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Current Registered Phone</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  +91 {data.profile.primaryPhone}
                </div>
              </div>

              {phoneNotice && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono">
                  {phoneNotice}
                </div>
              )}

              {phoneStep === 'input' ? (
                <form onSubmit={handleRequestPhoneOtp} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Mobile Number (India +91)</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm" className="w-full text-xs" disabled={isSubmitting || newPhone.length !== 10}>
                    {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit OTP sent to +91 {newPhone}</label>
                    <input
                      type="text"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit code"
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" className="flex-1 text-xs" disabled={isSubmitting || phoneOtp.length !== 6}>
                      {isSubmitting ? 'Verifying...' : 'Verify & Change Number'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPhoneStep('input')}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                  {phoneCooldown > 0 && (
                    <p className="text-[11px] text-slate-400 text-center">Resend code in {phoneCooldown}s</p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Email Address Change Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Change Login Email</CardTitle>
                  <CardDescription>Secure token verification to new address</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Current Login Email</span>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {data.profile.email}
                </div>
              </div>

              {emailNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
                  {emailNotice}
                </div>
              )}

              {emailStep === 'input' ? (
                <form onSubmit={handleRequestEmailToken} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. member@example.com"
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm" className="w-full text-xs" disabled={isSubmitting || !newEmail.includes('@')}>
                    {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailToken} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter Verification Code sent to {newEmail}</label>
                    <input
                      type="text"
                      value={emailToken}
                      onChange={(e) => setEmailToken(e.target.value.trim())}
                      placeholder="6-digit code"
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" className="flex-1 text-xs" disabled={isSubmitting || emailToken.length < 6}>
                      {isSubmitting ? 'Verifying...' : 'Verify & Change Email'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEmailStep('input')}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                  {emailCooldown > 0 && (
                    <p className="text-[11px] text-slate-400 text-center">Resend code in {emailCooldown}s</p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: PROFESSIONAL & YOUTH DISCOVERY */}
      {activeTab === 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Professional & Entrepreneurial Profile</CardTitle>
            <CardDescription>MYBF business categorization and Mission Malappuram 2050 talents alignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfessional} className="space-y-6">
              {/* Category & Position Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Member Category / Interest</label>
                  <select
                    value={professionalForm.memberCategory}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, memberCategory: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  >
                    {MEMBER_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Position</label>
                  <select
                    value={professionalForm.currentPosition}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, currentPosition: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  >
                    {CURRENT_POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Occupation / Profession</label>
                  <input
                    type="text"
                    value={professionalForm.occupation || ''}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, occupation: e.target.value })}
                    placeholder="e.g. Software Engineer, Retailer, Exporter"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company / Enterprise Name</label>
                  <input
                    type="text"
                    value={professionalForm.companyName || ''}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, companyName: e.target.value })}
                    placeholder="e.g. Malappuram Logistics LLP"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business Sector</label>
                  <input
                    type="text"
                    value={professionalForm.businessSector || ''}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, businessSector: e.target.value })}
                    placeholder="e.g. Technology, Retail, Healthcare, Agriculture"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years in Business / Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={professionalForm.yearsInBusiness || 0}
                    onChange={(e) => setProfessionalForm({ ...professionalForm, yearsInBusiness: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>
              </div>

              {/* Future Goal Statement */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#FBC206]" /> Future Goal & Vision Statement (Mission Malappuram 2050)
                </label>
                <textarea
                  value={professionalForm.futureGoal || ''}
                  onChange={(e) => setProfessionalForm({ ...professionalForm, futureGoal: e.target.value })}
                  placeholder="Share your entrepreneurial aspiration or how you aim to impact Malappuram's youth economy..."
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 focus:ring-2 focus:ring-[#035AFC] outline-none"
                />
              </div>

              {/* Expectations Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Member Expectations from MYBF</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {EXPECTATION_OPTIONS.map((opt) => {
                    const isSelected = professionalForm.expectations.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => {
                          const updated = isSelected
                            ? professionalForm.expectations.filter((k) => k !== opt.key)
                            : [...professionalForm.expectations, opt.key];
                          setProfessionalForm({ ...professionalForm, expectations: updated });
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#035AFC] bg-[#035AFC]/10 text-[#035AFC] dark:text-blue-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Talents Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Talents & Capabilities</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_TALENT_OPTIONS.map((opt) => {
                    const isSelected = professionalForm.talents.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => {
                          const updated = isSelected
                            ? professionalForm.talents.filter((k) => k !== opt.key)
                            : [...professionalForm.talents, opt.key];
                          setProfessionalForm({ ...professionalForm, talents: updated });
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Professional Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: LOCATION DETAILS */}
      {activeTab === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verified Residential Location</CardTitle>
            <CardDescription>Postal PIN Code, Taluk, and Local Body mapping across Malappuram District</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveLocation} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">District (Canonical Scope)</label>
                  <input
                    type="text"
                    disabled
                    value="Malappuram District, Kerala"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taluk</label>
                  <select
                    value={locationForm.taluk}
                    onChange={(e) => setLocationForm({ ...locationForm, taluk: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  >
                    {TALUKS_OF_MALAPPURAM.map((t) => (
                      <option key={t.code} value={t.name}>{t.name} ({t.headquarters})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Postal PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={locationForm.pinCode}
                    onChange={(e) => setLocationForm({ ...locationForm, pinCode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 676121"
                    required
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ward / Locality (Optional)</label>
                  <input
                    type="text"
                    value={locationForm.ward}
                    onChange={(e) => setLocationForm({ ...locationForm, ward: e.target.value })}
                    placeholder="e.g. Ward 12, Kizhakkethala"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Residential Address Line</label>
                <textarea
                  rows={2}
                  value={locationForm.addressLine || ''}
                  onChange={(e) => setLocationForm({ ...locationForm, addressLine: e.target.value })}
                  placeholder="House name, street, landmarks..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-[#035AFC] shrink-0 mt-0.5" />
                <p>
                  <strong>Organizational Rule:</strong> Updating your residential address does not automatically alter your MYBF constituency chapter assignment. Chapter assignment is an authorized governance process managed via Chapter Transfer.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Location...' : 'Save Location Details'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: MEMBERSHIP & CHAPTER TRANSFER */}
      {activeTab === 'chapter' && (
        <div className="space-y-6">
          {/* Active Chapter Card */}
          <Card className="border-blue-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Constituency Chapter</span>
                  <CardTitle className="text-lg mt-0.5 text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#035AFC]" /> {data.profile.chapter.name}
                  </CardTitle>
                </div>
                <Badge variant="primary">CODE: {data.profile.chapter.code}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-500">
              <p>Your voting, monthly chapter executive attendance, and local networking are registered under {data.profile.chapter.name}.</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Permanent Member ID: <strong className="font-mono text-slate-900 dark:text-white">{data.membership?.membershipNumber}</strong></span>
                <span className="text-emerald-600 font-bold">100% Free Lifetime Pass</span>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form / Active Tracker */}
          {activeTransfer ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">Active Chapter Transfer in Progress</CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {activeTransfer.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardDescription>
                  Transfer from <strong>{activeTransfer.fromChapter.name}</strong> to <strong>{activeTransfer.toChapter.name}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Reason for Transfer</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 italic">&ldquo;{activeTransfer.reason}&rdquo;</p>
                </div>

                {/* Transfer Pipeline Stepper */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    1. Submitted
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    activeTransfer.status !== 'REQUESTED'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                  }`}>
                    2. Origin Review
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    activeTransfer.status === 'DESTINATION_APPROVED' || activeTransfer.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : activeTransfer.status === 'CURRENT_APPROVED'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    3. Destination Review
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    activeTransfer.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : activeTransfer.status === 'DESTINATION_APPROVED'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    4. District Final
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  Requests are typically reviewed within 3-5 business days. Your current chapter standing remains active throughout.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="h-5 w-5 text-[#035AFC]" />
                  <CardTitle className="text-base">Request Chapter Transfer</CardTitle>
                </div>
                <CardDescription>
                  Switch your operational chapter to another of the 16 constituency chapters in Malappuram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTransfer} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Destination Chapter</label>
                    <select
                      value={transferForm.destinationChapterId}
                      onChange={(e) => setTransferForm({ ...transferForm, destinationChapterId: e.target.value })}
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    >
                      <option value="">Select Target Chapter (Other than {data.profile.chapter.name})</option>
                      {INITIAL_16_CHAPTERS.filter((c) => c.slug !== data.profile.chapter.slug).map((ch) => (
                        <option key={ch.code} value={ch.code}>
                          {ch.name} — {ch.taluk} Taluk ({ch.headquarters})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Chapter Transfer</label>
                    <textarea
                      rows={3}
                      value={transferForm.reason}
                      onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                      placeholder="Please describe why you wish to transfer (e.g. business relocation, residential change to new constituency, improved proximity)..."
                      required
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !transferForm.destinationChapterId || transferForm.reason.length < 10}>
                      {isSubmitting ? 'Submitting...' : 'Submit Transfer Request'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Chapter Assignment History */}
          {data.chapterHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Historical Chapter Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.chapterHistory.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{h.chapter.name}</div>
                      <div className="text-[11px] text-slate-400">Assigned: {new Date(h.assignedAt).toLocaleDateString()} {h.endedAt ? `• Concluded: ${new Date(h.endedAt).toLocaleDateString()}` : '• Current Active'}</div>
                    </div>
                    {h.reason && <span className="text-[11px] text-slate-500 italic max-w-[200px] truncate">{h.reason}</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 7: DOCUMENTS & FORMAL IDENTITY CORRECTION */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2.5">
                <FileCheck className="h-5 w-5 text-[#035AFC]" />
                <div>
                  <CardTitle className="text-base">Request Personal Identity Correction</CardTitle>
                  <CardDescription>
                    Administrative review required for Legal Full Name, Date of Birth, and identity-controlled records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCorrection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Field to be Corrected</label>
                    <select
                      value={correctionForm.field}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, field: e.target.value as any })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                    >
                      <option value="fullName">Legal Full Name (Current: {data.profile.fullName})</option>
                      <option value="dateOfBirth">Date of Birth (Current: {data.profile.dateOfBirth || 'Not set'})</option>
                      <option value="gender">Gender</option>
                      <option value="other">Other Identity Attribute</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Correct Value</label>
                    {correctionForm.field === 'dateOfBirth' ? (
                      <input
                        type="date"
                        value={correctionForm.requestedValue}
                        onChange={(e) => setCorrectionForm({ ...correctionForm, requestedValue: e.target.value })}
                        required
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 font-mono focus:ring-2 focus:ring-[#035AFC] outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={correctionForm.requestedValue}
                        onChange={(e) => setCorrectionForm({ ...correctionForm, requestedValue: e.target.value })}
                        placeholder="Enter requested correct legal value"
                        required
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Correction</label>
                  <textarea
                    rows={3}
                    value={correctionForm.reason}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                    placeholder="Provide the reason for this correction (e.g. typographical error in registration, name updated in official Aadhaar/Passport records)..."
                    required
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Supporting Document URL / Cloud Link (Optional)</label>
                  <input
                    type="url"
                    value={correctionForm.documentUrl}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, documentUrl: e.target.value })}
                    placeholder="e.g. Secure cloud storage link or uploaded document link"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 focus:ring-2 focus:ring-[#035AFC] outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Policy Compliance:</strong> All identity corrections are reviewed and audited by the District Administration Secretariat. Date of Birth changes remain subject to MYBF youth eligibility (18–40 years).
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting || !correctionForm.requestedValue || correctionForm.reason.length < 10}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Correction for Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 8: SECURITY & ACCESS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Identity Credentials
              </CardTitle>
              <CardDescription>Cryptographic verification pass parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Token</span>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                  {data.membership?.card?.verificationToken || 'Generated on card issuance'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>Card Version</span>
                <span className="font-mono font-bold">v{data.membership?.card?.cardVersion || 1}.0</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>Pass Valid Until</span>
                <span className="font-mono text-emerald-600 font-bold">{data.membership ? new Date(data.membership.validUntil).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#035AFC]" /> Session & Security Actions
              </CardTitle>
              <CardDescription>Authentication channel controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Registered Phone</div>
                  <div className="text-[11px] text-slate-400">+91 {data.profile.primaryPhone}</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setActiveTab('contact')}>Change</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Login Email</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{data.profile.email}</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setActiveTab('contact')}>Change</Button>
              </div>

              <Link href="/forgot-password">
                <Button variant="secondary" size="sm" className="w-full text-xs mt-2">
                  Reset Password Credentials
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 9: REQUESTS & CHANGE HISTORY */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Identity Corrections List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#035AFC]" /> Identity Correction Requests
              </CardTitle>
              <CardDescription>Formal personal details modification log</CardDescription>
            </CardHeader>
            <CardContent>
              {data.correctionRequests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No correction requests recorded.</p>
              ) : (
                <div className="space-y-3">
                  {data.correctionRequests.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                          Field: {r.field}
                        </div>
                        <Badge
                          variant={
                            r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'secondary'
                          }
                        >
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-slate-500">
                        Requested: <strong className="text-slate-800 dark:text-slate-200">{r.requestedValue}</strong> (was: {r.oldValue || 'None'})
                      </div>
                      <div className="text-slate-400 italic">&ldquo;{r.reason}&rdquo;</div>
                      {r.reviewNotes && (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                          <strong>Admin Remarks:</strong> {r.reviewNotes}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 pt-1">
                        Submitted: {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chapter Transfers List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-[#035AFC]" /> Chapter Transfer Requests
              </CardTitle>
              <CardDescription>Constituency chapter relocation tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {data.transfers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No chapter transfers requested.</p>
              ) : (
                <div className="space-y-3">
                  {data.transfers.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {t.fromChapter.name} → {t.toChapter.name}
                        </div>
                        <Badge
                          variant={
                            t.status === 'COMPLETED' ? 'success' : t.status === 'REJECTED' ? 'danger' : 'secondary'
                          }
                        >
                          {t.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-slate-500 italic">&ldquo;{t.reason}&rdquo;</div>
                      {t.currentReviewNotes && (
                        <div className="text-[11px] text-slate-500">
                          <strong>Origin Chapter Review:</strong> {t.currentReviewNotes}
                        </div>
                      )}
                      {t.destinationReviewNotes && (
                        <div className="text-[11px] text-slate-500">
                          <strong>Destination Chapter Review:</strong> {t.destinationReviewNotes}
                        </div>
                      )}
                      {t.districtReviewNotes && (
                        <div className="text-[11px] text-slate-500">
                          <strong>District Admin Decision:</strong> {t.districtReviewNotes}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 pt-1">
                        Requested: {new Date(t.requestedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
