import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import { ClientesPlanesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/planes/")({
  head: () => ({ meta: [{ title: "Bocadoo — Mis planes" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ClientesPlanesView
            onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})}
          />
        </div>
        <NavBar active="Planes" owner />
      </div>
    </AppShell>
  );
}
