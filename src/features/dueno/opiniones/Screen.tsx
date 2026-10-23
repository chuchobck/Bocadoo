import React, { useState } from "react";
import { MessageSquare, Check, AlertCircle, WifiOff, Loader2, ArrowLeft } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { OPINIONES_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface OpinionItem {
  id: string;
  dinerName: string;
  tag: string;
  comment: string;
  timeAgo: string;
  resolved: boolean;
}

export interface OpinionesScreenProps {
  opinions?: OpinionItem[];
  onResolve?: (opinionId: string, solution: string) => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const OpinionesScreen: React.FC<OpinionesScreenProps> = ({
  opinions = [
    {
      id: "op-1",
      dinerName: "Carlos Mejía",
      tag: "Rápido",
      comment: "Excelente atención y la sopa estuvo caliente.",
      timeAgo: "Hace 20 min",
      resolved: false,
    },
    {
      id: "op-2",
      dinerName: "Andrea Morales",
      tag: "Porción",
      comment: "Un poquito más de arroz por favor.",
      timeAgo: "Hace 1 hora",
      resolved: false,
    },
  ],
  onResolve,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionItem | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const solutions = [
    "Agradecer opinión",
    "Reponer almuerzo",
    "Nota privada al comensal",
  ];

  const handleSendSolution = (sol: string) => {
    if (!selectedOpinion) return;
    setUndoLabel(OPINIONES_COPY.sentUndo(selectedOpinion.dinerName));
    setUndoSeconds(10);
    onResolve?.(selectedOpinion.id, sol);
    setSelectedOpinion(null);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Buzón de opiniones"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a caja"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[22px] font-black text-[#4A0E78]">{OPINIONES_COPY.title}</h1>
        </div>
        <span className="text-[13px] font-bold text-[#6B5B7B]">
          {opinions.filter((o) => !o.resolved).length} pendientes
        </span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{OPINIONES_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{OPINIONES_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{OPINIONES_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{OPINIONES_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{OPINIONES_COPY.errorDesc}</p>
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
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{OPINIONES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-3">
            {opinions.map((op) => (
              <div
                key={op.id}
                onClick={() => setSelectedOpinion(op)}
                className="rounded-[24px] border border-[#E7E1F2] bg-white p-4 shadow-xs cursor-pointer hover:border-[#7B2CBF] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-extrabold text-[#4A0E78]">{op.dinerName}</h3>
                    <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[13px] font-bold text-[#7B2CBF]">
                      {op.tag}
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-[#6B5B7B]">{op.timeAgo}</span>
                </div>

                <p className="mt-2 text-[14px] font-medium text-[#4A0E78] bg-[#F5F3FA] p-3 rounded-2xl">
                  "{op.comment}"
                </p>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedOpinion(op)}
                    className="rounded-full bg-[#7B2CBF] px-4 py-1.5 text-[13px] font-bold text-white active:scale-95 transition-all"
                  >
                    {OPINIONES_COPY.respondButton}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de respuesta directa en 1 toque */}
      {selectedOpinion && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setSelectedOpinion(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl animate-in slide-in-from-bottom"
          >
            <h3 className="text-[17px] font-extrabold text-[#4A0E78] text-center">
              {OPINIONES_COPY.solutionModalTitle(selectedOpinion.dinerName)}
            </h3>

            <div className="mt-5 space-y-2">
              {solutions.map((sol) => (
                <button
                  key={sol}
                  type="button"
                  onClick={() => handleSendSolution(sol)}
                  className="w-full rounded-2xl bg-[#F5F3FA] p-4 text-left font-bold text-[#4A0E78] border border-[#E7E1F2] hover:border-[#7B2CBF] active:scale-98 transition-all flex items-center justify-between"
                >
                  <span>{sol}</span>
                  <Check className="h-4 w-4 text-[#7B2CBF]" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedOpinion(null)}
              className="mt-4 w-full rounded-full py-2 text-[13px] font-bold text-[#6B5B7B]"
            >
              {OPINIONES_COPY.cancel}
            </button>
          </div>
        </div>
      )}

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
