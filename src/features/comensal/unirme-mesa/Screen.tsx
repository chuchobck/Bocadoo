import React, { useState } from "react";
import { Users, Clock, AlertCircle, WifiOff, Loader2, CheckCircle2 } from "lucide-react";
import { ButtonPrimary, TopBar } from "@/design-system";
import { UNIRME_MESA_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface UnirmeMesaScreenProps {
  mesaId?: string | undefined;
  restaurantName?: string | undefined;
  meetTime?: string | undefined;
  hostName?: string | undefined;
  onJoinSuccess?: (() => void) | undefined;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const UnirmeMesaScreen: React.FC<UnirmeMesaScreenProps> = ({
  mesaId = "m1234",
  restaurantName = "La Cuchara de San Blas",
  meetTime = "13:00",
  hostName = "Carlos Mejía",
  onJoinSuccess,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    setJoined(true);
    if (onJoinSuccess) onJoinSuccess();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <TopBar title={UNIRME_MESA_COPY.title} onBack={onBack} />

      <main className="flex-1 p-6 flex flex-col justify-between">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h3 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{UNIRME_MESA_COPY.loadingTitle}</h3>
          </div>
        )}

        {state === "vacio" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Users className="h-14 w-14 text-[#6B5B7B] mb-2" />
            <h3 className="text-[20px] font-extrabold text-[#4A0E78]">{UNIRME_MESA_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">
              {UNIRME_MESA_COPY.emptyDesc}
            </p>
            <div className="mt-6 w-full">
              <ButtonPrimary onClick={onBack || (() => {})}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-[#FDEBEB] p-6 text-center text-[#C0392B] w-full">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h3 className="text-[17px] font-extrabold">{UNIRME_MESA_COPY.errorTitle}</h3>
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
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{UNIRME_MESA_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-6">
            <div className="rounded-[32px] bg-[#F5F3FA] p-6 border border-[#E7E1F2] text-center space-y-3">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-[20px] font-black text-[#4A0E78]">{restaurantName}</h2>
              {/* Línea guía justificada (máximo 8 palabras) */}
              <p className="text-[13px] font-semibold text-[#6B5B7B]">{UNIRME_MESA_COPY.guideLine}</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-bold text-[#4A0E78] border border-[#E7E1F2]">
                <Clock className="h-4 w-4 text-[#7B2CBF]" />
                <span>Almuerzo a las {meetTime}</span>
              </div>
              <p className="text-[13px] font-semibold text-[#6B5B7B]">
                Invitación creada por <span className="font-bold text-[#4A0E78]">{hostName}</span>
              </p>
            </div>

            {joined ? (
              <div className="rounded-2xl bg-[#E6F6EC] p-4 text-center text-[#157A41] flex items-center justify-center gap-2 font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>{UNIRME_MESA_COPY.joinedBadge}</span>
              </div>
            ) : (
              <ButtonPrimary onClick={handleJoin}>
                {UNIRME_MESA_COPY.joinButton}
              </ButtonPrimary>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
