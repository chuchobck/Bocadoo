import React from "react";
import { Loader2, WifiOff, AlertCircle, Check } from "lucide-react";
import type { BaseComponentProps } from "./types";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  cajaMode?: boolean; // 64px de alto para el teclado de Caja
  icon?: React.ReactNode;
}

/**
 * 1. ButtonPrimary — Botón principal de la pantalla (máximo uno relleno por vista).
 * Color: #7B2CBF (Primary) con hover #6A22A9. Radio cápsula completo.
 */
export const ButtonPrimary: React.FC<ButtonProps> = ({
  children,
  state = "exito",
  cajaMode = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const heightClass = cajaMode ? "h-16" : "h-14";
  const baseClasses = `relative inline-flex w-full items-center justify-center gap-2 rounded-full font-bold text-[17px] text-white shadow-[0_8px_20px_rgba(123,44,191,0.25)] transition-all duration-200 active:scale-[0.98] ${heightClass} ${className}`;

  if (state === "cargando") {
    return (
      <button
        disabled
        aria-busy="true"
        className={`${baseClasses} bg-[#7B2CBF] opacity-90 cursor-wait`}
        {...props}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Cargando</span>
      </button>
    );
  }

  if (state === "vacio") {
    return (
      <button
        disabled
        className={`${baseClasses} border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] text-[#6B5B7B] shadow-none cursor-not-allowed`}
        {...props}
      >
        <span>Sin acción</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        className={`${baseClasses} bg-[#C0392B] text-white hover:bg-[#A93226] shadow-[0_8px_20px_rgba(192,57,43,0.25)]`}
        {...props}
      >
        <AlertCircle className="h-5 w-5" />
        <span>{children || "Reintentar"}</span>
      </button>
    );
  }

  if (state === "offline") {
    return (
      <button
        disabled
        className={`${baseClasses} bg-[#6B5B7B] opacity-75 shadow-none cursor-not-allowed`}
        {...props}
      >
        <WifiOff className="h-5 w-5" />
        <span>Sin conexión</span>
      </button>
    );
  }

  // Éxito / Estado normal
  return (
    <button
      disabled={disabled}
      className={`${baseClasses} bg-[#7B2CBF] hover:bg-[#6A22A9] disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

/**
 * 2. ButtonSecondary — Botón secundario en lila suave o blanco con borde.
 * Color: Fondo #F3E8FF con texto #4A0E78 o blanco con borde #E7E1F2.
 */
export const ButtonSecondary: React.FC<ButtonProps> = ({
  children,
  state = "exito",
  cajaMode = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const heightClass = cajaMode ? "h-16" : "h-14";
  const baseClasses = `relative inline-flex w-full items-center justify-center gap-2 rounded-full font-bold text-[17px] border border-[#E7E1F2] transition-all duration-200 active:scale-[0.98] ${heightClass} ${className}`;

  if (state === "cargando") {
    return (
      <button
        disabled
        aria-busy="true"
        className={`${baseClasses} bg-[#F3E8FF] text-[#4A0E78] opacity-80 cursor-wait`}
        {...props}
      >
        <Loader2 className="h-5 w-5 animate-spin text-[#7B2CBF]" />
        <span>Cargando</span>
      </button>
    );
  }

  if (state === "vacio") {
    return (
      <button
        disabled
        className={`${baseClasses} bg-white text-[#6B5B7B] opacity-50 cursor-not-allowed`}
        {...props}
      >
        <span>No disponible</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        className={`${baseClasses} bg-[#FDEBEB] border-[#C0392B] text-[#C0392B] hover:bg-[#FADBD8]`}
        {...props}
      >
        <AlertCircle className="h-5 w-5" />
        <span>{children || "Error"}</span>
      </button>
    );
  }

  if (state === "offline") {
    return (
      <button
        disabled
        className={`${baseClasses} bg-[#F5F3FA] text-[#6B5B7B] opacity-60 cursor-not-allowed`}
        {...props}
      >
        <WifiOff className="h-5 w-5" />
        <span>Reconectar</span>
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC] hover:border-[#E0AAFF] disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

/**
 * 3. ButtonGhost — Botón sutil de texto o ícono sin contenedor pesado.
 */
export const ButtonGhost: React.FC<ButtonProps> = ({
  children,
  state = "exito",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-semibold text-[15px] transition-colors duration-150 ${className}`;

  if (state === "cargando") {
    return (
      <button disabled className={`${baseClasses} text-[#6B5B7B] opacity-60 cursor-wait`} {...props}>
        <Loader2 className="h-4 w-4 animate-spin text-[#7B2CBF]" />
        <span>Espere</span>
      </button>
    );
  }

  if (state === "vacio") {
    return (
      <button disabled className={`${baseClasses} text-[#6B5B7B] opacity-40`} {...props}>
        <span>Vacío</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button className={`${baseClasses} text-[#C0392B] hover:bg-[#FDEBEB]`} {...props}>
        <AlertCircle className="h-4 w-4" />
        <span>{children || "Revisar"}</span>
      </button>
    );
  }

  if (state === "offline") {
    return (
      <button disabled className={`${baseClasses} text-[#6B5B7B] opacity-50`} {...props}>
        <WifiOff className="h-4 w-4" />
        <span>Modo local</span>
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} text-[#6B5B7B] hover:bg-[#F3E8FF] hover:text-[#4A0E78] active:bg-[#EBD7FC]`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
