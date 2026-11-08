import React from "react";
import { PiggyBank } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { formatearDolares, formatearNumero, type AlmuerzosVencidos } from "../logic/reportes";
import { NumeroGrande, ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.vencidos;

export interface AlmuerzosVencidosCardProps {
  data?: AlmuerzosVencidos | undefined;
  state?: ComponentState;
}

/** Reporte 5 — Almuerzos que vencieron sin usarse en el último mes. */
export const AlmuerzosVencidosCard: React.FC<AlmuerzosVencidosCardProps> = ({
  data,
  state = "exito",
}) => (
  <ReporteCard
    icon={PiggyBank}
    title={COPY.title}
    state={data && data.cantidad === 0 ? "vacio" : state}
    emptyText={COPY.empty}
  >
    {data && (
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <NumeroGrande>{formatearNumero(data.cantidad)}</NumeroGrande>
          <span className="text-[22px] font-black text-success">
            {formatearDolares(data.valor, 0)}
          </span>
        </div>
        <p className="text-[14px] font-semibold text-foreground">{COPY.frase}</p>
        <span className="inline-flex rounded-full bg-secondary-container px-2.5 py-1 text-[13px] font-bold text-foreground">
          {COPY.promedio(
            data.promedioPorPlan.toLocaleString("es-EC", { maximumFractionDigits: 1 }),
          )}
        </span>
      </div>
    )}
  </ReporteCard>
);
