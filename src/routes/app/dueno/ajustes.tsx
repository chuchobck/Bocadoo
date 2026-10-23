import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { MasAjustesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/ajustes")({
  head: () => ({ meta: [{ title: "Bocadoo — Ajustes del local" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <MasAjustesView onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})} />
        </div>
        <NavBar active="Ajustes" owner />
      </div>
    </AppShell>
  );
}
