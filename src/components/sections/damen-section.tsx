import Link from "next/link";
import { Camera, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

// Platzhalter-Kacheln – bitte durch echte Damen-Styling-Fotos ersetzen
// (z. B. Lieblingsbilder vom Instagram-Profil @showtime_friseure).
const TILES = Array.from({ length: 4 });

export function DamenSection() {
  return (
    <section id="damen" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary">
            <Sparkle className="size-3.5" aria-hidden />
            FÜR DAMEN
          </span>
          <h2 className="mt-4 font-heading text-3xl tracking-tight sm:text-4xl">
            Schnitt, Farbe &amp; Styling
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Ob neuer Schnitt, Farbauffrischung oder Styling für den besonderen
            Anlass – bei Showtime bekommst du eine Typberatung, die zu dir passt.
          </p>
          <Button nativeButton={false} render={<Link href="/#buchen" />} className="mt-6" size="lg">
            Damentermin buchen
          </Button>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-3">
          {TILES.map((_, i) => (
            <RevealItem key={i}>
              <div className="flex aspect-square items-center justify-center rounded-lg border border-border/70 bg-gradient-to-br from-secondary to-background text-muted-foreground/50">
                <Camera className="size-8" aria-hidden />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
