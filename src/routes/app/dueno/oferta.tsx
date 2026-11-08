import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";

import { OfertaFlashModal, CajaView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/oferta")({
  head: () => ({ meta: [{ title: "Bocadoo — Oferta flash" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
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
        onClose={() => {
          setIsOpen(false);
          navigate({ to: "/app/dueno" }).catch(() => {});
        }}
      />
    </AppShell>
  );
}
