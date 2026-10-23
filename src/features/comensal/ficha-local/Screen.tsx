import React, { useState } from "react";
import { Utensils, AlertCircle, WifiOff, Loader2, Check } from "lucide-react";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { SellosModal } from "@/components/comensal/SellosModal";
import { FICHA_LOCAL_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface FichaLocalScreenProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string | undefined;
  distanceKm?: number | undefined;
  occupancy?: "LIBRE" | "MOVIDO" | "LLENO" | undefined;
  hasPlan?: boolean | undefined;
  hasPlanInRestaurant?: boolean | undefined;
  hasActiveOrderLimit?: boolean | undefined;
  onOrderSuccess?: ((orderNumber: string) => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const FichaLocalScreen: React.FC<FichaLocalScreenProps> = ({
  isOpen,
  onClose,
  restaurantName = "La Cuchara de San Blas",
  hasPlanInRestaurant = true,
  hasActiveOrderLimit = false,
  onOrderSuccess,
  onRetry,
  state = "exito",
}) => {
  const [selectedSoup, setSelectedSoup] = useState<string>("Locro de papa con queso");
  const [selectedMain, setSelectedMain] = useState<string>("Seco de pollo con maduro");
  const [isSellosOpen, setIsSellosOpen] = useState(false);

  const soups = ["Locro de papa con queso", "Sopa de lenteja"];
  const mains = ["Seco de pollo con maduro", "Trucha frita con ensalada"];

  const handleOrder = () => {
    if (hasActiveOrderLimit) return;
    const orderNumber = "42";
    if (onOrderSuccess) onOrderSuccess(orderNumber);
    onClose();
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={restaurantName}>
        <div className="space-y-4 py-2">
          {state === "cargando" && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
              <span className="mt-3 text-[15px] font-bold text-[#4A0E78]">{FICHA_LOCAL_COPY.loadingMenu}</span>
            </div>
          )}

          {state === "vacio" && (
            <div className="py-6 text-center">
              <Utensils className="mx-auto h-10 w-10 text-[#6B5B7B] mb-2" />
              <h3 className="text-[17px] font-bold text-[#4A0E78]">{FICHA_LOCAL_COPY.emptyMenu}</h3>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-[24px] bg-[#FDEBEB] p-4 text-center text-[#C0392B] border border-[#C0392B]">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <h3 className="text-[15px] font-extrabold">{FICHA_LOCAL_COPY.errorMenu}</h3>
              <button
                type="button"
                onClick={onRetry || onClose}
                className="mt-3 rounded-full bg-[#C0392B] px-5 py-1.5 text-[13px] font-bold text-white active:scale-95"
              >
                Reintentar
              </button>
            </div>
          )}

          {state === "offline" && (
            <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
              <WifiOff className="h-3.5 w-3.5" />
              <span>{FICHA_LOCAL_COPY.offlineNotice}</span>
            </div>
          )}

          {(state === "exito" || state === "offline") && (
            <>
              {/* Sección Sopa */}
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block mb-2">
                  {FICHA_LOCAL_COPY.soupTitle}
                </span>
                <div className="space-y-2">
                  {soups.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSoup(s)}
                      aria-pressed={selectedSoup === s}
                      className={`w-full rounded-2xl p-3 text-left font-bold text-[14px] transition-all flex items-center justify-between ${
                        selectedSoup === s
                          ? "bg-[#F3E8FF] text-[#4A0E78] border border-[#7B2CBF]"
                          : "bg-[#F5F3FA] text-[#6B5B7B] border border-[#E7E1F2]"
                      }`}
                    >
                      <span>{s}</span>
                      {selectedSoup === s && <Check className="h-4 w-4 text-[#7B2CBF]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección Segundo */}
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block mb-2">
                  {FICHA_LOCAL_COPY.mainTitle}
                </span>
                <div className="space-y-2">
                  {mains.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMain(m)}
                      aria-pressed={selectedMain === m}
                      className={`w-full rounded-2xl p-3 text-left font-bold text-[14px] transition-all flex items-center justify-between ${
                        selectedMain === m
                          ? "bg-[#F3E8FF] text-[#4A0E78] border border-[#7B2CBF]"
                          : "bg-[#F5F3FA] text-[#6B5B7B] border border-[#E7E1F2]"
                      }`}
                    >
                      <span>{m}</span>
                      {selectedMain === m && <Check className="h-4 w-4 text-[#7B2CBF]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acceso a Sellos */}
              <button
                type="button"
                onClick={() => setIsSellosOpen(true)}
                className="w-full text-center text-[13px] font-bold text-[#7B2CBF] py-1"
              >
                {FICHA_LOCAL_COPY.stampsLink}
              </button>

              {/* Botón de Preordenar en 1 toque */}
              <div className="pt-2">
                <ButtonPrimary onClick={handleOrder} disabled={hasActiveOrderLimit}>
                  {FICHA_LOCAL_COPY.orderButton}
                </ButtonPrimary>
                {hasActiveOrderLimit && (
                  <p className="mt-2 text-center text-[13px] font-bold text-[#C0392B]">
                    {FICHA_LOCAL_COPY.orderLimitNotice}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </BottomSheet>

      <SellosModal
        isOpen={isSellosOpen}
        onClose={() => setIsSellosOpen(false)}
        restaurantName={restaurantName}
        currentStamps={10}
      />
    </>
  );
};
