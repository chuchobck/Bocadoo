import React, { useState } from "react";
import { Users, Clock, AlertCircle, WifiOff, Loader2, Send } from "lucide-react";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { MESA_AMIGOS_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface MesaAmigosScreenProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string | undefined;
  onShareWhatsApp?: ((url: string) => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const MesaAmigosScreen: React.FC<MesaAmigosScreenProps> = ({
  isOpen,
  onClose,
  restaurantName = "La Cuchara de San Blas",
  onShareWhatsApp,
  onRetry,
  state = "exito",
}) => {
  const [selectedTime, setSelectedTime] = useState("13:00");
  const times = ["12:30", "13:00", "13:30"];

  const handleShare = () => {
    const mesaId = "m" + Date.now().toString().slice(-4);
    const mesaUrl = `${window.location.origin}/app/comensal/mesa/${mesaId}`;
    const text = `¡Vamos a almorzar juntos en ${restaurantName} a las ${selectedTime}! Únete aquí: ${mesaUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (onShareWhatsApp) {
      onShareWhatsApp(whatsappUrl);
    } else {
      window.open(whatsappUrl, "_blank");
    }
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={MESA_AMIGOS_COPY.title}>
      <div className="space-y-4 py-2">
        {state === "cargando" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <span className="mt-3 text-[15px] font-bold text-[#4A0E78]">{MESA_AMIGOS_COPY.loadingTitle}</span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-6 text-center">
            <Users className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h4 className="text-[17px] font-extrabold text-[#4A0E78]">{MESA_AMIGOS_COPY.emptyTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">
              {MESA_AMIGOS_COPY.emptyDesc}
            </p>
            <div className="mt-4">
              <ButtonPrimary onClick={onClose}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h4 className="text-[17px] font-extrabold">{MESA_AMIGOS_COPY.errorTitle}</h4>
            <button
              type="button"
              onClick={onRetry || onClose}
              className="mt-3 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{MESA_AMIGOS_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            <div>
              <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block mb-2">
                {MESA_AMIGOS_COPY.timeLabel}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    aria-pressed={selectedTime === t}
                    className={`rounded-2xl py-3 text-[14px] font-bold transition-all active:scale-95 ${
                      selectedTime === t
                        ? "bg-[#7B2CBF] text-white shadow-xs"
                        : "bg-[#F5F3FA] text-[#4A0E78] border border-[#E7E1F2]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <ButtonPrimary onClick={handleShare}>
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>{MESA_AMIGOS_COPY.shareButton}</span>
                </span>
              </ButtonPrimary>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
};
