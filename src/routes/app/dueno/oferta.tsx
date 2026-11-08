import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { z } from "zod";

import { OfertaFlashModal, CajaView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/oferta")({
  // ?modo=valle abre directo la promo programada de horas muertas; sin parámetro abre Flash de hoy
  validateSearch: z.object({
    modo: z.enum(["flash", "valle"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Ofertas y promos" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { modo } = Route.useSearch();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CajaView
            onScanPass={() => navigate({ to: "/app/dueno/descontar" })}
            onViewOrders={() => navigate({ to: "/app/dueno/pedidos" })}
            onSellPlan={() =>
              navigate({
                to: "/app/dueno/cobrar" as any,
                search: { segment: "clientes" } as any,
              }).catch(() => {})
            }
          />
        </div>
        <NavBar active="Ofertas" owner />
      </div>
      <OfertaFlashModal
        isOpen={isOpen}
        initialMode={modo === "valle" ? "HORA_VALLE" : "FLASH_HOY"}
        onClose={() => {
          setIsOpen(false);
          navigate({ to: "/app/dueno" }).catch(() => {});
        }}
      />
    </AppShell>
  );
}
