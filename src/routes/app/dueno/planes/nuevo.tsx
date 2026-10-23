import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { z } from "zod";

import { CrearEditarPlanModal, ClientesPlanesView } from "@/components/dueno";
import { AppShell, NavBar } from "@/components/bocadoo/ui";

export const Route = createFileRoute("/app/dueno/planes/nuevo")({
  validateSearch: z.object({
    tipo: z.enum(["Semanal", "Quincenal", "Mensual", "Libre"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Nuevo plan" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ClientesPlanesView onBack={() => navigate({ to: "/app/dueno" }).catch(() => {})} />
        </div>
        <NavBar active="Planes" owner />
      </div>
      <CrearEditarPlanModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          navigate({ to: "/app/dueno/planes" }).catch(() => {});
        }}
      />
    </AppShell>
  );
}
