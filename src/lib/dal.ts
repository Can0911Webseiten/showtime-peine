import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  return user;
});

function homeForRole(role: string) {
  if (role === "OWNER") return "/owner";
  if (role === "STAFF") return "/mitarbeiter";
  return "/konto";
}

export const requireOwner = cache(async () => {
  const session = await verifySession();
  if (session.role !== "OWNER") {
    redirect(homeForRole(session.role));
  }
  return session;
});

export const requireStaff = cache(async () => {
  const session = await verifySession();
  if (session.role !== "STAFF") {
    redirect(homeForRole(session.role));
  }
  return session;
});
