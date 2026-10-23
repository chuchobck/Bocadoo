import React from "react";
import { CheckCircle2, Clock, AlertCircle, WifiOff, Loader2 } from "lucide-react";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { PEDIDO_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface EstadoPedidoScreenProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string | undefined;
  status?: "PREPARANDO" | "LISTO" | undefined;
  restaurantName?: string | undefined;
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
  onViewLocales,
  onRetry,
  state = "exito",
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={PEDIDO_COPY.title}>
      <div className="py-2 text-center">
        {state === "cargando" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <span className="mt-3 text-[15px] font-bold text-[#4A0E78]">{PEDIDO_COPY.loadingTitle}</span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-6">
            <Clock className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h4 className="text-[17px] font-extrabold text-[#4A0E78]">{PEDIDO_COPY.emptyTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{PEDIDO_COPY.emptyDesc}</p>
            <div className="mt-5">
              <ButtonPrimary onClick={onViewLocales || onClose}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h4 className="text-[17px] font-extrabold">{PEDIDO_COPY.errorTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold">No pudimos actualizar tu pedido.</p>
            <button
              type="button"
              onClick={onRetry || onClose}
              className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{PEDIDO_COPY.offlineNotice}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            <div className="rounded-[28px] bg-[#F5F3FA] p-6 border border-[#E7E1F2] space-y-3">
              <span className="text-[13px] font-bold text-[#7B2CBF] uppercase tracking-wider">
                Orden #{orderNumber}
              </span>
              <h3 className="text-[20px] font-black text-[#4A0E78]">{restaurantName}</h3>

              <div className="my-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[14px] font-bold bg-[#F3E8FF] text-[#7B2CBF]">
                {status === "LISTO" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>{status === "LISTO" ? PEDIDO_COPY.ready : PEDIDO_COPY.preparing}</span>
              </div>

              <p className="text-[13px] font-semibold text-[#6B5B7B]">
                {status === "LISTO" ? PEDIDO_COPY.readyDesc : PEDIDO_COPY.preparingDesc}
              </p>
            </div>

            <ButtonPrimary onClick={onClose}>Entendido</ButtonPrimary>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
