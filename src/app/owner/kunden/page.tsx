import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, Phone } from "@phosphor-icons/react/dist/ssr";
import { requireOwner } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordButton } from "@/components/owner/reset-password-button";

export default async function CustomersPage() {
  await requireOwner();

  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appointments: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Zurück zum Dashboard
      </Link>

      <h1 className="mt-4 font-heading text-2xl">Kunden</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Alle registrierten Kund:innen. Ruft jemand an, weil er sein Passwort
        vergessen hat, kannst du es hier zurücksetzen.
      </p>

      {customers.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Noch keine Kund:innen registriert.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <EnvelopeSimple className="size-3.5" aria-hidden />
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" aria-hidden />
                        {customer.phone}
                      </span>
                    )}
                    <span>{customer._count.appointments} Termin(e)</span>
                  </p>
                </div>
                <ResetPasswordButton userId={customer.id} name={customer.name} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
