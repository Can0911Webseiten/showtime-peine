"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { deleteOwnAccount } from "@/lib/actions/account";

export function DeleteAccountButton({ upcomingCount }: { upcomingCount: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteOwnAccount();
      } catch {
        toast.error("Konto konnte nicht gelöscht werden.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Konto löschen
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konto wirklich unwiderruflich löschen?</DialogTitle>
          <DialogDescription>
            Dein Konto sowie alle deine Termine (auch vergangene) werden
            endgültig aus der Datenbank gelöscht. Das kann nicht rückgängig
            gemacht werden.
            {upcomingCount > 0 && (
              <>
                {" "}
                Du hast noch{" "}
                <strong className="text-foreground">
                  {upcomingCount} kommende{upcomingCount > 1 ? "" : "n"} Termin
                  {upcomingCount > 1 ? "e" : ""}
                </strong>{" "}
                – auch diese{upcomingCount > 1 ? "" : "r"} wird dabei gelöscht.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Wird gelöscht…" : "Ja, endgültig löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
