import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, AlertCircle, WifiOff, Loader2, ArrowLeft, QrCode, X } from "lucide-react";
import { UndoBanner } from "@/design-system";
import { PEDIDOS_COPY } from "./copy";
import { ordersRepository, type OrderItem } from "@/data/repositories/orders.repository";
import type { ComponentState } from "@/design-system";

/** Pedido en pantalla. `status` lo informa el store: POR_VALIDAR (falta escanear su QR) o VALIDADO (falta entregar). */
export type PedidoItem = OrderItem & { status?: "POR_VALIDAR" | "VALIDADO" };

export interface PedidosScreenProps {
  /** Si se pasa, la pantalla es controlada (datos del store). Si no, usa el repositorio local (solo demos de estados). */
  orders?: PedidoItem[];
  onDeliverOrder?: (orderId: string) => void;
  onUndoDeliver?: (orderId: string) => void;
  onScanOrder?: (orderId: string) => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const PedidosScreen: React.FC<PedidosScreenProps> = ({
  orders,
  onDeliverOrder,
  onUndoDeliver,
  onScanOrder,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const isControlled = orders !== undefined;
  const [localOrders, setLocalOrders] = useState<PedidoItem[]>(() =>
    isControlled ? [] : ordersRepository.getActiveOrders(),
  );
  const activeOrders: PedidoItem[] = isControlled ? orders : localOrders;
  const [scanningOrder, setScanningOrder] = useState<PedidoItem | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");
  const [lastDeliveredId, setLastDeliveredId] = useState<string | null>(null);

  // Cuenta regresiva del búfer de deshacer
  useEffect(() => {
    if (undoSeconds <= 0) return;
    const t = setTimeout(() => setUndoSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(t);
  }, [undoSeconds]);

  const handleDeliver = (order: PedidoItem) => {
    if (!isControlled) {
      ordersRepository.deliverOrder(order.id);
      setLocalOrders((prev) => prev.filter((o) => o.id !== order.id));
    }
    setLastDeliveredId(order.id);
    setUndoLabel(PEDIDOS_COPY.orderDelivered(order.orderNumber));
    setUndoSeconds(10);
    onDeliverOrder?.(order.id);
  };

  const handleUndoDeliver = () => {
    if (isControlled) {
      if (lastDeliveredId) onUndoDeliver?.(lastDeliveredId);
    } else {
      setLocalOrders(ordersRepository.getOrders().filter((o) => !o.delivered));
    }
    setLastDeliveredId(null);
    setUndoSeconds(0);
  };

  const handleScanOrder = (order: PedidoItem) => {
    if (onScanOrder) {
      onScanOrder(order.id);
    } else {
      setScanningOrder(order);
    }
  };

  return (
    <div
      tabIndex={0}
      aria-label="Pedidos en camino"
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between sticky top-0 z-10">
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
          <h1 className="text-[22px] font-black text-foreground">{PEDIDOS_COPY.title}</h1>
        </div>
        <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-[13px] font-bold text-primary">
          {PEDIDOS_COPY.activeCount(activeOrders.length)}
        </span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-3 text-[17px] font-extrabold text-foreground">{PEDIDOS_COPY.loadingTitle}</h2>
          </div>
        )}

        {(state === "vacio" || (activeOrders.length === 0 && state === "exito")) && (
          <div className="py-16 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h2 className="text-[17px] font-extrabold text-foreground">{PEDIDOS_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              {PEDIDOS_COPY.emptyDesc}
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-5 rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-primary-foreground active:scale-95"
              >
                {PEDIDOS_COPY.backToCaja}
              </button>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{PEDIDOS_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">No se pudieron sincronizar los pedidos.</p>
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
            <span>{PEDIDOS_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && activeOrders.length > 0 && (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-[24px] border border-border bg-surface p-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-primary-container px-2.5 py-1 text-[15px] font-black text-primary">
                      #{order.orderNumber}
                    </span>
                    <h3 className="text-[17px] font-extrabold text-foreground">{order.dinerName}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Hace {order.minutesAgo} min</span>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-background p-3 text-[14px] font-semibold text-foreground space-y-1">
                  <p>
                    <span className="font-bold text-primary">Sopa:</span> {order.soup}
                  </p>
                  <p>
                    <span className="font-bold text-primary">Segundo:</span> {order.main}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    QR: BCD-ORD-{order.orderNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    {order.status === "VALIDADO" && (
                      <span className="flex items-center gap-1 rounded-full bg-success-container px-2.5 py-1 text-[13px] font-bold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {PEDIDOS_COPY.validated}
                      </span>
                    )}
                    {(!order.status || order.status === "POR_VALIDAR") && (
                    <button
                      type="button"
                      onClick={() => handleScanOrder(order)}
                      aria-label={`Escanear QR de orden #${order.orderNumber}`}
                      className="flex items-center gap-1 rounded-full bg-primary-container px-3 py-1.5 text-[13px] font-bold text-primary border border-primary-container active:scale-95 transition-all hover:bg-secondary-container"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Escanear QR</span>
                    </button>
                    )}
                    {(!order.status || order.status === "VALIDADO") && (
                    <button
                      type="button"
                      onClick={() => handleDeliver(order)}
                      aria-label={`Entregar orden #${order.orderNumber}`}
                      className="flex items-center gap-1 rounded-full bg-success px-3.5 py-1.5 text-[13px] font-bold text-success-foreground shadow-xs active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{PEDIDOS_COPY.deliverButton}</span>
                    </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal interactivo de escaneo de QR de preorden */}
      {scanningOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Validar QR de orden"
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setScanningOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-5 shadow-xl animate-in slide-in-from-bottom space-y-4 text-center"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-primary">
                ORDEN #{scanningOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={() => setScanningOrder(null)}
                aria-label="Cerrar escáner"
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-2 rounded-2xl bg-background p-4 border border-border">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground mb-3 shadow-sm">
                <QrCode className="h-9 w-9 animate-pulse" />
              </div>
              <h3 className="text-[17px] font-black text-foreground">
                {scanningOrder.dinerName}
              </h3>
              <p className="text-[13px] font-semibold text-muted-foreground mt-1">
                {scanningOrder.soup} + {scanningOrder.main}
              </p>
              <div className="mt-2 text-[13px] font-mono text-primary bg-primary-container py-1 px-3 rounded-lg inline-block">
                BCD-ORD-{scanningOrder.orderNumber}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const orderToDeliver = scanningOrder;
                setScanningOrder(null);
                handleDeliver(orderToDeliver);
              }}
              className="w-full rounded-full bg-success py-3 text-[15px] font-black text-success-foreground shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Validar y entregar</span>
            </button>
          </div>
        </div>
      )}

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={handleUndoDeliver}
          label={undoLabel}
        />
      )}
    </div>
  );
};
