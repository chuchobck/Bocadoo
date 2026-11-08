import React from "react";
import { User, Phone, MessageSquare, AlertCircle, WifiOff, Loader2 } from "lucide-react";
import { ButtonPrimary } from "@/design-system";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar pb-24 focus:outline-hidden"
    >
      <header className="p-4 border-b border-border bg-surface">
        <h1 className="text-[24px] font-black text-foreground">{PERFIL_COPY.title}</h1>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {state === "cargando" && (
          <div role="status" className="space-y-4 py-2 animate-pulse">
            <span className="sr-only">Cargando perfil...</span>
            {/* Cabecera de usuario skeleton */}
            <div className="rounded-[28px] border border-border bg-surface p-5 text-center shadow-xs space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-secondary-container" />
              <div className="space-y-1.5">
                <div className="mx-auto h-5 w-40 rounded-full bg-secondary-container" />
                <div className="mx-auto h-3.5 w-32 rounded-full bg-secondary-container/70" />
              </div>
            </div>

            {/* Tarjeta de plan habitual skeleton */}
            <div className="rounded-[24px] border border-border bg-surface p-4 space-y-2.5">
              <div className="h-3 w-28 rounded-full bg-secondary-container" />
              <div className="h-16 rounded-2xl bg-secondary-container/60 p-3 space-y-1.5">
                <div className="h-4 w-36 rounded-full bg-secondary-container" />
                <div className="h-3 w-24 rounded-full bg-secondary-container/70" />
              </div>
            </div>

            {/* Selector de tema skeleton */}
            <div className="rounded-[24px] border border-border bg-surface p-4 space-y-2">
              <div className="h-3 w-24 rounded-full bg-secondary-container" />
              <div className="h-10 w-full rounded-2xl bg-secondary-container/60" />
            </div>

            {/* Opciones de cuenta skeleton */}
            <div className="space-y-2 pt-1">
              <div className="h-12 w-full rounded-2xl border border-border bg-surface" />
              <div className="h-12 w-full rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-[17px] font-extrabold text-foreground">{PERFIL_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{PERFIL_COPY.emptyDesc}</p>
            <div className="mt-4">
              <ButtonPrimary onClick={() => window.location.reload()}>Iniciar sesión</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{PERFIL_COPY.errorTitle}</h3>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{PERFIL_COPY.offlineNotice}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            <div className="flex items-center gap-4 rounded-[28px] bg-background p-5 border border-border">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-[24px] font-black text-primary-foreground">
                {userName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-extrabold text-foreground">{userName}</h2>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{userPhone}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-surface p-4 border border-border shadow-xs space-y-2">
              <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider block">
                {PERFIL_COPY.activePlanSection}
              </span>
              <p className="text-[15px] font-extrabold text-foreground">{userPlanName}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-[13px] font-bold text-foreground">
                  🍲 Sopa
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-[13px] font-bold text-foreground">
                  🍛 Segundo
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-[13px] font-bold text-foreground">
                  🥤 Bebida
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-4 shadow-xs space-y-2">
              <span className="block text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                {PERFIL_COPY.themeLabel}
              </span>
              <ThemeToggle />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-success py-3 text-[14px] font-bold text-success-foreground shadow-xs active:scale-95 transition-all"
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
