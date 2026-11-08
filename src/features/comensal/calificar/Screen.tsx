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
      <div className="rounded-[28px] bg-success-container p-6 text-center text-success">
        <Check className="mx-auto h-8 w-8 mb-2" />
        <h3 className="text-[17px] font-black">{CALIFICAR_COPY.sentFeedback}</h3>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      aria-label="Calificar almuerzo"
      className="rounded-[28px] bg-background p-4 border border-border space-y-3"
    >
      <h3 className="text-[17px] font-black text-foreground">{CALIFICAR_COPY.title}</h3>
      {/* Línea guía justificada (máximo 8 palabras) */}
      <p className="text-[13px] font-semibold text-muted-foreground">{CALIFICAR_COPY.guideLine}</p>

      {state === "cargando" && (
        <div role="status" className="space-y-3 py-1 animate-pulse">
          <span className="sr-only">Cargando tarjeta de calificación...</span>
          <div className="space-y-1.5">
            <div className="h-4 w-40 rounded-full bg-secondary-container" />
            <div className="h-3 w-56 rounded-full bg-secondary-container/70" />
          </div>

          {/* Grilla de tags de 1 toque */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full border border-border bg-surface"
              />
            ))}
          </div>

          {/* Campo de nota opcional y botón */}
          <div className="h-11 w-full rounded-2xl border border-border bg-surface mt-2" />
          <div className="h-12 w-full rounded-full bg-primary/20 mt-1" />
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl bg-danger-container p-4 text-center text-on-danger-container">
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
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
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
            className="w-full rounded-2xl border border-border bg-surface p-3 text-[13px] font-medium text-foreground placeholder-muted-foreground focus:border-primary focus:outline-hidden"
          />

          <ButtonPrimary onClick={handleSend} disabled={!selectedTag}>
            {CALIFICAR_COPY.sendButton}
          </ButtonPrimary>
        </>
      )}
    </div>
  );
};
