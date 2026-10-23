import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";

import { CajaView, CobrarPaseModal } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/descontar")({
  head: () => ({ meta: [{ title: "Bocadoo — Cobrar con plan" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CajaView onScanPass={() => setIsOpen(true)} />
        </div>
        <NavBar active="Caja" owner />
      </div>
      <CobrarPaseModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          navigate({ to: "/app/dueno" }).catch(() => {});
        }}
        outcome="VERDE"
        dinerName="Carlos Mejía"
        remainingLunches={13}
      />
    </AppShell>
  );
}
