import React, { useEffect, useState } from "react";
import {
  QrCode,
  Users,
  Banknote,
  Smartphone,
  Zap as ZapIcon,
  AlertCircle,
  WifiOff,
  Loader2,
  Clock,
  Zap,
  Receipt,
  BarChart3,
} from "lucide-react";
import { UndoBanner } from "@/design-system";
import { useBocadoo, money, type PaymentMethod, type Txn } from "@/components/bocadoo/store";

import { useCaja } from "./hooks/useCaja";
import { CAJA_COPY } from "./copy";
import { OfertaFlashScreen } from "../oferta/Screen";
import { VenderPlanModal } from "./VenderPlanModal";
import type { ComponentState } from "@/design-system";

export interface CajaScreenProps {
  role?: "dueno" | "cajero";
  state?: ComponentState;
  onScanPass?: () => void;
  /** Registra el cobro suelto. Devuelve el id de la venta para poder deshacerla. */
  onChargeSingle?: (method: PaymentMethod) => string | undefined | void;
  /** Deshace el último cobro suelto (dentro de los 10 s). */
  onUndoSingle?: (saleId: string) => void;
  onViewOrders?: () => void;
  onSellPlan?: () => void;
  onOpenCierre?: () => void;
  onOpenMetricas?: () => void;
  onRetry?: () => void;
}

export const CajaScreen: React.FC<CajaScreenProps> = ({
  role = "dueno",
  state = "exito",
  onScanPass,
  onChargeSingle,
  onUndoSingle,
  onViewOrders,
  onSellPlan,
  onOpenCierre,
  onOpenMetricas,
  onRetry,
}) => {
  const { singlePrice: configSinglePrice, occupancy, isManualBusy, busyMinutesLeft, toggleManualBusy } = useCaja();
  const [showSingleChargeModal, setShowSingleChargeModal] = useState(false);
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [showVenderPlanModal, setShowVenderPlanModal] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");
  const { transactions, simulatedTodayKey, orders, restaurant, flashOffers } = useBocadoo();
  // Oferta flash activa del local (la publica el dueño y la ve el comensal en "Ofertas hoy")
  const liveOffer = flashOffers.find(
    (f) => f.restaurantId === restaurant?.id && f.activa && f.stockRestante > 0,
  );
  const activeOffer = liveOffer
    ? { slots: liveOffer.stockRestante, price: liveOffer.precioCents / 100 }
    : null;
  // El precio suelto sale del store (centavos) para que coincida con lo que se cobra
  const singlePrice = restaurant ? money(restaurant.precioSueltoCents) : configSinglePrice;
  const [lastSingleSaleId, setLastSingleSaleId] = useState<string | null>(null);

  // Cuenta regresiva del búfer de deshacer
  useEffect(() => {
    if (undoSeconds <= 0) return;
    const t = setTimeout(() => setUndoSeconds((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(t);
  }, [undoSeconds]);
  const preorderCount = orders.filter((o) => o.estado === "EN_CAMINO").length;
  const todayTxns: Txn[] = transactions.filter(
    (t) => t.timestamp && t.timestamp.slice(0, 10) === simulatedTodayKey && t.positive
  ).slice(0, 20);
  const todayTotalCents = todayTxns.reduce((a: number, t: Txn) => {
    const raw = t.value.replace(/[$,]/g, "").trim();
    const n = parseFloat(raw);
    return a + (isNaN(n) ? 0 : Math.round(n * 100));
  }, 0);
  const fmtMoney = (c: number) => `$${(c / 100).toFixed(2).replace(".", ",")}`;

  const handleSinglePayment = (method: PaymentMethod) => {
    setShowSingleChargeModal(false);
    const methodLabel =
      method === "EFECTIVO" ? CAJA_COPY.cash : method === "DEUNA" ? CAJA_COPY.deuna : CAJA_COPY.transfer;
    setUndoLabel(CAJA_COPY.undoSingle(singlePrice, methodLabel));
    setUndoSeconds(10);
    const saleId = onChargeSingle?.(method);
    setLastSingleSaleId(typeof saleId === "string" ? saleId : null);
  };

  const handleUndoSingle = () => {
    if (lastSingleSaleId) onUndoSingle?.(lastSingleSaleId);
    setLastSingleSaleId(null);
    setUndoSeconds(0);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Caja rápida"
      className="flex h-full flex-col bg-surface overflow-hidden focus:outline-hidden"
    >
      {/* Cabecera oficial: Título "Caja" y un solo control de aforo */}
      <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-black text-foreground">{CAJA_COPY.title}</h1>
          {/* Aforo automático (solo visual cuando no está marcado lleno manual) */}
          {!isManualBusy && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${
                occupancy === "LIBRE"
                  ? "bg-success-container text-success"
                  : "bg-primary-container text-primary"
              }`}
            >
              {occupancy === "LIBRE" ? "Libre" : "Movido"}
            </span>
          )}
          {role === "cajero" && (
            <span className="rounded-full bg-background border border-primary-container px-2.5 py-0.5 text-[13px] font-extrabold text-primary">
              Cajero
            </span>
          )}
        </div>

        {/* Único control manual: Marcar lleno (1 toque, 20 min, se revierte con 1 toque) */}
        <button
          type="button"
          onClick={toggleManualBusy}
          aria-pressed={isManualBusy}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all active:scale-95 ${
            isManualBusy
              ? "bg-danger text-danger-foreground shadow-xs"
              : "bg-primary-container text-primary hover:bg-secondary-container"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isManualBusy ? "bg-surface animate-ping" : "bg-primary"
            }`}
          />
          <span>{isManualBusy ? CAJA_COPY.busyCountdown(busyMinutesLeft) : CAJA_COPY.markBusy}</span>
        </button>
      </header>

      {/* Franja 'N en camino' que abre Pedidos en camino */}
      <div
        onClick={onViewOrders}
        role="button"
        tabIndex={0}
        aria-label="Ver pedidos en camino"
        className="px-4 py-2.5 bg-primary-container border-b border-border flex items-center justify-between cursor-pointer hover:bg-secondary-container transition-colors shrink-0"
      >
        <div className="flex items-center gap-2 text-[13px] font-bold text-primary">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{CAJA_COPY.ordersPending(preorderCount)}</span>
        </div>
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[13px] font-extrabold text-primary-foreground">
          Ver
        </span>
      </div>

      {/* Estados del sistema */}
      <main className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-3 text-[17px] font-extrabold text-foreground">Cargando caja</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Banknote className="h-12 w-12 text-muted-foreground mb-2" />
            <h2 className="text-[17px] font-extrabold text-foreground">Caja al día</h2>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">Sin cobros en este turno.</p>
            <button
              type="button"
              onClick={onScanPass}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-primary-foreground active:scale-95"
            >
              Cobrar con plan
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger w-full">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <h2 className="text-[17px] font-extrabold">Error en caja</h2>
              <p className="mt-1 text-[13px] font-semibold">No se pudo iniciar la cámara.</p>
              <button
                type="button"
                onClick={onRetry || (() => window.location.reload())}
                className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-2 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground shrink-0">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Sin conexión · Cobro seguro activo</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="flex flex-1 flex-col justify-between">
            {/* Escáner único: el QR resuelve solo los 3 casos (preorden, plan, plan + preorden) */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                onClick={onScanPass}
                role="button"
                tabIndex={0}
                aria-label="Escanear pase de comensal"
                className="group relative flex min-h-[140px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-primary bg-background p-5 transition-all hover:border-foreground active:scale-[0.99]"
              >
                <div className="grid h-18 w-18 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                  <QrCode className="h-10 w-10" />
                </div>
                <h2 className="mt-3 text-[17px] font-black text-foreground">Escanear QR</h2>
                <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
                  Plan, preorden o mesa: se reconoce solo
                </p>
              </div>
            </div>

            {/* Banner de oferta flash activa si fue lanzada */}
            {activeOffer && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary-container p-3 border border-primary-container shrink-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-foreground">
                      Oferta flash activa
                    </span>
                    <span className="text-[13px] font-semibold text-primary">
                      {activeOffer.slots} cupos a ${activeOffer.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfertaModal(true)}
                  className="rounded-full bg-primary px-3 py-1 text-[13px] font-bold text-primary-foreground active:scale-95 transition-all"
                >
                  Ver
                </button>
              </div>
            )}

            {/* Botones de acción del primer pliegue: Cobro suelto y 3 accesos rápidos */}
            <div className="mt-3 space-y-2 shrink-0">
              {/* Botón Principal: Cobro suelto es el POS (Almuerzos y A la carta) */}
              <button
                type="button"
                onClick={() => window.location.assign("/app/dueno/registrar-consumo")}
                className="w-full rounded-full bg-primary py-3.5 text-[15px] font-black text-primary-foreground shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-primary-hover"
              >
                <Receipt className="h-5 w-5 text-primary-foreground" />
                <span>Cobro suelto (POS · Almuerzos y Carta)</span>
              </button>

              {/* Acciones rápidas: Si es dueño ve Vender plan, Oferta flash y Cuadre. Si es cajero ve solo Vender plan y Pedidos */}
              {role === "cajero" ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVenderPlanModal(true)}
                    aria-label="Vender plan a comensal"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-background p-2.5 text-center border border-border active:scale-95 transition-all hover:bg-secondary-container"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-bold text-foreground leading-tight">Vender plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={onViewOrders}
                    aria-label="Ver pedidos en camino"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-background p-2.5 text-center border border-border active:scale-95 transition-all hover:bg-secondary-container"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-bold text-foreground leading-tight">Pedidos</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVenderPlanModal(true)}
                    aria-label="Vender plan a comensal"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-background p-2.5 text-center border border-border active:scale-95 transition-all hover:bg-secondary-container"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-bold text-foreground leading-tight">Vender plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOfertaModal(true)}
                    aria-label="Lanzar oferta flash"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-primary-container p-2.5 text-center border border-primary-container active:scale-95 transition-all hover:bg-primary/20"
                  >
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-black text-primary leading-tight">Oferta flash</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCierre || (() => window.location.assign("/app/dueno/cierre"))}
                    aria-label="Cuadre de caja"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-background p-2.5 text-center border border-border active:scale-95 transition-all hover:bg-secondary-container"
                  >
                    <Receipt className="h-4 w-4 text-foreground" />
                    <span className="text-[13px] font-bold text-foreground leading-tight">Cuadre caja</span>
                  </button>
                </div>
              )}
            </div>

            {/* Acceso directo al panel de ventas y métricas (para dueño) */}
            {role === "dueno" && (
              <button
                type="button"
                onClick={onOpenMetricas || (() => window.location.assign("/app/dueno/metricas"))}
                aria-label="Ver panel de ventas y métricas"
                className="mt-3 flex w-full items-center justify-between rounded-2xl bg-secondary-container p-3 text-left border border-border/80 transition-all active:scale-[0.99] hover:bg-primary-container group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-foreground leading-tight">
                      Tus números
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Hoy, dinero y clientes por renovar
                    </span>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-primary">Ver →</span>
              </button>
            )}

            {/* Cobros de hoy: al final de todo (en el último), compactas, con scroll propio */}
            <section aria-label="Cobros de hoy" className="mt-3 shrink-0">
              <div className="mb-1 flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Cobros de hoy
                </h3>
                <span className="text-[12px] font-extrabold text-foreground">
                  {fmtMoney(todayTotalCents)}
                </span>
              </div>
              <div className="no-scrollbar flex max-h-[96px] flex-col gap-1.5 overflow-y-auto">
                {todayTxns.length === 0 ? (
                  <p className="py-2 text-center text-[12px] font-semibold text-muted-foreground">
                    Aún sin cobros
                  </p>
                ) : (
                  todayTxns.map((t: Txn) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-1.5"
                    >
                      <span className="min-w-0 truncate text-[12px] font-bold text-foreground">
                        {t.name}
                      </span>
                      <span className="text-[13px] font-black text-foreground">
                        {t.value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modal de Cobro Suelto: Efectivo o Transferencia (2do toque) */}
      {showSingleChargeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setShowSingleChargeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-6 shadow-xl animate-in slide-in-from-bottom"
          >
            <h3 className="text-[17px] font-extrabold text-foreground text-center">
              {CAJA_COPY.modalTitle(singlePrice)}
            </h3>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleSinglePayment("EFECTIVO")}
                className="w-full rounded-2xl bg-background p-4 text-left font-bold text-foreground border border-border hover:border-primary active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-success-container text-success">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <span>{CAJA_COPY.cash}</span>
                </div>
                <span className="text-[15px] font-black">{singlePrice}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSinglePayment("TRANSFERENCIA")}
                className="w-full rounded-2xl bg-background p-4 text-left font-bold text-foreground border border-border hover:border-primary active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span>{CAJA_COPY.transfer}</span>
                </div>
                <span className="text-[15px] font-black">{singlePrice}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSinglePayment("DEUNA")}
                className="w-full rounded-2xl bg-background p-4 text-left font-bold text-foreground border border-border hover:border-primary active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-primary">
                    <ZapIcon className="h-5 w-5" />
                  </div>
                  <span>{CAJA_COPY.deuna}</span>
                </div>
                <span className="text-[15px] font-black">{singlePrice}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSingleChargeModal(false)}
              className="mt-4 w-full rounded-full py-2 text-[13px] font-bold text-muted-foreground"
            >
              {CAJA_COPY.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Oferta Flash lanzado directamente desde Caja */}
      <OfertaFlashScreen
        isOpen={showOfertaModal}
        onClose={() => setShowOfertaModal(false)}
        onPublishOffer={(slots) => {
          setShowOfertaModal(false);
          setUndoLabel(`Oferta publicada (${slots} cupos)`);
          setLastSingleSaleId(null);
          setUndoSeconds(10);
        }}
        onCancelOffer={() => {
          setShowOfertaModal(false);
          setUndoLabel("Oferta cancelada sin costo");
          setLastSingleSaleId(null);
          setUndoSeconds(10);
        }}
      />

      {/* Modal in-situ para vender plan en 3 toques sin salir de Caja */}
      <VenderPlanModal
        isOpen={showVenderPlanModal}
        onClose={() => setShowVenderPlanModal(false)}
      />

      {/* Búfer de deshacer de 10s tras cobrar */}
      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={handleUndoSingle}
          label={undoLabel}
        />
      )}
    </div>
  );
};
