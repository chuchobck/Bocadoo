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
      className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-scrim/40 backdrop-blur-[4px] p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleUserClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] bg-surface p-5 sm:p-6 shadow-2xl border border-border animate-in slide-in-from-bottom duration-300 ${className}`}
      >
        {/* Cabecera con manija y botón cerrar */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-1.5 w-12 rounded-full bg-border mx-auto" />
          <button
            type="button"
            onClick={handleUserClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-primary-container text-foreground hover:bg-secondary-container active:scale-95 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state === "cargando" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mt-2 text-[15px] font-bold text-muted-foreground">Cargando...</span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8 text-center">
            <span className="text-[15px] font-bold text-muted-foreground">Sin opciones disponibles</span>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-danger-container p-4 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-7 w-7 mb-1" />
            <span className="text-[15px] font-bold">Ocurrió un problema al cargar</span>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Sin conexión</span>
          </div>
        )}

        {state === "exito" && (
          <>
            {title && (
              <h3 className="mb-4 text-[20px] font-extrabold text-foreground">{title}</h3>
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
 * - VERDE: Válido (`success` sobre `success-container`)
 * - AVISO: Morado (`primary` sobre `primary-container`: último almuerzo o duplicado)
 * - ROJO: No válido (`on-danger-container` sobre `danger-container`)
 * - GRIS: Sin conexión (`muted-foreground` sobre `background`)
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
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface p-6 ${className}`}>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="mt-3 text-[17px] font-bold text-foreground">Validando código</span>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 text-center ${className}`}>
        <span className="text-[17px] font-bold text-muted-foreground">Esperando código QR</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface p-6 text-center ${className}`}>
        <WifiOff className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-[20px] font-extrabold text-foreground">Validado localmente</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Se sincronizará al conectar.</p>
      </div>
    );
  }

  // Éxito: Fondo verde o morado medio según el estado
  const configs = {
    VERDE: {
      bg: "bg-success-container",
      iconColor: "text-success",
      Icon: CheckCircle2,
      title: "Validado",
      numberColor: "text-success",
    },
    AVISO: {
      bg: "bg-primary-container",
      iconColor: "text-primary",
      Icon: AlertTriangle,
      title: "Último almuerzo",
      numberColor: "text-primary",
    },
    ROJO: {
      bg: "bg-danger-container",
      iconColor: "text-danger",
      Icon: XCircle,
      title: "Sin almuerzos",
      numberColor: "text-danger",
    },
    GRIS: {
      bg: "bg-background",
      iconColor: "text-muted-foreground",
      Icon: AlertCircle,
      title: "Ya validado",
      numberColor: "text-muted-foreground",
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
        <h2 className="mt-3 text-[28px] font-extrabold text-foreground">{configs.title}</h2>
        <span className="text-[17px] font-bold text-muted-foreground">{clientName}</span>
      </div>

      {remainingLunches !== undefined && (
        <div className="flex flex-col items-center text-center">
          <span className={`text-[64px] font-black leading-none ${configs.numberColor}`}>
            {remainingLunches}
          </span>
          <span className="mt-1 text-[17px] font-bold text-foreground">
            {outcome === "VERDE" ? "Le quedan" : "restantes"}
          </span>
        </div>
      )}

      {message && <p className="text-center text-[15px] font-semibold text-muted-foreground">{message}</p>}

      <div className="w-full flex flex-col gap-3 pb-6">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-success bg-surface text-[17px] font-bold text-success active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Deshacer</span>
          </button>
        )}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-[17px] font-bold text-primary-foreground shadow-md active:scale-95"
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
    ? `relative flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-surface px-5 shadow-md border border-border ${className}`
    : `fixed bottom-24 left-1/2 z-40 flex h-14 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 items-center justify-between rounded-full bg-surface px-5 shadow-md border border-border ${className}`;

  if (state === "cargando") {
    return <div className={`h-14 w-full max-w-sm rounded-full bg-border animate-pulse ${className}`} />;
  }

  if (state === "vacio") return null;

  if (state === "error") {
    return (
      <div className={`flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-danger-container px-5 text-on-danger-container border border-danger ${className}`}>
        <span className="text-[13px] font-bold">No se puede deshacer</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-background px-5 text-muted-foreground border border-border ${className}`}>
        <span className="text-[13px] font-bold">Deshacer pendiente de red</span>
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className={containerClasses}>
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-success-container text-success text-[13px] font-black">
          {secondsLeft}
        </div>
        <span className="text-[15px] font-bold text-foreground">{label}</span>
      </div>

      <button
        type="button"
        onClick={onUndo}
        className="flex items-center gap-1 rounded-full bg-primary-container px-4 py-2 text-[13px] font-bold text-primary active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Deshacer</span>
      </button>
    </div>
  );
};
