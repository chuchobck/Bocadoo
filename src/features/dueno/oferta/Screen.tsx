import React, { useState } from "react";
import { toast } from "sonner";
import { Zap, AlertCircle, WifiOff, Loader2, X, Clock, Check } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { DEFAULT_COMMISSION_RATE, calculateCommission } from "@/domain/money";
import { useBocadoo, RESTAURANT_ID, money, parseMoneyToCents } from "@/components/bocadoo/store";
import { OFERTA_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface OfertaFlashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  commissionRate?: number;
  initialPublished?: boolean;
  onPublishOffer?: (slots: number, endTime: string, price: number) => void;
  onCancelOffer?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
  catalogDishes?: string[];
}

export const OfertaFlashScreen: React.FC<OfertaFlashScreenProps> = ({
  isOpen,
  onClose,
  commissionRate = DEFAULT_COMMISSION_RATE,
  initialPublished = false,
  onPublishOffer,
  onCancelOffer,
  onRetry,
  state = "exito",
  catalogDishes = ["Seco de pollo", "Locro de papa", "Trucha frita"],
}) => {
  const [offerItem, setOfferItem] = useState<string>("Menú de hoy");
  const [customDish, setCustomDish] = useState<string>(catalogDishes[0] || "Seco de pollo");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [customPrice, setCustomPrice] = useState<number>(2.5);
  const [slots, setSlots] = useState<number>(10);
  const [endTime, setEndTime] = useState<string>("14:00");
  const { restaurant, flashOffers, launchFlashOffer, cancelFlashOffer, restoreFlashOffer, simulatedToday } = useBocadoo();
  // La oferta publicada vive en el store: el comensal la ve en "Ofertas hoy" al instante
  const storeOffer = flashOffers.find(
    (f) => f.restaurantId === RESTAURANT_ID && f.activa && f.stockRestante > 0,
  );
  const [cancelledOfferId, setCancelledOfferId] = useState<string | null>(null);
  const [localPublished, setLocalPublished] = useState<boolean>(initialPublished);
  const isPublished = Boolean(storeOffer) || localPublished;
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const basePrice = (restaurant?.precioSueltoCents ?? 300) / 100;
  const currentPrice =
    discountPercent === 0
      ? customPrice
      : Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;

  const amountCents = Math.round(currentPrice * 100);
  const commissionCents = calculateCommission(amountCents, commissionRate);
  const netCents = amountCents - commissionCents;
  const netReceivedFormatted = `$${(netCents / 100).toFixed(2).replace(".", ",")}`;

  const slotOptions = [5, 10, 15];
  const timeOptions = ["13:30", "14:00", "14:30"];
  const commPercent = Math.round(commissionRate * 100);

  const handlePublish = () => {
    // Minutos hasta la hora de fin elegida; si ya pasó hoy, dura 1 hora
    const [hh = 14, mm = 0] = endTime.split(":").map(Number);
    const end = new Date(simulatedToday);
    end.setHours(hh, mm, 0, 0);
    const diffMin = Math.round((end.getTime() - simulatedToday.getTime()) / 60000);
    const dishName = offerItem === "Menú de hoy" ? "Menú de hoy" : customDish;

    launchFlashOffer({
      restaurantId: RESTAURANT_ID,
      titulo: dishName,
      descripcion: `${slots} cupos hasta las ${endTime}`,
      precioCents: parseMoneyToCents(currentPrice),
      precioOriginalCents: restaurant?.precioSueltoCents ?? parseMoneyToCents(basePrice),
      stockTotal: slots,
      minutosDuracion: diffMin > 0 ? diffMin : 60,
    });
    toast.success(`Oferta flash publicada: ${slots} cupos`);
    onPublishOffer?.(slots, endTime, currentPrice);
  };

  const handleCancelOffer = () => {
    if (storeOffer) {
      cancelFlashOffer(storeOffer.id);
      setCancelledOfferId(storeOffer.id);
    }
    setLocalPublished(false);
    setUndoLabel(OFERTA_COPY.cancelledUndo);
    setUndoSeconds(10);
    onCancelOffer?.();
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
        className="w-full max-w-sm rounded-[32px] bg-surface p-6 shadow-xl animate-in slide-in-from-bottom relative max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-container text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <h2 className="text-[20px] font-black text-foreground">
            {isPublished ? OFERTA_COPY.activeTitle : OFERTA_COPY.title}
          </h2>
        </div>

        {isPublished && (
          <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">
            {OFERTA_COPY.activeDesc}
          </p>
        )}

        {state === "cargando" && (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <span className="mt-3 block text-[13px] font-bold text-foreground">
              {OFERTA_COPY.loadingPublish}
            </span>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-8 text-center">
            <Zap className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-[17px] font-bold text-foreground">{OFERTA_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{OFERTA_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="my-4 rounded-[24px] bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{OFERTA_COPY.errorTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold">{OFERTA_COPY.errorDesc}</p>
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
            <span>{OFERTA_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="mt-4 space-y-4">
            {isPublished ? (
              /* Vista post-publicación: Oferta activa con botón de cancelar en 1 toque */
              <div className="space-y-4">
                <div className="rounded-[24px] bg-background p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-foreground">
                      {storeOffer
                        ? `${storeOffer.stockRestante} cupos · ${storeOffer.titulo}`
                        : `${slots} cupos · ${offerItem === "Menú de hoy" ? "Menú de hoy" : customDish}`}
                    </span>
                    <span className="rounded-full bg-success-container px-2.5 py-0.5 text-[13px] font-bold text-success">
                      Activa
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>
                        Hasta{" "}
                        {storeOffer
                          ? new Date(storeOffer.expiraEn).toLocaleTimeString("es-EC", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : endTime}
                      </span>
                    </div>
                    <span className="font-bold text-primary">
                      {storeOffer ? money(storeOffer.precioCents) : `$${currentPrice.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-success-container p-3 text-[13px] font-semibold text-success">
                  {OFERTA_COPY.cancelNote}
                </div>

                {/* Botón de Cancelar en 1 toque */}
                <button
                  type="button"
                  onClick={handleCancelOffer}
                  className="w-full rounded-full bg-danger py-3 text-[14px] font-bold text-danger-foreground shadow-xs active:scale-95 transition-all"
                >
                  {OFERTA_COPY.cancelOfferButton}
                </button>
              </div>
            ) : (
              /* Vista pre-publicación: Configuración de cupos, hora fin y precio */
              <>
                {/* Qué ofreces: por defecto Menú de hoy, opcional plato de catálogo */}
                <div>
                  <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                    {OFERTA_COPY.offerItemLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOfferItem("Menú de hoy")}
                      aria-pressed={offerItem === "Menú de hoy"}
                      className={`rounded-2xl py-2.5 px-3 text-[14px] font-bold transition-all active:scale-95 ${
                        offerItem === "Menú de hoy"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-primary-container text-foreground"
                      }`}
                    >
                      Menú de hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferItem("Plato")}
                      aria-pressed={offerItem === "Plato"}
                      className={`rounded-2xl py-2.5 px-3 text-[14px] font-bold transition-all active:scale-95 ${
                        offerItem === "Plato"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-primary-container text-foreground"
                      }`}
                    >
                      Plato suelto
                    </button>
                  </div>
                  {offerItem === "Plato" && (
                    <div className="mt-2">
                      <select
                        value={customDish}
                        onChange={(e) => setCustomDish(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-2 text-[13px] font-bold text-foreground focus:outline-none focus:border-primary"
                      >
                        {catalogDishes.map((dish) => (
                          <option key={dish} value={dish}>
                            {dish}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Precio con chips de descuento (-10 %, -20 %, personalizado) y lo que recibe el dueño */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-bold text-muted-foreground">
                      {OFERTA_COPY.discountLabel}
                    </label>
                    <span className="text-[13px] font-bold text-primary">
                      ${currentPrice.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 20, 0].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiscountPercent(d)}
                        aria-pressed={discountPercent === d}
                        className={`rounded-2xl py-2.5 text-[14px] font-bold transition-all active:scale-95 ${
                          discountPercent === d
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-primary-container text-foreground"
                        }`}
                      >
                        {d === 0 ? "Manual" : `-${d} %`}
                      </button>
                    ))}
                  </div>

                  {/* Recibes $X por venta */}
                  <div className="mt-2 rounded-xl bg-background px-3 py-2 border border-border text-center">
                    <span className="text-[13px] font-bold text-foreground">
                      Recibes {netReceivedFormatted} por venta
                    </span>
                  </div>
                </div>

                {/* Cupos disponibles en 1 toque (mismo morado `primary` al seleccionar) */}
                <div>
                  <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                    {OFERTA_COPY.slotsLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {slotOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlots(s)}
                        aria-pressed={slots === s}
                        className={`rounded-2xl py-3 text-[14px] font-bold transition-all active:scale-95 ${
                          slots === s
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-primary-container text-foreground"
                        }`}
                      >
                        {s} cupos
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hora fin en 1 toque (mismo morado `primary` al seleccionar) */}
                <div>
                  <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                    {OFERTA_COPY.timeLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEndTime(t)}
                        aria-pressed={endTime === t}
                        className={`rounded-2xl py-3 text-[14px] font-bold transition-all active:scale-95 ${
                          endTime === t
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-background text-foreground border border-border"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aviso transparente de comisión */}
                <div className="rounded-2xl bg-background p-3 border border-border text-[13px] font-semibold text-muted-foreground">
                  {OFERTA_COPY.commissionInfo(commPercent)}
                </div>

                {/* Publicar en 1 toque */}
                <div className="pt-1">
                  <ButtonPrimary onClick={handlePublish}>
                    {OFERTA_COPY.publishButton}
                  </ButtonPrimary>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            if (cancelledOfferId) restoreFlashOffer(cancelledOfferId);
            setLocalPublished(true);
            setCancelledOfferId(null);
          }}
          label={undoLabel}
        />
      )}
    </div>
  );
};
