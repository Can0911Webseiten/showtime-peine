import Link from "next/link";
import { Scissors } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link href="/" className="mb-2 flex items-center gap-2 font-heading text-lg">
            <Scissors weight="bold" className="size-5 text-primary" aria-hidden />
            SHOWTIME
          </Link>
          <CardTitle>Konto erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm next={next} />
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Schon registriert?{" "}
            <Link
              href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-primary hover:underline"
            >
              Jetzt anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
