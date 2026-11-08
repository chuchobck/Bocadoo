import React, { useState } from "react";
import { ArrowLeft, Banknote, CalendarDays, Users, WifiOff, type LucideIcon } from "lucide-react";
import { StateFeedback, type ComponentState } from "@/design-system";
import { METRICAS_COPY } from "./copy";
import { useReportes } from "./hooks/useReportes";
import type { Periodo } from "./logic/reportes";
import {
  AlmuerzosPendientesCard,
  AlmuerzosVencidosCard,
  ClientesSeguimiento,
  HorasPicoCard,
  PlatosRankingCard,
  ResumenDiaCard,
  VentasPlanesCard,
} from "./components";

export type PestanaReportes = "hoy" | "dinero" | "clientes";

const PESTANAS: Array<{ id: PestanaReportes; Icon: LucideIcon }> = [
  { id: "hoy", Icon: CalendarDays },
  { id: "dinero", Icon: Banknote },
  { id: "clientes", Icon: Users },
];

export interface MetricasScreenProps {
  onBack?: () => void;
  pestanaInicial?: PestanaReportes;
  /** Fuerza un estado (galería de estados / pruebas). Sin valor, usa el de la carga real. */
  state?: ComponentState;
}

/**
 * Reportes del dueño en 3 pestañas: Hoy (1, 7) · Dinero (2, 3, 5) · Clientes (4, 6).
 * Toque 1: Métricas en la barra · toque 2: pestaña · toque 3: acción (WhatsApp, ver todos, periodo).
 */
export const MetricasScreen: React.FC<MetricasScreenProps> = ({
  onBack,
  pestanaInicial = "hoy",
  state,
}) => {
  const [pestana, setPestana] = useState<PestanaReportes>(pestanaInicial);
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const { estado: estadoCarga, hoy, reportes, nombreLocal, recargar } = useReportes();

  const estado = state ?? estadoCarga;
  // Las tarjetas solo distinguen cargando / vacío / con datos; offline muestra los datos con aviso.
  const estadoTarjeta: ComponentState = estado === "offline" ? "exito" : estado;
  const r = estado === "vacio" || estado === "cargando" ? null : reportes;
  const diaSemana = hoy.toLocaleDateString("es-EC", { weekday: "long" });

  return (
    <div className="flex min-h-full flex-col bg-background pb-32">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 pb-3 pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-[20px] font-black leading-tight text-foreground">
              {METRICAS_COPY.title}
            </h1>
            <p className="truncate text-[13px] font-semibold capitalize text-muted-foreground">
              {nombreLocal} ·{" "}
              {hoy.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Reportes"
          className="mx-auto mt-3 grid max-w-4xl grid-cols-3 gap-1 rounded-full bg-secondary-container p-1"
        >
          {PESTANAS.map(({ id, Icon }) => {
            const activa = pestana === id;
            return (
              <button
                key={id}
                id={`tab-${id}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${id}`}
                onClick={() => setPestana(id)}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full text-[15px] font-black transition-all active:scale-95 ${
                  activa ? "bg-primary text-primary-foreground shadow-brand" : "text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {METRICAS_COPY.tabs[id]}
              </button>
            );
          })}
        </div>
      </header>

      <main
        id={`panel-${pestana}`}
        role="tabpanel"
        aria-labelledby={`tab-${pestana}`}
        className="mx-auto w-full max-w-4xl p-3.5 sm:p-5"
      >
        {estado === "offline" && (
          <p className="mb-3 flex items-center justify-center gap-1.5 rounded-full bg-surface py-1.5 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" aria-hidden />
            {METRICAS_COPY.offlineBadge}
          </p>
        )}

        {estado === "error" ? (
          <StateFeedback
            state="error"
            errorMessage={METRICAS_COPY.errorDesc}
            onRetry={() => void recargar()}
          >
            {null}
          </StateFeedback>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:items-start">
            {pestana === "hoy" && (
              <>
                <ResumenDiaCard data={r?.resumenDia} diaSemana={diaSemana} state={estadoTarjeta} />
                <PlatosRankingCard data={r?.platos} state={estadoTarjeta} />
              </>
            )}

            {pestana === "dinero" && (
              <>
                <AlmuerzosPendientesCard data={r?.pendientes} state={estadoTarjeta} />
                <AlmuerzosVencidosCard data={r?.vencidos} state={estadoTarjeta} />
                <div className="md:col-span-2">
                  <VentasPlanesCard
                    data={r?.ventas}
                    periodo={periodo}
                    onPeriodoChange={setPeriodo}
                    state={estadoTarjeta}
                  />
                </div>
              </>
            )}

            {pestana === "clientes" && (
              <>
                <ClientesSeguimiento
                  porRenovar={r?.porRenovar}
                  enRiesgo={r?.enRiesgo}
                  nombreLocal={nombreLocal}
                  state={estadoTarjeta}
                />
                <div className="md:col-span-2">
                  <HorasPicoCard data={r?.horasPico} state={estadoTarjeta} />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
