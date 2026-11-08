import React from "react";
import { Hourglass } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { formatearDolares, formatearNumero, type AlmuerzosPendientes } from "../logic/reportes";
import { NumeroGrande, ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.pendientes;

export interface AlmuerzosPendientesCardProps {
  data?: AlmuerzosPendientes | undefined;
  state?: ComponentState;
}

/** Reporte 2 — Almuerzos ya cobrados que todavía se deben servir. */
export const AlmuerzosPendientesCard: React.FC<AlmuerzosPendientesCardProps> = ({
  data,
  state = "exito",
}) => (
  <ReporteCard
    icon={Hourglass}
    title={COPY.title}
    state={data && data.cantidad === 0 ? "vacio" : state}
    emptyText={COPY.empty}
  >
    {data && (
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <NumeroGrande>{formatearNumero(data.cantidad)}</NumeroGrande>
          <span className="text-[22px] font-black text-primary">
            ≈ {formatearDolares(data.valor, 0)}
          </span>
        </div>
        <p className="text-[14px] font-semibold text-foreground">{COPY.frase}</p>
        <p className="text-[13px] font-semibold text-muted-foreground">
          {COPY.clientes(data.clientes)}
        </p>
      </div>
    )}
  </ReporteCard>
);
