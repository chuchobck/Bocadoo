import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { ClientesPlanesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo } from "@/components/bocadoo/store";

export const Route = createFileRoute("/app/dueno/planes/")({
  validateSearch: z.object({
    role: z.enum(["dueno", "cajero"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Mis planes" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { activeRole } = useBocadoo();
  const isCashier = (search.role ?? (activeRole === "CASHIER" ? "cajero" : "dueno")) === "cajero";
  const hasToastedRef = useRef(false);

  useEffect(() => {
    if (isCashier && !hasToastedRef.current) {
      hasToastedRef.current = true;
      toast.error("Solo el dueño puede configurar planes");
      navigate({ to: "/app/dueno", search: { role: "cajero" } }).catch(() => {});
    }
  }, [isCashier, navigate]);

  if (isCashier) {
    return null;
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ClientesPlanesView
            onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})}
          />
        </div>
        <NavBar active="Planes" owner />
      </div>
    </AppShell>
  );
}
