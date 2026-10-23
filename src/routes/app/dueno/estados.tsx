import { createFileRoute, notFound } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { z } from "zod";

const DevEstadosDueno = import.meta.env.DEV
  ? React.lazy(() => import("@/dev/EstadosDueno"))
  : null;

export const Route = createFileRoute("/app/dueno/estados")({
  validateSearch: z.object({
    pantalla: z
      .enum([
        "caja",
        "cobrar",
        "pedidos",
        "clientes",
        "plan",
        "cartulina",
        "menu",
        "oferta",
        "opiniones",
        "cierre",
        "ajustes",
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
  head: () => ({ meta: [{ title: "Bocadoo — Galería de Estados Etapa 3 (Dueño / Cajero)" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();

  if (!import.meta.env.DEV || !DevEstadosDueno) {
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
      <DevEstadosDueno
        initialScreen={search.pantalla}
        initialState={search.estado}
        chrome={search.chrome !== undefined ? String(search.chrome) : undefined}
      />
    </Suspense>
  );
}
