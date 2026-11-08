import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ToggleSwitch } from "@/design-system";
import { METRICAS_COPY } from "../copy";
import { useReportes } from "../hooks/useReportes";
import { formatearDolares, formatearNumero } from "../logic/reportes";

const COPY = METRICAS_COPY.resumenSemanal;

/**
 * Extra — Vista previa (solo visual) del resumen semanal que llegaría por WhatsApp.
 * El interruptor no envía nada: es de prototipo y no se guarda.
 */
export const ResumenSemanalWhatsApp: React.FC = () => {
  const [activo, setActivo] = useState(true);
  const { reportes, nombreLocal, estado } = useReportes();
  const resumen = reportes?.resumenSemanal;

  const lineas = resumen
    ? [
        COPY.servidos(formatearNumero(resumen.servidos)),
        COPY.cobrado(formatearDolares(resumen.cobrado, 0)),
        COPY.porRenovar(resumen.porRenovar),
        COPY.estrella(resumen.platoEstrella ?? "—"),
      ]
    : [];

  return (
    <div className="space-y-3 rounded-[24px] border border-border bg-surface p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-foreground">{COPY.title}</h3>
            <p className="text-[13px] font-semibold text-muted-foreground">
              {activo ? COPY.desc : COPY.apagado}
            </p>
          </div>
        </div>
        <ToggleSwitch checked={activo} onChange={setActivo} ariaLabel={COPY.title} />
      </div>

      <div aria-live="polite" className={activo ? "" : "opacity-45"}>
        <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
          {COPY.vistaPrevia} · {activo ? COPY.activo : COPY.inactivo}
        </span>
        <div className="rounded-2xl bg-background p-3">
          {estado === "cargando" || !resumen ? (
            <div className="space-y-2" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 w-3/4 animate-pulse rounded-lg bg-secondary-container"
                />
              ))}
            </div>
          ) : (
            <div className="max-w-[320px] rounded-2xl rounded-tl-[6px] border border-border bg-surface px-3.5 py-2.5 shadow-xs">
              <p className="text-[13px] font-black text-primary">{COPY.remitente}</p>
              <p className="mt-0.5 text-[14px] font-semibold text-foreground">
                {COPY.saludo(nombreLocal)}
              </p>
              <ul className="mt-1.5 space-y-0.5 text-[14px] font-semibold text-foreground">
                {lineas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="mt-1 text-right text-[13px] font-semibold text-muted-foreground">
                lun 08:00
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
