import React from "react";
import { Sparkles, AlertCircle, WifiOff, Loader2, Check } from "lucide-react";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { SELLOS_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface SellosScreenProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string | undefined;
  currentStamps?: number | undefined;
  totalGoal?: number | undefined;
  rewardTitle?: string | undefined;
  onClaimReward?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const SellosScreen: React.FC<SellosScreenProps> = ({
  isOpen,
  onClose,
  restaurantName = "La Cuchara de San Blas",
  currentStamps = 10,
  totalGoal = 10,
  rewardTitle = "Almuerzo gratis",
  onClaimReward,
  onRetry,
  state = "exito",
}) => {
  const canClaim = currentStamps >= totalGoal;

  const handleClaim = () => {
    if (onClaimReward) onClaimReward();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={SELLOS_COPY.title}>
      <div className="space-y-4 py-2">
        {state === "cargando" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <span className="mt-3 text-[15px] font-bold text-[#4A0E78]">{SELLOS_COPY.loadingTitle}</span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-6 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h4 className="text-[17px] font-extrabold text-[#4A0E78]">{SELLOS_COPY.emptyTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">
              {SELLOS_COPY.emptyDesc}
            </p>
            <div className="mt-4">
              <ButtonPrimary onClick={onClose}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h4 className="text-[17px] font-extrabold">{SELLOS_COPY.errorTitle}</h4>
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
            <span>{SELLOS_COPY.offlineNotice}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            <div className="text-center">
              <h3 className="text-[17px] font-black text-[#4A0E78]">{restaurantName}</h3>
              <p className="text-[13px] font-semibold text-[#6B5B7B]">
                {currentStamps} de {totalGoal} sellos
              </p>
            </div>

            {/* Grilla de sellos (10 sellos en 2 filas de 5) */}
            <div className="grid grid-cols-5 gap-2.5 rounded-[28px] bg-[#F5F3FA] p-4 border border-[#E7E1F2]">
              {Array.from({ length: totalGoal }).map((_, i) => {
                const isStamped = i < currentStamps;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                      isStamped
                        ? "bg-[#7B2CBF] text-white shadow-xs"
                        : "bg-white text-[#E7E1F2] border border-[#E7E1F2]"
                    }`}
                  >
                    {isStamped ? (
                      <Check className="h-5 w-5 stroke-[3]" />
                    ) : (
                      <span className="text-[13px] font-bold text-[#6B5B7B]">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Premio desbloqueado o en progreso */}
            <div className="rounded-[24px] bg-[#F3E8FF] p-4 text-center border border-[#7B2CBF]/20">
              <span className="text-[13px] font-bold text-[#7B2CBF] uppercase tracking-wider">
                Premio acumulado
              </span>
              <h4 className="mt-1 text-[17px] font-black text-[#4A0E78]">{rewardTitle}</h4>
            </div>

            {canClaim && (
              <div className="pt-2">
                <ButtonPrimary onClick={handleClaim}>
                  {SELLOS_COPY.claimRewardButton}
                </ButtonPrimary>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
};
