import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Datenschutzerklärung | Showtime Friseur Peine" };

export default function DatenschutzPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Diese Vorlage deckt die auf dieser Seite tatsächlich stattfindende
        Datenverarbeitung ab und ist ein solider Ausgangspunkt – sie ersetzt
        aber keine individuelle Rechtsberatung. Bitte einmal von einem Anwalt
        oder Dienst wie e-recht24.de gegenprüfen lassen, sobald alle echten
        Firmendaten eingetragen sind.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg text-foreground">1. Verantwortlicher</h2>
          <p className="mt-2">
            {BUSINESS.name}
            <br />
            {BUSINESS.addressLine}
            <br />
            {BUSINESS.postalCode} {BUSINESS.city}
            <br />
            Telefon: {BUSINESS.phone}
            <br />
            E-Mail: {BUSINESS.email}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-foreground">
            2. Welche Daten wir verarbeiten
          </h2>
          <p className="mt-2">
            Wenn du dich registrierst oder einen Termin buchst, verarbeiten
            wir: Name, E-Mail-Adresse, Telefonnummer sowie die von dir
            gewählte Leistung, den Termin und optionale Anmerkungen. Passwörter
            speichern wir ausschließlich als Hash (bcrypt) – nie im Klartext.
            Mitarbeiter-Konten werden ohne E-Mail-Adresse, nur mit Benutzername
            angelegt.
          </p>
          <p className="mt-2">
            Diese Daten benötigen wir, um deinen Termin zu verwalten und dich
            bei Rückfragen zu erreichen (Rechtsgrundlage: Art. 6 Abs. 1 lit. b
            DSGVO – Vertragserfüllung bzw. vorvertragliche Maßnahmen).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-foreground">3. Cookies</h2>
          <p className="mt-2">
            Wir setzen genau ein Cookie: ein technisch notwendiges
            Sitzungs-Cookie, das dich nach dem Login eingeloggt hält. Es
            enthält keine Werbe- oder Analyse-Funktionen, wird nicht an Dritte
            weitergegeben und ist nach spätestens 30 Tagen automatisch
            ungültig. Da dieses Cookie für den Betrieb der Seite zwingend
            erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs. 2 Nr. 2
            TTDSG), ist dafür keine Einwilligung nötig. Wir setzen keine
            Analyse-, Marketing- oder Tracking-Cookies ein.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-foreground">
            4. Hosting & Auftragsverarbeiter
          </h2>
          <p className="mt-2">
            <strong className="text-foreground">Vercel Inc.</strong> (USA)
            hostet die Webseite selbst; die Server-Funktionen laufen bewusst
            in der Region Frankfurt (EU). Es gilt Vercels Data Processing
            Addendum inkl. EU-Standardvertragsklauseln.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Neon Inc.</strong> speichert
            die Datenbank (Kunden-, Termin- und Kontodaten) in einem
            Rechenzentrum in Frankfurt am Main (EU).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-foreground">5. Speicherdauer</h2>
          <p className="mt-2">
            Wir speichern deine Daten, solange dein Konto besteht bzw. wir sie
            zur Terminabwicklung benötigen. Auf Anfrage löschen oder
            anonymisieren wir dein Konto und deine Termine, sofern keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-foreground">6. Deine Rechte</h2>
          <p className="mt-2">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und
            Widerspruch (Art. 15–21 DSGVO). Wende dich dafür einfach an{" "}
            {BUSINESS.email}. Außerdem kannst du dich bei einer
            Datenschutz-Aufsichtsbehörde beschweren.
          </p>
        </section>
      </div>
    </main>
  );
}
