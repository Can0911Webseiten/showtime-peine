"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setStaffActive } from "@/lib/actions/staff";

export function StaffToggleButton({
  staffId,
  active,
}: {
  staffId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("staffId", staffId);
      formData.set("active", (!active).toString());
      await setStaffActive(formData);
      toast.success(active ? "Mitarbeiter deaktiviert." : "Mitarbeiter aktiviert.");
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
      {isPending ? "…" : active ? "Deaktivieren" : "Aktivieren"}
    </Button>
  );
}
