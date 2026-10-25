import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { z } from "zod";

import {
  CajaView,
  CobrarPaseModal,
  PedidosEnCaminoView,
  ClientesPlanesView,
  PasarCartulinaModal,
} from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo } from "@/components/bocadoo/store";

export const Route = createFileRoute("/app/dueno/")({
  validateSearch: z.object({
    agregarCliente: z.boolean().optional(),
    role: z.enum(["dueno", "cajero"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Caja" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { activeRole } = useBocadoo();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const effectiveRole = search.role ?? (activeRole === "CASHIER" ? "cajero" : "dueno");
  const isCashier = effectiveRole === "cajero";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <CajaView
            role={effectiveRole}
            onScanPass={() => setIsScannerOpen(true)}
            onViewOrders={() => navigate({ to: "/app/dueno/pedidos" as any, search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
            onSellPlan={() => navigate({ to: "/app/dueno/cobrar" as any, search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
            onOpenCierre={() => navigate({ to: "/app/dueno/cierre" as any, search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
          />
        </div>
        <NavBar active="Caja" owner cashier={isCashier} />
      </div>

      <CobrarPaseModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        outcome="VERDE"
        dinerName="Carlos Mejía"
        remainingLunches={13}
      />
    </AppShell>
  );
}
