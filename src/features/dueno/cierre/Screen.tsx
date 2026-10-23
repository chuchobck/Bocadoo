import React, { useState } from "react";
import {
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { UndoBanner } from "@/design-system";
import { CIERRE_COPY } from "./copy";
import { salesRepository } from "@/data/repositories/sales.repository";
import type { ComponentState } from "@/design-system";

export interface CierreScreenProps {
  role?: "dueno" | "cajero";
  onBack?: () => void;
  onConfirmClose?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const CierreScreen: React.FC<CierreScreenProps> = ({
  role = "dueno",
  onBack,
  onConfirmClose,
  onRetry,
  state = "exito",
}) => {
  const totals = salesRepository.getTodayTotals();
  const [closed, setClosed] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const handleCloseShift = () => {
    setClosed(true);
    setUndoLabel(CIERRE_COPY.closedUndo);
    setUndoSeconds(10);
    onConfirmClose?.();
  };

  // Restricción estricta de seguridad: si es cajero/ayudante, no tiene acceso
  if (role === "cajero") {
    return (
      <div
        tabIndex={0}
        aria-label="Cierre de caja restringido"
        className="flex h-full flex-col bg-white focus:outline-hidden"
      >
        <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver a caja"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-[22px] font-black text-[#4A0E78]">{CIERRE_COPY.title}</h1>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="rounded-[32px] bg-[#F5F3FA] p-8 border border-[#E7E1F2] w-full max-w-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FDEBEB] text-[#C0392B] mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-[18px] font-black text-[#4A0E78]">
              {CIERRE_COPY.restrictedMessage}
            </h2>
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              className="mt-6 w-full rounded-full bg-[#7B2CBF] py-3 text-[14px] font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              Volver a caja
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      aria-label="Cierre de caja"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a caja"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[22px] font-black text-[#4A0E78]">{CIERRE_COPY.title}</h1>
        </div>
        <span className="text-[13px] font-bold text-[#6B5B7B]">{CIERRE_COPY.shiftToday}</span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{CIERRE_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <Banknote className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{CIERRE_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{CIERRE_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{CIERRE_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{CIERRE_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{CIERRE_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Ventas totales */}
            <div className="rounded-[28px] bg-[#4A0E78] p-6 text-white text-center shadow-md">
              <span className="text-[13px] font-bold text-[#E0AAFF] uppercase tracking-wider">
                {CIERRE_COPY.shiftSales}
              </span>
              <div className="my-2 text-[40px] font-black leading-none">
                {totals.totalFormatted}
              </div>
              <span className="text-[13px] font-semibold text-[#E0AAFF]">
                {CIERRE_COPY.lunchesServed(totals.lunchesServed)}
              </span>
            </div>

            {/* Desglose por método */}
            <div className="rounded-[24px] bg-[#F5F3FA] p-4 border border-[#E7E1F2] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#E6F6EC] text-[#157A41]">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-[#4A0E78]">
                    {CIERRE_COPY.cashInRegister}
                  </span>
                </div>
                <span className="text-[15px] font-black text-[#4A0E78]">
                  {totals.cashFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#E7E1F2] pt-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-[#4A0E78]">
                    {CIERRE_COPY.transfers}
                  </span>
                </div>
                <span className="text-[15px] font-black text-[#4A0E78]">
                  {totals.transferFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#E7E1F2] pt-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#EBD7FC] text-[#4A0E78]">
                    <Percent className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-[#4A0E78]">
                    {CIERRE_COPY.bocadooCommission}
                  </span>
                </div>
                <span className="text-[15px] font-black text-[#7B2CBF]">$0,00</span>
              </div>
            </div>

            {/* Botón de cierre en 1 toque */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseShift}
                className="w-full rounded-full bg-[#4A0E78] py-3.5 text-[15px] font-bold text-white shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{CIERRE_COPY.closeShiftButton}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            setClosed(false);
          }}
          label={undoLabel}
        />
      )}
    </div>
  );
};
