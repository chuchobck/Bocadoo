import React from "react";
import { ArrowDown, ArrowUp, Minus, Ticket, Utensils } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { formatearNumero, type ResumenDia } from "../logic/reportes";
import { NumeroGrande, ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.resumenDia;

const TENDENCIA = {
  sube: { Icon: ArrowUp, clase: "bg-success-container text-success", signo: "+" },
  baja: { Icon: ArrowDown, clase: "bg-danger-container text-on-danger-container", signo: "" },
  igual: { Icon: Minus, clase: "bg-secondary-container text-foreground", signo: "" },
} as const;

export interface ResumenDiaCardProps {
  data?: ResumenDia | undefined;
  /** Nombre del día en minúsculas ("jueves"). */
  diaSemana: string;
  state?: ComponentState;
}

/** Reporte 1 — Resumen del día. */
export const ResumenDiaCard: React.FC<ResumenDiaCardProps> = ({
  data,
  diaSemana,
  state = "exito",
}) => {
  const sinServir = data !== undefined && data.servidosHoy === 0;
  const t = data ? TENDENCIA[data.tendencia] : null;

  return (
    <ReporteCard icon={Utensils} title={COPY.title} state={state} emptyText={COPY.empty}>
      {data && t && (
        <div className="space-y-3">
          {sinServir ? (
            <p className="text-[15px] font-semibold text-muted-foreground">{COPY.empty}</p>
          ) : (
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <NumeroGrande>{formatearNumero(data.servidosHoy)}</NumeroGrande>
              {data.variacionPct === null ? (
                <span className="pb-1 text-[13px] font-semibold text-muted-foreground">
                  {COPY.sinComparacion}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 pb-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-black ${t.clase}`}
                  >
                    <t.Icon className="h-4 w-4" aria-hidden />
                    {t.signo}
                    {data.variacionPct}%
                  </span>
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {COPY.vsSemanaPasada(diaSemana)}
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2.5 text-[14px] font-bold text-foreground">
            <Ticket className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {COPY.porUsar(formatearNumero(data.porUsar))}
          </p>
        </div>
      )}
    </ReporteCard>
  );
};
