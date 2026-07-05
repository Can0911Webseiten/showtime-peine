import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Impressum | Showtime Friseur Peine" };

export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl">Impressum</h1>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          Angaben gemäß § 5 TMG – bitte durch die echten Angaben von Showtime
          ersetzen.
        </p>
        <p>
          {BUSINESS.name}
          <br />
          {BUSINESS.addressLine}
          <br />
          {BUSINESS.postalCode} {BUSINESS.city}
        </p>
        <p>
          Telefon: {BUSINESS.phone}
          <br />
          E-Mail: {BUSINESS.email}
        </p>
        <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Inhaber:in Showtime.</p>
      </div>
    </main>
  );
}
