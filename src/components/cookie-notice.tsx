"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "showtime_cookie_notice_ack";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read client-only localStorage after mount to avoid a hydration mismatch
    // (server always renders "not yet acknowledged").
    if (!localStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Wir verwenden nur ein technisch notwendiges Cookie, damit du
          eingeloggt bleiben kannst – keine Analyse- oder Werbe-Cookies.{" "}
          <Link href="/datenschutz" className="text-primary hover:underline">
            Mehr erfahren
          </Link>
        </p>
        <Button size="sm" onClick={dismiss} className="shrink-0">
          Verstanden
        </Button>
      </div>
    </div>
  );
}
