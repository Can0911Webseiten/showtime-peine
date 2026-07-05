import Link from "next/link";
import { ArrowLeft, IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import { requireOwner } from "@/lib/dal";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateStaffForm } from "@/components/owner/create-staff-form";
import { StaffToggleButton } from "@/components/owner/staff-toggle-button";

export default async function StaffManagementPage() {
  await requireOwner();

  const staff = await db.user.findMany({
    where: { role: "STAFF" },
    orderBy: { createdAt: "asc" },
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

      <h1 className="mt-4 font-heading text-2xl">Mitarbeiter verwalten</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lege Logins für dein Team an. Jeder Mitarbeiter sieht anschließend nur
        seine eigenen Termine und kann von Kund:innen gezielt gebucht werden.
      </p>

      <Card className="mt-6">
        <CardContent className="p-5">
          <CreateStaffForm />
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="font-heading text-sm tracking-wide text-muted-foreground">
          TEAM
        </h2>
        {staff.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Noch keine Mitarbeiter angelegt.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {staff.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      {member.name}
                      <Badge variant={member.active ? "secondary" : "destructive"}>
                        {member.active ? "Aktiv" : "Deaktiviert"}
                      </Badge>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <IdentificationCard className="size-3.5" aria-hidden />
                      Benutzername: {member.username}
                    </p>
                  </div>
                  <StaffToggleButton staffId={member.id} active={member.active} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
