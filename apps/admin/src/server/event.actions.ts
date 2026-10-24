'use server';

import { getCurrentActor } from './auth';
import { EventService } from './event.service';
import {
  CreateEventInput,
  createEventSchema,
  checkInAttendeeSchema,
} from './event.schema';
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
    return { success: true, event: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update event status.' };
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
