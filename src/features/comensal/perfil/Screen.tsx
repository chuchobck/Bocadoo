import React from "react";
import { User, Phone, MessageSquare, AlertCircle, WifiOff, Loader2 } from "lucide-react";
import { ButtonPrimary } from "@/design-system";
import { PERFIL_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface PerfilScreenProps {
  userName?: string | undefined;
  userPhone?: string | undefined;
  userPlanName?: string | undefined;
  onRetry?: (() => void) | undefined;
  onHelpClick?: (() => void) | undefined;
  state?: ComponentState;
}

export const PerfilScreen: React.FC<PerfilScreenProps> = ({
  userName = "Carlos Mejía",
  userPhone = "0991234567",
  userPlanName = "Plan mensual (20 almuerzos · $60)",
  onRetry,
  onHelpClick,
  state = "exito",
}) => {
  const handleOpenWhatsApp = () => {
    if (onHelpClick) {
      onHelpClick();
      return;
    }
    const message = "Hola Bocadoo, necesito ayuda con mi plan en mi restaurante habitual.";
    const url = `https://wa.me/593999999999?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      tabIndex={0}
      aria-label="Perfil del comensal"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar pb-24 focus:outline-hidden"
    >
      <header className="p-4 border-b border-[#E7E1F2] bg-white">
        <h1 className="text-[24px] font-black text-[#4A0E78]">{PERFIL_COPY.title}</h1>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {state === "cargando" && (
          <div className="flex flex-col items-center py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h3 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{PERFIL_COPY.loadingTitle}</h3>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h3 className="text-[17px] font-extrabold text-[#4A0E78]">{PERFIL_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{PERFIL_COPY.emptyDesc}</p>
            <div className="mt-4">
              <ButtonPrimary onClick={() => window.location.reload()}>Iniciar sesión</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{PERFIL_COPY.errorTitle}</h3>
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
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{PERFIL_COPY.offlineNotice}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            <div className="flex items-center gap-4 rounded-[28px] bg-[#F5F3FA] p-5 border border-[#E7E1F2]">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#7B2CBF] text-[24px] font-black text-white">
                {userName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-extrabold text-[#4A0E78]">{userName}</h2>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B5B7B]">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{userPhone}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-4 border border-[#E7E1F2] shadow-xs space-y-2">
              <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block">
                {PERFIL_COPY.activePlanSection}
              </span>
              <p className="text-[15px] font-extrabold text-[#4A0E78]">{userPlanName}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[13px] font-bold text-[#4A0E78]">
                  🍲 Sopa
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[13px] font-bold text-[#4A0E78]">
                  🍛 Segundo
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[13px] font-bold text-[#4A0E78]">
                  🥤 Bebida
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#157A41] py-3 text-[14px] font-bold text-white shadow-xs active:scale-95 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{PERFIL_COPY.helpButton}</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
