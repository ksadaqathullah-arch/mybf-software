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
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';
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
  // Navigation & mode state: PIN-First (default) vs Location-First (fallback)
  const [isLocationFirstMode, setIsLocationFirstMode] = React.useState(false);

  // Administrative Geography state
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

  // 3. Smart PIN Code Lookup (Method 1: Primary)
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
              setIsManualPostOffice(false);

              // Smart Automatic Location Resolution:
              // 1. Post Office: auto-select ONLY if exactly 1 verified unambiguous match
              const shouldAutoSelectPO = data.postOffices.length === 1 && !value.postOffice;
              const selectedPO = shouldAutoSelectPO ? data.postOffices[0] : null;

              // 2. Taluk: auto-select if unambiguous across matching post offices
              const resolvedTaluk =
                selectedPO?.talukName || data.verifiedTaluk || value.taluk;

              // 3. Local Body: auto-select ONLY if unambiguous and verified
              // Do NOT infer Local Body merely from PIN Code or Post Office name if ambiguous
              let resolvedLocalBody = value.localBody;
              if (selectedPO?.localBodyName) {
                resolvedLocalBody = selectedPO.localBodyName;
              } else if (data.verifiedLocalBody && !data.hasAmbiguousLocalBody && !value.localBody) {
                resolvedLocalBody = data.verifiedLocalBody;
              } else if (resolvedTaluk && value.localBody) {
                // If existing localBody is invalid for the new taluk, clear it
                // We'll let taluk revalidation handle it
              }

              if (shouldAutoSelectPO || (resolvedTaluk && resolvedTaluk !== value.taluk)) {
                onChange({
                  ...value,
                  pinCode: pin,
                  postOffice: selectedPO ? selectedPO.name : value.postOffice,
                  taluk: resolvedTaluk || value.taluk,
                  localBody: resolvedLocalBody || value.localBody,
                  ward: resolvedLocalBody !== value.localBody ? '' : value.ward,
                });
              }
            } else {
              setIsPinVerified(false);
              setPostOfficeOptions([]);
              setIsManualPostOffice(true);
              setPostalMessage(
                'PIN Code not in pre-indexed Malappuram registry. Manual input permitted.'
              );
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

  // 4. Fallback Location-First Post Office lookup (Method 2: when Local Body changes in fallback mode)
  React.useEffect(() => {
    if (!isLocationFirstMode || !value.localBody) {
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
  }, [isLocationFirstMode, value.localBody, value.taluk]);

  // Dependent field handlers
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanPin = e.target.value.replace(/\D/g, '').slice(0, 6);

    // If PIN Code changes, clear Post Office and revalidate dependent location selections
    const isNewPin = cleanPin !== value.pinCode;
    if (cleanPin.length < 6) {
      setPostOfficeOptions([]);
      setIsPinVerified(null);
      setPostalMessage(null);
    }

    onChange({
      ...value,
      pinCode: cleanPin,
      postOffice: isNewPin ? '' : value.postOffice,
    });
  };

  const handlePostOfficeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal === '__MANUAL__') {
      setIsManualPostOffice(true);
      return;
    }

    const matchedPO = postOfficeOptions.find((po) => po.name === selectedVal);
    if (matchedPO) {
      // Revalidate dependent location fields from verified postal mapping
      const newTaluk = matchedPO.talukName || value.taluk;
      let newLocalBody = value.localBody;

      // Only auto-select Local Body if verified and unambiguous
      if (matchedPO.localBodyName) {
        newLocalBody = matchedPO.localBodyName;
      } else if (newTaluk !== value.taluk) {
        // If Taluk changed and current Local Body doesn't belong to it, clear it
        newLocalBody = '';
      }

      const localBodyChanged = newLocalBody !== value.localBody;

      onChange({
        ...value,
        postOffice: matchedPO.name,
        pinCode: matchedPO.pinCode || value.pinCode,
        taluk: newTaluk,
        localBody: newLocalBody,
        ward: localBodyChanged ? '' : value.ward,
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

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      district: e.target.value,
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
    // If Taluk changes: Clear previously selected Local Body and Ward where invalid
    onChange({
      ...value,
      taluk: newTaluk,
      localBody: '',
      ward: '',
    });
  };

  const handleLocalBodyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocalBody = e.target.value;
    // If Local Body changes: Clear Ward when it no longer belongs to that Local Body
    onChange({
      ...value,
      localBody: newLocalBody,
      ward: '',
    });
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      ward: e.target.value,
    });
  };

  // Group local bodies by Municipality and Grama Panchayat for organized UX
  const municipalities = localBodies.filter((lb) => lb.type === 'MUNICIPALITY');
  const gramaPanchayats = localBodies.filter((lb) => lb.type === 'GRAMA_PANCHAYAT');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Switcher Banner / Top Control */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-[#035AFC]" />
          <span>
            {isLocationFirstMode
              ? 'Administrative Location-First Mode'
              : 'Smart PIN Code-First Address System'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsLocationFirstMode(!isLocationFirstMode);
            setPostalMessage(null);
          }}
          className="text-[11px] text-[#035AFC] hover:underline font-medium flex items-center gap-1 transition-colors"
        >
          <ArrowUpDown className="h-3 w-3" />
          {isLocationFirstMode ? 'Lookup by PIN Code Instead' : 'Search by Location Instead'}
        </button>
      </div>

      {/* RENDER FIELD GROUPS BASED ON REQUIRED ORDER */}
      {!isLocationFirstMode ? (
        /* ========================================================
           MODE 1: PIN CODE-FIRST (PRIMARY REQUIREMENT)
           ROW 1: PIN Code
           ROW 2: Post Office
           ROW 3: District | Taluk
           ROW 4: Local Body | Ward / Locality
           ======================================================== */
        <div className="space-y-3.5">
          {/* ROW 1: PIN CODE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="location-pincode"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5 text-[#035AFC]" />
                <span>1. Postal PIN Code *</span>
                {isPinVerified === true && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <Check className="h-2.5 w-2.5 mr-0.5" /> Verified Malappuram PIN
                  </span>
                )}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">6 Digits</span>
            </div>
            <div className="relative">
              <input
                id="location-pincode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={value.pinCode || ''}
                onChange={handlePinCodeChange}
                disabled={disabled}
                placeholder="Enter 6-digit PIN Code (e.g. 676121 for Manjeri, 676101 for Tirur)"
                className={`w-full rounded-xl border bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none disabled:opacity-60 transition-all ${
                  isPinVerified === true
                    ? 'border-emerald-500 focus:border-emerald-600 ring-2 ring-emerald-500/20'
                    : isPinVerified === false
                    ? 'border-amber-400 focus:border-amber-500'
                    : 'border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                }`}
              />
              {isLoadingPostal && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] text-[#035AFC]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Looking up...</span>
                </div>
              )}
            </div>
          </div>

          {/* ROW 2: POST OFFICE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="location-post-office"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Building className="h-3.5 w-3.5 text-[#035AFC]" />
                <span>2. Post Office *</span>
              </label>
              {postOfficeOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsManualPostOffice(!isManualPostOffice)}
                  className="text-[10px] text-[#035AFC] hover:underline"
                >
                  {isManualPostOffice ? 'Select from verified list' : 'Type unlisted Post Office'}
                </button>
              )}
            </div>

            {!isManualPostOffice && postOfficeOptions.length > 0 ? (
              <select
                id="location-post-office"
                value={value.postOffice || ''}
                onChange={handlePostOfficeSelect}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
              >
                <option value="">
                  {postOfficeOptions.length === 1
                    ? 'Select Post Office...'
                    : `Select from ${postOfficeOptions.length} matching Post Offices for PIN ${value.pinCode}...`}
                </option>
                {postOfficeOptions.map((po) => (
                  <option key={po.code} value={po.name}>
                    {po.name} ({po.officeType}) &bull; {po.talukName} Taluk
                  </option>
                ))}
                <option value="__MANUAL__">&rarr; Enter unlisted / custom Post Office</option>
              </select>
            ) : (
              <input
                id="location-post-office"
                type="text"
                value={value.postOffice || ''}
                onChange={handleManualPostOfficeChange}
                disabled={disabled}
                placeholder={
                  isLoadingPostal
                    ? 'Checking postal directory...'
                    : value.pinCode?.length === 6 && postOfficeOptions.length === 0
                    ? 'Enter your Post Office name (e.g. Manjeri H.O)'
                    : 'Enter 6-digit PIN Code above to auto-load Post Offices'
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
              />
            )}
          </div>

          {/* ROW 3: DISTRICT | TALUK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* District Field */}
            <div className="space-y-1">
              <label
                htmlFor="location-district"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>3. District *</span>
                <span className="text-[10px] text-slate-400">Fixed</span>
              </label>
              <select
                id="location-district"
                value={value.district || 'Malappuram'}
                onChange={handleDistrictChange}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Malappuram">Malappuram District</option>
              </select>
            </div>

            {/* Taluk Field */}
            <div className="space-y-1">
              <label
                htmlFor="location-taluk"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>4. Taluk *</span>
                {value.taluk ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-[#035AFC]">7 Taluks</span>
                )}
              </label>
              <select
                id="location-taluk"
                value={value.taluk}
                onChange={handleTalukChange}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none transition-all"
              >
                <option value="">Select Taluk...</option>
                {taluks.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 4: LOCAL BODY | WARD / LOCALITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Local Body Field */}
            <div className="space-y-1">
              <label
                htmlFor="location-local-body"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>5. Local Body *</span>
                {isLoadingLocalBodies ? (
                  <span className="inline-flex items-center text-[10px] text-blue-500">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading...
                  </span>
                ) : value.taluk ? (
                  <span className="text-[10px] text-slate-400">
                    {localBodies.length} in {value.taluk}
                  </span>
                ) : null}
              </label>
              <select
                id="location-local-body"
                value={value.localBody}
                onChange={handleLocalBodyChange}
                disabled={disabled || !value.taluk || isLoadingLocalBodies}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
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

            {/* Ward / Locality Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="location-ward"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  6. Ward / Locality
                </label>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">
                  Pending Delimitation
                </span>
              </div>
              <input
                id="location-ward"
                type="text"
                value={value.ward || ''}
                onChange={handleWardChange}
                disabled={disabled || !value.localBody}
                placeholder={
                  !value.localBody ? 'Select Local Body first' : 'e.g. Ward 14 or Locality'
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           MODE 2: ADMINISTRATIVE LOCATION-FIRST (FALLBACK WORKFLOW)
           ROW 1: District | Taluk
           ROW 2: Local Body | Ward / Locality
           ROW 3: Post Office | PIN Code
           ======================================================== */
        <div className="space-y-3.5">
          {/* ROW 1: DISTRICT | TALUK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="fb-district"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>District *</span>
                <span className="text-[10px] text-slate-400">Fixed</span>
              </label>
              <select
                id="fb-district"
                value={value.district || 'Malappuram'}
                onChange={handleDistrictChange}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="Malappuram">Malappuram District</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="fb-taluk"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>Taluk *</span>
                <span className="text-[10px] text-[#035AFC]">7 Taluks</span>
              </label>
              <select
                id="fb-taluk"
                value={value.taluk}
                onChange={handleTalukChange}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none transition-all"
              >
                <option value="">Select Taluk...</option>
                {taluks.map((t) => (
                  <option key={t.code} value={t.name}>
                    {t.name} Taluk
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 2: LOCAL BODY | WARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="fb-localbody"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
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
                id="fb-localbody"
                value={value.localBody}
                onChange={handleLocalBodyChange}
                disabled={disabled || !value.taluk || isLoadingLocalBodies}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
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

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="fb-ward"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Ward / Locality
                </label>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">
                  Pending Delimitation
                </span>
              </div>
              <input
                id="fb-ward"
                type="text"
                value={value.ward || ''}
                onChange={handleWardChange}
                disabled={disabled || !value.localBody}
                placeholder={
                  !value.localBody ? 'Select Local Body first' : 'e.g. Ward 14 or Locality'
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          {/* ROW 3: POST OFFICE | PIN CODE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="fb-post-office"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Building className="h-3.5 w-3.5 text-[#035AFC]" />
                  <span>Post Office *</span>
                </label>
                {postOfficeOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManualPostOffice(!isManualPostOffice)}
                    className="text-[10px] text-[#035AFC] hover:underline"
                  >
                    {isManualPostOffice ? 'Select from list' : 'Type manually'}
                  </button>
                )}
              </div>

              {!isManualPostOffice && postOfficeOptions.length > 0 ? (
                <select
                  id="fb-post-office"
                  value={value.postOffice || ''}
                  onChange={handlePostOfficeSelect}
                  disabled={disabled}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
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
                  <option value="__MANUAL__">&rarr; Enter unlisted Post Office</option>
                </select>
              ) : (
                <input
                  id="fb-post-office"
                  type="text"
                  value={value.postOffice || ''}
                  onChange={handleManualPostOfficeChange}
                  disabled={disabled}
                  placeholder="e.g. Manjeri H.O or Tirur H.O"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10 focus:outline-none disabled:opacity-60 transition-all"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="fb-pin"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <span>PIN Code *</span>
                  {isPinVerified === true && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                      <Check className="h-2.5 w-2.5 mr-0.5" /> Verified
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">6 Digits</span>
              </div>
              <input
                id="fb-pin"
                type="text"
                maxLength={6}
                value={value.pinCode || ''}
                onChange={handlePinCodeChange}
                disabled={disabled}
                placeholder="e.g. 676121"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none disabled:opacity-60 transition-all ${
                  isPinVerified === true
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:border-[#035AFC] focus:ring-2 focus:ring-[#035AFC]/10'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Postal Status & Guidance Feedback */}
      {postalMessage && (
        <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
          <Info className="h-4 w-4 shrink-0 text-amber-500" />
          <span>{postalMessage}</span>
        </div>
      )}

      {/* Verified Location Information Panel */}
      {(value.localBody || value.postOffice || isPinVerified) && (
        <div className="flex items-start gap-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 p-3 text-xs text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-[#035AFC] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {value.localBody ? value.localBody : value.taluk ? `${value.taluk} Taluk` : 'Malappuram District'}
              </span>
              {value.taluk && value.localBody && (
                <span className="text-[11px] text-slate-400">&bull; {value.taluk} Taluk</span>
              )}
              {value.pinCode && (
                <span className="text-[11px] font-mono text-[#035AFC] bg-blue-100/60 dark:bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/40">
                  PIN: {value.pinCode}
                </span>
              )}
              {value.postOffice && (
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  &bull; PO: {value.postOffice}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {value.localBody
                ? 'Administrative Local Body and verified Postal mapping confirmed against the official Malappuram registry.'
                : 'Postal verification active. Please select your administrative Taluk and Local Body to complete location details.'}
            </p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
    </div>
  );
}
