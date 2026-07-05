import Link from "next/link";
import {
  Scissors,
  MapPin,
  Phone,
  EnvelopeSimple,
  InstagramLogo,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { BUSINESS, OPENING_HOURS_LABELS } from "@/lib/business";

export function SiteFooter() {
  return (
    <footer id="kontakt" className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-heading text-lg tracking-wide">
            <Scissors weight="bold" className="size-5 text-primary" aria-hidden />
            SHOWTIME
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Moderner Friseursalon in {BUSINESS.city}. Haarschnitt, Bart &amp; Styling
            – Termin einfach online sichern.
          </p>
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <InstagramLogo className="size-5" aria-hidden />
            Instagram
          </a>
        </div>

        <div>
          <h3 className="font-heading text-sm tracking-wide text-foreground/90">
            KONTAKT
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
                {BUSINESS.addressLine}, {BUSINESS.postalCode} {BUSINESS.city}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
                {BUSINESS.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeSimple className="size-4 shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-foreground">
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm tracking-wide text-foreground/90">
            ÖFFNUNGSZEITEN
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {OPENING_HOURS_LABELS.map((row) => (
              <li key={row.day} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" aria-hidden />
                  {row.day}
                </span>
                <span>{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70 px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <p>
          © {new Date().getFullYear()} Showtime Friseur {BUSINESS.city} ·{" "}
          <Link href="/impressum" className="hover:text-foreground">
            Impressum
          </Link>{" "}
          ·{" "}
          <Link href="/datenschutz" className="hover:text-foreground">
            Datenschutz
          </Link>
        </p>
      </div>
    </footer>
  );
}
