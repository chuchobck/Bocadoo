import { createFileRoute, notFound } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { z } from "zod";

const DevEstados = import.meta.env.DEV
  ? React.lazy(() => import("@/dev/EstadosComensal"))
  : null;

export const Route = createFileRoute("/app/comensal/estados")({
  validateSearch: z.object({
    pantalla: z
      .enum([
        "pase",
        "comer",
        "ficha",
        "sellos",
        "calificar",
        "mesa",
        "unirme",
        "pedido",
        "cuenta",
      ])
      .optional(),
    estado: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
    chrome: z.union([z.string(), z.number()]).optional(),
  }),
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  head: () => ({ meta: [{ title: "Bocadoo — Galería de Estados Etapa 2 (Dev)" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();

  if (!import.meta.env.DEV || !DevEstados) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F3FA] text-[15px] font-bold text-[#4A0E78]">
          Cargando visor dev...
        </div>
      }
    >
      <DevEstados
        initialScreen={search.pantalla}
        initialState={search.estado}
        chrome={search.chrome !== undefined ? String(search.chrome) : undefined}
      />
    </Suspense>
  );
}
