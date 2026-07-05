"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetUserPassword } from "@/lib/actions/account";

export function ResetPasswordButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      const result = await resetUserPassword(userId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setNewPassword(result.password);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setNewPassword(null);
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Passwort zurücksetzen
      </DialogTrigger>
      <DialogContent>
        {newPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Neues Passwort für {name}</DialogTitle>
              <DialogDescription>
                Gib dieses Passwort an {name} weiter. Es wird nur einmal angezeigt.
              </DialogDescription>
            </DialogHeader>
            <p className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-center font-mono text-lg">
              {newPassword}
            </p>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Fertig</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Passwort für {name} zurücksetzen?</DialogTitle>
              <DialogDescription>
                Das alte Passwort wird sofort ungültig. Du bekommst danach ein neues
                Passwort angezeigt, das du weitergeben kannst.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Abbrechen
              </Button>
              <Button onClick={handleReset} disabled={isPending}>
                {isPending ? "Wird zurückgesetzt…" : "Ja, zurücksetzen"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
