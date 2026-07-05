import { CalendarBlank, Phone, Scissors } from "@phosphor-icons/react/dist/ssr";
import { requireStaff } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { AutoRefresh } from "@/components/owner/auto-refresh";
import { StaffCancelButton } from "@/components/owner/staff-cancel-button";
import { formatDateLong, formatPrice } from "@/lib/format";

export default async function StaffDashboardPage() {
  const session = await requireStaff();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [me, upcoming, todayCount] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.appointment.findMany({
      where: { staffId: session.userId, status: "BOOKED", startsAt: { gte: now } },
      include: { service: true, customer: true },
      orderBy: { startsAt: "asc" },
    }),
    db.appointment.count({
      where: {
        staffId: session.userId,
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
          <h1 className="font-heading text-2xl">Hallo, {me?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Deine Termine im Blick – aktualisiert sich automatisch.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-primary">{todayCount}</p>
            <p className="text-sm text-muted-foreground">Termine heute</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold text-primary">{upcoming.length}</p>
            <p className="text-sm text-muted-foreground">Kommende Termine</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
          DEINE KOMMENDEN TERMINE
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aktuell keine anstehenden Termine.
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
                      {a.seriesId && <Badge variant="secondary">Serientermin</Badge>}
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
                  <StaffCancelButton appointmentId={a.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
