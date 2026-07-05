import { CalendarCheck, Sparkle, Timer, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Online buchen, jederzeit",
    text: "Kein Anruf nötig – wähle Leistung, Datum und Uhrzeit in wenigen Klicks.",
  },
  {
    icon: Timer,
    title: "Pünktlich & entspannt",
    text: "Feste Slots ohne Überbuchung, damit du nicht warten musst.",
  },
  {
    icon: Sparkle,
    title: "Moderne Schnitte",
    text: "Aktuelle Techniken und Styles, abgestimmt auf dich.",
  },
  {
    icon: UsersThree,
    title: "Dein Salon in Peine",
    text: "Persönliche Beratung in entspannter, moderner Atmosphäre.",
  },
];

export function WhyUsSection() {
  return (
    <section className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-xl">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Warum Showtime
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title}>
              <feature.icon className="size-7 text-primary" aria-hidden />
              <h3 className="mt-4 font-heading text-base">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
