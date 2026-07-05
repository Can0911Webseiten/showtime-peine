"use client";

import { CalendarBlank, Clock, Scissors, UserCircle, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateLong, formatDuration, formatPrice } from "@/lib/format";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { BookingConfirmForm } from "@/components/konto/booking-confirm-form";
import type { BookingService, CurrentUser } from "@/components/booking/booking-widget";

export function ConfirmStep({
  service,
  staffId,
  staffName,
  date,
  time,
  startsAt,
  currentUser,
  onBack,
}: {
  service: BookingService;
  staffId: string | null;
  staffName: string | null;
  date: Date;
  time: string;
  startsAt: string;
  currentUser: CurrentUser;
  onBack: () => void;
}) {
  const nextUrl = `/konto/termin/neu?serviceId=${service.id}&startsAt=${encodeURIComponent(startsAt)}${
    staffId ? `&staffId=${staffId}` : ""
  }`;

  return (
    <div className="mt-6 space-y-5">
      <h3 className="font-heading text-sm tracking-wide text-muted-foreground">
        BESTÄTIGEN
      </h3>

      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <p className="flex items-center gap-2">
          <Scissors className="size-4 text-primary" aria-hidden />
          {service.name} · {formatDuration(service.durationMin)} ·{" "}
          <span className="font-medium text-primary">{formatPrice(service.priceCents)}</span>
        </p>
        {staffName && (
          <p className="flex items-center gap-2">
            <UserCircle className="size-4 text-primary" aria-hidden />
            Bei {staffName}
          </p>
        )}
        <p className="flex items-center gap-2">
          <CalendarBlank className="size-4 text-primary" aria-hidden />
          {formatDateLong(date)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 text-primary" aria-hidden />
          {time} Uhr
        </p>
      </div>

      {currentUser && currentUser.role !== "CUSTOMER" && (
        <Alert>
          <Warning className="size-4" aria-hidden />
          <AlertDescription>
            Du bist als {currentUser.role === "OWNER" ? "Inhaber" : "Mitarbeiter"}{" "}
            angemeldet. Termine für Kund:innen bitte über das Dashboard verwalten –
            das öffentliche Buchungsformular ist für Kundenkonten gedacht.
          </AlertDescription>
        </Alert>
      )}

      {currentUser?.role === "CUSTOMER" && (
        <BookingConfirmForm
          serviceId={service.id}
          staffId={staffId}
          startsAt={startsAt}
          defaultPhone={currentUser.phone}
          onBack={onBack}
        />
      )}

      {!currentUser && <GuestAuthTabs nextUrl={nextUrl} onBack={onBack} />}
    </div>
  );
}

function GuestAuthTabs({ nextUrl, onBack }: { nextUrl: string; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Fast fertig! Melde dich an oder registriere dich kurz, um den Termin
        verbindlich zu sichern.
      </p>
      <Tabs defaultValue="register">
        <TabsList className="w-full">
          <TabsTrigger value="register" className="flex-1">
            Neu hier
          </TabsTrigger>
          <TabsTrigger value="login" className="flex-1">
            Ich habe schon ein Konto
          </TabsTrigger>
        </TabsList>
        <TabsContent value="register" className="mt-4">
          <SignupForm next={nextUrl} submitLabel="Registrieren & Termin sichern" />
        </TabsContent>
        <TabsContent value="login" className="mt-4">
          <LoginForm next={nextUrl} submitLabel="Anmelden & Termin sichern" />
        </TabsContent>
      </Tabs>
      <Button type="button" variant="ghost" onClick={onBack}>
        Zurück
      </Button>
    </div>
  );
}
