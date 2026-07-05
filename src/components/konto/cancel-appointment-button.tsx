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
import { cancelAppointment } from "@/lib/actions/booking";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("appointmentId", appointmentId);
      try {
        await cancelAppointment(formData);
        setOpen(false);
        toast.success("Termin wurde storniert.");
      } catch {
        toast.error("Termin konnte nicht storniert werden.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Termin stornieren
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Termin wirklich stornieren?</DialogTitle>
          <DialogDescription>
            Der Termin wird sofort freigegeben und Showtime wird automatisch
            informiert. Das kannst du nicht rückgängig machen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Wird storniert…" : "Ja, stornieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
