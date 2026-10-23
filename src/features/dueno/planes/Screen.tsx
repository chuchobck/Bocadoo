import React, { useState } from "react";
import { Plus, Minus, Check, AlertCircle, WifiOff, Loader2, X } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { PLANES_COPY } from "./copy";
import { plansRepository, type PlanConfig } from "@/data/repositories/plans.repository";
import type { ComponentState } from "@/design-system";

export interface CrearEditarPlanScreenProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: PlanConfig;
  onSavePlan?: (plan: Partial<PlanConfig>) => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const CrearEditarPlanScreen: React.FC<CrearEditarPlanScreenProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSavePlan,
  onRetry,
  state = "exito",
}) => {
  const isEditing = Boolean(planToEdit);
  const [lunches, setLunches] = useState<number>(planToEdit?.lunches || 20);
  const [price, setPrice] = useState<number>(planToEdit?.priceCents ? planToEdit.priceCents / 100 : 50);
  const [days, setDays] = useState<number>(planToEdit?.daysValidity || 30);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const lunchOptions = [10, 15, 20];
  const priceOptions = [45, 50, 55];

  const handleSave = () => {
    const formattedPrice = `$${price},00`;
    const planName = `Plan ${lunches} almuerzos`;
    plansRepository.savePlan({
      ...(planToEdit?.id ? { id: planToEdit.id } : {}),
      name: planName,
      lunches,
      priceCents: price * 100,
      priceFormatted: formattedPrice,
      daysValidity: days,
    });
    setUndoLabel(PLANES_COPY.savedUndo(planName, formattedPrice));
    setUndoSeconds(10);
    onSavePlan?.({
      name: planName,
      lunches,
      priceCents: price * 100,
      priceFormatted: formattedPrice,
      daysValidity: days,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl animate-in slide-in-from-bottom relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-[20px] font-black text-[#4A0E78]">
          {isEditing ? PLANES_COPY.editTitle : PLANES_COPY.createTitle}
        </h2>
        {/* Línea guía justificada (máximo 8 palabras) */}
        <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">
          {PLANES_COPY.guideLine}
        </p>

        {state === "cargando" && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7B2CBF]" />
            <span className="mt-3 block text-[13px] font-bold text-[#4A0E78]">
              {PLANES_COPY.loadingTitle}
            </span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8 text-center">
            <Plus className="mx-auto h-10 w-10 text-[#6B5B7B] mb-2" />
            <h3 className="text-[17px] font-bold text-[#4A0E78]">{PLANES_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{PLANES_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="my-4 rounded-[24px] bg-[#FDEBEB] p-5 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{PLANES_COPY.errorTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold">{PLANES_COPY.errorDesc}</p>
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
          <div className="my-3 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{PLANES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="mt-5 space-y-4">
            {/* Cantidad de almuerzos en 1 toque */}
            <div>
              <label className="block mb-2 text-[13px] font-bold text-[#6B5B7B]">
                {PLANES_COPY.lunchesLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {lunchOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setLunches(opt);
                      setPrice(opt === 10 ? 30 : opt === 15 ? 45 : 60);
                    }}
                    aria-pressed={lunches === opt}
                    className={`rounded-2xl py-3 text-[15px] font-bold transition-all active:scale-95 ${
                      lunches === opt
                        ? "bg-[#7B2CBF] text-white shadow-xs"
                        : "bg-[#F3E8FF] text-[#4A0E78]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de precio: Chips predefinidos editables en 1 toque + botones + / − */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-[#6B5B7B]">
                  {PLANES_COPY.priceLabel}
                </label>
                <span className="text-[17px] font-black text-[#4A0E78]">
                  ${price},00
                </span>
              </div>

              {/* Fila 1: Opciones predefinidas en 1 toque */}
              <div className="grid grid-cols-3 gap-2">
                {priceOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrice(p)}
                    aria-pressed={price === p}
                    className={`rounded-2xl py-2.5 text-[15px] font-bold transition-all active:scale-95 ${
                      price === p
                        ? "bg-[#4A0E78] text-white shadow-xs"
                        : "bg-[#F5F3FA] text-[#4A0E78] border border-[#E7E1F2]"
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* Fila 2: Ajuste fino con botones + y − (1 toque por dólar) */}
              <div className="mt-2 flex items-center justify-center gap-3 rounded-2xl bg-[#F5F3FA] p-2 border border-[#E7E1F2]">
                <button
                  type="button"
                  onClick={() => setPrice((prev) => Math.max(5, prev - 1))}
                  aria-label="Disminuir un dólar"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white text-[#4A0E78] shadow-xs active:scale-95 font-black"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Ajustar $1</span>
                <button
                  type="button"
                  onClick={() => setPrice((prev) => prev + 1)}
                  aria-label="Aumentar un dólar"
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white text-[#4A0E78] shadow-xs active:scale-95 font-black"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Guardar plan en 1 toque */}
            <div className="pt-2">
              <ButtonPrimary onClick={handleSave}>{PLANES_COPY.saveButton}</ButtonPrimary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
