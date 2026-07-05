"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login } from "@/lib/actions/auth";
import type { LoginState } from "@/lib/validations";

export function LoginForm({
  next,
  submitLabel = "Anmelden",
  pendingLabel = "Wird angemeldet…",
}: {
  next?: string;
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-1.5">
        <Label htmlFor="login-identifier">E-Mail oder Benutzername</Label>
        <Input id="login-identifier" name="identifier" type="text" autoComplete="username" required />
        {state?.errors?.identifier && (
          <p className="text-xs text-destructive">{state.errors.identifier[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Passwort</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.password && (
          <p className="text-xs text-destructive">{state.errors.password[0]}</p>
        )}
      </div>
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
