import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { RegistrarConsumoScreen } from "@/features/dueno/registrar-consumo/Screen";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/registrar-consumo")({
  head: () => ({ meta: [{ title: "Bocadoo — Registrar consumo POS" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <RegistrarConsumoScreen
            onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})}
            onScanPass={() => navigate({ to: "/app/dueno" }).catch(() => {})}
            onOpenMenu={() => navigate({ to: "/app/dueno/menu" as any }).catch(() => {})}
          />
        </div>
        <NavBar active="Caja" owner />
      </div>
    </AppShell>
  );
}
