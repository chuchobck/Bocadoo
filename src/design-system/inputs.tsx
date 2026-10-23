import React, { useState } from "react";
import { Loader2, WifiOff, AlertCircle, Search, X, Check } from "lucide-react";
import type { BaseComponentProps } from "./types";

/**
 * 7. Chip — Etiqueta o filtro interactivo de 1 toque.
 */
export interface ChipProps extends BaseComponentProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onToggle,
  icon,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <span className={`inline-flex items-center justify-center rounded-full bg-[#E7E1F2] px-4 py-2 text-[13px] font-bold text-[#6B5B7B] animate-pulse ${className}`}>
        Cargando
      </span>
    );
  }

  if (state === "vacio") {
    return (
      <span className={`inline-flex items-center rounded-full border border-dashed border-[#E7E1F2] px-4 py-2 text-[13px] font-bold text-[#6B5B7B] ${className}`}>
        Sin opciones
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FDEBEB] border border-[#C0392B] px-3.5 py-2 text-[13px] font-bold text-[#C0392B] ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Error</span>
      </span>
    );
  }

  if (state === "offline") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F5F3FA] px-3.5 py-2 text-[13px] font-bold text-[#6B5B7B] opacity-75 ${className}`}>
        <WifiOff className="h-3.5 w-3.5" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-bold transition-all duration-150 active:scale-95 ${
        selected
          ? "bg-[#7B2CBF] text-white shadow-[0_4px_12px_rgba(123,44,191,0.22)]"
          : "bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC]"
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * 8. Badge — Etiqueta pequeña de estado funcional.
 */
export interface BadgeProps extends BaseComponentProps {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = "neutral",
  icon,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <span className={`inline-flex items-center justify-center rounded-full bg-[#E7E1F2] px-2.5 py-0.5 text-[13px] font-bold text-[#6B5B7B] animate-pulse ${className}`}>
        Cargando
      </span>
    );
  }

  if (state === "vacio") {
    return (
      <span className={`inline-flex items-center rounded-full bg-[#F5F3FA] px-2.5 py-0.5 text-[13px] font-semibold text-[#6B5B7B] ${className}`}>
        --
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#FDEBEB] px-2.5 py-0.5 text-[13px] font-bold text-[#C0392B] ${className}`}>
        <AlertCircle className="h-3 w-3" />
        <span>Error</span>
      </span>
    );
  }

  if (state === "offline") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[#F5F3FA] px-2.5 py-0.5 text-[13px] font-bold text-[#6B5B7B] ${className}`}>
        <WifiOff className="h-3 w-3" />
        <span>Offline</span>
      </span>
    );
  }

  const toneClasses = {
    success: "bg-[#E6F6EC] text-[#157A41]",
    warning: "bg-[#F3E8FF] text-[#7B2CBF]",
    danger: "bg-[#FDEBEB] text-[#C0392B]",
    neutral: "bg-[#F5F3FA] text-[#6B5B7B]",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-bold ${toneClasses} ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

/**
 * 9. ToggleSwitch — Switch responsivo para iOS (51×31) y Android Material 3 (52×32).
 */
export interface ToggleSwitchProps extends BaseComponentProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  platform?: "ios" | "android";
  ariaLabel?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  platform = "ios",
  ariaLabel = "Interruptor",
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return <div className={`h-8 w-13 rounded-full bg-[#E7E1F2] animate-pulse ${className}`} />;
  }

  if (state === "vacio" || state === "offline") {
    return (
      <div className={`h-8 w-13 rounded-full bg-[#E7E1F2] opacity-40 cursor-not-allowed ${className}`} />
    );
  }

  if (state === "error") {
    return (
      <div className={`flex items-center gap-1 text-[#C0392B] ${className}`}>
        <AlertCircle className="h-5 w-5" />
      </div>
    );
  }

  if (platform === "android") {
    // Material 3 Switch spec
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] ${
          checked ? "bg-[#7B2CBF]" : "bg-[#F5F3FA] border-2 border-[#6B5B7B]"
        } ${className}`}
      >
        <span
          className={`grid place-items-center rounded-full transition-all duration-200 shadow-sm ${
            checked
              ? "translate-x-6 h-6 w-6 bg-white text-[#7B2CBF]"
              : "translate-x-1.5 h-4 w-4 bg-[#6B5B7B]"
          }`}
        >
          {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </span>
      </button>
    );
  }

  // iOS Switch spec: 51x31
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] ${
        checked ? "bg-[#7B2CBF]" : "bg-[#E7E1F2]"
      } ${className}`}
    >
      <span
        className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

/**
 * 10. InputField — Campo de texto o teléfono con foco morado y radio 16px.
 */
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseComponentProps {
  label?: string | undefined;
  errorMessage?: string | undefined;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  errorMessage,
  state = "exito",
  className = "",
  disabled,
  ...props
}) => {
  if (state === "cargando") {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <div className="h-4 w-20 rounded bg-[#E7E1F2] animate-pulse" />}
        <div className="h-13 w-full rounded-2xl bg-[#E7E1F2] animate-pulse" />
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex flex-col gap-1.5 opacity-60 ${className}`}>
        {label && <span className="text-[13px] font-bold text-[#6B5B7B]">{label}</span>}
        <input
          disabled
          placeholder="Sin conexión disponible"
          className="h-13 w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] px-4 text-[15px] cursor-not-allowed"
        />
      </div>
    );
  }

  const isError = state === "error" || Boolean(errorMessage);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-[13px] font-bold text-[#4A0E78]">{label}</label>}
      <input
        disabled={disabled}
        className={`h-13 w-full rounded-2xl border bg-white px-4 text-[15px] font-medium text-[#4A0E78] placeholder:text-[#6B5B7B] shadow-sm transition-all focus:outline-none focus:ring-2 ${
          isError
            ? "border-[#C0392B] focus:ring-[#C0392B]/20"
            : "border-[#E7E1F2] focus:border-[#7B2CBF] focus:ring-[#E0AAFF]"
        }`}
        {...props}
      />
      {isError && (
        <span className="flex items-center gap-1 text-[13px] font-bold text-[#C0392B]">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage || "Entrada no válida"}</span>
        </span>
      )}
    </div>
  );
};

/**
 * 11. SearchInput — Buscador con icono, botón de limpiar y respuesta rápida.
 */
export interface SearchInputProps extends BaseComponentProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Buscar restaurante",
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`flex h-13 w-full items-center gap-2 rounded-2xl bg-[#F5F3FA] px-4 animate-pulse ${className}`}>
        <Search className="h-5 w-5 text-[#6B5B7B]" />
        <span className="text-[15px] text-[#6B5B7B]">Buscando...</span>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-13 w-full items-center gap-2 rounded-2xl border border-dashed border-[#E7E1F2] bg-[#F5F3FA] px-4 ${className}`}>
        <Search className="h-5 w-5 text-[#6B5B7B]" />
        <span className="text-[15px] text-[#6B5B7B]">Sin resultados previos</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-13 w-full items-center gap-2 rounded-2xl border border-[#C0392B] bg-[#FDEBEB] px-4 text-[#C0392B] ${className}`}>
        <AlertCircle className="h-5 w-5" />
        <span className="text-[15px] font-bold">Error en la búsqueda</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`relative flex items-center ${className}`}>
        <Search className="absolute left-4 h-5 w-5 text-[#6B5B7B]" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar en guardados..."
          className="h-13 w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] pl-11 pr-4 text-[15px] font-medium text-[#4A0E78]"
        />
        <WifiOff className="absolute right-4 h-4 w-4 text-[#6B5B7B]" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 h-5 w-5 text-[#6B5B7B]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-2xl border border-[#E7E1F2] bg-white pl-11 pr-11 text-[15px] font-medium text-[#4A0E78] placeholder:text-[#6B5B7B] shadow-sm transition-all focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#E0AAFF]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3.5 grid h-6 w-6 place-items-center rounded-full bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC]"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
