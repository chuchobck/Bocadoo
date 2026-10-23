import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { CajaView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/registrar-consumo")({
  head: () => ({ meta: [{ title: "Bocadoo — Caja rápida" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CajaView
            onViewOrders={() => navigate({ to: "/app/dueno/pedidos" as any }).catch(() => {})}
            onSellPlan={() => navigate({ to: "/app/dueno/cobrar" as any }).catch(() => {})}
          />
        </div>
        <NavBar active="Caja" owner />
      </div>
    </AppShell>
  );
}
