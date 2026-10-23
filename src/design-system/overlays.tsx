import React, { useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, WifiOff, AlertCircle, Loader2, X } from "lucide-react";
import type { BaseComponentProps } from "./types";

/**
 * 12. BottomSheet — Hoja inferior interactiva con integración del botón Atrás de Android.
 * Regla: history.back() solo se llama cuando el USUARIO cierra explícitamente la hoja
 * (botón X o fondo), NUNCA en el cleanup de desmontaje.
 */
export interface BottomSheetProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  state = "exito",
  className = "",
}) => {
  const isPushedRef = useRef(false);
  const sheetIdRef = useRef<string>("");
  const depthRef = useRef<number>(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    if (!sheetIdRef.current) {
      sheetIdRef.current = "sheet-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    }

    const currentSheetId = sheetIdRef.current;
    const currentState = window.history.state || {};

    // Si este sheet específico ya fue empujado (ej. remonte de React StrictMode), no duplicar push
    if (currentState.bocadooSheetId === currentSheetId) {
      isPushedRef.current = true;
      depthRef.current = currentState.bocadooSheetDepth || 1;
    } else {
      const nextDepth = (currentState.bocadooSheetDepth || 0) + 1;
      depthRef.current = nextDepth;
      window.history.pushState(
        {
          ...currentState,
          bocadooSheetId: currentSheetId,
          bocadooSheetDepth: nextDepth,
          prevSheetId: currentState.bocadooSheetId,
        },
        ""
      );
      isPushedRef.current = true;
    }

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {};
      const newDepth = state.bocadooSheetDepth || 0;
      // Si la profundidad actual es menor que la de esta hoja, significa que esta hoja fue desapilada
      if (newDepth < depthRef.current) {
        isPushedRef.current = false;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // NUNCA llamar a history.back() en cleanup para no chocar con navegación del router
    };
  }, [isOpen]);

  const handleUserClose = () => {
    if (isPushedRef.current && typeof window !== "undefined") {
      isPushedRef.current = false;
      // Solo hacer back si esta hoja sigue en el tope del historial
      if (window.history.state?.bocadooSheetId === sheetIdRef.current) {
        window.history.back();
      }
    }
    onCloseRef.current();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-[#4A0E78]/40 backdrop-blur-[4px] animate-in fade-in duration-200"
      onClick={handleUserClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-[0_-8px_30px_rgba(74,14,120,0.15)] animate-in slide-in-from-bottom duration-300 ${className}`}
      >
        {/* Cabecera con manija y botón cerrar */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-1.5 w-12 rounded-full bg-[#E7E1F2] mx-auto" />
          <button
            type="button"
            onClick={handleUserClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC] active:scale-95 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state === "cargando" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#7B2CBF]" />
            <span className="mt-2 text-[15px] font-bold text-[#6B5B7B]">Cargando...</span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8 text-center">
            <span className="text-[15px] font-bold text-[#6B5B7B]">Sin opciones disponibles</span>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-[#FDEBEB] p-4 text-center text-[#C0392B]">
            <AlertCircle className="mx-auto h-7 w-7 mb-1" />
            <span className="text-[15px] font-bold">Ocurrió un problema al cargar</span>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Sin conexión</span>
          </div>
        )}

        {state === "exito" && (
          <>
            {title && (
              <h3 className="mb-4 text-[20px] font-extrabold text-[#4A0E78]">{title}</h3>
            )}
            {children}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 13. ScanResultOverlay — Pantalla de validación en caja con resultados accesibles:
 * - VERDE: Válido (#1F9D55 sobre #E6F6EC)
 * - AVISO: Morado medio (#9D4EDD sobre #F3E8FF: último almuerzo o duplicado)
 * - ROJO: No válido (#C0392B sobre #FDEBEB)
 * - GRIS: Sin conexión (#6B5B7B sobre #F5F3FA)
 */
export interface ScanResultOverlayProps extends BaseComponentProps {
  outcome: "VERDE" | "AVISO" | "ROJO" | "GRIS";
  clientName: string;
  remainingLunches?: number | undefined;
  message?: string | undefined;
  onUndo?: (() => void) | undefined;
  onAction?: (() => void) | undefined;
  actionLabel?: string | undefined;
}

export const ScanResultOverlay: React.FC<ScanResultOverlayProps> = ({
  outcome,
  clientName,
  remainingLunches,
  message,
  onUndo,
  onAction,
  actionLabel = "Vender plan",
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 ${className}`}>
        <Loader2 className="h-12 w-12 animate-spin text-[#7B2CBF]" />
        <span className="mt-3 text-[17px] font-bold text-[#4A0E78]">Validando código</span>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F3FA] p-6 text-center ${className}`}>
        <span className="text-[17px] font-bold text-[#6B5B7B]">Esperando código QR</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-6 text-center ${className}`}>
        <WifiOff className="h-12 w-12 text-[#6B5B7B] mb-2" />
        <h3 className="text-[20px] font-extrabold text-[#4A0E78]">Validado localmente</h3>
        <p className="mt-1 text-[13px] text-[#6B5B7B]">Se sincronizará al conectar.</p>
      </div>
    );
  }

  // Éxito: Fondo verde o morado medio según el estado
  const configs = {
    VERDE: {
      bg: "bg-[#E6F6EC]",
      iconColor: "text-[#157A41]",
      Icon: CheckCircle2,
      title: "Validado",
      numberColor: "text-[#157A41]",
    },
    AVISO: {
      bg: "bg-[#F3E8FF]",
      iconColor: "text-[#9D4EDD]",
      Icon: AlertTriangle,
      title: "Último almuerzo",
      numberColor: "text-[#9D4EDD]",
    },
    ROJO: {
      bg: "bg-[#FDEBEB]",
      iconColor: "text-[#C0392B]",
      Icon: XCircle,
      title: "Sin almuerzos",
      numberColor: "text-[#C0392B]",
    },
    GRIS: {
      bg: "bg-[#F5F3FA]",
      iconColor: "text-[#6B5B7B]",
      Icon: AlertCircle,
      title: "Ya validado",
      numberColor: "text-[#6B5B7B]",
    },
  }[outcome];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 ${configs.bg} ${className}`}
    >
      <div className="mt-8 flex flex-col items-center text-center">
        <configs.Icon className={`h-24 w-24 ${configs.iconColor}`} />
        <h2 className="mt-3 text-[28px] font-extrabold text-[#4A0E78]">{configs.title}</h2>
        <span className="text-[17px] font-bold text-[#6B5B7B]">{clientName}</span>
      </div>

      {remainingLunches !== undefined && (
        <div className="flex flex-col items-center text-center">
          <span className={`text-[64px] font-black leading-none ${configs.numberColor}`}>
            {remainingLunches}
          </span>
          <span className="mt-1 text-[17px] font-bold text-[#4A0E78]">
            {outcome === "VERDE" ? "Le quedan" : "restantes"}
          </span>
        </div>
      )}

      {message && <p className="text-center text-[15px] font-semibold text-[#6B5B7B]">{message}</p>}

      <div className="w-full flex flex-col gap-3 pb-6">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-[#157A41] bg-white text-[17px] font-bold text-[#157A41] active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Deshacer</span>
          </button>
        )}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#7B2CBF] text-[17px] font-bold text-white shadow-md active:scale-95"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 14. UndoBanner — Barra con cuenta regresiva de 10s y botón Deshacer.
 * Admite modo inline para mostrarse limpiamente dentro de contenedores o kit de diseño.
 */
export interface UndoBannerProps extends BaseComponentProps {
  secondsLeft: number;
  onUndo: () => void;
  label?: string | undefined;
  inline?: boolean | undefined;
}

export const UndoBanner: React.FC<UndoBannerProps> = ({
  secondsLeft,
  onUndo,
  label = "Almuerzo validado",
  inline = false,
  state = "exito",
  className = "",
}) => {
  if (secondsLeft <= 0 && state === "exito") return null;

  const containerClasses = inline
    ? `relative flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-white px-5 shadow-[0_6px_20px_rgba(74,14,120,0.08)] border border-[#E7E1F2] ${className}`
    : `fixed bottom-24 left-1/2 z-40 flex h-14 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 items-center justify-between rounded-full bg-white px-5 shadow-[0_12px_28px_rgba(74,14,120,0.18)] border border-[#E7E1F2] ${className}`;

  if (state === "cargando") {
    return <div className={`h-14 w-full max-w-sm rounded-full bg-[#E7E1F2] animate-pulse ${className}`} />;
  }

  if (state === "vacio") return null;

  if (state === "error") {
    return (
      <div className={`flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-[#FDEBEB] px-5 text-[#C0392B] border border-[#C0392B] ${className}`}>
        <span className="text-[13px] font-bold">No se puede deshacer</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-[#F5F3FA] px-5 text-[#6B5B7B] border border-[#E7E1F2] ${className}`}>
        <span className="text-[13px] font-bold">Deshacer pendiente de red</span>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className={containerClasses}>
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#E6F6EC] text-[#157A41] text-[13px] font-black">
          {secondsLeft}
        </div>
        <span className="text-[15px] font-bold text-[#4A0E78]">{label}</span>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-4 py-2 text-[13px] font-bold text-[#7B2CBF] active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Deshacer</span>
      </button>
    </div>
  );
};
