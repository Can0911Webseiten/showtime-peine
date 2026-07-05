import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import {
  BookingWidget,
  type BookingService,
  type StaffOption,
  type CurrentUser,
} from "@/components/booking/booking-widget";
import { BUSINESS } from "@/lib/business";

export function HeroSection({
  services,
  staff,
  currentUser,
}: {
  services: BookingService[];
  staff: StaffOption[];
  currentUser: CurrentUser;
}) {
  return (
    <section
      id="buchen"
      className="relative overflow-hidden border-b border-border/60 pt-16 pb-20 sm:pt-24 sm:pb-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,var(--color-gold-soft),transparent_55%),radial-gradient(circle_at_85%_30%,var(--color-curtain-soft),transparent_45%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
            <Sparkle className="size-3.5" aria-hidden />
            FRISEUR IN {BUSINESS.city.toUpperCase()}
          </span>
          <h1 className="mt-6 font-heading text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            IT&apos;S
            <br />
            <span className="text-primary">SHOWTIME.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Moderner Haarschnitt, präzise Bartpflege und Styling, das sitzt.
            Sichere dir in 60 Sekunden deinen Termin – ganz ohne Anruf.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <BookingWidget services={services} staff={staff} currentUser={currentUser} />
        </Reveal>
      </div>
    </section>
  );
}
