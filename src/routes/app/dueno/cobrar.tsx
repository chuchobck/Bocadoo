import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { z } from "zod";

import { ClientesPlanesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/cobrar")({
  validateSearch: z.object({
    cliente: z.string().optional(),
    role: z.enum(["dueno", "cajero"]).optional(),
    segment: z.enum(["planes", "clientes"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Vender plan" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isCashier = search.role === "cajero";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ClientesPlanesView
            initialSegment={search.segment ?? "clientes"}
            initialSearchTerm={search.cliente ?? ""}
            autoFocusSearch={true}
            onBack={() =>
              navigate({
                to: "/app/dueno" as any,
                search: (isCashier ? { role: "cajero" } : {}) as any,
              }).catch(() => {})
            }
          />
        </div>
        <NavBar active="Planes" owner cashier={isCashier} />
      </div>
    </AppShell>
  );
}
