"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { changeOwnPassword } from "@/lib/actions/account";
import type { ChangePasswordState } from "@/lib/validations";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(
    changeOwnPassword,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);
  const prevState = useRef(state);

  useEffect(() => {
    if (state !== prevState.current && state?.success) {
      toast.success("Passwort wurde geändert.");
      formRef.current?.reset();
    }
    prevState.current = state;
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.currentPassword && (
          <p className="text-xs text-destructive">{state.errors.currentPassword[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Neues Passwort</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.newPassword && (
          <p className="text-xs text-destructive">{state.errors.newPassword[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
        )}
      </div>
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Wird geändert…" : "Passwort ändern"}
      </Button>
    </form>
  );
}
