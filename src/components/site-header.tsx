import Link from "next/link";
import { Scissors, User } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

const NAV_LINKS = [
  { href: "/#buchen", label: "Termin" },
  { href: "/#leistungen", label: "Leistungen" },
  { href: "/#damen", label: "Damen" },
  { href: "/#team", label: "Team" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#kontakt", label: "Kontakt" },
];

function dashboardHref(role: string) {
  if (role === "OWNER") return "/owner";
  if (role === "STAFF") return "/mitarbeiter";
  return "/konto";
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardLabel = user?.role === "CUSTOMER" ? "Mein Konto" : "Dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg tracking-wide">
          <Scissors weight="bold" className="size-5 text-primary" aria-hidden />
          SHOWTIME
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button
              nativeButton={false}
              render={<Link href={dashboardHref(user.role)} />}
              variant="secondary"
              size="sm"
            >
              <User className="size-4" aria-hidden />
              {dashboardLabel}
            </Button>
          ) : (
            <Button nativeButton={false} render={<Link href="/login" />} variant="ghost" size="sm">
              Anmelden
            </Button>
          )}
          <Button nativeButton={false} render={<Link href="/#buchen" />} size="sm">
            Termin buchen
          </Button>
        </div>

        <MobileNav
          links={NAV_LINKS}
          dashboardHref={user ? dashboardHref(user.role) : "/login"}
          dashboardLabel={user ? dashboardLabel : "Anmelden"}
        />
      </div>
    </header>
  );
}
