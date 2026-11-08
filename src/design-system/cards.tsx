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

  const baseClasses = `relative rounded-[32px] bg-surface border border-border shadow-md transition-all duration-200 ${padClasses} ${className}`;

  if (state === "cargando") {
    return (
      <div className={`${baseClasses} animate-pulse bg-background`}>
        <div className="h-6 w-3/4 rounded-xl bg-border" />
        <div className="mt-3 h-4 w-1/2 rounded-lg bg-border" />
        <div className="mt-6 h-12 w-full rounded-2xl bg-border" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`${baseClasses} border-2 border-dashed border-border bg-background text-center`}>
        <span className="text-[15px] font-semibold text-muted-foreground">Sin información disponible</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`${baseClasses} border-danger bg-danger-container text-on-danger-container`}>
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
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
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
 * 6. PassCard — Tarjeta estelar del pase comensal con el degradado de hero (`bg-hero-gradient`).
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
  const gradientBg = "bg-hero-gradient  ";

  if (state === "cargando") {
    return (
      <div className={`relative w-full rounded-[32px] ${gradientBg} p-6 text-image-foreground shadow-md animate-pulse ${className}`}>
        <div className="h-6 w-1/2 rounded-xl bg-image-foreground/20" />
        <div className="mx-auto my-6 h-48 w-48 rounded-2xl bg-image-foreground/20" />
        <div className="h-12 w-24 mx-auto rounded-xl bg-image-foreground/20" />
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`relative w-full rounded-[32px] border-2 border-dashed border-primary/50 bg-background p-8 text-center shadow-sm ${className}`}>
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary-container text-primary">
          <Utensils className="h-7 w-7" />
        </div>
        <h4 className="text-[17px] font-bold text-foreground">Sin pases activos</h4>
        <p className="mt-1 text-[13px] text-muted-foreground">Elige un restaurante para almorzar hoy.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`relative w-full rounded-[32px] bg-danger-container border border-danger p-6 text-center text-on-danger-container ${className}`}>
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h4 className="text-[17px] font-bold">Código no disponible</h4>
        <p className="mt-1 text-[13px] text-muted-foreground">Hubo un error al generar tu pase.</p>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`relative w-full rounded-[32px] ${gradientBg} p-6 text-image-foreground shadow-md ${className}`}>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-image-foreground/20 px-3 py-1 text-[13px] font-bold text-image-foreground">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Sin conexión</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold">{restaurantName}</span>
        </div>
        <div className="my-4 flex flex-col items-center">
          <span className="text-[48px] font-extrabold">{remainingLunches}</span>
          <span className="text-[15px] font-medium text-image-foreground/85">almuerzos disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] ${gradientBg} p-6 text-image-foreground shadow-md ${className}`}>
      {/* Cabecera del pase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-surface text-primary font-black text-[13px]">
            B
          </div>
          <span className="text-[17px] font-bold text-image-foreground truncate max-w-[280px]">{restaurantName}</span>
        </div>
      </div>

      {/* Contenedor del QR con contraste óptimo */}
      <div className="mx-auto my-5 flex h-52 w-52 flex-col items-center justify-center rounded-[24px] bg-surface p-3 shadow-md">
        <QrCode className="h-40 w-40 text-foreground" />
        <span className="mt-1 text-[13px] font-bold text-muted-foreground">30 s</span>
      </div>

      {/* Saldo y vencimiento */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-[48px] font-extrabold leading-none tracking-tight text-image-foreground">{remainingLunches}</span>
          <span className="text-[17px] font-bold text-image-foreground/85">almuerzos</span>
        </div>
        <p className="mt-1 text-[13px] font-semibold text-image-foreground/85">Vence {expiryDate}</p>
      </div>

      {remainingLunches <= 3 && onRenew && (
        <button
          onClick={onRenew}
          className="mt-4 w-full rounded-full bg-surface py-3 text-[15px] font-bold text-primary shadow-md active:scale-95 transition-transform"
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
      <div className={`rounded-[28px] border border-border bg-surface p-5 animate-pulse ${className}`}>
        <div className="h-5 w-1/3 rounded-lg bg-border" />
        <div className="my-4 grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-border" />
          ))}
        </div>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`rounded-[28px] border-2 border-dashed border-border bg-background p-6 text-center ${className}`}>
        <Sparkles className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
        <span className="text-[15px] font-bold text-foreground">Sin tarjeta de sellos</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`rounded-[28px] bg-danger-container border border-danger p-5 text-center text-on-danger-container ${className}`}>
        <AlertCircle className="mx-auto h-6 w-6 mb-1" />
        <span className="text-[13px] font-semibold">Error al cargar sellos</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[28px] border border-border bg-surface p-5 opacity-80 ${className}`}>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
          <WifiOff className="h-4 w-4" />
          <span>Sellos sincronizados localmente</span>
        </div>
        <span className="text-[15px] font-bold text-foreground">{currentStamps} de {totalGoal} sellos</span>
      </div>
    );
  }

  return (
    <div className={`rounded-[28px] border border-border bg-surface p-5 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-[15px] font-extrabold text-foreground truncate">{restaurantName}</h4>
        <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-[13px] font-bold text-primary">
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
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "border-2 border-dashed border-border bg-background text-muted-foreground"
              }`}
            >
              {filled ? <Check className="h-5 w-5 stroke-[2.5]" /> : <span className="text-[13px] font-bold">{i + 1}</span>}
            </div>
          );
        })}
      </div>

      <p className="text-[15px] font-bold text-foreground">Premio: {rewardTitle}</p>
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
      <div className={`h-24 rounded-[24px] bg-background animate-pulse border border-border p-4 ${className}`} />
    );
  }

  if (state === "vacio") {
    return (
      <div className={`flex h-24 items-center justify-center rounded-[24px] border-2 border-dashed border-border bg-background ${className}`}>
        <span className="text-[13px] font-semibold text-muted-foreground">Plato no disponible</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`flex h-24 items-center gap-2 rounded-[24px] bg-danger-container border border-danger p-4 text-on-danger-container ${className}`}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-[13px] font-bold">Error en plato</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[24px] bg-surface border border-border p-4 opacity-80 ${className}`}>
        <span className="text-[15px] font-bold text-foreground">{name}</span>
        <span className="block text-[13px] font-bold text-muted-foreground">{priceFormatted}</span>
      </div>
    );
  }

  return (
    <div
      onClick={!isSoldOut ? onClick : undefined}
      className={`flex items-center justify-between rounded-[24px] border border-border bg-surface p-4 shadow-sm transition-all ${
        isSoldOut ? "opacity-60 bg-background" : "hover:border-primary/50 active:scale-[0.99] cursor-pointer"
      } ${className}`}
    >
      <div className="min-w-0 pr-3">
        <span className="text-[13px] font-bold text-primary">{category}</span>
        <h4 className={`text-[15px] font-bold text-foreground truncate ${isSoldOut ? "line-through" : ""}`}>
          {name}
        </h4>
        <span className="text-[15px] font-extrabold text-foreground">{priceFormatted}</span>
      </div>

      {onToggleSoldOut ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSoldOut(!isSoldOut);
          }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors ${
            isSoldOut ? "bg-danger-container text-on-danger-container" : "bg-primary-container text-primary"
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
      <div className={`rounded-[28px] bg-background p-5 animate-pulse border border-border ${className}`}>
        <div className="h-6 w-1/3 rounded-lg bg-border mb-3" />
        <div className="flex gap-2">
          <div className="h-10 w-20 rounded-full bg-border" />
          <div className="h-10 w-20 rounded-full bg-border" />
          <div className="h-10 w-20 rounded-full bg-border" />
        </div>
      </div>
    );
  }

  if (state === "vacio") {
    return (
      <div className={`rounded-[28px] border-2 border-dashed border-border bg-background p-6 text-center ${className}`}>
        <h3 className="text-[17px] font-extrabold text-foreground">¡Gracias por tu opinión!</h3>
        <p className="mt-1 text-[13px] font-semibold text-muted-foreground">Almuerzo registrado con éxito.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={`rounded-[28px] bg-danger-container border border-danger p-5 text-center text-on-danger-container ${className}`}>
        <AlertCircle className="mx-auto h-6 w-6 mb-1" />
        <h3 className="text-[15px] font-bold">Error al enviar calificación</h3>
        <button
          type="button"
          onClick={() => {}}
          className="mt-3 rounded-full bg-danger px-4 py-1.5 text-[13px] font-bold text-danger-foreground active:scale-95"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className={`rounded-[28px] bg-surface border border-border p-5 shadow-xs ${className}`}>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground mb-2">
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión · Se guardará al reconectar</span>
        </div>
        <h3 className="text-[17px] font-extrabold text-foreground">¿Qué tal hoy?</h3>
        <div className="mt-3 flex gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex-1 rounded-full bg-background py-2 text-center text-[13px] font-bold text-muted-foreground"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[28px] border border-border bg-surface p-5 shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[17px] font-extrabold text-foreground">¿Qué tal hoy?</h4>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-background active:scale-95 transition-all"
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
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "bg-primary-container text-foreground hover:bg-secondary-container"
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
