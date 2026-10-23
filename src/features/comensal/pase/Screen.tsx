import React, { useState } from "react";
import {
  QrCode,
  Users,
  Utensils,
  Sparkles,
  Clock,
  AlertCircle,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  BigNumber,
  ButtonPrimary,
  UndoBanner,
  BottomSheet,
  FeedbackCard,
} from "@/design-system";
import { PASE_COPY } from "./copy";
import { EstadoPedidoModal } from "@/components/comensal/EstadoPedidoModal";
import { MesaAmigosModal } from "@/components/comensal/MesaAmigosModal";
import { SellosModal } from "@/components/comensal/SellosModal";
import type { ComponentState } from "@/design-system";

export interface RestaurantPlanData {
  restaurantId: string;
  restaurantName: string;
  lunchesLeft: number;
  expiryDate: string;
  hasMultipleExpiries?: boolean | undefined;
  multipleExpiryText?: string | undefined;
  qrPayload: string;
  currentStamps: number;
}

export interface PaseScreenProps {
  plans?: RestaurantPlanData[] | undefined;
  hasRecentRedemption?: boolean | undefined;
  feedbackState?: ComponentState | undefined;
  activeOrder?: { orderNumber: string; status: "PREPARANDO" | "LISTO"; restaurantName: string } | undefined;
  onViewLocales?: (() => void) | undefined;
  onFeedbackSubmit?: ((tag: string) => void) | undefined;
  onFeedbackDismiss?: (() => void) | undefined;
  onClaimReward?: (() => void) | undefined;
  onUndoRedemption?: (() => void) | undefined;
  onRetry?: () => void;
  state?: ComponentState;
}

export const PaseScreen: React.FC<PaseScreenProps> = ({
  plans = [
    {
      restaurantId: "r1",
      restaurantName: "La Cuchara de San Blas",
      lunchesLeft: 14,
      expiryDate: "30 oct",
      hasMultipleExpiries: true,
      multipleExpiryText: "3 vencen el 30 oct",
      qrPayload: "BCD1.PASS.USER1.R1.HASH",
      currentStamps: 10,
    },
    {
      restaurantId: "r2",
      restaurantName: "El Fogón Quiteño",
      lunchesLeft: 6,
      expiryDate: "15 nov",
      hasMultipleExpiries: false,
      qrPayload: "BCD1.PASS.USER1.R2.HASH",
      currentStamps: 4,
    },
  ],
  hasRecentRedemption = false,
  feedbackState,
  activeOrder,
  onViewLocales,
  onFeedbackSubmit,
  onFeedbackDismiss,
  onClaimReward,
  onUndoRedemption,
  onRetry,
  state = "exito",
}) => {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isSellosOpen, setIsSellosOpen] = useState(false);
  const [isMesaOpen, setIsMesaOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);

  const activePlan = plans[currentPlanIndex] || plans[0];
  const hasPlans = plans && plans.length > 0;

  const handleNextRestaurant = () => {
    if (plans.length > 1) {
      setCurrentPlanIndex((prev) => (prev + 1) % plans.length);
    }
  };

  const handlePrevRestaurant = () => {
    if (plans.length > 1) {
      setCurrentPlanIndex((prev) => (prev - 1 + plans.length) % plans.length);
    }
  };

  const handleTagClick = (tag: string) => {
    setFeedbackSubmitted(true);
    if (onFeedbackSubmit) onFeedbackSubmit(tag);
  };

  const handleDismissFeedback = () => {
    setFeedbackSubmitted(true);
    if (onFeedbackDismiss) onFeedbackDismiss();
  };

  const handleClaimRewardWithUndo = () => {
    setUndoSeconds(10);
    if (onClaimReward) onClaimReward();
  };

  return (
    <div
      tabIndex={0}
      aria-label="Pase del comensal"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      {state === "cargando" && (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7B2CBF]" />
          <h2 className="mt-4 text-[20px] font-extrabold text-[#4A0E78]">{PASE_COPY.loadingTitle}</h2>
        </div>
      )}

      {(state === "vacio" || (!hasPlans && state === "exito")) && (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
            <Utensils className="h-8 w-8" />
          </div>
          <h2 className="text-[24px] font-black text-[#4A0E78]">{PASE_COPY.emptyTitle}</h2>
          <p className="mt-2 text-[15px] font-semibold text-[#6B5B7B]">
            {PASE_COPY.emptyDesc}
          </p>
          <div className="mt-8 w-full max-w-xs">
            <ButtonPrimary onClick={onViewLocales}>{PASE_COPY.exploreButton}</ButtonPrimary>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[20px] font-extrabold">{PASE_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">No pudimos cargar tu pase.</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-5 rounded-full bg-[#C0392B] px-6 py-2.5 text-[15px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {state === "offline" && activePlan && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1.5 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-4 w-4" />
            <span>{PASE_COPY.offlineBadge}</span>
          </div>

          <div className="rounded-[32px] bg-gradient-to-b from-[#7B2CBF] to-[#4A0E78] p-6 text-white text-center shadow-lg">
            <h2 className="text-[22px] font-black leading-tight line-clamp-2 break-words text-white">
              {activePlan.restaurantName}
            </h2>
            <div className="mx-auto my-5 flex h-48 w-48 flex-col items-center justify-center rounded-[24px] bg-white p-3 shadow-md">
              <QRCodeSVG
                value={activePlan.qrPayload}
                size={150}
                level="M"
                fgColor="#4A0E78"
                title="Código QR del pase"
              />
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[48px] font-extrabold leading-none">{activePlan.lunchesLeft}</span>
              <span className="text-[17px] font-bold text-[#E0AAFF]">almuerzos</span>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-[#E0AAFF]">
              {activePlan.hasMultipleExpiries && activePlan.multipleExpiryText
                ? activePlan.multipleExpiryText
                : `Vence ${activePlan.expiryDate}`}
            </p>
          </div>
        </div>
      )}

      {state === "exito" && hasPlans && activePlan && (
        <div className="space-y-4 p-4 pb-24">
          {/* Calificar sobre el pase si hubo consumo reciente */}
          {(hasRecentRedemption || feedbackState) && !feedbackSubmitted && (
            <div className="rounded-[28px] border border-[#E7E1F2] bg-[#FAF8FC] p-4 shadow-sm animate-in fade-in">
              <FeedbackCard
                state={feedbackState || "exito"}
                onSelectTag={handleTagClick}
                onDismiss={handleDismissFeedback}
              />
            </div>
          )}

          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#7B2CBF] to-[#4A0E78] p-6 text-white shadow-[0_16px_36px_rgba(74,14,120,0.22)]">
            <div className="w-full">
              <h1 className="text-[22px] font-black leading-tight text-white line-clamp-2 break-words text-center">
                {activePlan.restaurantName}
              </h1>
            </div>

            <div
              data-testid="comensal-qr"
              onClick={() => setIsQrZoomed(true)}
              className="relative mx-auto my-4 flex h-52 w-52 cursor-pointer flex-col items-center justify-center rounded-[24px] bg-white p-3 shadow-md transition-transform active:scale-95"
            >
              <QRCodeSVG
                value={activePlan.qrPayload}
                size={160}
                level="M"
                fgColor="#4A0E78"
                title="Código QR del pase"
              />
              <div className="absolute bottom-2 right-2 rounded-full bg-[#F3E8FF] p-1 text-[#7B2CBF]">
                <Maximize2 className="h-3.5 w-3.5" />
              </div>
            </div>

            {plans.length > 1 && (
              <div className="flex items-center justify-center gap-4 my-2">
                <button
                  type="button"
                  onClick={handlePrevRestaurant}
                  aria-label="Restaurante anterior"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white active:scale-90 transition-all hover:bg-white/30"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-[13px] font-bold text-white/90">
                  {currentPlanIndex + 1} de {plans.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextRestaurant}
                  aria-label="Siguiente restaurante"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white active:scale-90 transition-all hover:bg-white/30"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}

            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-[52px] font-extrabold leading-none tracking-tight">
                  {activePlan.lunchesLeft}
                </span>
                <span className="text-[18px] font-bold text-[#E0AAFF]">almuerzos</span>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-[#E0AAFF]">
                {activePlan.hasMultipleExpiries && activePlan.multipleExpiryText
                  ? activePlan.multipleExpiryText
                  : `Vence ${activePlan.expiryDate}`}
              </p>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsSellosOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95 transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-[#7B2CBF]" />
              <span>{PASE_COPY.stampsButton}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMesaOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95 transition-all shadow-xs"
            >
              <Users className="h-4 w-4 text-[#7B2CBF]" />
              <span>{PASE_COPY.tableButton}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modales secundarios */}
      <SellosModal
        isOpen={isSellosOpen}
        onClose={() => setIsSellosOpen(false)}
        restaurantName={activePlan?.restaurantName || "Restaurante"}
        currentStamps={activePlan?.currentStamps || 0}
        onClaimReward={handleClaimRewardWithUndo}
      />

      <MesaAmigosModal
        isOpen={isMesaOpen}
        onClose={() => setIsMesaOpen(false)}
        restaurantName={activePlan?.restaurantName || "Restaurante"}
      />

      <EstadoPedidoModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        orderNumber={activeOrder?.orderNumber || "42"}
        restaurantName={activeOrder?.restaurantName || "Restaurante"}
      />

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            if (onUndoRedemption) onUndoRedemption();
          }}
          label="Premio reclamado"
        />
      )}
    </div>
  );
};
