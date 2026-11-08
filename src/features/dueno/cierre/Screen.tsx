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
  const [countedCashDollars, setCountedCashDollars] = useState<number>(totals.cashCents / 100);
  const [closed, setClosed] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const diffCents = Math.round(countedCashDollars * 100) - totals.cashCents;
  const isBalanced = diffCents === 0;

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
        className="flex h-full flex-col bg-surface focus:outline-hidden"
      >
        <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver a caja"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-[22px] font-black text-foreground">{CIERRE_COPY.title}</h1>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="rounded-[32px] bg-background p-8 border border-border w-full max-w-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-danger-container text-on-danger-container mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-[18px] font-black text-foreground">
              {CIERRE_COPY.restrictedMessage}
            </h2>
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              className="mt-6 w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-xs active:scale-95 transition-all"
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
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-border bg-surface sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a caja"
              className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[22px] font-black text-foreground">{CIERRE_COPY.title}</h1>
        </div>
        <span className="text-[13px] font-bold text-muted-foreground">{CIERRE_COPY.shiftToday}</span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-3 text-[17px] font-extrabold text-foreground">{CIERRE_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <Banknote className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h2 className="text-[17px] font-extrabold text-foreground">{CIERRE_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{CIERRE_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{CIERRE_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{CIERRE_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{CIERRE_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Ventas totales */}
            <div className="rounded-[28px] bg-hero-gradient p-6 text-image-foreground text-center shadow-md">
              <span className="text-[13px] font-bold text-image-foreground/85 uppercase tracking-wider">
                {CIERRE_COPY.shiftSales}
              </span>
              <div className="my-2 text-[40px] font-black leading-none">
                {totals.totalFormatted}
              </div>
              <span className="text-[13px] font-semibold text-image-foreground/85">
                {CIERRE_COPY.lunchesServed(totals.lunchesServed)}
              </span>
            </div>

            {/* Desglose por método */}
            <div className="rounded-[24px] bg-background p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-success-container text-success">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-foreground">
                    {CIERRE_COPY.cashInRegister}
                  </span>
                </div>
                <span className="text-[15px] font-black text-foreground">
                  {totals.cashFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-primary">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-foreground">
                    {CIERRE_COPY.transfers}
                  </span>
                </div>
                <span className="text-[15px] font-black text-foreground">
                  {totals.transferFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-foreground">
                    <Percent className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-foreground">
                    {CIERRE_COPY.bocadooCommission}
                  </span>
                </div>
                <span className="text-[15px] font-black text-primary">$0,00</span>
              </div>
            </div>

            {/* CUADRE DE CAJA: FÍSICO VS BOCADOO */}
            <div className="rounded-[24px] bg-background p-4 border border-border space-y-3">
              <span className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Cuadre de caja física
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold text-muted-foreground">Efectivo en Bocadoo</span>
                  <p className="text-[18px] font-black text-foreground">{totals.cashFormatted}</p>
                </div>

                <div className="text-right">
                  <label htmlFor="counted-cash" className="block text-[13px] font-bold text-muted-foreground">
                    Efectivo en cajón
                  </label>
                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                    <span className="text-[16px] font-black text-primary">$</span>
                    <input
                      id="counted-cash"
                      type="number"
                      step="0.5"
                      value={countedCashDollars}
                      onChange={(e) => setCountedCashDollars(parseFloat(e.target.value) || 0)}
                      className="w-20 rounded-xl border border-border bg-surface px-2 py-1 text-right text-[16px] font-black text-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Resultado del cuadre */}
              <div
                className={`rounded-2xl p-3 flex items-center justify-between border ${
                  isBalanced
                    ? "bg-success-container border-success/30 text-success"
                    : diffCents > 0
                    ? "bg-primary-container border-primary/30 text-primary"
                    : "bg-danger-container border-danger/30 text-on-danger-container"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="text-[13px] font-bold">
                    {isBalanced
                      ? "Caja cuadrada exacta"
                      : diffCents > 0
                      ? "Sobrante en cajón"
                      : "Faltante en cajón"}
                  </span>
                </div>
                <span className="text-[14px] font-black">
                  {isBalanced
                    ? "$0,00"
                    : `${diffCents > 0 ? "+" : ""}$${(diffCents / 100).toFixed(2).replace(".", ",")}`}
                </span>
              </div>
            </div>

            {/* Botón de cierre en 1 toque */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCloseShift}
                className="w-full rounded-full bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-primary-hover"
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
