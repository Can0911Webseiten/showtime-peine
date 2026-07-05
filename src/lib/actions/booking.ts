"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession, requireOwner } from "@/lib/dal";
import { getAvailableSlots, isWithinOpeningHours, type SlotInfo } from "@/lib/availability";
import { BookingSchema } from "@/lib/validations";

/**
 * dateStr must be "YYYY-MM-DD" and is interpreted in the server's local timezone.
 * When staffId is given, availability is checked only against that staff
 * member's own bookings (independent chairs). Without a staffId, it falls
 * back to a shop-wide single-pool check (conservative, avoids overbooking
 * when the customer has no preference).
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

  const bookings = await db.appointment.findMany({
    where: {
      status: "BOOKED",
      startsAt: { gte: dayStart, lte: dayEnd },
      ...(staffId ? { staffId } : {}),
    },
    select: { startsAt: true, endsAt: true },
  });

  return getAvailableSlots(date, service.durationMin, bookings);
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
      ...(staffId ? { staffId } : {}),
    },
  });
  return !overlap;
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

  if (!(await isSlotFree(occurrences[0].start, occurrences[0].end, staffId))) {
    return {
      error: "Dieser Termin ist leider gerade vergeben. Bitte wähle eine andere Uhrzeit.",
    };
  }

  const seriesId = repeatWeeks > 1 ? crypto.randomUUID() : null;
  let created = 0;
  let skipped = 0;

  for (const occurrence of occurrences) {
    const withinHours = isWithinOpeningHours(occurrence.start, service.durationMin);
    const free =
      withinHours && (await isSlotFree(occurrence.start, occurrence.end, staffId));
    if (!free) {
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
        staffId: staffId ?? null,
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
