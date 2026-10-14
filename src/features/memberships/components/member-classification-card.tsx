'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Briefcase, Edit3, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import {
  MEMBER_CATEGORIES,
  CURRENT_POSITIONS,
  getMemberCategoryLabel,
  getCurrentPositionLabel,
  type MemberCategoryValue,
  type CurrentPositionValue,
} from '@/features/memberships/constants/member-classifications';

interface MemberClassificationCardProps {
  initialCategory?: MemberCategoryValue | null;
  initialPosition?: CurrentPositionValue | null;
  onSave?: (category: MemberCategoryValue, position: CurrentPositionValue) => Promise<void> | void;
  readOnly?: boolean;
}

export function MemberClassificationCard({
  initialCategory,
  initialPosition,
  onSave,
  readOnly = false,
}: MemberClassificationCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [category, setCategory] = React.useState<MemberCategoryValue | ''>(initialCategory || '');
  const [position, setPosition] = React.useState<CurrentPositionValue | ''>(initialPosition || '');
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const isUnclassified = !category || !position;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !position) return;

    setSaving(true);
    try {
      if (onSave) {
        await onSave(category as MemberCategoryValue, position as CurrentPositionValue);
      }
      setSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setSaving(false);
      alert('Failed to update classification. Please try again.');
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">Official Member Classification</CardTitle>
              {isUnclassified ? (
                <Badge variant="warning" className="text-[10px]">
                  Classification Incomplete
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px]">
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1">
              Independent interest and professional position designations (non-fee based).
            </CardDescription>
          </div>

          {!readOnly && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 text-xs self-start sm:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Classification
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-4">
        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Member classification updated successfully.</span>
          </div>
        )}

        {isUnclassified && !isEditing && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Notice for Historical Records</p>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Your profile was created before the introduction of independent member classification. Please select your Member Category and Current Position to update your records.
              </p>
            </div>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-member-category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Member Category / Interest *
                </label>
                <select
                  id="edit-member-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemberCategoryValue)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  <option value="" disabled>Select category...</option>
                  {MEMBER_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  {MEMBER_CATEGORIES.find((c) => c.value === category)?.description || 'Select your primary interest category'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-current-position" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Position *
                </label>
                <select
                  id="edit-current-position"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value as CurrentPositionValue)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070A10] px-3 py-2 text-xs focus:ring-2 focus:ring-[#035AFC]"
                >
                  <option value="" disabled>Select current position...</option>
                  {CURRENT_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  {CURRENT_POSITIONS.find((p) => p.value === position)?.description || 'Select your current vocational position'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategory(initialCategory || '');
                  setPosition(initialPosition || '');
                  setIsEditing(false);
                }}
                disabled={saving}
                className="h-8 text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving || !category || !position}
                className="h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Award className="h-4 w-4 text-[#035AFC]" />
                <span>Field A: Member Category / Interest</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {getMemberCategoryLabel(category)}
              </div>
              <p className="text-[11px] text-slate-500">
                {category
                  ? MEMBER_CATEGORIES.find((c) => c.value === category)?.description
                  : 'Historical record lacking category assignment'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Briefcase className="h-4 w-4 text-[#FBC206]" />
                <span>Field B: Current Position</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {getCurrentPositionLabel(position)}
              </div>
              <p className="text-[11px] text-slate-500">
                {position
                  ? CURRENT_POSITIONS.find((p) => p.value === position)?.description
                  : 'Historical record lacking current position assignment'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
