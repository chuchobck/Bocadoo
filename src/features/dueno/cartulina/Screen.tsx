import React, { useState } from "react";
import { Sparkles, AlertCircle, WifiOff, Loader2, X, Check } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { CARTULINA_COPY } from "./copy";
import { clientsRepository } from "@/data/repositories/clients.repository";
import type { ComponentState } from "@/design-system";

export interface PasarCartulinaScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrateSuccess?: (dinerName: string, remainingLunches: number) => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const PasarCartulinaScreen: React.FC<PasarCartulinaScreenProps> = ({
  isOpen,
  onClose,
  onMigrateSuccess,
  onRetry,
  state = "exito",
}) => {
  const [dinerName, setDinerName] = useState("Carlos Mejía");
  const [phone, setPhone] = useState("0991234567");
  const [remainingLunches, setRemainingLunches] = useState(8);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const handleMigrate = () => {
    clientsRepository.registerPhysicalCard(dinerName, phone, remainingLunches);
    setUndoLabel(CARTULINA_COPY.migratedUndo(dinerName, remainingLunches));
    setUndoSeconds(10);
    onMigrateSuccess?.(dinerName, remainingLunches);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-surface p-6 shadow-xl animate-in slide-in-from-bottom relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-[20px] font-black text-foreground">{CARTULINA_COPY.title}</h2>
        {/* Línea guía justificada (máximo 8 palabras) */}
        <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">
          {CARTULINA_COPY.guideLine}
        </p>

        {state === "cargando" && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <span className="mt-3 block text-[13px] font-bold text-foreground">
              {CARTULINA_COPY.loadingTitle}
            </span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-[17px] font-bold text-foreground">{CARTULINA_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
              {CARTULINA_COPY.emptyDesc}
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="my-4 rounded-[24px] bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{CARTULINA_COPY.errorTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold">{CARTULINA_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || onClose}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="my-3 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{CARTULINA_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="cartulina-name" className="block text-[13px] font-bold text-muted-foreground mb-1">
                {CARTULINA_COPY.nameLabel}
              </label>
              <input
                id="cartulina-name"
                type="text"
                value={dinerName}
                onChange={(e) => setDinerName(e.target.value)}
                aria-label={CARTULINA_COPY.nameLabel}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="cartulina-phone" className="block text-[13px] font-bold text-muted-foreground mb-1">
                {CARTULINA_COPY.phoneLabel}
              </label>
              <input
                id="cartulina-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label={CARTULINA_COPY.phoneLabel}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-muted-foreground mb-1">
                {CARTULINA_COPY.lunchesLabel}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRemainingLunches((prev) => Math.max(1, prev - 1))}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-background text-foreground font-bold active:scale-95"
                >
                  -
                </button>
                <span className="flex-1 text-center text-[17px] font-black text-foreground">
                  {remainingLunches} almuerzos
                </span>
                <button
                  type="button"
                  onClick={() => setRemainingLunches((prev) => prev + 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-primary-container text-primary font-bold active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2">
              <ButtonPrimary onClick={handleMigrate}>
                {CARTULINA_COPY.migrateButton}
              </ButtonPrimary>
            </div>
          </div>
        )}
      </div>

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
