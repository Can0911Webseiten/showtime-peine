import { Scissors } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { formatDuration, formatPrice } from "@/lib/format";
import type { BookingService } from "@/components/booking/booking-widget";

export function ServicesSection({ services }: { services: BookingService[] }) {
  return (
    <section id="leistungen" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="max-w-xl">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Unsere Leistungen
        </h2>
        <p className="mt-3 text-muted-foreground">
          Von präzisem Herrenschnitt bis Komplettpaket – jede Leistung online in
          Sekunden buchbar.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <RevealItem key={service.id}>
            <div className="group h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Scissors className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading text-lg">{service.name}</h3>
              {service.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">
                  {formatDuration(service.durationMin)}
                </span>
                <span className="font-medium text-primary">
                  {formatPrice(service.priceCents)}
                </span>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
