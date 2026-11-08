import React from "react";
import { Loader2, WifiOff, AlertCircle } from "lucide-react";
import type { BaseComponentProps } from "./types";

export interface BigNumberProps extends BaseComponentProps {
  value: string | number;
  label: string;
  sublabel?: string;
  size?: "md" | "lg" | "xl";
  tone?: "primary" | "success" | "neutral" | "danger";
}

/**
 * 4. BigNumber — Tipografía protagonista para saldos, almuerzos y totales.
 * Tamaños: 32px a 56px, peso 800 (ExtraBold).
 */
export const BigNumber: React.FC<BigNumberProps> = ({
  value,
  label,
  sublabel,
  size = "lg",
  tone = "primary",
  state = "exito",
  className = "",
}) => {
  const sizeClasses = {
    md: "text-[32px] leading-tight",
    lg: "text-[44px] leading-none",
    xl: "text-[56px] leading-none",
  }[size];

  const toneClasses = {
    primary: "text-foreground",
    success: "text-success",
    neutral: "text-muted-foreground",
    danger: "text-danger",
  }[tone];

  if (state === "cargando") {
    return (
      <div className={`flex flex-col items-center gap-1.5 ${className}`}>
        <div className="h-10 w-24 animate-pulse rounded-2xl bg-border" />
        <div className="h-4 w-16 animate-pulse rounded-md bg-border" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex flex-col items-center gap-1 text-center ${className}`}>
        <span className={`${sizeClasses} font-extrabold text-muted-foreground opacity-40`}>--</span>
        <span className="text-[13px] font-semibold text-muted-foreground">Sin registros</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex flex-col items-center gap-1 text-center ${className}`}>
        <div className="flex items-center gap-1.5 text-danger">
          <AlertCircle className="h-6 w-6" />
          <span className="text-[20px] font-bold">Error</span>
        </div>
        <span className="text-[13px] font-semibold text-muted-foreground">{label || "No disponible"}</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex flex-col items-center gap-1 text-center ${className}`}>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <WifiOff className="h-5 w-5" />
          <span className={`${sizeClasses} font-extrabold opacity-60`}>{value}</span>
        </div>
        <span className="text-[13px] font-semibold text-muted-foreground">Guardado local</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span className={`${sizeClasses} font-extrabold tracking-tight ${toneClasses}`}>
        {value}
      </span>
      <span className="mt-1 text-[15px] font-bold text-foreground">{label}</span>
      {sublabel && (
        <span className="mt-0.5 text-[13px] font-semibold text-muted-foreground">{sublabel}</span>
      )}
    </div>
  );
};
