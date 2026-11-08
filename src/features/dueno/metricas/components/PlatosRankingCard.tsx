import React from "react";
import { ChefHat, Star, ThumbsDown } from "lucide-react";
import type { ComponentState } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import type { PlatoRanking, RankingPlatos } from "../logic/reportes";
import { ReporteCard } from "./ReporteCard";

const COPY = METRICAS_COPY.platos;

const Nota: React.FC<{ valor: number | null; tono?: "normal" | "baja" }> = ({
  valor,
  tono = "normal",
}) =>
  valor === null ? (
    <span className="text-[13px] font-semibold text-muted-foreground">{COPY.sinNota}</span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[14px] font-black ${
        tono === "baja"
          ? "bg-danger-container text-on-danger-container"
          : "bg-primary-container text-on-primary-container"
      }`}
      aria-label={`Nota ${valor.toFixed(1)} de 5`}
    >
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
      {valor.toLocaleString("es-EC", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
    </span>
  );

const Fila: React.FC<{ item: PlatoRanking; puesto: number }> = ({ item, puesto }) => (
  <li className="flex items-center gap-3 py-2">
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-black ${
        puesto === 1
          ? "bg-primary text-primary-foreground"
          : "bg-secondary-container text-foreground"
      }`}
    >
      {puesto}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] font-bold text-foreground">{item.plato.nombre}</p>
      <p className="text-[13px] font-semibold text-muted-foreground">
        {COPY.pedidos(item.pedidos)}
      </p>
    </div>
    <Nota valor={item.calificacion} />
  </li>
);

export interface PlatosRankingCardProps {
  data?: RankingPlatos | undefined;
  state?: ComponentState;
}

/** Reporte 7 — Top 3 de platos y el peor calificado en "¿Qué tal hoy?". */
export const PlatosRankingCard: React.FC<PlatosRankingCardProps> = ({ data, state = "exito" }) => (
  <ReporteCard
    icon={ChefHat}
    title={COPY.title}
    subtitle={COPY.sub}
    state={data && data.top.length === 0 ? "vacio" : state}
    emptyText={COPY.empty}
  >
    {data && (
      <div>
        <ol className="divide-y divide-border">
          {data.top.map((item, i) => (
            <Fila key={item.plato.id} item={item} puesto={i + 1} />
          ))}
        </ol>
        {data.peor && (
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5">
            <ThumbsDown className="h-5 w-5 shrink-0 text-danger" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-muted-foreground">{COPY.peor}</p>
              <p className="truncate text-[15px] font-bold text-foreground">
                {data.peor.plato.nombre}
              </p>
            </div>
            <Nota valor={data.peor.calificacion} tono="baja" />
          </div>
        )}
      </div>
    )}
  </ReporteCard>
);
