"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { de } from "date-fns/locale";
import { CalendarBlank, Check, Scissors, UserCircle } from "@phosphor-icons/react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateLong, formatDuration, formatPrice, toDateKey } from "@/lib/format";
import { getAvailableSlotsAction } from "@/lib/actions/booking";
import { OPENING_HOURS, BOOKING_WINDOW_DAYS } from "@/lib/business";
import { ConfirmStep } from "@/components/booking/confirm-step";
import type { SlotInfo } from "@/lib/availability";

export type BookingService = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
};

export type StaffOption = { id: string; name: string };

export type CurrentUser =
  | { id: string; role: "CUSTOMER" | "OWNER" | "STAFF"; phone: string | null }
  | null;

type Step = 1 | 2 | 3 | 4;

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function BookingWidget({
  services,
  staff,
  currentUser,
}: {
  services: BookingService[];
  staff: StaffOption[];
  currentUser: CurrentUser;
}) {
  const hasStaff = staff.length > 0;
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotInfo[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );
  const selectedStaff = useMemo(
    () => staff.find((s) => s.id === staffId) ?? null,
    [staff, staffId]
  );

  useEffect(() => {
    if (!serviceId || !date) return;
    startTransition(async () => {
      const result = await getAvailableSlotsAction(
        serviceId,
        toDateKey(date),
        staffId ?? undefined
      );
      setSlots(result);
    });
  }, [serviceId, staffId, date]);

  function selectService(id: string) {
    setServiceId(id);
    setTime(null);
    setSlots(null);
  }

  function selectStaff(id: string | null) {
    setStaffId(id);
    setTime(null);
    setSlots(null);
  }

  function selectDate(d: Date | undefined) {
    setDate(d);
    setTime(null);
    setSlots(null);
  }

  function goToDateStep() {
    setStep(hasStaff ? 2 : 3);
  }

  const minDate = todayStart();
  const maxDate = new Date(minDate);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);

  const startsAt = date && time ? `${toDateKey(date)}T${time}:00` : null;

  return (
    <Card className="w-full max-w-xl border-border/80 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur">
      <CardContent className="p-5 sm:p-7">
        <Stepper step={step} hasStaff={hasStaff} />

        {step === 1 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-heading text-sm tracking-wide text-muted-foreground">
              1. LEISTUNG WÄHLEN
            </h3>
            <div className="grid gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectService(s.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    serviceId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent/40"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Scissors className="size-4 text-primary" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDuration(s.durationMin)}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {formatPrice(s.priceCents)}
                  </span>
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" disabled={!serviceId} onClick={goToDateStep}>
              Weiter
            </Button>
          </div>
        )}

        {step === 2 && hasStaff && (
          <div className="mt-6 space-y-3">
            <h3 className="font-heading text-sm tracking-wide text-muted-foreground">
              2. BEI WEM?
            </h3>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => selectStaff(null)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  staffId === null
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/40"
                )}
              >
                <UserCircle className="size-5 text-primary" aria-hidden />
                <span className="text-sm font-medium">Keine Präferenz</span>
              </button>
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectStaff(s.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    staffId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent/40"
                  )}
                >
                  <UserCircle className="size-5 text-primary" aria-hidden />
                  <span className="text-sm font-medium">{s.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Zurück
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Weiter
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-heading text-sm tracking-wide text-muted-foreground">
              {hasStaff ? "3." : "2."} DATUM &amp; UHRZEIT
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Calendar
                mode="single"
                locale={de}
                selected={date}
                onSelect={selectDate}
                startMonth={minDate}
                endMonth={maxDate}
                disabled={(d) =>
                  d < minDate || d > maxDate || !OPENING_HOURS[d.getDay()]
                }
                className="rounded-lg border border-border p-2"
              />
              <div className="flex-1">
                {!date && (
                  <p className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Bitte wähle zuerst ein Datum.
                  </p>
                )}
                {date && isPending && (
                  <p className="text-sm text-muted-foreground">Verfügbare Zeiten werden geladen…</p>
                )}
                {date && !isPending && slots && slots.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    An diesem Tag bieten wir keine Termine an.
                  </p>
                )}
                {date && !isPending && slots && slots.length > 0 && slots.every((s) => !s.available) && (
                  <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    An diesem Tag sind leider schon alle Termine vergeben.
                  </p>
                )}
                {date && !isPending && slots && slots.some((s) => s.available) && (
                  <>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {formatDateLong(date)}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          title={slot.available ? undefined : "Bereits vergeben"}
                          onClick={() => setTime(slot.time)}
                          className={cn(
                            "rounded-md border px-2 py-2 text-sm transition-colors",
                            !slot.available &&
                              "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through opacity-50",
                            slot.available &&
                              time === slot.time &&
                              "border-primary bg-primary text-primary-foreground",
                            slot.available &&
                              time !== slot.time &&
                              "border-border hover:border-primary/50 hover:bg-accent/40"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(hasStaff ? 2 : 1)}>
                Zurück
              </Button>
              <Button className="flex-1" disabled={!time} onClick={() => setStep(4)}>
                Weiter
              </Button>
            </div>
          </div>
        )}

        {step === 4 && service && date && time && startsAt && (
          <ConfirmStep
            service={service}
            staffName={selectedStaff?.name ?? null}
            staffId={staffId}
            date={date}
            time={time}
            startsAt={startsAt}
            currentUser={currentUser}
            onBack={() => setStep(3)}
          />
        )}
      </CardContent>
    </Card>
  );
}

function Stepper({ step, hasStaff }: { step: Step; hasStaff: boolean }) {
  const items = hasStaff
    ? [
        { n: 1, label: "Leistung", icon: Scissors },
        { n: 2, label: "Mitarbeiter", icon: UserCircle },
        { n: 3, label: "Termin", icon: CalendarBlank },
        { n: 4, label: "Bestätigen", icon: Check },
      ]
    : [
        { n: 1, label: "Leistung", icon: Scissors },
        { n: 3, label: "Termin", icon: CalendarBlank },
        { n: 4, label: "Bestätigen", icon: Check },
      ];
  return (
    <div className="flex items-center gap-2">
      {items.map((item, idx) => (
        <div key={item.n} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
              step >= item.n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            )}
          >
            {step > item.n ? <Check className="size-4" aria-hidden /> : idx + 1}
          </div>
          <span
            className={cn(
              "hidden text-xs sm:inline",
              step >= item.n ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </span>
          {idx < items.length - 1 && (
            <div className="mx-1 h-px flex-1 bg-border" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
