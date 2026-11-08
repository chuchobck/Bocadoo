import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { MetricasScreen } from "@/features/dueno/metricas/Screen";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/metricas")({
  validateSearch: z.object({ role: z.enum(["dueno", "cajero"]).optional() }),
  head: () => ({ meta: [{ title: "Bocadoo — Panel de ventas y métricas" }] }),
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
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <MetricasScreen
            onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})}
          />
        </div>
        <NavBar active="Métricas" owner />
      </div>
    </AppShell>
  );
}
