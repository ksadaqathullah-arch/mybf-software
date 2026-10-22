'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Target,
  Palette,
  Users2,
  Edit3,
  CheckCircle2,
  Check,
  Save,
  X,
  Lock,
  Compass,
} from 'lucide-react';
import {
  EXPECTATION_OPTIONS,
  TALENT_CATEGORIES,
  PARTICIPATION_PREFERENCES,
  getExpectationLabel,
  getTalentLabel,
  getParticipationPreferenceLabel,
} from '../constants/youth-discovery';

export interface YouthDiscoveryData {
  expectations: string[];
  otherExpectationText?: string;
  futureGoal?: string;
  talents: string[];
  otherTalentDescription?: string;
  participationPreferences: string[];
}

interface YouthDiscoveryCardProps {
  initialData: YouthDiscoveryData;
  onSave?: (data: YouthDiscoveryData) => Promise<void> | void;
  readOnly?: boolean;
}

export function YouthDiscoveryCard({
  initialData,
  onSave,
  readOnly = false,
}: YouthDiscoveryCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [data, setData] = React.useState<YouthDiscoveryData>(initialData);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const toggleItem = (field: 'expectations' | 'talents' | 'participationPreferences', key: string) => {
    setData((prev) => {
      const current = prev[field];
      const exists = current.includes(key);
      const updated = exists ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (data.expectations.length === 0) {
      setErrorMsg('Please select at least one expectation from MYBF.');
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave(data);
      }
      setSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setSaving(false);
      setErrorMsg('Failed to update youth discovery preferences. Please try again.');
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#035AFC]" />
              <CardTitle className="text-base font-bold">
                Youth Expectations, Talents & Participation
              </CardTitle>
              <Badge variant="primary" className="text-[10px]">
                Talent Discovery
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Your community objectives, extracurricular interests, and preferred ways to collaborate.
            </CardDescription>
          </div>

          {!readOnly && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 text-xs self-start sm:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile Details
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-5">
        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Youth expectations and talents updated successfully.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {!isEditing ? (
          /* READ-ONLY VIEW */
          <div className="space-y-4">
            {/* Expectations */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Target className="h-3 w-3 text-[#035AFC]" />
                Expectations from MYBF ({data.expectations.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.expectations.length > 0 ? (
                  data.expectations.map((exp) => (
                    <Badge key={exp} variant="primary" className="text-xs py-0.5 px-2.5">
                      {getExpectationLabel(exp)}
                      {exp === 'OTHER' && data.otherExpectationText && ` (${data.otherExpectationText})`}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No expectations selected.</span>
                )}
              </div>
            </div>

            {/* 3-Year Future Goal */}
            {data.futureGoal && (
              <div className="p-4 border-2 border-ink bg-paper shadow-[3px_3px_0px_#14161c] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue">
                  <Sparkles className="h-3.5 w-3.5" />
                  3-Year Vision & Goal
                </div>
                <p className="font-serif italic text-sm text-ink leading-relaxed">
                  &ldquo;{data.futureGoal}&rdquo;
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-ink/60 pt-1">
                  <Lock className="h-3 w-3 text-ink/60" />
                  <span>Private to chapter mentoring leadership</span>
                </div>
              </div>
            )}

            {/* Talents & Extracurriculars */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-ink/60 flex items-center gap-1">
                <Palette className="h-3 w-3 text-blue" />
                Extracurricular Skills & Talents ({data.talents.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.talents.length > 0 ? (
                  data.talents.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs py-0.5 px-2.5 font-mono">
                      {getTalentLabel(t)}
                      {t === 'OTHER_TALENT' && data.otherTalentDescription && ` (${data.otherTalentDescription})`}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs font-serif italic text-ink/60">No specific talents logged.</span>
                )}
              </div>
            </div>

            {/* Participation Preferences */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-ink/60 flex items-center gap-1">
                <Users2 className="h-3 w-3 text-blue" />
                Participation Preferences ({data.participationPreferences.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.participationPreferences.length > 0 ? (
                  data.participationPreferences.map((p) => (
                    <span
                      key={p}
                      className="text-xs border-2 border-ink bg-paper text-ink font-mono font-bold px-2.5 py-1 shadow-[2px_2px_0px_#14161c]"
                    >
                      {getParticipationPreferenceLabel(p)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-serif italic text-ink/60">No participation preferences set.</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EDITING FORM */
          <form onSubmit={handleSave} className="space-y-5">
            {/* Expectations Edit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  What Do You Expect from MYBF? *
                </label>
                <span className="text-[10px] text-slate-400">
                  {data.expectations.length} Selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border rounded-lg dark:border-slate-800">
                {EXPECTATION_OPTIONS.map((exp) => {
                  const isSelected = data.expectations.includes(exp.key);
                  return (
                    <button
                      key={exp.key}
                      type="button"
                      onClick={() => toggleItem('expectations', exp.key)}
                      className={`text-left p-2 rounded-md border text-xs flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#035AFC] bg-[#035AFC]/10 font-semibold text-[#035AFC]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-[#035AFC] border-[#035AFC] text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <span className="truncate">{exp.label}</span>
                    </button>
                  );
                })}
              </div>

              {data.expectations.includes('OTHER') && (
                <input
                  type="text"
                  value={data.otherExpectationText || ''}
                  onChange={(e) => setData({ ...data, otherExpectationText: e.target.value })}
                  placeholder="Specify other expectation"
                  className="w-full rounded-md border px-3 py-1.5 text-xs bg-white dark:bg-[#070A10]"
                />
              )}
            </div>

            {/* 3-Year Future Goal Edit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  3-Year Vision & Biggest Goal (Optional)
                </label>
                <span className="text-[10px] text-slate-400">
                  {(data.futureGoal || '').length} / 500
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                value={data.futureGoal || ''}
                onChange={(e) => setData({ ...data, futureGoal: e.target.value })}
                placeholder="Share your entrepreneurial, career, or leadership vision for the next 3 years..."
                className="w-full rounded-md border px-3 py-1.5 text-xs bg-white dark:bg-[#070A10]"
              />
            </div>

            {/* Talents Edit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Skills & Talents (Optional)
              </label>
              <div className="space-y-2">
                {TALENT_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {cat.title}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cat.options.map((t) => {
                        const isSelected = data.talents.includes(t.key);
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => toggleItem('talents', t.key)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              isSelected
                                ? 'bg-[#035AFC] text-white border-[#035AFC]'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isSelected && <Check className="h-2.5 w-2.5 inline mr-1" />}
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participation Preferences Edit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                How Would You Like to Participate in MYBF?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PARTICIPATION_PREFERENCES.map((pref) => {
                  const isSelected = data.participationPreferences.includes(pref.key);
                  return (
                    <button
                      key={pref.key}
                      type="button"
                      onClick={() => toggleItem('participationPreferences', pref.key)}
                      className={`text-left p-2 rounded border text-xs flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#035AFC] bg-[#035AFC]/10 font-semibold text-[#035AFC]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`h-3.5 w-3.5 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-[#035AFC] border-[#035AFC] text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <span className="truncate">{pref.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setData(initialData);
                  setIsEditing(false);
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
