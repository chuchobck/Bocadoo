import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

import { PedidosEnCaminoView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo } from "@/components/bocadoo/store";

export const Route = createFileRoute("/app/dueno/pedidos")({
  validateSearch: z.object({
    role: z.enum(["dueno", "cajero"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Pedidos en camino" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { activeRole } = useBocadoo();
  const effectiveRole = search.role ?? (activeRole === "CASHIER" ? "cajero" : "dueno");
  const isCashier = effectiveRole === "cajero";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <PedidosEnCaminoView
            onBack={() => navigate({ to: "/app/dueno", search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
          />
        </div>
        <NavBar active={isCashier ? "Pedidos" : "Caja"} owner cashier={isCashier} />
      </div>
    </AppShell>
  );
}
