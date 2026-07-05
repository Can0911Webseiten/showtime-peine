"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bookAppointment, type BookingActionState } from "@/lib/actions/booking";

export function BookingConfirmForm({
  serviceId,
  staffId,
  startsAt,
  defaultPhone,
  onBack,
}: {
  serviceId: string;
  staffId?: string | null;
  startsAt: string;
  defaultPhone?: string | null;
  onBack?: () => void;
}) {
  const [state, action, pending] = useActionState<BookingActionState, FormData>(
    bookAppointment,
    undefined
  );

  const fieldErrors = state && "fieldErrors" in state ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {staffId && <input type="hidden" name="staffId" value={staffId} />}
      <input type="hidden" name="startsAt" value={startsAt} />

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefonnummer *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          defaultValue={defaultPhone ?? ""}
          placeholder="z. B. 0151 23456789"
        />
        <p className="text-xs text-muted-foreground">
          Damit Showtime dich bei Rückfragen kurzfristig erreichen kann.
        </p>
        {fieldErrors?.phone && (
          <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="repeatWeeks">Wiederholen</Label>
        <Select name="repeatWeeks" defaultValue="1">
          <SelectTrigger id="repeatWeeks" className="w-full">
            <SelectValue placeholder="Einmalig" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Einmalig</SelectItem>
            <SelectItem value="4">Jede Woche, 4 Wochen lang</SelectItem>
            <SelectItem value="8">Jede Woche, 8 Wochen lang</SelectItem>
            <SelectItem value="12">Jede Woche, 12 Wochen lang</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Praktisch für feste Termine, z. B. jeden Mittwoch zur gleichen Uhrzeit.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anmerkungen (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="z. B. Wunschfrisur, besondere Hinweise…"
          rows={2}
        />
      </div>

      {state && "error" in state && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
            Zurück
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Wird gebucht…" : "Termin verbindlich buchen"}
        </Button>
      </div>
    </form>
  );
}
