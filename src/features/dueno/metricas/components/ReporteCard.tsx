import React from "react";
import type { LucideIcon } from "lucide-react";
import type { ComponentState } from "@/design-system";

export interface ReporteCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  state?: ComponentState;
  /** Mensaje del estado vacío (ya en tono cercano). */
  emptyText?: string;
  /** Control a la derecha del título (ej. selector de periodo). */
  headerAction?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Carcasa común de cada reporte: ícono + título siempre visibles (estado visible),
 * y cuerpo con esqueleto de carga o mensaje vacío.
 */
export const ReporteCard: React.FC<ReporteCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  state = "exito",
  emptyText,
  headerAction,
  className = "",
  children,
}) => {
  const titleId = React.useId();
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={state === "cargando"}
      className={`rounded-[24px] border border-border bg-surface p-4 shadow-xs sm:p-5 ${className}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-[15px] font-black leading-tight text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[13px] font-semibold text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {headerAction && state !== "cargando" && <div className="shrink-0">{headerAction}</div>}
      </header>

      {state === "cargando" ? (
        <div className="space-y-2.5" aria-hidden>
          <div className="h-12 w-32 animate-pulse rounded-2xl bg-secondary-container" />
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-secondary-container" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-secondary-container" />
        </div>
      ) : state === "vacio" ? (
        <p className="rounded-2xl border-2 border-dashed border-border bg-background px-4 py-5 text-center text-[14px] font-semibold text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        children
      )}
    </section>
  );
};

/** Número protagonista de cada tarjeta. */
export const NumeroGrande: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`text-[44px] font-black leading-none tracking-tight text-foreground sm:text-[52px] ${className}`}
  >
    {children}
  </div>
);
