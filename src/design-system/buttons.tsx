import React from "react";
import { Loader2, WifiOff, AlertCircle, Check } from "lucide-react";
import type { BaseComponentProps } from "./types";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  cajaMode?: boolean; // 64px de alto para el teclado de Caja
  icon?: React.ReactNode;
}

/**
 * 1. ButtonPrimary — Botón principal de la pantalla (máximo uno relleno por vista).
 * Color: token `primary` con hover `primary-hover` (texto `primary-foreground`). Radio cápsula completo.
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
  const baseClasses = `relative inline-flex w-full items-center justify-center gap-2 rounded-full font-bold text-[17px] shadow-brand transition-all duration-200 active:scale-[0.98] ${heightClass} ${className}`;

  if (state === "cargando") {
    return (
      <button
        disabled
        aria-busy="true"
        className={`${baseClasses} bg-primary text-primary-foreground opacity-90 cursor-wait`}
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
        className={`${baseClasses} border-2 border-dashed border-border bg-background text-muted-foreground shadow-none cursor-not-allowed`}
        {...props}
      >
        <span>Sin acción</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        className={`${baseClasses} bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm`}
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
        className={`${baseClasses} bg-muted-foreground text-background opacity-75 shadow-none cursor-not-allowed`}
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
      className={`${baseClasses} bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};

/**
 * 2. ButtonSecondary — Botón secundario en lila suave o blanco con borde.
 * Color: fondo `primary-container` con texto `foreground`, o `surface` con borde `border`.
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
  const baseClasses = `relative inline-flex w-full items-center justify-center gap-2 rounded-full font-bold text-[17px] border border-border transition-all duration-200 active:scale-[0.98] ${heightClass} ${className}`;

  if (state === "cargando") {
    return (
      <button
        disabled
        aria-busy="true"
        className={`${baseClasses} bg-primary-container text-foreground opacity-80 cursor-wait`}
        {...props}
      >
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Cargando</span>
      </button>
    );
  }

  if (state === "vacio") {
    return (
      <button
        disabled
        className={`${baseClasses} bg-surface text-muted-foreground opacity-50 cursor-not-allowed`}
        {...props}
      >
        <span>No disponible</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        className={`${baseClasses} bg-danger-container border-danger text-on-danger-container hover:bg-danger-container`}
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
        className={`${baseClasses} bg-background text-muted-foreground opacity-60 cursor-not-allowed`}
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
      className={`${baseClasses} bg-primary-container text-foreground hover:bg-secondary-container hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed`}
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
      <button disabled className={`${baseClasses} text-muted-foreground opacity-60 cursor-wait`} {...props}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Espere</span>
      </button>
    );
  }

  if (state === "vacio") {
    return (
      <button disabled className={`${baseClasses} text-muted-foreground opacity-40`} {...props}>
        <span>Vacío</span>
      </button>
    );
  }

  if (state === "error") {
    return (
      <button className={`${baseClasses} text-danger hover:bg-danger-container`} {...props}>
        <AlertCircle className="h-4 w-4" />
        <span>{children || "Revisar"}</span>
      </button>
    );
  }

  if (state === "offline") {
    return (
      <button disabled className={`${baseClasses} text-muted-foreground opacity-50`} {...props}>
        <WifiOff className="h-4 w-4" />
        <span>Modo local</span>
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} text-muted-foreground hover:bg-primary-container hover:text-foreground active:bg-secondary-container`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
};
