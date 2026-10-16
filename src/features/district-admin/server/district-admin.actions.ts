'use server';

import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from './district-admin.service';
import { revalidatePath } from 'next/cache';

export async function submitDistrictReviewNoteAction(applicationId: string, notes: string) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  try {
    await DistrictAdminService.recordDistrictReviewNote(actor, applicationId, notes);
    revalidatePath('/district-admin/applications');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to record review note.' };
  }
}
