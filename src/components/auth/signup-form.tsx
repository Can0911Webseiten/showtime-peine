"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signup } from "@/lib/actions/auth";
import type { SignupState } from "@/lib/validations";

export function SignupForm({
  next,
  submitLabel = "Registrieren",
  pendingLabel = "Wird erstellt…",
}: {
  next?: string;
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, action, pending] = useActionState<SignupState, FormData>(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" required />
        {state?.errors?.name && (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email">E-Mail</Label>
        <Input id="reg-email" name="email" type="email" autoComplete="email" required />
        {state?.errors?.email && (
          <p className="text-xs text-destructive">{state.errors.email[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon (optional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Passwort</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.password && (
          <ul className="text-xs text-destructive">
            {state.errors.password.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="acceptPrivacy" name="acceptPrivacy" required className="mt-0.5" />
        <Label htmlFor="acceptPrivacy" className="text-xs font-normal text-muted-foreground">
          Ich habe die{" "}
          <Link href="/datenschutz" target="_blank" className="text-primary hover:underline">
            Datenschutzerklärung
          </Link>{" "}
          gelesen und akzeptiere sie.
        </Label>
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
