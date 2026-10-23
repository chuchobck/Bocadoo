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
      <div className={`flex h-[72px] w-full items-center justify-around border-t border-[#E7E1F2] bg-white px-2 animate-pulse ${className}`}>
        {Array.from({ length: items.length || 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 rounded-full bg-[#E7E1F2]" />
            <div className="h-3 w-10 rounded bg-[#E7E1F2]" />
          </div>
        ))}
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-[72px] w-full items-center justify-center border-t border-[#E7E1F2] bg-[#F5F3FA] text-[13px] font-bold text-[#6B5B7B] ${className}`}>
        Sin pestañas configuradas
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-[72px] w-full items-center justify-center border-t border-[#C0392B] bg-[#FDEBEB] text-[13px] font-bold text-[#C0392B] ${className}`}>
        <AlertCircle className="h-4 w-4 mr-1.5" />
        <span>Error en navegación</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-[72px] w-full flex-col border-t border-[#E7E1F2] bg-white ${className}`}>
        <div className="flex h-5 items-center justify-center bg-[#F5F3FA] text-[13px] font-bold text-[#6B5B7B]">
          <WifiOff className="h-3.5 w-3.5 mr-1" />
          <span>Sin conexión</span>
        </div>
        <div className="flex flex-1 items-center justify-around">
          {items.map((item) => (
            <button key={item.id} onClick={() => onSelect(item.id)} className="flex flex-col items-center text-[13px] font-bold text-[#6B5B7B]">
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
      className={`flex h-[72px] w-full items-center justify-around border-t border-[#E7E1F2] bg-white px-2 shadow-[0_-4px_16px_rgba(74,14,120,0.04)] ${className}`}
    >
      {items.map((item) => {
        const isSelected = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 transition-all duration-150 ${
              isSelected ? "text-[#7B2CBF]" : "text-[#6B5B7B] hover:text-[#4A0E78]"
            }`}
          >
            <div className={`grid place-items-center rounded-xl p-1 ${isSelected ? "bg-[#F3E8FF]" : ""}`}>
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
      <header className={`flex h-14 w-full items-center justify-between px-4 animate-pulse bg-white border-b border-[#E7E1F2] ${className}`}>
        <div className="h-6 w-6 rounded-full bg-[#E7E1F2]" />
        <div className="h-6 w-28 rounded-lg bg-[#E7E1F2]" />
        <div className="h-6 w-6 rounded-full bg-[#E7E1F2]" />
      </header>
    );
  }

  if (state === "vacio") {
    return (
      <header className={`flex h-14 w-full items-center justify-center px-4 bg-white border-b border-[#E7E1F2] ${className}`}>
        <span className="text-[15px] font-bold text-[#6B5B7B]">Bocadoo</span>
      </header>
    );
  }

  if (state === "error") {
    return (
      <header className={`flex h-14 w-full items-center justify-between px-4 bg-[#FDEBEB] border-b border-[#C0392B] text-[#C0392B] ${className}`}>
        <span className="text-[15px] font-bold">Error de conexión</span>
      </header>
    );
  }

  if (state === "offline") {
    return (
      <header className={`flex h-14 w-full items-center justify-between px-4 bg-white border-b border-[#E7E1F2] ${className}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} aria-label="Volver" className="grid h-10 w-10 place-items-center rounded-full text-[#4A0E78]">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[17px] font-extrabold text-[#4A0E78] truncate">{title}</h1>
        </div>
        <WifiOff className="h-4 w-4 text-[#6B5B7B]" />
      </header>
    );
  }

  return (
    <header className={`flex h-14 w-full items-center justify-between px-4 bg-white border-b border-[#E7E1F2] ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#4A0E78] hover:bg-[#F3E8FF] active:scale-95 transition-all"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}
        <h1 className="text-[17px] font-extrabold text-[#4A0E78] truncate max-w-[240px]">{title}</h1>
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
    return <div className={`h-8 w-24 rounded-full bg-[#E7E1F2] animate-pulse ${className}`} />;
  }

  if (state === "vacio") {
    return (
      <span className={`inline-flex items-center rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-semibold text-[#6B5B7B] ${className}`}>
        Sin estimar
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#FDEBEB] px-3 py-1 text-[13px] font-bold text-[#C0392B] ${className}`}>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>No disponible</span>
      </span>
    );
  }

  if (state === "offline") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#6B5B7B] ${className}`}>
        <WifiOff className="h-3.5 w-3.5" />
        <span>Ocupación previa</span>
      </span>
    );
  }

  const configs = {
    LIBRE: {
      bg: "bg-[#E6F6EC]",
      text: "text-[#157A41]",
      label: "Libre",
      Icon: CheckCircle2,
    },
    MOVIDO: {
      bg: "bg-[#F3E8FF]",
      text: "text-[#7B2CBF]",
      label: "Movido",
      Icon: Users,
    },
    LLENO: {
      bg: "bg-[#FDEBEB]",
      text: "text-[#C0392B]",
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
      <div className={`flex h-20 w-full items-center justify-between border-t border-[#E7E1F2] bg-white p-4 animate-pulse ${className}`}>
        <div className="h-8 w-24 rounded-lg bg-[#E7E1F2]" />
        <div className="h-12 w-32 rounded-full bg-[#E7E1F2]" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-20 w-full items-center justify-center border-t border-[#E7E1F2] bg-[#F5F3FA] text-[15px] font-bold text-[#6B5B7B] ${className}`}>
        Toca un plato para cobrar
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-20 w-full items-center justify-center border-t border-[#C0392B] bg-[#FDEBEB] text-[15px] font-bold text-[#C0392B] ${className}`}>
        <AlertCircle className="h-5 w-5 mr-1.5" />
        <span>Error en cálculo de venta</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-20 w-full items-center justify-between border-t border-[#E7E1F2] bg-white p-4 ${className}`}>
        <div>
          <span className="text-[13px] font-bold text-[#6B5B7B]">Solo efectivo (offline)</span>
          <div className="text-[28px] font-extrabold text-[#4A0E78]">{totalFormatted}</div>
        </div>
        <button
          onClick={onPayCash}
          className="rounded-full bg-[#7B2CBF] px-6 py-3 text-[15px] font-bold text-white shadow-md"
        >
          Efectivo
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex h-24 w-full flex-col justify-between border-t border-[#E7E1F2] bg-white px-5 py-3 shadow-[0_-6px_20px_rgba(74,14,120,0.06)] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-[#6B5B7B]">Total:</span>
          <span className="text-[32px] font-extrabold leading-none text-[#4A0E78]">{totalFormatted}</span>
        </div>

        {onToggleTakeaway && (
          <button
            type="button"
            onClick={() => onToggleTakeaway(!isTakeaway)}
            className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all ${
              isTakeaway ? "bg-[#7B2CBF] text-white" : "bg-[#F3E8FF] text-[#4A0E78]"
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
          className="h-12 rounded-full bg-[#7B2CBF] text-[17px] font-bold text-white shadow-md active:scale-95 transition-all"
        >
          Efectivo
        </button>
        <button
          type="button"
          onClick={onPayTransfer}
          className="h-12 rounded-full bg-[#F3E8FF] text-[17px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95 transition-all"
        >
          Transferencia
        </button>
      </div>
    </div>
  );
};
