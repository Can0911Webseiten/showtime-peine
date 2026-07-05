"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession, type Role } from "@/lib/session";
import { SignupSchema, LoginSchema, type SignupState, type LoginState } from "@/lib/validations";

function safeNext(next: FormDataEntryValue | null): string | null {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function homeForRole(role: Role) {
  if (role === "OWNER") return "/owner";
  if (role === "STAFF") return "/mitarbeiter";
  return "/konto";
}

export async function signup(_state: SignupState, formData: FormData): Promise<SignupState> {
  const validated = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, phone, password } = validated.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Diese E-Mail-Adresse ist bereits registriert." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
  });

  await createSession({ userId: user.id, role: "CUSTOMER" });
  redirect(safeNext(formData.get("next")) ?? "/konto");
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { identifier, password } = validated.data;

  const user =
    (await db.user.findUnique({ where: { email: identifier } })) ??
    (await db.user.findUnique({ where: { username: identifier } }));
  if (!user) {
    return { message: "Zugangsdaten sind falsch." };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { message: "Zugangsdaten sind falsch." };
  }

  if (!user.active) {
    return { message: "Dieses Konto ist deaktiviert." };
  }

  const role = user.role as Role;
  await createSession({ userId: user.id, role });
  const next = safeNext(formData.get("next"));
  redirect(next ?? homeForRole(role));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
