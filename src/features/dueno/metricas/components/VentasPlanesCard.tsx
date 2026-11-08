import React from "react";
import { WalletCards } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { formatearDolares, type Periodo, type VentasPlanes } from "../logic/reportes";
import { NumeroGrande, ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.ventas;
const PERIODOS: Periodo[] = ["semana", "mes"];

/** Dos pasos de la misma rampa morada (validados para CVD; los valores van siempre en texto). */
const COLOR_EFECTIVO = "var(--primary)";
const COLOR_TRANSFERENCIA = "color-mix(in oklab, var(--primary) 55%, var(--surface))";

export interface VentasPlanesCardProps {
  data?: Record<Periodo, VentasPlanes> | undefined;
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
  state?: ComponentState;
}

const SelectorPeriodo: React.FC<{ periodo: Periodo; onChange: (p: Periodo) => void }> = ({
  periodo,
  onChange,
}) => (
  <div
    role="radiogroup"
    aria-label="Periodo"
    className="flex rounded-full bg-secondary-container p-1"
  >
    {PERIODOS.map((p) => (
      <button
        key={p}
        type="button"
        role="radio"
        aria-checked={periodo === p}
        onClick={() => onChange(p)}
        className={`min-h-9 rounded-full px-3.5 text-[13px] font-black transition-all active:scale-95 ${
          periodo === p ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground"
        }`}
      >
        {COPY.periodos[p]}
      </button>
    ))}
  </div>
);

const Leyenda: React.FC<{ color: string; label: string; valor: number }> = ({
  color,
  label,
  valor,
}) => (
  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
    <span className="h-3 w-3 rounded-[4px]" style={{ background: color }} aria-hidden />
    {label} <span className="font-black text-foreground">{formatearDolares(valor, 0)}</span>
  </span>
);

/** Reporte 3 — Ingresos por tipo de plan, separados en efectivo y transferencia. */
export const VentasPlanesCard: React.FC<VentasPlanesCardProps> = ({
  data,
  periodo,
  onPeriodoChange,
  state = "exito",
}) => {
  const actual = data?.[periodo];
  const maximo = Math.max(1, ...(actual?.porTipo.map((t) => t.total) ?? [0]));

  return (
    <ReporteCard
      icon={WalletCards}
      title={COPY.title}
      subtitle={COPY.subtitulo[periodo]}
      headerAction={<SelectorPeriodo periodo={periodo} onChange={onPeriodoChange} />}
      state={actual && actual.total === 0 ? "vacio" : state}
      emptyText={COPY.empty}
    >
      {actual && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <NumeroGrande>{formatearDolares(actual.total, 0)}</NumeroGrande>
            <span className="text-[14px] font-bold text-muted-foreground">
              {COPY.planes(actual.planesVendidos)}
            </span>
          </div>

          <ul className="space-y-3">
            {actual.porTipo.map((t) => {
              const descripcion = `${t.nombre}: ${formatearDolares(t.total, 0)} — ${COPY.efectivo} ${formatearDolares(
                t.efectivo,
                0,
              )}, ${COPY.transferencia} ${formatearDolares(t.transferencia, 0)}`;
              return (
                <li key={t.tipo} className="space-y-1">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="font-bold text-foreground">
                      {t.nombre}{" "}
                      <span className="font-semibold text-muted-foreground">· {t.cantidad}</span>
                    </span>
                    <span className="font-black text-foreground">
                      {formatearDolares(t.total, 0)}
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={descripcion}
                    title={descripcion}
                    className="flex h-5 gap-[2px] rounded-[6px] bg-background"
                    style={{ width: `${Math.max(4, (t.total / maximo) * 100)}%` }}
                  >
                    {t.efectivo > 0 && (
                      <span
                        className="h-full rounded-l-[6px] last:rounded-r-[6px]"
                        style={{ flexGrow: t.efectivo, background: COLOR_EFECTIVO }}
                      />
                    )}
                    {t.transferencia > 0 && (
                      <span
                        className="h-full rounded-r-[6px] first:rounded-l-[6px]"
                        style={{ flexGrow: t.transferencia, background: COLOR_TRANSFERENCIA }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
            <Leyenda color={COLOR_EFECTIVO} label={COPY.efectivo} valor={actual.efectivo} />
            <Leyenda
              color={COLOR_TRANSFERENCIA}
              label={COPY.transferencia}
              valor={actual.transferencia}
            />
          </div>
        </div>
      )}
    </ReporteCard>
  );
};
