import * as z from "zod";

export const PasswordSchema = z
  .string()
  .min(8, { error: "Das Passwort muss mindestens 8 Zeichen haben." })
  .regex(/[a-zA-Z]/, { error: "Das Passwort braucht mindestens einen Buchstaben." })
  .regex(/[0-9]/, { error: "Das Passwort braucht mindestens eine Zahl." });

export const SignupSchema = z.object({
  name: z.string().trim().min(2, { error: "Bitte gib deinen Namen ein." }),
  email: z.email({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }).trim(),
  phone: z.string().trim().optional(),
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { error: "Bitte gib deine E-Mail oder deinen Benutzernamen ein." }),
  password: z.string().min(1, { error: "Bitte gib dein Passwort ein." }),
});

export const PHONE_REGEX = /^[0-9+][0-9+\s/-]{5,}$/;

export const REPEAT_WEEKS_OPTIONS = [1, 4, 8, 12] as const;

export const BookingSchema = z.object({
  serviceId: z.string().min(1, { error: "Bitte wähle eine Leistung." }),
  staffId: z.string().trim().optional(),
  startsAt: z.string().min(1, { error: "Bitte wähle Datum und Uhrzeit." }),
  phone: z
    .string()
    .trim()
    .min(6, { error: "Bitte gib eine Telefonnummer an, unter der wir dich erreichen können." })
    .regex(PHONE_REGEX, { error: "Bitte gib eine gültige Telefonnummer an." }),
  notes: z.string().trim().max(500).optional(),
  repeatWeeks: z.coerce
    .number()
    .refine((n) => (REPEAT_WEEKS_OPTIONS as readonly number[]).includes(n), {
      error: "Ungültige Wiederholung.",
    })
    .default(1),
});

export const StaffSchema = z.object({
  name: z.string().trim().min(2, { error: "Bitte gib einen Namen ein." }),
  password: PasswordSchema,
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Bitte gib dein aktuelles Passwort ein." }),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, { error: "Bitte bestätige das neue Passwort." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export type StaffState =
  | {
      errors?: { name?: string[]; password?: string[] };
      message?: string;
      username?: string;
    }
  | undefined;

export type SignupState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type ChangePasswordState =
  | {
      errors?: {
        currentPassword?: string[];
        newPassword?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type LoginState =
  | {
      errors?: {
        identifier?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
