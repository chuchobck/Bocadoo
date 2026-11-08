import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { z } from "zod";

import {
  CajaView,
  CobrarPaseLive,
  CobrarMesaModal,
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
  const { activeRole, sharedTables, restaurant, posSale, undoSale } = useBocadoo();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mesaToCharge, setMesaToCharge] = useState<string | null>(null);
  const pendingTables = (sharedTables || []).filter(
    (t) => t.estado !== "FINALIZADA" && t.miembros.length > 0,
  );
  const effectiveRole = search.role ?? (activeRole === "CASHIER" ? "cajero" : "dueno");
  const isCashier = effectiveRole === "cajero";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {pendingTables.length > 0 && (
            <div className="space-y-1.5 px-4 pt-3" data-testid="mesas-pendientes">
              {pendingTables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMesaToCharge(t.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-primary bg-primary-container px-4 py-2.5 text-left active:scale-[0.99]"
                >
                  <span className="text-[13px] font-extrabold text-foreground">
                    Mesa #{t.id.toUpperCase()} · {t.miembros.length} comensales · {t.hora}
                  </span>
                  <span className="text-[12px] font-bold text-primary">Cobrar</span>
                </button>
              ))}
            </div>
          )}
          <CajaView
            role={effectiveRole}
            onScanPass={() => setIsScannerOpen(true)}
            onViewOrders={() => navigate({ to: "/app/dueno/pedidos" as any, search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
            onOpenCierre={() => navigate({ to: "/app/dueno/cierre" as any, search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
            onOpenMetricas={() => navigate({ to: "/app/dueno/metricas" as any }).catch(() => {})}
          />
        </div>
        <NavBar active="Caja" owner cashier={isCashier} />
      </div>

      <CobrarMesaModal mesaId={mesaToCharge} onClose={() => setMesaToCharge(null)} />

      <CobrarPaseLive isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </AppShell>
  );
}
