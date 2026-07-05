import { Camera } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

// Platzhalter-Kacheln – bitte durch echte Salon-/Arbeitsfotos ersetzen.
const TILES = Array.from({ length: 6 });

export function GallerySection() {
  return (
    <section id="galerie" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-xl">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Galerie
          </h2>
          <p className="mt-3 text-muted-foreground">
            Ein Einblick in unseren Salon und unsere Arbeit.
          </p>
        </Reveal>

        <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
