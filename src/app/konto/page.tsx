import Link from "next/link";
import { CalendarBlank, CheckCircle, Scissors, XCircle } from "@phosphor-icons/react/dist/ssr";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateLong, formatDuration, formatPrice } from "@/lib/format";
import { CancelAppointmentButton } from "@/components/konto/cancel-appointment-button";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function KontoPage({
  searchParams,
}: {
  searchParams: Promise<{ gebucht?: string; anzahl?: string; uebersprungen?: string }>;
}) {
  const session = await verifySession();
  const { gebucht, anzahl, uebersprungen } = await searchParams;
  const bookedCount = Number(anzahl ?? "1") || 1;
  const skippedCount = Number(uebersprungen ?? "0") || 0;

  const [user, appointments] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId } }),
    db.appointment.findMany({
      where: { customerId: session.userId },
      include: { service: true },
      orderBy: { startsAt: "desc" },
    }),
  ]);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => a.status === "BOOKED" && a.startsAt >= now
  );
  const past = appointments.filter(
    (a) => a.status === "CANCELLED" || a.startsAt < now
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Mein Konto</h1>
          <p className="text-sm text-muted-foreground">
            Willkommen zurück, {user?.name}.
          </p>
        </div>
        <LogoutButton />
      </div>

      {gebucht === "1" && (
        <Alert className="mt-6 border-primary/40">
          <CheckCircle className="size-4 text-primary" aria-hidden />
          <AlertDescription>
            {bookedCount > 1
              ? `${bookedCount} Termine deiner Serie wurden erfolgreich gebucht.`
              : "Dein Termin wurde erfolgreich gebucht."}{" "}
            Showtime wurde informiert.
            {skippedCount > 0 &&
              ` ${skippedCount} Termin${skippedCount > 1 ? "e" : ""} der Serie waren bereits vergeben und wurden übersprungen.`}
          </AlertDescription>
        </Alert>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
            KOMMENDE TERMINE
          </h2>
          <Button nativeButton={false} render={<Link href="/#buchen" />} size="sm" variant="secondary">
            Neuen Termin buchen
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Du hast aktuell keine anstehenden Termine.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Scissors className="size-4 text-primary" aria-hidden />
                      {a.service.name}
                      {a.seriesId && (
                        <Badge variant="secondary">Serientermin</Badge>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarBlank className="size-4" aria-hidden />
                      {formatDateLong(a.startsAt)} ·{" "}
                      {a.startsAt.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      Uhr · {formatDuration(a.service.durationMin)} ·{" "}
                      {formatPrice(a.service.priceCents)}
                    </p>
                  </div>
                  <CancelAppointmentButton appointmentId={a.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
            VERGANGEN &amp; STORNIERT
          </h2>
          <div className="mt-4 space-y-3">
            {past.map((a) => (
              <Card key={a.id} className="opacity-70">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Scissors className="size-4 text-muted-foreground" aria-hidden />
                      {a.service.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateLong(a.startsAt)}
                      {a.status === "CANCELLED" && a.cancelledBy === "OWNER" && (
                        <span> · vom Salon storniert</span>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={a.status === "CANCELLED" ? "destructive" : "secondary"}
                    className="gap-1"
                  >
                    {a.status === "CANCELLED" ? (
                      <>
                        <XCircle className="size-3.5" aria-hidden /> Storniert
                      </>
                    ) : (
                      "Abgeschlossen"
                    )}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
