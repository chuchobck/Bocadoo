import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

import { PedidosEnCaminoView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { toast } from "sonner";
import { useBocadoo, RESTAURANT_ID, orderDisplayNumber, isOrderOpen, isOrderValidated } from "@/components/bocadoo/store";
import type { PedidoItem } from "@/features/dueno/pedidos/Screen";

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
  const { activeRole, orders, simulatedToday, scanOrder, serveOrder, undoServeOrder } = useBocadoo();
  const effectiveRole = search.role ?? (activeRole === "CASHIER" ? "cajero" : "dueno");
  const isCashier = effectiveRole === "cajero";

  // Preórdenes reales del comensal para este local: por validar o por entregar
  const pedidos: PedidoItem[] = orders
    .filter((o) => o.restaurantId === RESTAURANT_ID && isOrderOpen(o))
    .sort((a, b) => new Date(a.creadaEn).getTime() - new Date(b.creadaEn).getTime())
    .map((o) => ({
      id: o.id,
      orderNumber: orderDisplayNumber(o.id),
      dinerName: o.comensalNombre,
      soup: o.items.find((i) => i.seccion === "sopa")?.nombre ?? "—",
      main: o.items.find((i) => i.seccion === "fuerte")?.nombre ?? "—",
      minutesAgo: Math.max(
        0,
        Math.round((simulatedToday.getTime() - new Date(o.creadaEn).getTime()) / 60000),
      ),
      delivered: false,
      expiresInMinutes: Math.max(
        0,
        Math.round((new Date(o.venceEn).getTime() - simulatedToday.getTime()) / 60000),
      ),
      status: isOrderValidated(o) ? "VALIDADO" : "POR_VALIDAR",
    }));

  const handleScanOrder = (orderId: string) => {
    const res = scanOrder(orderId);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <PedidosEnCaminoView
            orders={pedidos}
            onScanOrder={handleScanOrder}
            onDeliverOrder={(id) => serveOrder(id)}
            onUndoDeliver={(id) => undoServeOrder(id)}
            onBack={() => navigate({ to: "/app/dueno", search: (isCashier ? { role: "cajero" } : {}) as any }).catch(() => {})}
          />
        </div>
        <NavBar active={isCashier ? "Pedidos" : "Caja"} owner cashier={isCashier} />
      </div>
    </AppShell>
  );
}
