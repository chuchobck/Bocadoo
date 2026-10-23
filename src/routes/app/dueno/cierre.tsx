import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { CierreCajaView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/cierre")({
  validateSearch: z.object({ role: z.enum(["dueno", "cajero"]).optional() }),
  head: () => ({ meta: [{ title: "Bocadoo — Cierre de caja" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const role = search.role ?? "dueno";
  const hasToastedRef = React.useRef(false);

  useEffect(() => {
    if (role === "cajero" && !hasToastedRef.current) {
      hasToastedRef.current = true;
      toast.info("Solo para el dueño");
      navigate({ to: "/app/dueno", search: { role: "cajero" } }).catch(() => {});
    }
  }, [role, navigate]);

  if (role === "cajero") {
    return null;
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <CierreCajaView
            role="dueno"
            onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})}
          />
        </div>
        <NavBar active="Ajustes" owner />
      </div>
    </AppShell>
  );
}
