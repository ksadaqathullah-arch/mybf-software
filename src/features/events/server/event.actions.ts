'use server';

import { getCurrentActor } from '@/server/auth/session';
import { EventService } from './event.service';
import {
  CreateEventInput,
  RegisterEventInput,
  CheckInAttendeeInput,
  createEventSchema,
  registerEventSchema,
  checkInAttendeeSchema,
} from '../schemas/event.schema';
import { revalidatePath } from 'next/cache';

export async function createEventAction(input: CreateEventInput) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid event input data.' };
  }

  try {
    const event = await EventService.createEvent(actor, parsed.data);
    revalidatePath('/events');
    revalidatePath('/super-admin/events');
    revalidatePath('/district-admin/events');
    return { success: true, event };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create event.' };
  }
}

export async function updateEventAction(eventId: string, input: Partial<CreateEventInput>) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  try {
    const updated = await EventService.updateEvent(actor, eventId, input);
    revalidatePath('/events');
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath('/super-admin/events');
    revalidatePath('/district-admin/events');
    return { success: true, event: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update event.' };
  }
}

export async function setEventStatusAction(eventId: string, status: string, reason?: string) {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  try {
    const updated = await EventService.setEventStatus(actor, eventId, status, reason);
    revalidatePath('/events');
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath('/super-admin/events');
    revalidatePath('/district-admin/events');
    return { success: true, event: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update event status.' };
  }
}

export async function registerForEventAction(input: RegisterEventInput) {
  const actor = await getCurrentActor();

  const parsed = registerEventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid registration input.' };
  }

  const targetUserId = actor?.userId || parsed.data.userId;
  if (!targetUserId) {
    return { success: false, error: 'Authentication required to book event tickets.' };
  }

  try {
    const registration = await EventService.registerForEvent({
      ...parsed.data,
      userId: targetUserId,
    });
    revalidatePath('/events');
    revalidatePath('/member');
    return { success: true, registration };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register for event.' };
  }
}

export async function checkInAttendeeAction(eventId: string, qrToken: string): Promise<
  | {
      success: true;
      alreadyCheckedIn: boolean;
      scannedAt: string;
      attendeeName: string;
      ticketTier?: string | null;
      message: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const actor = await getCurrentActor();
  if (!actor) {
    return { success: false, error: 'Unauthorized: Authentication required to scan tickets.' };
  }

  const parsed = checkInAttendeeSchema.safeParse({ eventId, qrToken });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid scan payload.' };
  }

  try {
    const result = await EventService.checkInAttendee(actor, parsed.data);
    return {
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      scannedAt: result.scannedAt,
      attendeeName: result.attendeeName,
      ticketTier: result.ticketTier,
      message: result.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to check in attendee.' };
  }
}
