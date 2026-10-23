import React, { useState } from "react";
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
  onUndoRedemption?: () => void;
  onSellPlan?: () => void;
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
  onSellPlan,
  onRetry,
  state = "exito",
}) => {
  const [undoSeconds, setUndoSeconds] = useState(10);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A0E78]/50 backdrop-blur-[4px] p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar escáner"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {state === "cargando" && (
          <div className="py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-4 text-[17px] font-extrabold text-[#4A0E78]">{COBRO_PASE_COPY.validating}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8">
            <QrCode className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{COBRO_PASE_COPY.scanPassPrompt}</h2>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-[#F3E8FF] px-5 py-2 text-[13px] font-bold text-[#7B2CBF] active:scale-95"
            >
              Volver a caja
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="py-6">
            <div className="rounded-[24px] bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h2 className="text-[17px] font-extrabold">{COBRO_PASE_COPY.scanError}</h2>
              <button
                type="button"
                onClick={onRetry || onClose}
                className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {state === "offline" && (
          <div className="py-4">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#6B5B7B]">
              <WifiOff className="h-4 w-4" />
              <span>Sin conexión</span>
            </div>
            <div className="rounded-[24px] bg-[#E6F6EC] p-5 text-[#157A41]">
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
              <div className="rounded-[28px] bg-[#E6F6EC] p-6 text-[#157A41]">
                <CheckCircle2 className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.validPass}</p>
                <span className="block text-[15px] font-bold text-[#0E542C] mt-1">
                  Le quedan {remainingLunches} almuerzos
                </span>
              </div>
            )}

            {outcome === "MORADO" && (
              <div className="rounded-[28px] bg-[#F3E8FF] p-6 text-[#7B2CBF]">
                <AlertTriangle className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.warningPass}</p>
                <span className="block text-[13px] font-bold text-[#4A0E78] mt-1">
                  {COBRO_PASE_COPY.warningPlanEnded}
                </span>
                <button
                  type="button"
                  onClick={onSellPlan}
                  className="mt-4 w-full rounded-full bg-[#7B2CBF] py-2.5 text-[13px] font-bold text-white shadow-xs"
                >
                  {COBRO_PASE_COPY.offerPlan}
                </button>
              </div>
            )}

            {outcome === "ROJO" && (
              <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-[#C0392B]">
                <XCircle className="mx-auto h-14 w-14 mb-2" />
                <h2 className="text-[22px] font-black">{dinerName}</h2>
                <p className="text-[17px] font-extrabold mt-1">{COBRO_PASE_COPY.expiredPass}</p>
                <span className="block text-[13px] font-semibold text-[#6B5B7B] mt-1">
                  {COBRO_PASE_COPY.expiredSub}
                </span>
                <button
                  type="button"
                  onClick={onSellPlan}
                  className="mt-4 w-full rounded-full bg-[#4A0E78] py-2.5 text-[13px] font-bold text-white"
                >
                  {COBRO_PASE_COPY.sellNewPlan}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-[#F5F3FA] py-3 text-[15px] font-bold text-[#4A0E78] active:scale-95"
            >
              {COBRO_PASE_COPY.done}
            </button>
          </div>
        )}

        {/* Deshacer automático de 10 segundos para revertir el cobro */}
        {undoSeconds > 0 && outcome === "VERDE" && state === "exito" && (
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
