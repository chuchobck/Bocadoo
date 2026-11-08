import React from "react";
import { Loader2, Inbox, AlertCircle, WifiOff, CheckCircle2 } from "lucide-react";
import type { BaseComponentProps, ComponentState } from "./types";

/**
 * 22. StateFeedback — Contenedor unificado para los 5 estados de UI en Bocadoo.
 * Permite renderizar de manera estándar:
 * - cargando: Spinner y animación suave.
 * - vacio: Icono sutil y mensaje claro.
 * - error: Alerta con opción de reintentar.
 * - offline: Aviso de modo sin conexión.
 * - exito: Renderiza los hijos normalmente.
 */
export interface StateFeedbackProps extends BaseComponentProps {
  children: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  loadingMessage?: string;
}

export const StateFeedback: React.FC<StateFeedbackProps> = ({
  state = "exito",
  children,
  emptyTitle = "Sin información",
  emptyMessage = "No hay datos para mostrar en este momento.",
  errorMessage = "Ocurrió un problema al cargar los datos.",
  onRetry,
  loadingMessage = "Cargando...",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="mt-3 text-[15px] font-bold text-foreground">{loadingMessage}</span>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-6 text-center rounded-[32px] border-2 border-dashed border-border bg-background ${className}`}>
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-container text-primary mb-3">
          <Inbox className="h-8 w-8" />
        </div>
        <h4 className="text-[17px] font-extrabold text-foreground">{emptyTitle}</h4>
        <p className="mt-1 text-[13px] font-semibold text-muted-foreground max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex flex-col items-center justify-center py-10 px-6 text-center rounded-[32px] border border-danger bg-danger-container text-on-danger-container ${className}`}>
        <AlertCircle className="h-10 w-10 mb-2" />
        <h4 className="text-[17px] font-extrabold">Algo salió mal</h4>
        <p className="mt-1 text-[13px] text-muted-foreground max-w-xs">{errorMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-full bg-danger px-5 py-2 text-[15px] font-bold text-danger-foreground shadow-sm active:scale-95"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex flex-col items-center justify-center py-10 px-6 text-center rounded-[32px] border border-border bg-surface ${className}`}>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-muted-foreground mb-2">
          <WifiOff className="h-7 w-7" />
        </div>
        <h4 className="text-[17px] font-extrabold text-foreground">Sin conexión</h4>
        <p className="mt-1 text-[13px] font-semibold text-muted-foreground max-w-xs">
          Mostrando los datos guardados en tu dispositivo.
        </p>
      </div>
    );
  }

  // Éxito: contenido normal
  return <div className={className}>{children}</div>;
};
