'use client';

import * as React from 'react';
import {
  MapPin,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Building,
  Check,
  Edit2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TALUKS_OF_MALAPPURAM } from '../constants/malappuram-geo';

export interface LocationSelectorValue {
  district: string;
  taluk: string;
  localBody: string;
  ward?: string;
  postOffice?: string;
  pinCode?: string;
}

export interface LocationSelectorProps {
  value: LocationSelectorValue;
  onChange: (value: LocationSelectorValue) => void;
  disabled?: boolean;
  className?: string;
}

interface LocalBodyOption {
  id: string;
  code: string;
  name: string;
  type: 'MUNICIPALITY' | 'GRAMA_PANCHAYAT';
  talukName: string;
}

interface PostOfficeOption {
  id: string;
  code: string;
  name: string;
  pinCode: string;
  officeType: string;
  deliveryStatus: string;
  talukName: string;
  localBodyName?: string | null;
  postalDivision?: string | null;
}

export function LocationSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: LocationSelectorProps) {
  const [taluks, setTaluks] = React.useState<Array<{ code: string; name: string }>>(
    TALUKS_OF_MALAPPURAM.map((t) => ({ code: t.code, name: t.name }))
  );
  const [localBodies, setLocalBodies] = React.useState<LocalBodyOption[]>([]);
  const [isLoadingLocalBodies, setIsLoadingLocalBodies] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Postal lookup states
  const [postOfficeOptions, setPostOfficeOptions] = React.useState<PostOfficeOption[]>([]);
  const [isLoadingPostal, setIsLoadingPostal] = React.useState(false);
  const [postalMessage, setPostalMessage] = React.useState<string | null>(null);
  const [isManualPostOffice, setIsManualPostOffice] = React.useState(false);
  const [isPinVerified, setIsPinVerified] = React.useState<boolean | null>(null);

  // Request race-condition guards
  const latestTalukRequestRef = React.useRef<string>('');
  const latestPostalRequestRef = React.useRef<string>('');

  // 1. Load Taluks on mount
  React.useEffect(() => {
    let isMounted = true;
    async function fetchTaluks() {
      try {
        const res = await fetch('/api/v1/geography/taluks');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.taluks && data.taluks.length > 0) {
            setTaluks(data.taluks.map((t: any) => ({ code: t.code, name: t.name })));
          }
        }
      } catch {
        // Keeps verified fallback from TALUKS_OF_MALAPPURAM
      }
    }
    fetchTaluks();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Local Bodies whenever Taluk changes
  React.useEffect(() => {
    if (!value.taluk) {
      setLocalBodies([]);
      return;
    }

    const currentTaluk = value.taluk;
    latestTalukRequestRef.current = currentTaluk;
    setIsLoadingLocalBodies(true);
    setLoadError(null);

    async function fetchLocalBodies() {
      try {
        const res = await fetch(
          `/api/v1/geography/local-bodies?taluk=${encodeURIComponent(currentTaluk)}`
        );
        if (!res.ok) throw new Error('Failed to load local bodies');
        const data = await res.json();

        if (latestTalukRequestRef.current === currentTaluk) {
          setLocalBodies(data.localBodies || []);
        }
      } catch {
        if (latestTalukRequestRef.current === currentTaluk) {
          setLoadError('Unable to dynamically load local bodies for this taluk.');
        }
      } finally {
        if (latestTalukRequestRef.current === currentTaluk) {
          setIsLoadingLocalBodies(false);
        }
      }
    }

    fetchLocalBodies();
  }, [value.taluk]);

  // 3. Method 2: Load Post Offices by Local Body when Local Body changes
  React.useEffect(() => {
    if (!value.localBody) {
      // If no PIN is entered yet, clear post office options
      if (!value.pinCode || value.pinCode.length !== 6) {
        setPostOfficeOptions([]);
        setPostalMessage(null);
      }
      return;
    }

    const reqKey = `LB:${value.localBody}:${value.taluk}`;
    latestPostalRequestRef.current = reqKey;
    setIsLoadingPostal(true);

    async function fetchPostalByLocalBody() {
      try {
        const res = await fetch(
          `/api/v1/geography/postal/local-body?localBody=${encodeURIComponent(
            value.localBody
          )}&taluk=${encodeURIComponent(value.taluk || '')}`
        );
        if (res.ok) {
          const data = await res.json();
          if (latestPostalRequestRef.current === reqKey) {
            if (data.hasVerifiedPostalMapping && data.postOffices.length > 0) {
              setPostOfficeOptions(data.postOffices);
              setPostalMessage(null);
              setIsPinVerified(true);
            } else {
              setPostalMessage(
                'Verified postal mapping pending for this local body. Enter 6-digit PIN Code to lookup.'
              );
            }
          }
        }
      } catch {
        // Fallback
      } finally {
        if (latestPostalRequestRef.current === reqKey) {
          setIsLoadingPostal(false);
        }
      }
    }

    fetchPostalByLocalBody();
  }, [value.localBody, value.taluk]);

  // 4. Method 1: Debounced PIN Code Lookup (when PIN code reaches 6 digits)
  React.useEffect(() => {
    const pin = (value.pinCode || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      setIsPinVerified(null);
      return;
    }

    const reqKey = `PIN:${pin}`;
    latestPostalRequestRef.current = reqKey;
    setIsLoadingPostal(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/geography/postal/lookup?pinCode=${pin}`);
        if (res.ok) {
          const data = await res.json();
          if (latestPostalRequestRef.current === reqKey) {
            if (data.found && data.postOffices.length > 0) {
              setPostOfficeOptions(data.postOffices);
              setIsPinVerified(true);
              setPostalMessage(null);

              // If only 1 post office and none selected yet, auto-populate
              if (data.postOffices.length === 1 && !value.postOffice) {
                onChange({
                  ...value,
                  postOffice: data.postOffices[0].name,
                  pinCode: pin,
                });
              }
            } else {
              setIsPinVerified(false);
              setPostalMessage('PIN Code not in Malappuram directory. Manual entry permitted.');
            }
          }
        }
      } catch {
        if (latestPostalRequestRef.current === reqKey) {
          setIsPinVerified(false);
        }
      } finally {
        if (latestPostalRequestRef.current === reqKey) {
          setIsLoadingPostal(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value.pinCode]);

  // Cascading reset handlers
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    onChange({
      district: newDistrict,
      taluk: '',
      localBody: '',
      ward: '',
      postOffice: '',
      pinCode: '',
    });
    setPostOfficeOptions([]);
    setIsPinVerified(null);
    setPostalMessage(null);
  };

  const handleTalukChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTaluk = e.target.value;
    onChange({
      ...value,
      taluk: newTaluk,
      localBody: '',
      ward: '',
      postOffice: '',
      pinCode: '',
    });
    setPostOfficeOptions([]);
    setIsPinVerified(null);
    setPostalMessage(null);
  };

  const handleLocalBodyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocalBody = e.target.value;
    onChange({
      ...value,
      localBody: newLocalBody,
      ward: '',
      postOffice: '',
      pinCode: '',
    });
    setPostOfficeOptions([]);
    setIsPinVerified(null);
    setPostalMessage(null);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      ward: e.target.value,
    });
  };

  // Post office selection handler
  const handlePostOfficeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal === '__MANUAL__') {
      setIsManualPostOffice(true);
      return;
    }

    const matchedPO = postOfficeOptions.find((po) => po.name === selectedVal);
    if (matchedPO) {
      onChange({
        ...value,
        postOffice: matchedPO.name,
        pinCode: matchedPO.pinCode, // Auto-populate verified PIN!
      });
      setIsPinVerified(true);
    } else {
      onChange({
        ...value,
        postOffice: selectedVal,
      });
    }
  };

  const handleManualPostOfficeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      postOffice: e.target.value,
    });
  };

  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanPin = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({
      ...value,
      pinCode: cleanPin,
      // If PIN is edited manually, clear post office if it doesn't match
      postOffice: cleanPin.length === 6 ? value.postOffice : '',
    });
  };

  // Group local bodies by Municipality and Grama Panchayat for cleaner UX
  const municipalities = localBodies.filter((lb) => lb.type === 'MUNICIPALITY');
  const gramaPanchayats = localBodies.filter((lb) => lb.type === 'GRAMA_PANCHAYAT');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Grid: District, Taluk, Local Body */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* District Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>District</span>
            <span className="text-[10px] text-slate-400">Fixed</span>
          </label>
          <select
            value={value.district || 'Malappuram'}
            onChange={handleDistrictChange}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A10]/70 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
          >
            <option value="Malappuram">Malappuram District</option>
          </select>
        </div>

        {/* Taluk Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Taluk *</span>
            <span className="text-[10px] text-[#035AFC]">7 Taluks</span>
          </label>
          <select
            value={value.taluk}
            onChange={handleTalukChange}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#035AFC] focus:outline-none"
          >
            <option value="">Select Taluk...</option>
            {taluks.map((t) => (
              <option key={t.code} value={t.name}>
                {t.name} Taluk
              </option>
            ))}
          </select>
        </div>

        {/* Local Body Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Local Body *</span>
            {isLoadingLocalBodies ? (
              <span className="inline-flex items-center text-[10px] text-blue-500">
                <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading...
              </span>
            ) : value.taluk ? (
              <span className="text-[10px] text-slate-400">
                {localBodies.length} Options
              </span>
            ) : null}
          </label>
          <select
            value={value.localBody}
            onChange={handleLocalBodyChange}
            disabled={disabled || !value.taluk || isLoadingLocalBodies}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#035AFC] focus:outline-none disabled:opacity-60"
          >
            <option value="">
              {!value.taluk
                ? 'Select Taluk first...'
                : isLoadingLocalBodies
                ? 'Loading Local Bodies...'
                : 'Select Municipality or Panchayat...'}
            </option>

            {municipalities.length > 0 && (
              <optgroup label="Municipalities (Urban)">
                {municipalities.map((m) => (
                  <option key={m.code} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            )}

            {gramaPanchayats.length > 0 && (
              <optgroup label="Grama Panchayats (Rural)">
                {gramaPanchayats.map((gp) => (
                  <option key={gp.code} value={gp.name}>
                    {gp.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Secondary Row: Ward, Post Office, PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Ward Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ward / Locality
            </label>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">
              Pending Delimitation
            </span>
          </div>
          <input
            type="text"
            value={value.ward || ''}
            onChange={handleWardChange}
            disabled={disabled || !value.localBody}
            placeholder={
              !value.localBody ? 'Select Local Body first' : 'e.g. Ward 14 or Locality'
            }
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#035AFC] focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* Post Office Field (Searchable Select or Manual) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>Post Office</span>
              {isLoadingPostal && <Loader2 className="h-3 w-3 animate-spin text-[#035AFC]" />}
            </label>
            {postOfficeOptions.length > 0 && (
              <button
                type="button"
                onClick={() => setIsManualPostOffice(!isManualPostOffice)}
                className="text-[9px] text-[#035AFC] hover:underline flex items-center gap-0.5"
              >
                {isManualPostOffice ? 'Select from list' : 'Type manually'}
              </button>
            )}
          </div>

          {!isManualPostOffice && postOfficeOptions.length > 0 ? (
            <select
              value={value.postOffice || ''}
              onChange={handlePostOfficeSelect}
              disabled={disabled}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#035AFC] focus:outline-none disabled:opacity-60"
            >
              <option value="">
                {postOfficeOptions.length === 1
                  ? 'Select Post Office...'
                  : `Select from ${postOfficeOptions.length} matching offices...`}
              </option>
              {postOfficeOptions.map((po) => (
                <option key={po.code} value={po.name}>
                  {po.name} ({po.officeType}) - {po.pinCode}
                </option>
              ))}
              <option value="__MANUAL__">&rarr; Enter custom / unlisted Post Office</option>
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={value.postOffice || ''}
                onChange={handleManualPostOfficeChange}
                disabled={disabled}
                placeholder={
                  isLoadingPostal
                    ? 'Checking postal directory...'
                    : 'e.g. Manjeri H.O or Tirur H.O'
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#035AFC] focus:outline-none disabled:opacity-60"
              />
            </div>
          )}
        </div>

        {/* PIN Code Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>PIN Code</span>
              {isPinVerified === true && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                  <Check className="h-2.5 w-2.5 mr-0.5 inline" /> Verified
                </span>
              )}
            </label>
            <span className="text-[9px] text-slate-400 font-mono">6 Digits</span>
          </div>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={value.pinCode || ''}
              onChange={handlePinCodeChange}
              disabled={disabled}
              placeholder="e.g. 676121"
              className={`w-full rounded-lg border bg-white dark:bg-[#070A10] px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none disabled:opacity-60 ${
                isPinVerified === true
                  ? 'border-emerald-500 focus:border-emerald-600'
                  : 'border-slate-200 dark:border-slate-800 focus:border-[#035AFC]'
              }`}
            />
            {isLoadingPostal && (
              <div className="absolute right-2.5 top-2.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Postal Status & Guidance Feedback */}
      {postalMessage && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
          <Info className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span>{postalMessage}</span>
        </div>
      )}

      {/* Verified Status Note */}
      {value.localBody && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 p-2.5 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-[#035AFC] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-white">
              {value.localBody} &middot; {value.taluk} Taluk
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Administrative Local Body relationship verified against the official Malappuram master register.
            </p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{loadError}</span>
        </div>
      )}
    </div>
  );
}
