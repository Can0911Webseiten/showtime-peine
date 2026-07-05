"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/dal";
import { StaffSchema, type StaffState } from "@/lib/validations";

const COMBINING_MARKS = new RegExp("\\p{M}", "gu");

function slugifyUsername(name: string) {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 20);
}

async function generateUniqueUsername(name: string) {
  const base = slugifyUsername(name) || "mitarbeiter";
  let candidate = base;
  let suffix = 1;
  while (await db.user.findUnique({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

export async function createStaffMember(
  _state: StaffState,
  formData: FormData
): Promise<StaffState> {
  await requireOwner();

  const validated = StaffSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, password } = validated.data;
  const username = await generateUniqueUsername(name);
  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.create({
    data: { name, username, passwordHash, role: "STAFF" },
  });

  revalidatePath("/owner/mitarbeiter");
  return { username };
}

export async function setStaffActive(formData: FormData) {
  await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const active = formData.get("active") === "true";

  await db.user.update({
    where: { id: staffId },
    data: { active },
  });

  revalidatePath("/owner/mitarbeiter");
}
