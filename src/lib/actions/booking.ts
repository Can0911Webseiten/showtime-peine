"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession, requireOwner } from "@/lib/dal";
import { getAvailableSlots, isWithinOpeningHours, type SlotInfo } from "@/lib/availability";
import { BookingSchema } from "@/lib/validations";

/**
 * Legacy/unassigned bookings (staffId null) can't be tied to a single staff
 * member's calendar, so they conservatively block *every* staff member for
 * that time. New "keine Präferenz" bookings no longer create unassigned rows
 * (see findFreeStaffId below) — they get auto-assigned to a free staff member
 * at booking time — but old rows or a shop with zero staff still rely on this.
 */
function staffAvailabilityFilter(staffId: string | undefined) {
  return staffId ? { OR: [{ staffId }, { staffId: null }] } : {};
}

async function getActiveStaffIds() {
  const staff = await db.user.findMany({
    where: { role: "STAFF", active: true },
    select: { id: true },
  });
  return staff.map((s) => s.id);
}

/**
 * dateStr must be "YYYY-MM-DD" and is interpreted in the server's local timezone.
 *
 * - Specific staff chosen: availability is that staff's own bookings plus any
 *   unassigned legacy bookings.
 * - No preference, staff exist: a slot is available if *at least one* active
 *   staff member is free then (union across staff), so one busy hairdresser
 *   doesn't block the whole shop.
 * - No preference, no staff configured at all: falls back to a single
 *   shop-wide pool (original one-person-shop behavior).
 */
export async function getAvailableSlotsAction(
  serviceId: string,
  dateStr: string,
  staffId?: string
): Promise<SlotInfo[]> {
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  if (staffId) {
    const bookings = await db.appointment.findMany({
      where: {
        status: "BOOKED",
        startsAt: { gte: dayStart, lte: dayEnd },
        ...staffAvailabilityFilter(staffId),
      },
      select: { startsAt: true, endsAt: true },
    });
    return getAvailableSlots(date, service.durationMin, bookings);
  }

  const activeStaffIds = await getActiveStaffIds();
  const allBookings = await db.appointment.findMany({
    where: { status: "BOOKED", startsAt: { gte: dayStart, lte: dayEnd } },
    select: { startsAt: true, endsAt: true, staffId: true },
  });

  if (activeStaffIds.length === 0) {
    return getAvailableSlots(date, service.durationMin, allBookings);
  }

  const legacyUnassigned = allBookings.filter((b) => b.staffId === null);
  const perStaffSlots = activeStaffIds.map((id) => {
    const staffBookings = allBookings
      .filter((b) => b.staffId === id)
      .concat(legacyUnassigned);
    return getAvailableSlots(date, service.durationMin, staffBookings);
  });

  return perStaffSlots[0].map((slot, i) => ({
    time: slot.time,
    available: perStaffSlots.some((staffSlots) => staffSlots[i]?.available),
  }));
}

export async function getActiveStaffAction() {
  return db.user.findMany({
    where: { role: "STAFF", active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

async function isSlotFree(start: Date, end: Date, staffId?: string | null) {
  const overlap = await db.appointment.findFirst({
    where: {
      status: "BOOKED",
      startsAt: { lt: end },
      endsAt: { gt: start },
      ...staffAvailabilityFilter(staffId ?? undefined),
    },
  });
  return !overlap;
}

/** Returns the id of the first active staff member free for this slot, or null if none are. */
async function findFreeStaffId(
  start: Date,
  end: Date,
  staffIds: string[]
): Promise<string | null> {
  const results = await Promise.all(
    staffIds.map(async (id) => ({ id, free: await isSlotFree(start, end, id) }))
  );
  return results.find((r) => r.free)?.id ?? null;
}

export type BookingActionState =
  | { error: string }
  | { fieldErrors: Record<string, string[] | undefined> }
  | undefined;

export async function bookAppointment(
  _state: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const session = await verifySession();

  const validated = BookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId") || undefined,
    startsAt: formData.get("startsAt"),
    phone: formData.get("phone"),
    notes: formData.get("notes") || undefined,
    repeatWeeks: formData.get("repeatWeeks") || 1,
  });

  if (!validated.success) {
    return { fieldErrors: validated.error.flatten().fieldErrors };
  }

  const { serviceId, staffId, startsAt, phone, notes, repeatWeeks } = validated.data;

  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { error: "Diese Leistung ist nicht verfügbar." };
  }

  if (staffId) {
    const staff = await db.user.findUnique({ where: { id: staffId } });
    if (!staff || staff.role !== "STAFF" || !staff.active) {
      return { error: "Dieser Mitarbeiter ist nicht verfügbar." };
    }
  }

  const firstStart = new Date(startsAt);
  if (Number.isNaN(firstStart.getTime()) || firstStart.getTime() < Date.now()) {
    return { error: "Bitte wähle einen gültigen, zukünftigen Termin." };
  }
  if (!isWithinOpeningHours(firstStart, service.durationMin)) {
    return { error: "Dieser Termin liegt außerhalb unserer Öffnungszeiten." };
  }

  const occurrences = Array.from({ length: repeatWeeks }, (_, i) => {
    const start = new Date(firstStart);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start.getTime() + service.durationMin * 60_000);
    return { start, end };
  });

  // No explicit staff chosen: auto-assign each occurrence to whichever active
  // staff member is actually free, instead of leaving it unassigned (which
  // would otherwise look like it blocks every hairdresser's calendar at once).
  const activeStaffIds = staffId ? [] : await getActiveStaffIds();

  async function resolveStaffForOccurrence(
    start: Date,
    end: Date
  ): Promise<{ staffId: string | null } | { full: true }> {
    if (staffId) {
      return (await isSlotFree(start, end, staffId)) ? { staffId } : { full: true };
    }
    if (activeStaffIds.length === 0) {
      return (await isSlotFree(start, end, null)) ? { staffId: null } : { full: true };
    }
    const freeStaffId = await findFreeStaffId(start, end, activeStaffIds);
    return freeStaffId ? { staffId: freeStaffId } : { full: true };
  }

  const firstResolved = await resolveStaffForOccurrence(
    occurrences[0].start,
    occurrences[0].end
  );
  if ("full" in firstResolved) {
    return {
      error:
        activeStaffIds.length > 0
          ? "Zu dieser Zeit ist gerade niemand frei. Bitte wähle eine andere Uhrzeit."
          : "Dieser Termin ist leider gerade vergeben. Bitte wähle eine andere Uhrzeit.",
    };
  }

  const seriesId = repeatWeeks > 1 ? crypto.randomUUID() : null;
  let created = 0;
  let skipped = 0;

  for (const occurrence of occurrences) {
    const withinHours = isWithinOpeningHours(occurrence.start, service.durationMin);
    if (!withinHours) {
      skipped += 1;
      continue;
    }
    const resolved = await resolveStaffForOccurrence(occurrence.start, occurrence.end);
    if ("full" in resolved) {
      skipped += 1;
      continue;
    }
    await db.appointment.create({
      data: {
        startsAt: occurrence.start,
        endsAt: occurrence.end,
        notes,
        phone,
        seriesId,
        customerId: session.userId,
        serviceId: service.id,
        staffId: resolved.staffId,
      },
    });
    created += 1;
  }

  await db.user.update({ where: { id: session.userId }, data: { phone } });

  revalidatePath("/owner");
  revalidatePath("/mitarbeiter");
  revalidatePath("/konto");
  redirect(`/konto?gebucht=1&anzahl=${created}&uebersprungen=${skipped}`);
}

export async function cancelAppointment(formData: FormData) {
  const session = await verifySession();
  const appointmentId = String(formData.get("appointmentId") ?? "");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.customerId !== session.userId) {
    throw new Error("Nicht berechtigt.");
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelledBy: "CUSTOMER" },
  });

  revalidatePath("/owner");
  revalidatePath("/mitarbeiter");
  revalidatePath("/konto");
}

export async function ownerCancelAppointment(formData: FormData) {
  await requireOwner();
  const appointmentId = String(formData.get("appointmentId") ?? "");

  const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new Error("Termin nicht gefunden.");
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelledBy: "OWNER" },
  });

  revalidatePath("/owner");
  revalidatePath("/mitarbeiter");
  revalidatePath("/konto");
}

export async function staffCancelAppointment(formData: FormData) {
  const session = await verifySession();
  if (session.role !== "STAFF") throw new Error("Nicht berechtigt.");
  const appointmentId = String(formData.get("appointmentId") ?? "");

  const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.staffId !== session.userId) {
    throw new Error("Nicht berechtigt.");
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelledBy: "OWNER" },
  });

  revalidatePath("/owner");
  revalidatePath("/mitarbeiter");
  revalidatePath("/konto");
}
