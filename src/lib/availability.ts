import {
  OPENING_HOURS,
  SLOT_INTERVAL_MIN,
  MIN_LEAD_TIME_MIN,
} from "@/lib/business";

type Booking = { startsAt: Date; endsAt: Date };

function toMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function dateAtMinutes(base: Date, minutes: number) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

export type SlotInfo = { time: string; available: boolean };

/**
 * Returns every "HH:mm" candidate slot for the given date + service duration,
 * each flagged as available or not (already booked / too soon). Callers that
 * only want free slots can filter on `available`; the booking UI shows every
 * slot so already-taken times render greyed out instead of disappearing.
 */
export function getAvailableSlots(
  date: Date,
  durationMin: number,
  existingBookings: Booking[],
  now: Date = new Date()
): SlotInfo[] {
  const hours = OPENING_HOURS[date.getDay()];
  if (!hours) return [];

  const isToday = date.toDateString() === now.toDateString();
  const earliestMinutesToday = toMinutes(now) + MIN_LEAD_TIME_MIN;

  const slots: SlotInfo[] = [];
  for (
    let start = hours.open;
    start + durationMin <= hours.close;
    start += SLOT_INTERVAL_MIN
  ) {
    if (isToday && start < earliestMinutesToday) continue;

    const slotStart = dateAtMinutes(date, start);
    const slotEnd = dateAtMinutes(date, start + durationMin);

    const overlaps = existingBookings.some(
      (b) => slotStart < b.endsAt && slotEnd > b.startsAt
    );

    const hh = String(Math.floor(start / 60)).padStart(2, "0");
    const mm = String(start % 60).padStart(2, "0");
    slots.push({ time: `${hh}:${mm}`, available: !overlaps });
  }

  return slots;
}

export function isWithinOpeningHours(startsAt: Date, durationMin: number) {
  const hours = OPENING_HOURS[startsAt.getDay()];
  if (!hours) return false;
  const start = toMinutes(startsAt);
  return start >= hours.open && start + durationMin <= hours.close;
}
