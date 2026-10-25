import React, { useState } from "react";
import {
  QrCode,
  Users,
  Banknote,
  Smartphone,
  AlertCircle,
  WifiOff,
  Loader2,
  Clock,
  Zap,
  Receipt,
} from "lucide-react";
import { UndoBanner } from "@/design-system";
import { useCaja } from "./hooks/useCaja";
import { CAJA_COPY } from "./copy";
import { OfertaFlashScreen } from "../oferta/Screen";
import type { ComponentState } from "@/design-system";

export interface CajaScreenProps {
  role?: "dueno" | "cajero";
  state?: ComponentState;
  onScanPass?: () => void;
  onChargeSingle?: (method: "EFECTIVO" | "TRANSFERENCIA") => void;
  onViewOrders?: () => void;
  onSellPlan?: () => void;
  onOpenCierre?: () => void;
  onRetry?: () => void;
}

export const CajaScreen: React.FC<CajaScreenProps> = ({
  role = "dueno",
  state = "exito",
  onScanPass,
  onChargeSingle,
  onViewOrders,
  onSellPlan,
  onOpenCierre,
  onRetry,
}) => {
  const { singlePrice, occupancy, isManualBusy, busyMinutesLeft, toggleManualBusy } = useCaja();
  const [showSingleChargeModal, setShowSingleChargeModal] = useState(false);
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [activeOffer, setActiveOffer] = useState<{ slots: number; endTime: string; price: number } | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const handleSinglePayment = (method: "EFECTIVO" | "TRANSFERENCIA") => {
    setShowSingleChargeModal(false);
    setUndoLabel(CAJA_COPY.undoSingle(singlePrice, method === "EFECTIVO" ? CAJA_COPY.cash : CAJA_COPY.transfer));
    setUndoSeconds(10);
    onChargeSingle?.(method);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Caja rápida"
      className="flex h-full flex-col bg-white overflow-hidden focus:outline-hidden"
    >
      {/* Cabecera oficial: Título "Caja" y un solo control de aforo */}
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-black text-[#4A0E78]">{CAJA_COPY.title}</h1>
          {/* Aforo automático (solo visual cuando no está marcado lleno manual) */}
          {!isManualBusy && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${
                occupancy === "LIBRE"
                  ? "bg-[#E6F6EC] text-[#157A41]"
                  : "bg-[#F3E8FF] text-[#7B2CBF]"
              }`}
            >
              {occupancy === "LIBRE" ? "Libre" : "Movido"}
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
              ? "bg-[#C0392B] text-white shadow-xs"
              : "bg-[#F3E8FF] text-[#7B2CBF] hover:bg-[#EBD7FC]"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isManualBusy ? "bg-white animate-ping" : "bg-[#7B2CBF]"
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
        className="px-4 py-2.5 bg-[#F3E8FF] border-b border-[#E7E1F2] flex items-center justify-between cursor-pointer hover:bg-[#EBD7FC] transition-colors shrink-0"
      >
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#7B2CBF]">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{CAJA_COPY.ordersPending(3)}</span>
        </div>
        <span className="rounded-full bg-[#7B2CBF] px-2.5 py-0.5 text-[13px] font-extrabold text-white">
          Ver
        </span>
      </div>

      {/* Estados del sistema */}
      <main className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">Cargando caja</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Banknote className="h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">Caja al día</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">Sin cobros en este turno.</p>
            <button
              type="button"
              onClick={onScanPass}
              className="mt-4 rounded-full bg-[#7B2CBF] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Cobrar con plan
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B] w-full">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <h2 className="text-[17px] font-extrabold">Error en caja</h2>
              <p className="mt-1 text-[13px] font-semibold">No se pudo iniciar la cámara.</p>
              <button
                type="button"
                onClick={onRetry || (() => window.location.reload())}
                className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-2 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B] shrink-0">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Sin conexión · Cobro seguro activo</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="flex flex-1 flex-col justify-between">
            {/* Escáner como elemento principal del primer pliegue */}
            <div
              onClick={onScanPass}
              role="button"
              tabIndex={0}
              aria-label="Escanear pase de comensal"
              className="relative flex-1 rounded-[28px] border-2 border-dashed border-[#7B2CBF] bg-[#F5F3FA] p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#4A0E78] transition-all group active:scale-[0.99] min-h-[160px]"
            >
              <div className="grid h-18 w-18 place-items-center rounded-2xl bg-[#7B2CBF] text-white shadow-md group-hover:scale-105 transition-transform">
                <QrCode className="h-10 w-10" />
              </div>
              <h2 className="mt-3 text-[17px] font-black text-[#4A0E78]">{CAJA_COPY.scanPass}</h2>
            </div>

            {/* Banner de oferta flash activa si fue lanzada */}
            {activeOffer && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F3E8FF] p-3 border border-[#EBD7FC] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#7B2CBF] text-white">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-[13px] font-black text-[#1F1135]">
                      Oferta flash activa
                    </span>
                    <span className="text-[13px] font-semibold text-[#7B2CBF]">
                      {activeOffer.slots} cupos a ${activeOffer.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfertaModal(true)}
                  className="rounded-full bg-[#7B2CBF] px-3 py-1 text-[13px] font-bold text-white active:scale-95 transition-all"
                >
                  Ver
                </button>
              </div>
            )}

            {/* Botones de acción del primer pliegue: Cobro suelto y 3 accesos rápidos */}
            <div className="mt-3 space-y-2 shrink-0">
              {/* Botón 1: Cobro suelto con precio dinámico leído de configuración */}
              <button
                type="button"
                onClick={() => setShowSingleChargeModal(true)}
                className="w-full rounded-full bg-[#4A0E78] py-3 text-[15px] font-black text-white shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-[#3D0A66]"
              >
                <Banknote className="h-5 w-5" />
                <span>{CAJA_COPY.chargeSingle(singlePrice)}</span>
              </button>

              {/* Fila de 3 accesos directos: Vender plan, Oferta flash y Cuadre de caja */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onSellPlan}
                  aria-label="Vender plan a comensal"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#F5F3FA] p-2.5 text-center border border-[#E7E1F2] active:scale-95 transition-all hover:bg-[#EBD7FC]"
                >
                  <Users className="h-4 w-4 text-[#7B2CBF]" />
                  <span className="text-[13px] font-bold text-[#1F1135] leading-tight">Vender plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowOfertaModal(true)}
                  aria-label="Lanzar oferta flash"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#F3E8FF] p-2.5 text-center border border-[#EBD7FC] active:scale-95 transition-all hover:bg-[#E0AAFF]/30"
                >
                  <Zap className="h-4 w-4 text-[#7B2CBF]" />
                  <span className="text-[13px] font-black text-[#7B2CBF] leading-tight">Oferta flash</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCierre || (() => window.location.assign("/app/dueno/cierre"))}
                  aria-label="Cuadre de caja"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#F5F3FA] p-2.5 text-center border border-[#E7E1F2] active:scale-95 transition-all hover:bg-[#EBD7FC]"
                >
                  <Receipt className="h-4 w-4 text-[#4A0E78]" />
                  <span className="text-[13px] font-bold text-[#1F1135] leading-tight">Cuadre caja</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Cobro Suelto: Efectivo o Transferencia (2do toque) */}
      {showSingleChargeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setShowSingleChargeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl animate-in slide-in-from-bottom"
          >
            <h3 className="text-[17px] font-extrabold text-[#4A0E78] text-center">
              {CAJA_COPY.modalTitle(singlePrice)}
            </h3>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleSinglePayment("EFECTIVO")}
                className="w-full rounded-2xl bg-[#F5F3FA] p-4 text-left font-bold text-[#4A0E78] border border-[#E7E1F2] hover:border-[#7B2CBF] active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E6F6EC] text-[#157A41]">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <span>{CAJA_COPY.cash}</span>
                </div>
                <span className="text-[15px] font-black">{singlePrice}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSinglePayment("TRANSFERENCIA")}
                className="w-full rounded-2xl bg-[#F5F3FA] p-4 text-left font-bold text-[#4A0E78] border border-[#E7E1F2] hover:border-[#7B2CBF] active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span>{CAJA_COPY.transfer}</span>
                </div>
                <span className="text-[15px] font-black">{singlePrice}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSingleChargeModal(false)}
              className="mt-4 w-full rounded-full py-2 text-[13px] font-bold text-[#6B5B7B]"
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
        onPublishOffer={(slots, endTime, price) => {
          setActiveOffer({ slots, endTime, price });
          setShowOfertaModal(false);
          setUndoLabel(`Oferta publicada (${slots} cupos)`);
          setUndoSeconds(10);
        }}
        onCancelOffer={() => {
          setActiveOffer(null);
          setShowOfertaModal(false);
          setUndoLabel("Oferta cancelada sin costo");
          setUndoSeconds(10);
        }}
      />

      {/* Búfer de deshacer de 10s tras cobrar */}
      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => setUndoSeconds(0)}
          label={undoLabel}
        />
      )}
    </div>
  );
};
