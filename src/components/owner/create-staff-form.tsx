"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createStaffMember } from "@/lib/actions/staff";
import type { StaffState } from "@/lib/validations";

export function CreateStaffForm() {
  const [state, action, pending] = useActionState<StaffState, FormData>(
    createStaffMember,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef(state);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);

  useEffect(() => {
    if (state !== successRef.current && state?.username) {
      toast.success("Mitarbeiter-Login wurde erstellt.");
      setCreatedUsername(state.username);
      formRef.current?.reset();
    }
    successRef.current = state;
  }, [state]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="staff-name">Name</Label>
          <Input id="staff-name" name="name" required />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-password">Passwort</Label>
          <Input id="staff-password" name="password" type="password" required />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Wird erstellt…" : "Mitarbeiter anlegen"}
        </Button>
        {state?.message && (
          <Alert variant="destructive" className="sm:col-span-3">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </form>

      {createdUsername && (
        <Alert className="border-primary/40">
          <AlertDescription>
            Login angelegt! Benutzername: <strong>{createdUsername}</strong> – gib
            diesen zusammen mit dem gewählten Passwort an den Mitarbeiter weiter
            (kein E-Mail-Konto nötig).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
