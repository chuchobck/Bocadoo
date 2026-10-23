import React, { useState } from "react";
import { MessageSquare, Check, AlertCircle, WifiOff, Loader2 } from "lucide-react";
import { ButtonPrimary, Chip } from "@/design-system";
import { CALIFICAR_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface CalificarScreenProps {
  onSelectTag?: (tag: string) => void;
  onSubmitPrivateNote?: (note: string) => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const CalificarScreen: React.FC<CalificarScreenProps> = ({
  onSelectTag,
  onSubmitPrivateNote,
  onRetry,
  state = "exito",
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tags = ["Rápido", "Porción", "Rico", "Atención"];

  const handleSelect = (tag: string) => {
    setSelectedTag(tag);
    onSelectTag?.(tag);
  };

  const handleSend = () => {
    setSubmitted(true);
    if (note.trim() && onSubmitPrivateNote) {
      onSubmitPrivateNote(note.trim());
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[28px] bg-[#E6F6EC] p-6 text-center text-[#157A41]">
        <Check className="mx-auto h-8 w-8 mb-2" />
        <h3 className="text-[17px] font-black">{CALIFICAR_COPY.sentFeedback}</h3>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      aria-label="Calificar almuerzo"
      className="rounded-[28px] bg-[#FAF8FC] p-4 border border-[#E7E1F2] space-y-3"
    >
      <h3 className="text-[17px] font-black text-[#4A0E78]">{CALIFICAR_COPY.title}</h3>
      {/* Línea guía justificada (máximo 8 palabras) */}
      <p className="text-[13px] font-semibold text-[#6B5B7B]">{CALIFICAR_COPY.guideLine}</p>

      {state === "cargando" && (
        <div className="py-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#7B2CBF]" />
          <span className="mt-2 block text-[13px] font-bold text-[#4A0E78]">{CALIFICAR_COPY.loadingTitle}</span>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl bg-[#FDEBEB] p-4 text-center text-[#C0392B]">
          <AlertCircle className="mx-auto h-6 w-6 mb-1" />
          <span className="text-[13px] font-bold">{CALIFICAR_COPY.errorTitle}</span>
          <button
            type="button"
            onClick={onRetry || (() => window.location.reload())}
            className="mt-2 block mx-auto text-[13px] font-extrabold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {state === "offline" && (
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
          <WifiOff className="h-3.5 w-3.5" />
          <span>{CALIFICAR_COPY.offlineBadge}</span>
        </div>
      )}

      {(state === "exito" || state === "offline") && (
        <>
          {/* Tags en 1 toque */}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={selectedTag === t}
                onToggle={() => handleSelect(t)}
              />
            ))}
          </div>

          {/* Nota privada opcional */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={CALIFICAR_COPY.commentPlaceholder}
            rows={2}
            className="w-full rounded-2xl border border-[#E7E1F2] bg-white p-3 text-[13px] font-medium text-[#4A0E78] placeholder-[#6B5B7B] focus:border-[#7B2CBF] focus:outline-hidden"
          />

          <ButtonPrimary onClick={handleSend} disabled={!selectedTag}>
            {CALIFICAR_COPY.sendButton}
          </ButtonPrimary>
        </>
      )}
    </div>
  );
};
