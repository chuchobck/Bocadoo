import React from "react";
import { Flame } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { DIAS_SEMANA, FRANJAS, type HorasPico } from "../logic/reportes";
import { ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.horasPico;

/** Rampa secuencial de un solo tono: más almuerzos = morado más intenso. */
function colorCelda(valor: number, maximo: number): string {
  const intensidad = maximo === 0 ? 0 : Math.round(8 + (valor / maximo) * 92);
  return `color-mix(in oklab, var(--primary) ${intensidad}%, var(--surface))`;
}

export interface HorasPicoCardProps {
  data?: HorasPico | undefined;
  state?: ComponentState;
}

/** Reporte 6 — Mapa de calor lunes-viernes × franjas del mediodía. */
export const HorasPicoCard: React.FC<HorasPicoCardProps> = ({ data, state = "exito" }) => {
  const pico = data?.pico ?? null;
  const diaPico = pico ? (DIAS_SEMANA[pico.dia] ?? "").toLowerCase() : "";
  const horaPico = pico ? (FRANJAS[pico.franja] ?? "") : "";

  return (
    <ReporteCard
      icon={Flame}
      title={COPY.title}
      subtitle={COPY.sub}
      state={data && data.total === 0 ? "vacio" : state}
      emptyText={COPY.empty}
    >
      {data && pico && (
        <div className="space-y-3">
          <div>
            <p className="text-[20px] font-black leading-tight text-foreground">
              {COPY.frase(diaPico, horaPico)}
            </p>
            {data.diaFuerte !== null && (
              <p className="text-[13px] font-semibold text-muted-foreground">
                {COPY.diaFuerte((DIAS_SEMANA[data.diaFuerte] ?? "").toLowerCase())}
              </p>
            )}
          </div>

          <div
            aria-hidden
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `2.25rem repeat(${FRANJAS.length}, minmax(0, 1fr))` }}
          >
            <span aria-hidden />
            {FRANJAS.map((f) => (
              <span
                key={f}
                className="pb-0.5 text-center text-[13px] font-semibold tabular-nums tracking-tight text-muted-foreground"
              >
                {f}
              </span>
            ))}
            {data.matriz.map((fila, d) => (
              <React.Fragment key={DIAS_SEMANA[d]}>
                <span className="self-center text-[13px] font-bold text-foreground">
                  {(DIAS_SEMANA[d] ?? "").slice(0, 3)}
                </span>
                {fila.map((valor, f) => {
                  const esPico = pico.dia === d && pico.franja === f;
                  const etiqueta = `${DIAS_SEMANA[d]} ${FRANJAS[f]}: ${valor} almuerzos`;
                  return (
                    <span
                      key={f}
                      title={etiqueta}
                      className={`grid h-9 place-items-center rounded-[6px] ${
                        esPico ? "ring-2 ring-foreground ring-offset-1 ring-offset-surface" : ""
                      }`}
                      style={{ background: colorCelda(valor, data.maximo) }}
                    >
                      {esPico && <Flame className="h-4 w-4 text-primary-foreground" aria-hidden />}
                    </span>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <table className="sr-only">
            <caption>{COPY.title}</caption>
            <thead>
              <tr>
                <th scope="col">Día</th>
                {FRANJAS.map((f) => (
                  <th key={f} scope="col">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matriz.map((fila, d) => (
                <tr key={DIAS_SEMANA[d]}>
                  <th scope="row">{DIAS_SEMANA[d]}</th>
                  {fila.map((valor, f) => (
                    <td key={f}>{valor}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-muted-foreground"
            aria-hidden
          >
            {COPY.menos}
            {[0.1, 0.4, 0.7, 1].map((p) => (
              <span
                key={p}
                className="h-3 w-5 rounded-[4px]"
                style={{ background: colorCelda(p, 1) }}
              />
            ))}
            {COPY.mas}
          </div>
        </div>
      )}
    </ReporteCard>
  );
};
