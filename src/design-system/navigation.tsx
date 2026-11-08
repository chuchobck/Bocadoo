import React from "react";
import { ArrowLeft, WifiOff, AlertCircle, Users, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { BaseComponentProps } from "./types";

/**
 * 15. NavBar — Barra de navegación inferior fija (Dueño: 4 pestañas, Comensal: 3 pestañas).
 */
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavBarProps extends BaseComponentProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  items,
  activeId,
  onSelect,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`flex h-[72px] w-full items-center justify-around border-t border-border bg-surface px-2 animate-pulse ${className}`}>
        {Array.from({ length: items.length || 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 rounded-full bg-border" />
            <div className="h-3 w-10 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-[72px] w-full items-center justify-center border-t border-border bg-background text-[13px] font-bold text-muted-foreground ${className}`}>
        Sin pestañas configuradas
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-[72px] w-full items-center justify-center border-t border-danger bg-danger-container text-[13px] font-bold text-on-danger-container ${className}`}>
        <AlertCircle className="h-4 w-4 mr-1.5" />
        <span>Error en navegación</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-[72px] w-full flex-col border-t border-border bg-surface ${className}`}>
        <div className="flex h-5 items-center justify-center bg-background text-[13px] font-bold text-muted-foreground">
          <WifiOff className="h-3.5 w-3.5 mr-1" />
          <span>Sin conexión</span>
        </div>
        <div className="flex flex-1 items-center justify-around">
          {items.map((item) => (
            <button key={item.id} onClick={() => onSelect(item.id)} className="flex flex-col items-center text-[13px] font-bold text-muted-foreground">
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav
      className={`flex h-[72px] w-full items-center justify-around border-t border-border bg-surface-nav px-2 shadow-sm ${className}`}
    >
      {items.map((item) => {
        const isSelected = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 transition-all duration-150 ${
              isSelected ? "text-on-primary-container" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`grid place-items-center rounded-xl p-1 ${isSelected ? "bg-primary-container text-on-primary-container" : ""}`}>
              {item.icon}
            </div>
            <span className={`text-[13px] font-bold ${isSelected ? "font-extrabold" : ""}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

/**
 * 16. TopBar — Barra superior con título de máximo 3 palabras y retroceso.
 */
export interface TopBarProps extends BaseComponentProps {
  title: string;
  onBack?: (() => void) | undefined;
  rightAction?: React.ReactNode | undefined;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onBack,
  rightAction,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <header className={`flex h-14 w-full items-center justify-between px-4 animate-pulse bg-surface border-b border-border ${className}`}>
        <div className="h-6 w-6 rounded-full bg-border" />
        <div className="h-6 w-28 rounded-lg bg-border" />
        <div className="h-6 w-6 rounded-full bg-border" />
      </header>
    );
  }

  if (state === "vacio") {
    return (
      <header className={`flex h-14 w-full items-center justify-center px-4 bg-surface border-b border-border ${className}`}>
        <span className="text-[15px] font-bold text-muted-foreground">Bocadoo</span>
      </header>
    );
  }

  if (state === "error") {
    return (
      <header className={`flex h-14 w-full items-center justify-between px-4 bg-danger-container border-b border-danger text-on-danger-container ${className}`}>
        <span className="text-[15px] font-bold">Error de conexión</span>
      </header>
    );
  }

  if (state === "offline") {
    return (
      <header className={`flex h-14 w-full items-center justify-between px-4 bg-surface border-b border-border ${className}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} aria-label="Volver" className="grid h-10 w-10 place-items-center rounded-full text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[17px] font-extrabold text-foreground truncate">{title}</h1>
        </div>
        <WifiOff className="h-4 w-4 text-muted-foreground" />
      </header>
    );
  }

  return (
    <header className={`flex h-14 w-full items-center justify-between px-4 bg-surface border-b border-border ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-foreground hover:bg-primary-container active:scale-95 transition-all"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}
        <h1 className="text-[17px] font-extrabold text-foreground truncate max-w-[240px]">{title}</h1>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </header>
  );
};

/**
 * 17. OccupancyChip — Semáforo de ocupación del restaurante (Libre, Movido, Lleno).
 */
export interface OccupancyChipProps extends BaseComponentProps {
  status: "LIBRE" | "MOVIDO" | "LLENO";
}

export const OccupancyChip: React.FC<OccupancyChipProps> = ({
  status,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return <div className={`h-8 w-24 rounded-full bg-border animate-pulse ${className}`} />;
  }

  if (state === "vacio") {
    return (
      <span className={`inline-flex items-center rounded-full bg-background px-3 py-1 text-[13px] font-semibold text-muted-foreground ${className}`}>
        Sin estimar
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-danger-container px-3 py-1 text-[13px] font-bold text-on-danger-container ${className}`}>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>No disponible</span>
      </span>
    );
  }

  if (state === "offline") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-[13px] font-bold text-muted-foreground ${className}`}>
        <WifiOff className="h-3.5 w-3.5" />
        <span>Ocupación previa</span>
      </span>
    );
  }

  const configs = {
    LIBRE: {
      bg: "bg-success-container",
      text: "text-success",
      label: "Libre",
      Icon: CheckCircle2,
    },
    MOVIDO: {
      bg: "bg-primary-container",
      text: "text-primary",
      label: "Movido",
      Icon: Users,
    },
    LLENO: {
      bg: "bg-danger-container",
      text: "text-on-danger-container",
      label: "Lleno",
      Icon: AlertTriangle,
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold ${configs.bg} ${configs.text} ${className}`}
    >
      <configs.Icon className="h-3.5 w-3.5" />
      <span>{configs.label}</span>
    </span>
  );
};

/**
 * 21. QuickPayBar — Barra de cobro rápido inferior en Caja (Venta rápida).
 */
export interface QuickPayBarProps extends BaseComponentProps {
  totalFormatted: string;
  isTakeaway?: boolean;
  onToggleTakeaway?: (val: boolean) => void;
  onPayCash: () => void;
  onPayTransfer: () => void;
}

export const QuickPayBar: React.FC<QuickPayBarProps> = ({
  totalFormatted,
  isTakeaway = false,
  onToggleTakeaway,
  onPayCash,
  onPayTransfer,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`flex h-20 w-full items-center justify-between border-t border-border bg-surface p-4 animate-pulse ${className}`}>
        <div className="h-8 w-24 rounded-lg bg-border" />
        <div className="h-12 w-32 rounded-full bg-border" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-20 w-full items-center justify-center border-t border-border bg-background text-[15px] font-bold text-muted-foreground ${className}`}>
        Toca un plato para cobrar
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-20 w-full items-center justify-center border-t border-danger bg-danger-container text-[15px] font-bold text-on-danger-container ${className}`}>
        <AlertCircle className="h-5 w-5 mr-1.5" />
        <span>Error en cálculo de venta</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-20 w-full items-center justify-between border-t border-border bg-surface p-4 ${className}`}>
        <div>
          <span className="text-[13px] font-bold text-muted-foreground">Solo efectivo (offline)</span>
          <div className="text-[28px] font-extrabold text-foreground">{totalFormatted}</div>
        </div>
        <button
          onClick={onPayCash}
          className="rounded-full bg-primary px-6 py-3 text-[15px] font-bold text-primary-foreground shadow-md"
        >
          Efectivo
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex h-24 w-full flex-col justify-between border-t border-border bg-surface px-5 py-3 shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-muted-foreground">Total:</span>
          <span className="text-[32px] font-extrabold leading-none text-foreground">{totalFormatted}</span>
        </div>

        {onToggleTakeaway && (
          <button
            type="button"
            onClick={() => onToggleTakeaway(!isTakeaway)}
            className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all ${
              isTakeaway ? "bg-primary text-primary-foreground" : "bg-primary-container text-foreground"
            }`}
          >
            {isTakeaway ? "Para llevar" : "Comer aquí"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          type="button"
          onClick={onPayCash}
          className="h-12 rounded-full bg-primary text-[17px] font-bold text-primary-foreground shadow-md active:scale-95 transition-all"
        >
          Efectivo
        </button>
        <button
          type="button"
          onClick={onPayTransfer}
          className="h-12 rounded-full bg-primary-container text-[17px] font-bold text-foreground border border-border active:scale-95 transition-all"
        >
          Transferencia
        </button>
      </div>
    </div>
  );
};
