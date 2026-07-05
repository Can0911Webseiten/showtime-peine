import { UserCircle } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

// Platzhalter – bitte durch die echten Team-Mitglieder von Showtime ersetzen.
const TEAM = [
  { role: "Inhaber & Master Barber" },
  { role: "Stylistin" },
  { role: "Barber" },
];

export function TeamSection() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="max-w-xl">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Unser Team
        </h2>
        <p className="mt-3 text-muted-foreground">
          Erfahrene Stylistinnen und Barber mit Gefühl für Details.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3">
        {TEAM.map((member) => (
          <RevealItem key={member.role}>
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <UserCircle className="size-10" aria-hidden />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{member.role}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
