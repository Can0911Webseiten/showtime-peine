"use client";

import Link from "next/link";
import { useState } from "react";
import { List, User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type Link_ = { href: string; label: string };

export function MobileNav({
  links,
  dashboardHref,
  dashboardLabel,
}: {
  links: Link_[];
  dashboardHref: string;
  dashboardLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menü öffnen" />}>
          <List className="size-6" aria-hidden />
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="font-heading">SHOWTIME</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1 px-4">
            {links.map((link) => (
              <SheetClose
                key={link.href}
                nativeButton={false}
                render={
                  <Link
                    href={link.href}
                    className="rounded-md px-2 py-3 text-base text-foreground/90 hover:bg-accent"
                  />
                }
              >
                {link.label}
              </SheetClose>
            ))}
            <div className="my-2 border-t border-border" />
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 rounded-md px-2 py-3 text-base text-foreground/90 hover:bg-accent"
                />
              }
            >
              <User className="size-5" aria-hidden />
              {dashboardLabel}
            </SheetClose>
            <SheetClose
              nativeButton={false}
              render={
                <Button
                  className="mt-2"
                  nativeButton={false}
                  render={<Link href="/#buchen" />}
                />
              }
            >
              Termin buchen
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
