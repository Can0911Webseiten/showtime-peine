// Platzhalter-Angaben – bitte durch die echten Daten von Showtime Peine ersetzen.
export const BUSINESS = {
  name: "Showtime",
  city: "Peine",
  region: "Niedersachsen",
  addressLine: "Musterstraße 1",
  postalCode: "31226",
  phone: "+49 5171 000000",
  email: "info@showtime-peine.example",
  instagram: "https://www.instagram.com/showtime_friseure",
  mapsUrl: "https://maps.google.com/?q=Showtime+Friseur+Peine",
};

// Wochentag-Index: 0 = Sonntag ... 6 = Samstag (Date#getDay()).
// Öffnungszeiten in Minuten ab Mitternacht. null = geschlossen.
export const OPENING_HOURS: Record<number, { open: number; close: number } | null> = {
  0: null, // Sonntag
  1: null, // Montag (Ruhetag)
  2: { open: 9 * 60, close: 18 * 60 },
  3: { open: 9 * 60, close: 18 * 60 },
  4: { open: 9 * 60, close: 18 * 60 },
  5: { open: 9 * 60, close: 18 * 60 },
  6: { open: 9 * 60, close: 14 * 60 },
};

export const OPENING_HOURS_LABELS = [
  { day: "Montag", hours: "Ruhetag" },
  { day: "Dienstag – Freitag", hours: "09:00 – 18:00" },
  { day: "Samstag", hours: "09:00 – 14:00" },
  { day: "Sonntag", hours: "geschlossen" },
];

export const SLOT_INTERVAL_MIN = 30;
export const BOOKING_WINDOW_DAYS = 21;
export const MIN_LEAD_TIME_MIN = 60;
