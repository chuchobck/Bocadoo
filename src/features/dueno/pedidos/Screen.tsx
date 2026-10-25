import React, { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, WifiOff, Loader2, ArrowLeft, QrCode, X } from "lucide-react";
import { UndoBanner } from "@/design-system";
import { PEDIDOS_COPY } from "./copy";
import { ordersRepository, type OrderItem } from "@/data/repositories/orders.repository";
import type { ComponentState } from "@/design-system";

export interface PedidosScreenProps {
  orders?: OrderItem[];
  onDeliverOrder?: (orderId: string) => void;
  onScanOrder?: (orderId: string) => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const PedidosScreen: React.FC<PedidosScreenProps> = ({
  orders,
  onDeliverOrder,
  onScanOrder,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const initialOrders = orders ?? ordersRepository.getActiveOrders();
  const [activeOrders, setActiveOrders] = useState<OrderItem[]>(initialOrders);
  const [scanningOrder, setScanningOrder] = useState<OrderItem | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const handleDeliver = (order: OrderItem) => {
    ordersRepository.deliverOrder(order.id);
    setActiveOrders((prev) => prev.filter((o) => o.id !== order.id));
    setUndoLabel(PEDIDOS_COPY.orderDelivered(order.orderNumber));
    setUndoSeconds(10);
    onDeliverOrder?.(order.id);
  };

  const handleScanOrder = (order: OrderItem) => {
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
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white flex items-center justify-between sticky top-0 z-10">
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
          <h1 className="text-[22px] font-black text-[#4A0E78]">{PEDIDOS_COPY.title}</h1>
        </div>
        <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[13px] font-bold text-[#7B2CBF]">
          {PEDIDOS_COPY.activeCount(activeOrders.length)}
        </span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{PEDIDOS_COPY.loadingTitle}</h2>
          </div>
        )}

        {(state === "vacio" || (activeOrders.length === 0 && state === "exito")) && (
          <div className="py-16 text-center">
            <Clock className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{PEDIDOS_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">
              {PEDIDOS_COPY.emptyDesc}
            </p>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-5 rounded-full bg-[#7B2CBF] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
              >
                {PEDIDOS_COPY.backToCaja}
              </button>
            )}
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{PEDIDOS_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">No se pudieron sincronizar los pedidos.</p>
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
            <span>{PEDIDOS_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && activeOrders.length > 0 && (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-[24px] border border-[#E7E1F2] bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#F3E8FF] px-2.5 py-1 text-[15px] font-black text-[#7B2CBF]">
                      #{order.orderNumber}
                    </span>
                    <h3 className="text-[17px] font-extrabold text-[#4A0E78]">{order.dinerName}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-bold text-[#6B5B7B]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Hace {order.minutesAgo} min</span>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#F5F3FA] p-3 text-[14px] font-semibold text-[#4A0E78] space-y-1">
                  <p>
                    <span className="font-bold text-[#7B2CBF]">Sopa:</span> {order.soup}
                  </p>
                  <p>
                    <span className="font-bold text-[#7B2CBF]">Segundo:</span> {order.main}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#6B5B7B]">
                    QR: BCD-ORD-{order.orderNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScanOrder(order)}
                      aria-label={`Escanear QR de orden #${order.orderNumber}`}
                      className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3 py-1.5 text-[13px] font-bold text-[#7B2CBF] border border-[#EBD7FC] active:scale-95 transition-all hover:bg-[#EBD7FC]"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Escanear QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeliver(order)}
                      aria-label={`Entregar orden #${order.orderNumber}`}
                      className="flex items-center gap-1 rounded-full bg-[#157A41] px-3.5 py-1.5 text-[13px] font-bold text-white shadow-xs active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{PEDIDOS_COPY.deliverButton}</span>
                    </button>
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setScanningOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-xl animate-in slide-in-from-bottom space-y-4 text-center"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#7B2CBF]">
                ORDEN #{scanningOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={() => setScanningOrder(null)}
                aria-label="Cerrar escáner"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-2 rounded-2xl bg-[#F5F3FA] p-4 border border-[#E7E1F2]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#7B2CBF] text-white mb-3 shadow-sm">
                <QrCode className="h-9 w-9 animate-pulse" />
              </div>
              <h3 className="text-[17px] font-black text-[#4A0E78]">
                {scanningOrder.dinerName}
              </h3>
              <p className="text-[13px] font-semibold text-[#6B5B7B] mt-1">
                {scanningOrder.soup} + {scanningOrder.main}
              </p>
              <div className="mt-2 text-[13px] font-mono text-[#7B2CBF] bg-[#F3E8FF] py-1 px-3 rounded-lg inline-block">
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
              className="w-full rounded-full bg-[#157A41] py-3 text-[15px] font-black text-white shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
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
          onUndo={() => {
            setUndoSeconds(0);
            setActiveOrders(initialOrders);
          }}
          label={undoLabel}
        />
      )}
    </div>
  );
};
