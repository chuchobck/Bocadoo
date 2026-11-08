import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  WifiOff,
  Loader2,
  QrCode,
  Utensils,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { BocadooQr } from "@/components/bocadoo/BocadooQr";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { PEDIDO_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface EstadoPedidoScreenProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string | undefined;
  status?: "PREPARANDO" | "LISTO" | undefined;
  restaurantName?: string | undefined;
  soup?: string | undefined;
  main?: string | undefined;
  paraLlevar?: boolean | undefined;
  hasPlan?: boolean | undefined;
  onViewLocales?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const EstadoPedidoScreen: React.FC<EstadoPedidoScreenProps> = ({
  isOpen,
  onClose,
  orderNumber = "42",
  status = "PREPARANDO",
  restaurantName = "La Cuchara de San Blas",
  soup = "Locro de papa con queso y aguacate",
  main = "Seco de pollo tierno con maduro frito",
  paraLlevar = false,
  hasPlan = true,
  onViewLocales,
  onRetry,
  state = "exito",
}) => {
  const [secondsLeft, setSecondsLeft] = useState(28 * 60 + 45); // 28:45

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  const timeFormatted = `${min}:${sec.toString().padStart(2, "0")}`;

  const qrValue = `BCD-ORD-${orderNumber}`;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={PEDIDO_COPY.title}>
      <div className="py-1 text-center space-y-4 pb-4">
        {state === "cargando" && (
          <div role="status" className="space-y-4 py-2 text-center animate-pulse">
            <span className="sr-only">Cargando estado del pedido...</span>
            {/* Estado de preparación skeleton */}
            <div className="mx-auto h-7 w-36 rounded-full bg-secondary-container" />

            {/* Tarjeta con QR del pedido skeleton */}
            <div className="rounded-[28px] border border-border bg-surface p-4 text-center shadow-xs space-y-2">
              <div className="mx-auto h-3.5 w-48 rounded-full bg-secondary-container" />
              <div className="mx-auto my-2 flex h-44 w-44 flex-col items-center justify-center rounded-[22px] border border-border bg-secondary-container/60 p-3 shadow-inner">
                <div className="h-32 w-32 rounded-xl bg-border/60" />
              </div>
              <div className="mx-auto h-6 w-32 rounded-lg bg-secondary-container" />
            </div>

            {/* Resumen del plato skeleton */}
            <div className="rounded-2xl border border-border bg-background p-3.5 text-left space-y-2">
              <div className="h-3.5 w-28 rounded-full bg-secondary-container" />
              <div className="space-y-1">
                <div className="h-3 w-44 rounded-full bg-secondary-container/80" />
                <div className="h-3 w-36 rounded-full bg-secondary-container/70" />
              </div>
            </div>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-6">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h4 className="text-[17px] font-extrabold text-foreground">{PEDIDO_COPY.emptyTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{PEDIDO_COPY.emptyDesc}</p>
            <div className="mt-5">
              <ButtonPrimary onClick={onViewLocales || onClose}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h4 className="text-[17px] font-extrabold">{PEDIDO_COPY.errorTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold">No pudimos actualizar tu pedido.</p>
            <button
              type="button"
              onClick={onRetry || onClose}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{PEDIDO_COPY.offlineNotice}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Tarjeta de estado de orden con cuenta regresiva */}
            <div className="rounded-[28px] bg-gradient-to-b from-background to-primary-container p-4 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-primary text-primary-foreground px-2.5 py-0.5 text-[12px] font-black">
                  ORDEN #{orderNumber}
                </span>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-surface px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Vence en {timeFormatted}</span>
                </div>
              </div>

              <h3 className="text-[18px] font-black text-foreground text-left leading-tight">
                {restaurantName}
              </h3>

              {/* Platos pedidos */}
              <div className="rounded-2xl bg-surface p-3 border border-border text-left text-[13px] space-y-1">
                <p className="text-foreground">
                  <strong className="text-primary">Sopa:</strong> {soup}
                </p>
                <p className="text-foreground">
                  <strong className="text-primary">Segundo:</strong> {main}
                </p>
                <p className="text-[12px] font-bold text-muted-foreground pt-0.5">
                  Modalidad: {paraLlevar ? "🥡 Para llevar (+ $0,25)" : "🍽️ Para comer en el local"}
                </p>
              </div>
            </div>

            {/* CÓDIGO QR DE LA PREORDEN */}
            <div className="rounded-[28px] bg-surface border border-border p-4 text-center shadow-xs space-y-2">
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-primary block">
                Muestra este QR en la caja al llegar
              </span>

              <div className="mx-auto my-2 flex h-44 w-44 flex-col items-center justify-center rounded-[22px] bg-qr-bg p-3 border border-border shadow-sm">
                <BocadooQr
                  value={qrValue}
                  size={140}
                  level="M"
                  title={`QR de orden ${orderNumber}`}
                />
              </div>

              <div className="text-[12px] font-mono font-bold text-primary bg-primary-container py-1 px-3 rounded-lg inline-block">
                {qrValue}
              </div>
            </div>

            {/* EXPLICACIÓN CLARA: CON PLAN VS SIN PLAN */}
            <div className="rounded-[24px] bg-background border border-border p-3.5 text-left text-[12px] space-y-2">
              <span className="font-extrabold text-foreground block text-[13px]">
                ¿Cómo se valida en el restaurante?
              </span>

              <div className="flex items-start gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong className="text-success">Si tienes plan activo:</strong>
                  <p className="text-muted-foreground">
                    El cajero escanea tu QR y se descuenta 1 almuerzo de tu saldo. Pagas <strong>$0,00 adicionales</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-foreground">
                <Banknote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-primary">Si no tienes plan (Cobro suelto):</strong>
                  <p className="text-muted-foreground">
                    El cajero escanea tu QR y te cobra el almuerzo suelto ($3,00) en efectivo o transferencia.
                  </p>
                </div>
              </div>
            </div>

            {/* Probar vista de caja */}
            <button
              type="button"
              onClick={() => {
                onClose();
                window.open("/app/dueno", "_blank");
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[13px] font-bold text-primary hover:underline"
            >
              <span>Ver cómo lo recibe la caja del dueño (probar en otra pestaña)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            <ButtonPrimary onClick={onClose}>Listo, voy al restaurante</ButtonPrimary>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
