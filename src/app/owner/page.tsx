import Link from "next/link";
import { CalendarBlank, Phone, Scissors, Sparkle, UsersThree, UserCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { requireOwner } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { AutoRefresh } from "@/components/owner/auto-refresh";
import { OwnerCancelButton } from "@/components/owner/owner-cancel-button";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { formatDateLong, formatPrice } from "@/lib/format";

const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000;
const CANCELLED_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export default async function OwnerDashboardPage() {
  await requireOwner();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [upcoming, recentlyCancelled, todayCount] = await Promise.all([
    db.appointment.findMany({
      where: { status: "BOOKED", startsAt: { gte: now } },
      include: { service: true, customer: true, staff: true },
      orderBy: { startsAt: "asc" },
    }),
    db.appointment.findMany({
      where: {
        status: "CANCELLED",
        cancelledAt: { gte: new Date(now.getTime() - CANCELLED_WINDOW_MS) },
      },
      include: { service: true, customer: true, staff: true },
      orderBy: { cancelledAt: "desc" },
    }),
    db.appointment.count({
      where: {
        status: "BOOKED",
        startsAt: { gte: todayStart, lt: todayEnd },
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
      <AutoRefresh />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">Owner-Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Alle Termine im Blick – aktualisiert sich automatisch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/owner/mitarbeiter" />}
            variant="secondary"
            size="sm"
          >
            <UsersThree className="size-4" aria-hidden />
            Mitarbeiter
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/owner/kunden" />}
            variant="secondary"
            size="sm"
          >
            <UserCircle className="size-4" aria-hidden />
            Kunden
          </Button>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Termine heute" value={todayCount} />
        <StatCard label="Kommende Termine" value={upcoming.length} />
        <StatCard label="Stornierungen (7 Tage)" value={recentlyCancelled.length} />
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
          KOMMENDE TERMINE
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aktuell keine anstehenden Termine.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((a) => {
              const isNew = now.getTime() - a.createdAt.getTime() < NEW_THRESHOLD_MS;
              return (
                <Card
                  key={a.id}
                  className={isNew ? "border-primary/60 bg-primary/5" : undefined}
                >
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        <Scissors className="size-4 text-primary" aria-hidden />
                        {a.service.name}
                        {isNew && (
                          <Badge className="gap-1">
                            <Sparkle className="size-3" aria-hidden /> Neu
                          </Badge>
                        )}
                        {a.seriesId && <Badge variant="secondary">Serientermin</Badge>}
                        {a.staff && <Badge variant="outline">Bei {a.staff.name}</Badge>}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarBlank className="size-4" aria-hidden />
                        {formatDateLong(a.startsAt)} ·{" "}
                        {a.startsAt.toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        Uhr · {formatPrice(a.service.priceCents)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.customer.name}
                        <span className="ml-2 inline-flex items-center gap-1 font-medium text-foreground">
                          <Phone className="size-3.5" aria-hidden />
                          <a href={`tel:${a.phone}`} className="hover:text-primary">
                            {a.phone}
                          </a>
                        </span>
                      </p>
                      {a.notes && (
                        <p className="mt-1 text-sm text-muted-foreground italic">
                          „{a.notes}“
                        </p>
                      )}
                    </div>
                    <OwnerCancelButton appointmentId={a.id} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {recentlyCancelled.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
            ZULETZT STORNIERT
          </h2>
          <div className="mt-4 space-y-3">
            {recentlyCancelled.map((a) => (
              <Card key={a.id} className="border-destructive/40 bg-destructive/5">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <XCircle className="size-4 text-destructive" aria-hidden />
                      {a.service.name} – {a.customer.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      War geplant für {formatDateLong(a.startsAt)} ·{" "}
                      {a.cancelledBy === "OWNER" ? "von euch storniert" : "vom Kunden storniert"}
                    </p>
                  </div>
                  <Badge variant="destructive">Storniert</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
          PASSWORT
        </h2>
        <Card className="mt-4">
          <CardContent className="p-5">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-semibold text-primary">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
