import { redirect } from "next/navigation";
import { CalendarBlank, Clock, Scissors, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLong, formatDuration, formatPrice } from "@/lib/format";
import { BookingConfirmForm } from "@/components/konto/booking-confirm-form";

export default async function NeuerTerminPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string; startsAt?: string; staffId?: string }>;
}) {
  const session = await verifySession();
  const { serviceId, startsAt, staffId } = await searchParams;

  if (!serviceId || !startsAt) {
    redirect("/#buchen");
  }

  const [service, user, staffMember] = await Promise.all([
    db.service.findUnique({ where: { id: serviceId } }),
    db.user.findUnique({ where: { id: session.userId }, select: { phone: true } }),
    staffId ? db.user.findUnique({ where: { id: staffId }, select: { name: true } }) : null,
  ]);
  const start = new Date(startsAt);

  if (!service || Number.isNaN(start.getTime())) {
    redirect("/#buchen");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-16 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Termin bestätigen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="flex items-center gap-2">
              <Scissors className="size-4 text-primary" aria-hidden />
              {service.name} · {formatDuration(service.durationMin)} ·{" "}
              <span className="font-medium text-primary">
                {formatPrice(service.priceCents)}
              </span>
            </p>
            {staffMember && (
              <p className="flex items-center gap-2">
                <UserCircle className="size-4 text-primary" aria-hidden />
                Bei {staffMember.name}
              </p>
            )}
            <p className="flex items-center gap-2">
              <CalendarBlank className="size-4 text-primary" aria-hidden />
              {formatDateLong(start)}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-primary" aria-hidden />
              {start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}{" "}
              Uhr
            </p>
          </div>
          <BookingConfirmForm
            serviceId={service.id}
            staffId={staffId}
            startsAt={startsAt}
            defaultPhone={user?.phone}
          />
        </CardContent>
      </Card>
    </main>
  );
}
