import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BUSINESS } from "@/lib/business";

export function CtaSection() {
  return (
    <section className="border-t border-border/60 bg-primary/10">
      <Reveal className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Bereit für deinen nächsten Look?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Sichere dir jetzt deinen Termin bei Showtime in {BUSINESS.city} – online,
          ohne Wartezeit am Telefon.
        </p>
        <Button nativeButton={false} render={<Link href="/#buchen" />} size="lg" className="mt-6">
          Jetzt Termin buchen
        </Button>
      </Reveal>
    </section>
  );
}
