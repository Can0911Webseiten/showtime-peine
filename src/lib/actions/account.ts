"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession, requireOwner } from "@/lib/dal";
import { ChangePasswordSchema, type ChangePasswordState } from "@/lib/validations";

export async function changeOwnPassword(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await verifySession();

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { message: "Konto nicht gefunden." };
  }

  const currentMatches = await bcrypt.compare(
    validated.data.currentPassword,
    user.passwordHash
  );
  if (!currentMatches) {
    return { message: "Das aktuelle Passwort ist falsch." };
  }

  const passwordHash = await bcrypt.hash(validated.data.newPassword, 10);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

const PASSWORD_CHARS =
  "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomPassword(length = 10) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
  }
  return result;
}

export async function resetUserPassword(userId: string): Promise<
  { password: string } | { error: string }
> {
  await requireOwner();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "OWNER") {
    return { error: "Dieses Konto kann nicht zurückgesetzt werden." };
  }

  const newPassword = generateRandomPassword();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/owner/mitarbeiter");
  revalidatePath("/owner/kunden");
  return { password: newPassword };
}
