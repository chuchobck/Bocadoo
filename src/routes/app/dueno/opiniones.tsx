import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { BuzonOpinionesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/opiniones")({
  head: () => ({ meta: [{ title: "Bocadoo — Buzón de opiniones" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <BuzonOpinionesView onBack={() => navigate({ to: "/app/dueno/ajustes" }).catch(() => {})} />
        </div>
        <NavBar active="Ajustes" owner />
      </div>
    </AppShell>
  );
}
