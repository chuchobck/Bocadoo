import React, { useState } from "react";
import { toast } from "sonner";
import { Zap, CalendarClock, AlertCircle, WifiOff, Loader2, X, Clock } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { DEFAULT_COMMISSION_RATE, calculateCommission } from "@/domain/money";
import {
  useBocadoo,
  RESTAURANT_ID,
  money,
  parseMoneyToCents,
  offerMode,
  promoDaysLabel,
  WEEK_DAYS_MON_FIRST,
  PROMO_VALLE_DURATION_MINUTES,
  type FlashOfferMode,
} from "@/components/bocadoo/store";
import { OFERTA_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface OfertaFlashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  commissionRate?: number;
  initialPublished?: boolean;
  initialMode?: FlashOfferMode;
  onPublishOffer?: (slots: number, endTime: string, price: number) => void;
  onCancelOffer?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
  catalogDishes?: string[];
}

const chipClass = (selected: boolean, alt = "bg-primary-container text-foreground") =>
  `rounded-2xl py-2.5 px-3 text-[14px] font-bold transition-all active:scale-95 ${
    selected ? "bg-primary text-primary-foreground shadow-xs" : alt
  }`;

export const OfertaFlashScreen: React.FC<OfertaFlashScreenProps> = ({
  isOpen,
  onClose,
  commissionRate = DEFAULT_COMMISSION_RATE,
  initialPublished = false,
  initialMode = "FLASH_HOY",
  onPublishOffer,
  onCancelOffer,
  onRetry,
  state = "exito",
  catalogDishes = ["Seco de pollo", "Locro de papa", "Trucha frita"],
}) => {
  const [modalidad, setModalidad] = useState<FlashOfferMode>(initialMode);
  const [offerItem, setOfferItem] = useState<string>("Menú de hoy");
  const [customDish, setCustomDish] = useState<string>(catalogDishes[0] || "Seco de pollo");
  const [flashDiscount, setFlashDiscount] = useState<number>(10);
  const [valleDiscount, setValleDiscount] = useState<number>(20);
  const [manualPriceText, setManualPriceText] = useState<string>("2.50");
  const [slots, setSlots] = useState<number>(10);
  const [valleSlots, setValleSlots] = useState<number>(20);
  const [endTime, setEndTime] = useState<string>("14:00");
  const [promoTitle, setPromoTitle] = useState<string>("");
  const [promoDays, setPromoDays] = useState<string[]>(["Martes", "Jueves"]);
  const [promoStart, setPromoStart] = useState<string>("16:00");
  const [promoEnd, setPromoEnd] = useState<string>("18:00");
  const [submitted, setSubmitted] = useState(false);
  const { restaurant, flashOffers, launchFlashOffer, cancelFlashOffer, restoreFlashOffer, simulatedToday } = useBocadoo();

  const isValle = modalidad === "HORA_VALLE";

  // La oferta publicada vive en el store: el comensal la ve al instante. Cada modalidad tiene la suya.
  const storeOffer = flashOffers.find(
    (f) =>
      f.restaurantId === RESTAURANT_ID &&
      f.activa &&
      f.stockRestante > 0 &&
      offerMode(f) === modalidad,
  );
  const [cancelledOfferId, setCancelledOfferId] = useState<string | null>(null);
  const [localPublished, setLocalPublished] = useState<boolean>(initialPublished);
  const isPublished = Boolean(storeOffer) || (localPublished && !isValle);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Todo en centavos enteros
  const baseCents = restaurant?.precioSueltoCents ?? 300;
  const discountPercent = isValle ? valleDiscount : flashDiscount;
  const manualCents = parseMoneyToCents(manualPriceText);
  const manualValid = manualCents > 0 && manualCents < baseCents;
  const priceCents =
    discountPercent === 0 ? manualCents : Math.round((baseCents * (100 - discountPercent)) / 100);
  const effectivePercent =
    discountPercent !== 0
      ? discountPercent
      : Math.max(0, Math.round((1 - manualCents / baseCents) * 100));
  const commissionCents = calculateCommission(priceCents, commissionRate);
  const netReceivedFormatted = money(priceCents - commissionCents);

  const slotOptions = isValle ? [10, 20, 30] : [5, 10, 15];
  const discountOptions = isValle ? [10, 20, 30, 0] : [10, 20, 0];
  const timeOptions = ["13:30", "14:00", "14:30"];
  const commPercent = Math.round(commissionRate * 100);

  const errors: string[] = [];
  if (isValle) {
    if (!promoTitle.trim()) errors.push("Escribe el título de la promo.");
    if (promoDays.length === 0) errors.push("Elige al menos un día.");
    if (promoEnd <= promoStart) errors.push("La hora final debe ser después de la inicial.");
  }
  if (discountPercent === 0 && !manualValid) {
    errors.push(`El precio especial debe ser mayor a $0,00 y menor a ${money(baseCents)}.`);
  }

  const handlePublish = () => {
    if (errors.length > 0) {
      setSubmitted(true);
      return;
    }
    setSubmitted(false);

    if (isValle) {
      const dias = WEEK_DAYS_MON_FIRST.filter((d) => promoDays.includes(d));
      const horario = `${promoStart} - ${promoEnd}`;
      launchFlashOffer({
        restaurantId: RESTAURANT_ID,
        titulo: promoTitle.trim(),
        descripcion: `${promoDaysLabel(dias)} ${horario} · ${valleSlots} cupos`,
        precioCents: priceCents,
        precioOriginalCents: baseCents,
        stockTotal: valleSlots,
        minutosDuracion: PROMO_VALLE_DURATION_MINUTES,
        modalidad: "HORA_VALLE",
        diasSemana: [...dias],
        horarioPromo: horario,
        porcentajeDescuento: effectivePercent,
      });
      toast.success(OFERTA_COPY.promoPublishedToast(`${promoDaysLabel(dias)} ${horario}`));
      onPublishOffer?.(valleSlots, promoEnd, priceCents / 100);
      return;
    }

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
      precioCents: priceCents,
      precioOriginalCents: baseCents,
      stockTotal: slots,
      minutosDuracion: diffMin > 0 ? diffMin : 60,
      modalidad: "FLASH_HOY",
      porcentajeDescuento: effectivePercent,
    });
    toast.success(`Oferta flash publicada: ${slots} cupos`);
    onPublishOffer?.(slots, endTime, priceCents / 100);
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

  const toggleDay = (day: string) =>
    setPromoDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

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
            {isValle ? <CalendarClock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
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
            {/* Modalidad: Flash de hoy (liquidación) o Promo horas muertas (programada) */}
            <div>
              <div
                role="tablist"
                aria-label="Modalidad de la oferta"
                className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-background p-1"
              >
                {(
                  [
                    { id: "FLASH_HOY", title: OFERTA_COPY.modeFlashTitle, sub: OFERTA_COPY.modeFlashSub },
                    { id: "HORA_VALLE", title: OFERTA_COPY.modeValleTitle, sub: OFERTA_COPY.modeValleSub },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={modalidad === m.id}
                    onClick={() => {
                      setModalidad(m.id);
                      setSubmitted(false);
                    }}
                    className={`rounded-xl px-2 py-2 text-center transition-all active:scale-95 ${
                      modalidad === m.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="block text-[14px] font-black leading-tight">{m.title}</span>
                    <span className="block text-[13px] font-semibold leading-tight opacity-90">{m.sub}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[13px] font-semibold text-muted-foreground">
                {isValle ? OFERTA_COPY.modeValleHelp : OFERTA_COPY.modeFlashHelp}
              </p>
            </div>

            {isPublished ? (
              /* Vista post-publicación: Oferta activa con botón de cancelar en 1 toque */
              <div className="space-y-4">
                <div className="rounded-[24px] bg-background p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold text-foreground">
                      {storeOffer
                        ? `${storeOffer.stockRestante} cupos · ${storeOffer.titulo}`
                        : `${slots} cupos · ${offerItem === "Menú de hoy" ? "Menú de hoy" : customDish}`}
                    </span>
                    <span className="shrink-0 rounded-full bg-success-container px-2.5 py-0.5 text-[13px] font-bold text-success">
                      Activa
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>
                        {storeOffer && isValle
                          ? `${promoDaysLabel(storeOffer.diasSemana ?? [])} ${storeOffer.horarioPromo ?? ""}`
                          : `Hasta ${
                              storeOffer
                                ? new Date(storeOffer.expiraEn).toLocaleTimeString("es-EC", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : endTime
                            }`}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-primary">
                      {storeOffer ? money(storeOffer.precioCents) : money(priceCents)}
                      {storeOffer?.porcentajeDescuento !== undefined && ` · -${storeOffer.porcentajeDescuento}%`}
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
              /* Vista pre-publicación */
              <>
                {isValle ? (
                  <>
                    {/* Título de la promo */}
                    <div>
                      <label
                        htmlFor="promo-title"
                        className="block text-[13px] font-bold text-muted-foreground mb-1.5"
                      >
                        {OFERTA_COPY.promoTitleLabel}
                      </label>
                      <input
                        id="promo-title"
                        type="text"
                        value={promoTitle}
                        onChange={(e) => setPromoTitle(e.target.value)}
                        placeholder={OFERTA_COPY.promoTitlePlaceholder}
                        className="w-full rounded-2xl border border-border bg-background p-3 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>

                    {/* Días de la semana */}
                    <div>
                      <span className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                        {OFERTA_COPY.promoDaysLabel}
                      </span>
                      <div className="grid grid-cols-7 gap-1">
                        {WEEK_DAYS_MON_FIRST.map((day) => {
                          const on = promoDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              aria-pressed={on}
                              aria-label={day}
                              className={`rounded-xl py-2.5 text-center text-[13px] font-bold transition-all active:scale-95 ${
                                on
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-background text-foreground border border-border"
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rango horario */}
                    <div>
                      <span className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                        {OFERTA_COPY.promoHoursLabel}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block text-[13px] font-semibold text-muted-foreground">
                          {OFERTA_COPY.promoFrom}
                          <input
                            type="time"
                            value={promoStart}
                            onChange={(e) => setPromoStart(e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-border bg-background p-2.5 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                          />
                        </label>
                        <label className="block text-[13px] font-semibold text-muted-foreground">
                          {OFERTA_COPY.promoTo}
                          <input
                            type="time"
                            value={promoEnd}
                            onChange={(e) => setPromoEnd(e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-border bg-background p-2.5 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Qué ofreces: por defecto Menú de hoy, opcional plato de catálogo */
                  <div>
                    <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                      {OFERTA_COPY.offerItemLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOfferItem("Menú de hoy")}
                        aria-pressed={offerItem === "Menú de hoy"}
                        className={chipClass(offerItem === "Menú de hoy")}
                      >
                        Menú de hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfferItem("Plato")}
                        aria-pressed={offerItem === "Plato"}
                        className={chipClass(offerItem === "Plato")}
                      >
                        Plato suelto
                      </button>
                    </div>
                    {offerItem === "Plato" && (
                      <div className="mt-2">
                        <select
                          aria-label="Plato de la oferta"
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
                )}

                {/* Precio normal vs. precio de oferta, con chips de descuento */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-bold text-muted-foreground">
                      {OFERTA_COPY.discountLabel}
                    </label>
                    <span className="text-[13px] font-bold text-primary">
                      <span className="mr-1.5 font-semibold text-muted-foreground line-through">
                        {money(baseCents)}
                      </span>
                      {money(priceCents)}
                      {effectivePercent > 0 && ` · -${effectivePercent}%`}
                    </span>
                  </div>
                  <div className={`grid gap-2 ${discountOptions.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                    {discountOptions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => (isValle ? setValleDiscount(d) : setFlashDiscount(d))}
                        aria-pressed={discountPercent === d}
                        className={chipClass(discountPercent === d)}
                      >
                        {d === 0 ? "Manual" : `-${d} %`}
                      </button>
                    ))}
                  </div>

                  {discountPercent === 0 && (
                    <div className="mt-2">
                      <label
                        htmlFor="oferta-precio-manual"
                        className="block text-[13px] font-semibold text-muted-foreground mb-1"
                      >
                        {OFERTA_COPY.manualPriceLabel} (en dólares)
                      </label>
                      <input
                        id="oferta-precio-manual"
                        type="text"
                        inputMode="decimal"
                        value={manualPriceText}
                        onChange={(e) => setManualPriceText(e.target.value.replace(/[^0-9.,]/g, ""))}
                        className="w-full rounded-2xl border border-border bg-background p-3 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Recibes $X por venta */}
                  <div className="mt-2 rounded-xl bg-background px-3 py-2 border border-border text-center">
                    <span className="text-[13px] font-bold text-foreground">
                      Recibes {netReceivedFormatted} por venta
                    </span>
                  </div>
                </div>

                {/* Cupos disponibles en 1 toque */}
                <div>
                  <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                    {OFERTA_COPY.slotsLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {slotOptions.map((s) => {
                      const selected = (isValle ? valleSlots : slots) === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => (isValle ? setValleSlots(s) : setSlots(s))}
                          aria-pressed={selected}
                          className={`rounded-2xl py-3 text-[14px] font-bold transition-all active:scale-95 ${
                            selected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-primary-container text-foreground"
                          }`}
                        >
                          {s} cupos
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hora fin de hoy (solo liquidación flash) */}
                {!isValle && (
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
                )}

                {isValle && (
                  <p className="rounded-2xl bg-background p-3 border border-border text-[13px] font-semibold text-muted-foreground">
                    {OFERTA_COPY.promoDuration}
                  </p>
                )}

                {/* Aviso transparente de comisión */}
                <div className="rounded-2xl bg-background p-3 border border-border text-[13px] font-semibold text-muted-foreground">
                  {OFERTA_COPY.commissionInfo(commPercent)}
                </div>

                {submitted && errors.length > 0 && (
                  <ul role="alert" className="space-y-1 rounded-2xl bg-danger-container p-3 text-[13px] font-bold text-on-danger-container">
                    {errors.map((e) => (
                      <li key={e} className="flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Publicar en 1 toque */}
                <div className="pt-1">
                  <ButtonPrimary onClick={handlePublish}>
                    {isValle ? OFERTA_COPY.promoPublishButton : OFERTA_COPY.publishButton}
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
