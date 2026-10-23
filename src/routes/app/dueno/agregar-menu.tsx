import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { MenuDiaView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/agregar-menu")({
  head: () => ({ meta: [{ title: "Bocadoo — Publicar menú" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <MenuDiaView onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})} />
        </div>
        <NavBar active="Menú" owner />
      </div>
    </AppShell>
  );
}
