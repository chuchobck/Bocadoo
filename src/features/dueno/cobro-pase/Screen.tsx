import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  WifiOff,
  Loader2,
  QrCode,
  X,
} from "lucide-react";
import { UndoBanner } from "@/design-system";
import { COBRO_PASE_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface CobrarPaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome?: "VERDE" | "MORADO" | "ROJO";
  dinerName?: string;
  remainingLunches?: number;
  onUndoRedemption?: (() => void) | undefined;
  /** Texto bajo el nombre (p. ej. "Le quedan 12 almuerzos" o "Cobrado $3,25"). Si falta se usa el saldo. */
  detailText?: string | undefined;
  /** Controla si se ofrece Deshacer. Por defecto solo en VERDE. */
  undoable?: boolean | undefined;
  onSellPlan?: (() => void) | undefined;
  onRetry?: () => void;
  state?: ComponentState;
}

export const CobrarPaseScreen: React.FC<CobrarPaseModalProps> = ({
  isOpen,
  onClose,
  outcome = "VERDE",
  dinerName = "Carlos Mejía",
  remainingLunches = 13,
  onUndoRedemption,
  detailText,
  undoable,
  onSellPlan,
  onRetry,
  state = "exito",
}) => {
  const [undoSeconds, setUndoSeconds] = useState(10);

  // Al abrir se reinicia el búfer de deshacer; luego cuenta regresiva de 10 s
  useEffect(() => {
    if (isOpen) setUndoSeconds(10);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || undoSeconds <= 0) return;
    const t = setTimeout(() => setUndoSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(t);
  }, [isOpen, undoSeconds]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-[4px] p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-surface p-6 text-center shadow-2xl animate-in zoom-in-95 relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar escáner"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {state === "cargando" && (
          <div className="py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-[17px] font-extrabold text-foreground">{COBRO_PASE_COPY.validating}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8">
            <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h2 className="text-[17px] font-extrabold text-foreground">{COBRO_PASE_COPY.scanPassPrompt}</h2>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-primary-container px-5 py-2 text-[13px] font-bold text-primary active:scale-95"
            >
              Volver a caja
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="py-6">
            <div className="rounded-[24px] bg-danger-container p-5 text-center text-on-danger-container">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h2 className="text-[17px] font-extrabold">{COBRO_PASE_COPY.scanError}</h2>
              <button
                type="button"
                onClick={onRetry || onClose}
                className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {state === "offline" && (
          <div className="py-4">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-[13px] font-bold text-muted-foreground">
              <WifiOff className="h-4 w-4" />
              <span>Sin conexión</span>
            </div>
            <div className="rounded-[24px] bg-success-container p-5 text-success">
              <CheckCircle2 className="mx-auto h-10 w-10 mb-2" />
              <h2 className="text-[20px] font-black">{dinerName}</h2>
              <p className="text-[15px] font-bold mt-1">{COBRO_PASE_COPY.scanOffline}</p>
              <span className="block text-[13px] font-semibold mt-0.5">
                {remainingLunches} restantes en su plan
              </span>
            </div>
          </div>
        )}

        {state === "exito" && (
          <div className="py-2">
            {outcome === "VERDE" && (
              <div className="rounded-[28px] bg-success-container p-6 text-success">
                <CheckCircle2 className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.validPass}</p>
                <span className="block text-[15px] font-bold text-success mt-1">
                  {detailText ?? `Le quedan ${remainingLunches} almuerzos`}
                </span>
              </div>
            )}

            {outcome === "MORADO" && (
              <div className="rounded-[28px] bg-primary-container p-6 text-primary">
                <AlertTriangle className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.warningPass}</p>
                <span className="block text-[13px] font-bold text-foreground mt-1">
                  {COBRO_PASE_COPY.warningPlanEnded}
                </span>
                <button
                  type="button"
                  onClick={onSellPlan}
                  className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground shadow-xs"
                >
                  {COBRO_PASE_COPY.offerPlan}
                </button>
              </div>
            )}

            {outcome === "ROJO" && (
              <div className="rounded-[28px] bg-danger-container p-6 text-on-danger-container">
                <XCircle className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.expiredPass}</p>
                <span className="block text-[13px] font-semibold text-muted-foreground mt-1">
                  {detailText ?? COBRO_PASE_COPY.expiredSub}
                </span>
                <button
                  type="button"
                  onClick={onSellPlan}
                  className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground"
                >
                  {COBRO_PASE_COPY.sellNewPlan}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-background py-3 text-[15px] font-bold text-foreground active:scale-95"
            >
              {COBRO_PASE_COPY.done}
            </button>
          </div>
        )}

        {/* Deshacer automático de 10 segundos para revertir el cobro */}
        {undoSeconds > 0 && (undoable ?? outcome === "VERDE") && state === "exito" && (
          <div className="mt-3">
            <UndoBanner
              secondsLeft={undoSeconds}
              onUndo={() => {
                setUndoSeconds(0);
                onUndoRedemption?.();
                onClose();
              }}
              label={COBRO_PASE_COPY.undoLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
};
