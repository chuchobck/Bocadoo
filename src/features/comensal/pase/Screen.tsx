import React, { useEffect, useMemo, useState } from "react";
import {
  QrCode,
  Users,
  Utensils,
  Sparkles,
  Clock,
  AlertCircle,
  WifiOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShoppingBag,
  Receipt,
  X,
} from "lucide-react";
import { BocadooQr } from "@/components/bocadoo/BocadooQr";
import {
  BigNumber,
  ButtonPrimary,
  UndoBanner,
  BottomSheet,
  FeedbackCard,
  StampCard,
} from "@/design-system";
import { PASE_COPY } from "./copy";
import { EstadoPedidoModal } from "@/components/comensal/EstadoPedidoModal";
import { MesaAmigosModal } from "@/components/comensal/MesaAmigosModal";
import type { ComponentState } from "@/design-system";

export interface RestaurantPlanData {
  restaurantId: string;
  restaurantName: string;
  lunchesLeft: number;
  expiryDate: string;
  hasMultipleExpiries?: boolean | undefined;
  multipleExpiryText?: string | undefined;
  qrPayload: string;
  /** Tarjeta de sellos del local (opcional). */
  currentStamps?: number | undefined;
  rewardsAvailable?: number | undefined;
  stampGoal?: number | undefined;
  stampReward?: string | undefined;
  stampCardName?: string | undefined;
  stampCountMode?: "almuerzo" | "plato" | undefined;
}

export interface PaseActiveTable {
  id: string;
  restaurantName: string;
  hora: string;
  membersCount: number;
  url: string;
}

export interface PaseActivityItem {
  id: string;
  name: string;
  detail: string;
  value: string;
  positive: boolean;
  kind?: "lunch" | "plan" | "other";
}

type QrMode = "plan" | "preorden" | "mesa";

export interface PaseScreenProps {
  plans?: RestaurantPlanData[] | undefined;
  hasRecentRedemption?: boolean | undefined;
  feedbackState?: ComponentState | undefined;
  activeOrder?:
    | {
        orderNumber: string;
        status: "PREPARANDO" | "LISTO";
        restaurantName: string;
        qrPayload?: string | undefined;
        detail?: string | undefined;
      }
    | undefined;
  activeTable?: PaseActiveTable | undefined;
  recentActivity?: PaseActivityItem[] | undefined;
  onViewLocales?: (() => void) | undefined;
  onFeedbackSubmit?: ((tag: string) => void) | undefined;
  onFeedbackDismiss?: (() => void) | undefined;
  onUndoRedemption?: (() => void) | undefined;
  onClaimReward?: ((restaurantId: string) => void) | undefined;
  dinerName?: string | undefined;
  onRetry?: () => void;
  state?: ComponentState;
}

export const PaseScreen: React.FC<PaseScreenProps> = ({
  plans = [
    {
      restaurantId: "r1",
      restaurantName: "La Cuchara de San Blas",
      lunchesLeft: 14,
      expiryDate: "30 oct",
      hasMultipleExpiries: true,
      multipleExpiryText: "3 vencen el 30 oct",
      qrPayload: "BCD1.PASS.USER1.R1.HASH",
    },
    {
      restaurantId: "r2",
      restaurantName: "El Fogón Quiteño",
      lunchesLeft: 6,
      expiryDate: "15 nov",
      hasMultipleExpiries: false,
      qrPayload: "BCD1.PASS.USER1.R2.HASH",
    },
  ],
  hasRecentRedemption = false,
  feedbackState,
  activeOrder,
  activeTable,
  recentActivity = [],
  onViewLocales,
  onFeedbackSubmit,
  onFeedbackDismiss,
  onUndoRedemption,
  onClaimReward,
  onRetry,
  state = "exito",
}) => {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isMesaOpen, setIsMesaOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);

  const activePlan = plans[currentPlanIndex] || plans[0];
  const hasPlans = plans && plans.length > 0;

  // Ley del mínimo esfuerzo: el QR correcto ya está en pantalla al abrir.
  // Prioridad: Preorden (vas a recoger/comer) > Mesa (vas en grupo) > Plan.
  const availableModes = useMemo<QrMode[]>(() => {
    const modes: QrMode[] = [];
    if (activeOrder) modes.push("preorden");
    if (activeTable) modes.push("mesa");
    if (hasPlans) modes.push("plan");
    return modes;
  }, [activeOrder, activeTable, hasPlans]);

  const [qrMode, setQrMode] = useState<QrMode>(availableModes[0] ?? "plan");

  useEffect(() => {
    if (!availableModes.includes(qrMode)) setQrMode(availableModes[0] ?? "plan");
  }, [availableModes, qrMode]);

  const qrValue =
    qrMode === "preorden" && activeOrder
      ? activeOrder.qrPayload || `BCD-ORD-${activeOrder.orderNumber}`
      : qrMode === "mesa" && activeTable
        ? activeTable.url
        : activePlan?.qrPayload || "";

  const modeLabel: Record<QrMode, string> = {
    plan: "Mi plan",
    preorden: activeOrder ? `Preorden #${activeOrder.orderNumber}` : "Preorden",
    mesa: activeTable ? `Mesa ${activeTable.hora}` : "Mesa",
  };

  const handleNextRestaurant = () => {
    if (plans.length > 1) {
      setCurrentPlanIndex((prev) => (prev + 1) % plans.length);
    }
  };

  const handlePrevRestaurant = () => {
    if (plans.length > 1) {
      setCurrentPlanIndex((prev) => (prev - 1 + plans.length) % plans.length);
    }
  };

  const handleTagClick = (tag: string) => {
    setFeedbackSubmitted(true);
    if (onFeedbackSubmit) onFeedbackSubmit(tag);
  };

  const handleDismissFeedback = () => {
    setFeedbackSubmitted(true);
    if (onFeedbackDismiss) onFeedbackDismiss();
  };

  return (
    <div
      tabIndex={0}
      aria-label="Pase del comensal"
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      {state === "cargando" && (
        <div role="status" className="pb-24 animate-pulse">
          <span className="sr-only">Cargando pase...</span>
          {/* Cabecera hero degradada skeleton */}
          <header className="rounded-b-[40px] bg-hero-gradient px-5 pb-[72px] pt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/20" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded-full bg-white/20" />
                  <div className="h-4 w-40 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="h-6 w-24 rounded-full bg-white/20" />
            </div>

            <div className="mt-5 space-y-2 text-center">
              <div className="mx-auto h-5 w-48 rounded-full bg-white/20" />
              <div className="mx-auto h-12 w-32 rounded-2xl bg-white/20" />
              <div className="mx-auto h-3 w-36 rounded-full bg-white/20" />
            </div>
          </header>

          <div className="relative -mt-12 space-y-4 px-4">
            {/* Tarjeta de QR skeleton */}
            <div className="rounded-[32px] border border-border bg-surface p-5 text-center shadow-lg">
              <div className="mx-auto flex h-52 w-52 flex-col items-center justify-center rounded-[24px] bg-secondary-container/60 p-4 border border-border/50">
                <div className="h-36 w-36 rounded-xl bg-border/50" />
              </div>
              <div className="mx-auto mt-4 h-3 w-44 rounded-full bg-secondary-container" />
            </div>

            {/* Accesos rápidos skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 rounded-2xl border border-border bg-surface" />
              <div className="h-12 rounded-2xl border border-border bg-surface" />
            </div>

            {/* Últimos movimientos skeleton */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-32 rounded-full bg-secondary-container" />
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-secondary-container" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-32 rounded-full bg-secondary-container" />
                        <div className="h-2.5 w-20 rounded-full bg-secondary-container/70" />
                      </div>
                    </div>
                    <div className="h-3 w-14 rounded-full bg-secondary-container/60" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(state === "vacio" || (!hasPlans && state === "exito")) && (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-container text-primary">
            <Utensils className="h-8 w-8" />
          </div>
          <h2 className="text-[24px] font-black text-foreground">{PASE_COPY.emptyTitle}</h2>
          <p className="mt-2 text-[15px] font-semibold text-muted-foreground">
            {PASE_COPY.emptyDesc}
          </p>
          <div className="mt-8 w-full max-w-xs">
            <ButtonPrimary onClick={onViewLocales}>{PASE_COPY.exploreButton}</ButtonPrimary>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[20px] font-extrabold">{PASE_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">No pudimos cargar tu pase.</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-5 rounded-full bg-danger px-6 py-2.5 text-[15px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {state === "offline" && activePlan && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1.5 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-4 w-4" />
            <span>{PASE_COPY.offlineBadge}</span>
          </div>

          <div className="rounded-[32px] bg-hero-gradient p-6 text-image-foreground text-center shadow-lg">
            <h2 className="text-[22px] font-black leading-tight line-clamp-2 break-words text-image-foreground">
              {activePlan.restaurantName}
            </h2>
            <div className="mx-auto my-5 flex h-48 w-48 flex-col items-center justify-center rounded-[24px] bg-qr-bg p-3 shadow-md">
              <BocadooQr value={activePlan.qrPayload} size={150} level="M" title="Código QR del pase" />
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[48px] font-extrabold leading-none">{activePlan.lunchesLeft}</span>
              <span className="text-[17px] font-bold text-image-foreground/85">almuerzos</span>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-image-foreground/85">
              {activePlan.hasMultipleExpiries && activePlan.multipleExpiryText
                ? activePlan.multipleExpiryText
                : `Vence ${activePlan.expiryDate}`}
            </p>
          </div>
        </div>
      )}

      {state === "exito" && hasPlans && activePlan && (
        <div className="pb-24">
          {/* ENCABEZADO: bloque a todo el ancho con el degradado de hero (plan, almuerzos, vencimiento).
              Deja 48px libres abajo: la tarjeta del QR se superpone sobre ellos. */}
          <header className="rounded-b-[40px] bg-hero-gradient px-5 pb-[72px] pt-5 text-image-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-image-foreground/20">
                  <Utensils className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-image-foreground/80">
                    Tu almuerzo de hoy
                  </span>
                  <p className="truncate text-[16px] font-black leading-none">{activePlan.restaurantName}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-container px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-[12px] font-black text-success">Pase activo</span>
              </div>
            </div>

            {availableModes.length > 1 && (
              <div
                role="tablist"
                aria-label="Qué QR mostrar"
                className="mt-4 flex gap-1 rounded-full bg-image-foreground/15 p-1"
              >
                {availableModes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    id={`pase-qr-tab-${m}`}
                    aria-selected={qrMode === m}
                    onClick={() => setQrMode(m)}
                    className={`flex-1 truncate rounded-full px-2 py-1.5 text-[12px] font-extrabold transition-all active:scale-95 ${
                      qrMode === m
                        ? "bg-surface text-foreground shadow-xs"
                        : "text-image-foreground hover:bg-image-foreground/10"
                    }`}
                  >
                    {modeLabel[m]}
                  </button>
                ))}
              </div>
            )}

            <h1 className="mt-4 line-clamp-2 break-words text-center text-[22px] font-black leading-tight">
              {activePlan.restaurantName}
            </h1>

            <div className="mt-2 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-[52px] font-extrabold leading-none tracking-tight">
                  {activePlan.lunchesLeft}
                </span>
                <span className="text-[18px] font-bold">almuerzos</span>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-image-foreground/85">
                {activePlan.hasMultipleExpiries && activePlan.multipleExpiryText
                  ? activePlan.multipleExpiryText
                  : `Vence ${activePlan.expiryDate}`}
              </p>
            </div>

            {qrMode === "preorden" && activeOrder && (
              <div className="mt-2 space-y-1 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-success-container px-3 py-1 text-[12px] font-black text-success">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{activeOrder.status === "LISTO" ? "Listo para entregar" : "Preparando tu plato"}</span>
                </div>
                {activeOrder.detail && (
                  <p className="line-clamp-2 text-[13px] font-semibold text-image-foreground/90">{activeOrder.detail}</p>
                )}
              </div>
            )}

            {qrMode === "mesa" && activeTable && (
              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="text-[44px] font-extrabold leading-none">{activeTable.membersCount}</span>
                <span className="text-[16px] font-bold">en la mesa · {activeTable.hora}</span>
              </div>
            )}
          </header>

          <div className="relative -mt-12 space-y-4 px-4">
            {/* TARJETA ÚNICA DE QR: Plan · Preorden · Mesa (se elige sola).
                En surface; el QR siempre va en una caja blanca (bg-qr-bg), también en oscuro. */}
            <div className="rounded-[32px] border border-border bg-surface p-5 text-center shadow-lg">
              <div
                data-testid="comensal-qr"
                onClick={() => setIsQrZoomed(true)}
                className="relative mx-auto flex h-52 w-52 cursor-pointer flex-col items-center justify-center rounded-[24px] bg-qr-bg p-3 shadow-sm ring-1 ring-border transition-transform active:scale-95"
              >
                <BocadooQr value={qrValue} size={160} level="M" title="Código QR del pase" />
                <div className="absolute bottom-2 right-2 rounded-full bg-primary p-1 text-primary-foreground">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {qrMode === "preorden" && activeOrder && (
                <div className="mt-3 space-y-1">
                  <p className="text-[12px] font-semibold text-muted-foreground">
                    {hasPlans ? "Al escanear se descuenta de tu plan" : "Pagas tu plato al escanear"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="text-[13px] font-bold text-primary underline underline-offset-2"
                  >
                    Ver estado del pedido
                  </button>
                </div>
              )}

              {qrMode === "mesa" && activeTable && (
                <div className="mt-3 space-y-1">
                  <p className="text-[12px] font-semibold text-muted-foreground">
                    Tus amigos lo escanean para unirse. En caja: una cuenta o cada uno lo suyo.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsMesaOpen(true)}
                    className="text-[13px] font-bold text-primary underline underline-offset-2"
                  >
                    Ver mesa y compartir
                  </button>
                </div>
              )}

              {qrMode === "plan" && plans.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handlePrevRestaurant}
                    aria-label="Restaurante anterior"
                    className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary-container transition-all hover:bg-secondary-container active:scale-90"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <span className="text-[13px] font-bold text-muted-foreground">
                    {currentPlanIndex + 1} de {plans.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextRestaurant}
                    aria-label="Siguiente restaurante"
                    className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary-container transition-all hover:bg-secondary-container active:scale-90"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>

            {/* Calificar sobre el pase si hubo consumo reciente */}
            {(hasRecentRedemption || feedbackState) && !feedbackSubmitted && (
              <div className="animate-in fade-in rounded-[28px] border border-border bg-background p-4 shadow-sm">
                <FeedbackCard
                  state={feedbackState || "exito"}
                  onSelectTag={handleTagClick}
                  onDismiss={handleDismissFeedback}
                />
              </div>
            )}

          {/* Tarjeta de sellos del local activo */}
          {activePlan?.stampGoal ? (
            <section aria-label="Tarjeta de sellos" className="space-y-2" data-testid="pase-sellos">
              <StampCard
                restaurantName={activePlan.stampCardName ?? activePlan.restaurantName}
                currentStamps={activePlan.currentStamps ?? 0}
                totalGoal={activePlan.stampGoal}
                rewardTitle={activePlan.stampReward ?? "Almuerzo gratis"}
              />
              <p
                className="flex items-center justify-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-center text-[12px] font-bold text-on-primary-container"
                data-testid="sellos-no-caducan"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{PASE_COPY.stampsNeverExpire}</span>
              </p>
              {(activePlan.rewardsAvailable ?? 0) > 0 && onClaimReward && (
                <ButtonPrimary onClick={() => onClaimReward(activePlan.restaurantId)}>
                  {PASE_COPY.claimReward(activePlan.rewardsAvailable ?? 0)}
                </ButtonPrimary>
              )}
            </section>
          ) : null}

          {/* Acceso rápido a Mesa con amigos */}
          <div>
            <button
              type="button"
              onClick={() => setIsMesaOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-background p-3.5 text-[14px] font-bold text-foreground border border-border active:scale-95 transition-all shadow-xs"
            >
              <Users className="h-4 w-4 text-primary" />
              <span>{activeTable ? "Mi mesa" : PASE_COPY.tableButton}</span>
            </button>
          </div>

          {/* ÚLTIMOS MOVIMIENTOS: al final, compactos */}
          <section aria-label="Últimos movimientos" className="pt-1">
            <h3 className="mb-1.5 px-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Últimos movimientos
            </h3>
            {recentActivity.length === 0 ? (
              <p className="rounded-2xl bg-background py-3 text-center text-[12px] font-semibold text-muted-foreground">
                Aún sin movimientos
              </p>
            ) : (
              <ul className="space-y-1.5">
                {recentActivity.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                        {t.kind === "plan" ? (
                          <ShoppingBag className="h-4 w-4" />
                        ) : t.kind === "lunch" ? (
                          <Utensils className="h-4 w-4" />
                        ) : (
                          <Receipt className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-foreground">{t.name}</p>
                        <p className="truncate text-[11px] font-semibold text-muted-foreground">{t.detail}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[13px] font-black ${t.positive ? "text-success" : "text-foreground"}`}
                    >
                      {t.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          </div>
        </div>
      )}

      {/* QR ampliado para escanear más fácil en caja */}
      {isQrZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR ampliado"
          onClick={() => setIsQrZoomed(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface p-6 animate-in fade-in"
        >
          <button
            type="button"
            aria-label="Cerrar QR ampliado"
            onClick={() => setIsQrZoomed(false)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="mb-3 text-[14px] font-black uppercase tracking-wider text-primary">
            {modeLabel[qrMode]}
          </span>
          <div className="rounded-[28px] bg-qr-bg p-5 shadow-lg"><BocadooQr value={qrValue} size={280} level="M" /></div>
          <p className="mt-4 text-[13px] font-semibold text-muted-foreground">Toca en cualquier lugar para cerrar</p>
        </div>
      )}

      {/* Modales secundarios */}
      <MesaAmigosModal
        isOpen={isMesaOpen}
        onClose={() => setIsMesaOpen(false)}
        restaurantId={activePlan?.restaurantId || "r1"}
        restaurantName={activePlan?.restaurantName || "Restaurante"}
      />

      <EstadoPedidoModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        orderNumber={activeOrder?.orderNumber || "42"}
        restaurantName={activeOrder?.restaurantName || "Restaurante"}
      />

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            if (onUndoRedemption) onUndoRedemption();
          }}
          label="Premio reclamado"
        />
      )}
    </div>
  );
};
