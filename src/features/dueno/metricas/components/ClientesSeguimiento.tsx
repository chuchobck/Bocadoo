import React, { useState } from "react";
import { CalendarClock, MessageCircle, UserX, type LucideIcon } from "lucide-react";
import { BottomSheet, type ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import {
  enlaceWhatsApp,
  mensajeEnRiesgo,
  mensajeRenovar,
  type ClienteEnRiesgo,
  type ClientePorRenovar,
} from "../logic/reportes";
import { ReporteCard } from "./ReporteCard";

const MAX_VISIBLES = 5;

interface FilaCliente {
  id: string;
  nombre: string;
  detalle: string;
  urgente: boolean;
  enlace: string;
}

const Iniciales: React.FC<{ nombre: string }> = ({ nombre }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-container text-[13px] font-black text-on-primary-container">
    {nombre
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </span>
);

const ListaFilas: React.FC<{ filas: FilaCliente[] }> = ({ filas }) => (
  <ul className="divide-y divide-border">
    {filas.map((f) => (
      <li key={f.id} className="flex items-center gap-3 py-2">
        <Iniciales nombre={f.nombre} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-foreground">{f.nombre}</p>
          <p
            className={`text-[13px] font-semibold ${f.urgente ? "text-danger" : "text-muted-foreground"}`}
          >
            {f.detalle}
          </p>
        </div>
        <a
          href={f.enlace}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={METRICAS_COPY.whatsapp(f.nombre)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success text-success-foreground shadow-xs transition-transform active:scale-95"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </a>
      </li>
    ))}
  </ul>
);

const ListaClientesCard: React.FC<{
  icon: LucideIcon;
  title: string;
  subtitle: string;
  emptyText: string;
  filas: FilaCliente[] | undefined;
  state: ComponentState;
}> = ({ icon, title, subtitle, emptyText, filas, state }) => {
  const [verTodos, setVerTodos] = useState(false);
  const total = filas?.length ?? 0;

  return (
    <ReporteCard
      icon={icon}
      title={title}
      subtitle={subtitle}
      state={filas && total === 0 ? "vacio" : state}
      emptyText={emptyText}
      headerAction={
        total > 0 ? (
          <span className="rounded-full bg-primary-container px-2.5 py-1 text-[14px] font-black text-on-primary-container">
            {total}
          </span>
        ) : undefined
      }
    >
      {filas && (
        <>
          <ListaFilas filas={filas.slice(0, MAX_VISIBLES)} />
          {total > MAX_VISIBLES && (
            <button
              type="button"
              onClick={() => setVerTodos(true)}
              className="mt-2 min-h-11 w-full rounded-full bg-secondary-container text-[14px] font-black text-foreground transition-transform active:scale-[0.99]"
            >
              {METRICAS_COPY.verTodos(total)}
            </button>
          )}
          <BottomSheet isOpen={verTodos} onClose={() => setVerTodos(false)} title={title}>
            <ListaFilas filas={filas} />
          </BottomSheet>
        </>
      )}
    </ReporteCard>
  );
};

export interface ClientesSeguimientoProps {
  porRenovar?: ClientePorRenovar[] | undefined;
  enRiesgo?: ClienteEnRiesgo[] | undefined;
  nombreLocal: string;
  state?: ComponentState;
}

/** Reporte 4 — Clientes por renovar y clientes que no han vuelto, con WhatsApp prellenado. */
export const ClientesSeguimiento: React.FC<ClientesSeguimientoProps> = ({
  porRenovar,
  enRiesgo,
  nombreLocal,
  state = "exito",
}) => {
  const filasRenovar = porRenovar?.map<FilaCliente>((r) => ({
    id: r.plan.id,
    nombre: r.cliente.nombre,
    detalle: METRICAS_COPY.renovar.cuando(r.diasParaVencer),
    urgente: r.diasParaVencer <= 1,
    enlace: enlaceWhatsApp(r.cliente.telefono, mensajeRenovar(r, nombreLocal)),
  }));
  const filasRiesgo = enRiesgo?.map<FilaCliente>((r) => ({
    id: r.plan.id,
    nombre: r.cliente.nombre,
    detalle: METRICAS_COPY.riesgo.cuando(r.diasSinVenir, r.restantes),
    urgente: false,
    enlace: enlaceWhatsApp(r.cliente.telefono, mensajeEnRiesgo(r, nombreLocal)),
  }));

  return (
    <>
      <ListaClientesCard
        icon={CalendarClock}
        title={METRICAS_COPY.renovar.title}
        subtitle={METRICAS_COPY.renovar.sub}
        emptyText={METRICAS_COPY.renovar.empty}
        filas={filasRenovar}
        state={state}
      />
      <ListaClientesCard
        icon={UserX}
        title={METRICAS_COPY.riesgo.title}
        subtitle={METRICAS_COPY.riesgo.sub}
        emptyText={METRICAS_COPY.riesgo.empty}
        filas={filasRiesgo}
        state={state}
      />
    </>
  );
};
