import React from "react";
import { Loader2, WifiOff, AlertCircle, Sparkles, Utensils, QrCode, Check } from "lucide-react";
import type { BaseComponentProps } from "./types";

/**
 * 5. Card — Superficie base blanca con bordes redondeados y sombra morada sutil.
 */
export interface CardProps extends BaseComponentProps {
  children?: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "md",
  state = "exito",
  className = "",
  onClick,
}) => {
  const padClasses = {
    none: "p-0",
    sm: "p-3.5",
    md: "p-5",
    lg: "p-6",
  }[padding];

  const baseClasses = `relative rounded-[32px] bg-white border border-[#E7E1F2] shadow-[0_10px_28px_rgba(74,14,120,0.06)] transition-all duration-200 ${padClasses} ${className}`;

  if (state === "cargando") {
    return (
      <div className={`${baseClasses} animate-pulse bg-[#F5F3FA]`}>
        <div className="h-6 w-3/4 rounded-xl bg-[#E7E1F2]" />
        <div className="mt-3 h-4 w-1/2 rounded-lg bg-[#E7E1F2]" />
        <div className="mt-6 h-12 w-full rounded-2xl bg-[#E7E1F2]" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`${baseClasses} border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] text-center`}>
        <span className="text-[15px] font-semibold text-[#6B5B7B]">Sin información disponible</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`${baseClasses} border-[#C0392B] bg-[#FDEBEB] text-[#C0392B]`}>
        <div className="flex items-center gap-2 font-bold text-[15px]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>No se pudo cargar</span>
        </div>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`${baseClasses} opacity-85`}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#6B5B7B]">
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión (datos locales)</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}`}
    >
      {children}
    </div>
  );
};

/**
 * 6. PassCard — Tarjeta estelar del pase comensal con degradado morado oficial (#7B2CBF → #4A0E78).
 */
export interface PassCardProps extends BaseComponentProps {
  restaurantName: string;
  remainingLunches: number;
  expiryDate: string;
  qrPayload?: string;
  onRenew?: () => void;
}

export const PassCard: React.FC<PassCardProps> = ({
  restaurantName,
  remainingLunches,
  expiryDate,
  qrPayload = "BCD1.DEMO.123.HASH",
  onRenew,
  state = "exito",
  className = "",
}) => {
  const gradientBg = "bg-gradient-to-b from-[#7B2CBF] to-[#4A0E78]";

  if (state === "cargando") {
    return (
      <div className={`relative w-full rounded-[32px] ${gradientBg} p-6 text-white shadow-[0_16px_36px_rgba(74,14,120,0.18)] animate-pulse ${className}`}>
        <div className="h-6 w-1/2 rounded-xl bg-white/20" />
        <div className="mx-auto my-6 h-48 w-48 rounded-2xl bg-white/20" />
        <div className="h-12 w-24 mx-auto rounded-xl bg-white/20" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`relative w-full rounded-[32px] border-2 border-dashed border-[#E0AAFF] bg-[#F5F3FA] p-8 text-center shadow-sm ${className}`}>
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
          <Utensils className="h-7 w-7" />
        </div>
        <h4 className="text-[17px] font-bold text-[#4A0E78]">Sin pases activos</h4>
        <p className="mt-1 text-[13px] text-[#6B5B7B]">Elige un restaurante para almorzar hoy.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`relative w-full rounded-[32px] bg-[#FDEBEB] border border-[#C0392B] p-6 text-center text-[#C0392B] ${className}`}>
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h4 className="text-[17px] font-bold">Código no disponible</h4>
        <p className="mt-1 text-[13px] text-[#6B5B7B]">Hubo un error al generar tu pase.</p>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`relative w-full rounded-[32px] ${gradientBg} p-6 text-white shadow-[0_16px_36px_rgba(74,14,120,0.18)] ${className}`}>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[13px] font-bold text-white">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Sin conexión</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold">{restaurantName}</span>
        </div>
        <div className="my-4 flex flex-col items-center">
          <span className="text-[48px] font-extrabold">{remainingLunches}</span>
          <span className="text-[15px] font-medium text-[#E0AAFF]">almuerzos disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] ${gradientBg} p-6 text-white shadow-[0_16px_36px_rgba(74,14,120,0.22)] ${className}`}>
      {/* Cabecera del pase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#7B2CBF] font-black text-[13px]">
            B
          </div>
          <span className="text-[17px] font-bold text-white truncate max-w-[280px]">{restaurantName}</span>
        </div>
      </div>

      {/* Contenedor del QR con contraste óptimo */}
      <div className="mx-auto my-5 flex h-52 w-52 flex-col items-center justify-center rounded-[24px] bg-white p-3 shadow-md">
        <QrCode className="h-40 w-40 text-[#4A0E78]" />
        <span className="mt-1 text-[13px] font-bold text-[#6B5B7B]">30 s</span>
      </div>

      {/* Saldo y vencimiento */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-[48px] font-extrabold leading-none tracking-tight text-white">{remainingLunches}</span>
          <span className="text-[17px] font-bold text-[#E0AAFF]">almuerzos</span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-[#E0AAFF]">Vence {expiryDate}</p>
      </div>

      {remainingLunches <= 3 && onRenew && (
        <button
          onClick={onRenew}
          className="mt-4 w-full rounded-full bg-white py-3 text-[15px] font-bold text-[#7B2CBF] shadow-md active:scale-95 transition-transform"
        >
          Renovar plan
        </button>
      )}
    </div>
  );
};

/**
 * 18. StampCard — Tarjeta de sellos de fidelidad con 10 posiciones.
 */
export interface StampCardProps extends BaseComponentProps {
  restaurantName: string;
  currentStamps: number;
  totalGoal?: number;
  rewardTitle: string;
}

export const StampCard: React.FC<StampCardProps> = ({
  restaurantName,
  currentStamps,
  totalGoal = 10,
  rewardTitle,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`rounded-[28px] border border-[#E7E1F2] bg-white p-5 animate-pulse ${className}`}>
        <div className="h-5 w-1/3 rounded-lg bg-[#E7E1F2]" />
        <div className="my-4 grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-[#E7E1F2]" />
          ))}
        </div>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`rounded-[28px] border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] p-6 text-center ${className}`}>
        <Sparkles className="mx-auto h-7 w-7 text-[#6B5B7B] mb-2" />
        <span className="text-[15px] font-bold text-[#4A0E78]">Sin tarjeta de sellos</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`rounded-[28px] bg-[#FDEBEB] border border-[#C0392B] p-5 text-center text-[#C0392B] ${className}`}>
        <AlertCircle className="mx-auto h-6 w-6 mb-1" />
        <span className="text-[13px] font-semibold">Error al cargar sellos</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[28px] border border-[#E7E1F2] bg-white p-5 opacity-80 ${className}`}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#6B5B7B]">
          <WifiOff className="h-4 w-4" />
          <span>Sellos sincronizados localmente</span>
        </div>
        <span className="text-[15px] font-bold text-[#4A0E78]">{currentStamps} de {totalGoal} sellos</span>
      </div>
    );
  }

  return (
    <div className={`rounded-[28px] border border-[#E7E1F2] bg-white p-5 shadow-[0_8px_20px_rgba(74,14,120,0.06)] ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-[15px] font-extrabold text-[#4A0E78] truncate">{restaurantName}</h4>
        <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[13px] font-bold text-[#7B2CBF]">
          {currentStamps}/{totalGoal}
        </span>
      </div>

      {/* Grilla de 10 sellos */}
      <div className="my-4 grid grid-cols-5 gap-2.5">
        {Array.from({ length: totalGoal }).map((_, i) => {
          const filled = i < currentStamps;
          return (
            <div
              key={i}
              className={`grid h-11 w-11 place-items-center rounded-full transition-all duration-200 ${
                filled
                  ? "bg-[#7B2CBF] text-white shadow-[0_4px_12px_rgba(123,44,191,0.3)]"
                  : "border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] text-[#6B5B7B]"
              }`}
            >
              {filled ? <Check className="h-5 w-5 stroke-[2.5]" /> : <span className="text-[13px] font-bold">{i + 1}</span>}
            </div>
          );
        })}
      </div>

      <p className="text-[15px] font-bold text-[#4A0E78]">Premio: {rewardTitle}</p>
    </div>
  );
};

/**
 * 19. DishCard — Tarjeta de plato para venta rápida o publicar el menú.
 */
export interface DishCardProps extends BaseComponentProps {
  name: string;
  priceFormatted: string;
  category?: string;
  isSoldOut?: boolean;
  onToggleSoldOut?: (val: boolean) => void;
  onClick?: () => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  name,
  priceFormatted,
  category = "Segundo",
  isSoldOut = false,
  onToggleSoldOut,
  onClick,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`h-24 rounded-[24px] bg-[#F5F3FA] animate-pulse border border-[#E7E1F2] p-4 ${className}`} />
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-24 items-center justify-center rounded-[24px] border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] ${className}`}>
        <span className="text-[13px] font-semibold text-[#6B5B7B]">Plato no disponible</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-24 items-center gap-2 rounded-[24px] bg-[#FDEBEB] border border-[#C0392B] p-4 text-[#C0392B] ${className}`}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-[13px] font-bold">Error en plato</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[24px] bg-white border border-[#E7E1F2] p-4 opacity-80 ${className}`}>
        <span className="text-[15px] font-bold text-[#4A0E78]">{name}</span>
        <span className="block text-[13px] font-bold text-[#6B5B7B]">{priceFormatted}</span>
      </div>
    );
  }

  return (
    <div
      onClick={!isSoldOut ? onClick : undefined}
      className={`flex items-center justify-between rounded-[24px] border border-[#E7E1F2] bg-white p-4 shadow-[0_4px_16px_rgba(74,14,120,0.04)] transition-all ${
        isSoldOut ? "opacity-60 bg-[#F5F3FA]" : "hover:border-[#E0AAFF] active:scale-[0.99] cursor-pointer"
      } ${className}`}
    >
      <div className="min-w-0 pr-3">
        <span className="text-[13px] font-bold text-[#7B2CBF]">{category}</span>
        <h4 className={`text-[15px] font-bold text-[#4A0E78] truncate ${isSoldOut ? "line-through" : ""}`}>
          {name}
        </h4>
        <span className="text-[15px] font-extrabold text-[#4A0E78]">{priceFormatted}</span>
      </div>

      {onToggleSoldOut ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSoldOut(!isSoldOut);
          }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors ${
            isSoldOut ? "bg-[#FDEBEB] text-[#C0392B]" : "bg-[#F3E8FF] text-[#7B2CBF]"
          }`}
        >
          {isSoldOut ? "Agotado" : "Disponible"}
        </button>
      ) : null}
    </div>
  );
};

/**
 * 20. FeedbackCard — Tarjeta de calificación comensal con título "¿Qué tal hoy?" y 3 etiquetas.
 */
export interface FeedbackCardProps extends BaseComponentProps {
  tags?: string[];
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
  onDismiss?: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  tags = ["Rico", "Rápido", "Porción"],
  selectedTag,
  onSelectTag,
  onDismiss,
  state = "exito",
  className = "",
}) => {
  if (state === "cargando") {
    return (
      <div className={`rounded-[28px] bg-[#F5F3FA] p-5 animate-pulse border border-[#E7E1F2] ${className}`}>
        <div className="h-6 w-1/3 rounded-lg bg-[#E7E1F2] mb-3" />
        <div className="flex gap-2">
          <div className="h-10 w-20 rounded-full bg-[#E7E1F2]" />
          <div className="h-10 w-20 rounded-full bg-[#E7E1F2]" />
          <div className="h-10 w-20 rounded-full bg-[#E7E1F2]" />
        </div>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`rounded-[28px] border-2 border-dashed border-[#E7E1F2] bg-[#F5F3FA] p-6 text-center ${className}`}>
        <h3 className="text-[17px] font-extrabold text-[#4A0E78]">¡Gracias por tu opinión!</h3>
        <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">Almuerzo registrado con éxito.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`rounded-[28px] bg-[#FDEBEB] border border-[#C0392B] p-5 text-center text-[#C0392B] ${className}`}>
        <AlertCircle className="mx-auto h-6 w-6 mb-1" />
        <h3 className="text-[15px] font-bold">Error al enviar calificación</h3>
        <button
          type="button"
          onClick={() => {}}
          className="mt-3 rounded-full bg-[#C0392B] px-4 py-1.5 text-[13px] font-bold text-white active:scale-95"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[28px] bg-white border border-[#E7E1F2] p-5 shadow-xs ${className}`}>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#6B5B7B] mb-2">
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión · Se guardará al reconectar</span>
        </div>
        <h3 className="text-[17px] font-extrabold text-[#4A0E78]">¿Qué tal hoy?</h3>
        <div className="mt-3 flex gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex-1 rounded-full bg-[#F5F3FA] py-2 text-center text-[13px] font-bold text-[#6B5B7B]"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[28px] border border-[#E7E1F2] bg-white p-5 shadow-[0_8px_20px_rgba(74,14,120,0.06)] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[17px] font-extrabold text-[#4A0E78]">¿Qué tal hoy?</h4>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar"
            className="grid h-7 w-7 place-items-center rounded-full text-[#6B5B7B] hover:bg-[#F5F3FA] active:scale-95 transition-all"
          >
            <span className="text-[16px] leading-none">×</span>
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag?.(tag)}
              className={`flex-1 rounded-full py-2.5 text-[15px] font-bold transition-all ${
                isSelected
                  ? "bg-[#7B2CBF] text-white shadow-[0_4px_12px_rgba(123,44,191,0.25)]"
                  : "bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC]"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
