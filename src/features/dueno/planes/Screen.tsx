import React, { useState } from "react";
import { Plus, Minus, Check, AlertCircle, WifiOff, Loader2, ArrowLeft, Pencil } from "lucide-react";
import { UndoBanner } from "@/design-system";
import { PLANES_COPY } from "./copy";
import { plansRepository, type PlanConfig } from "@/data/repositories/plans.repository";
import type { ComponentState } from "@/design-system";

export interface CrearEditarPlanScreenProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: PlanConfig;
  onSavePlan?: (plan: Partial<PlanConfig>) => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const CrearEditarPlanScreen: React.FC<CrearEditarPlanScreenProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSavePlan,
  onRetry,
  state = "exito",
}) => {
  const isEditing = Boolean(planToEdit);

  const [planType, setPlanType] = useState<"Semanal" | "Quincenal" | "Mensual" | "Libre">("Mensual");
  const [planName, setPlanName] = useState<string>(planToEdit?.name || "Plan mensual ejecutivo");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [lunches, setLunches] = useState<number>(planToEdit?.lunches || 20);
  const [days, setDays] = useState<number>(planToEdit?.daysValidity || 35);
  const [price, setPrice] = useState<number>(planToEdit?.priceCents ? planToEdit.priceCents / 100 : 52);
  const [quota, setQuota] = useState<number>(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "M1", "M2", "J", "V"]);
  const [includes, setIncludes] = useState<string[]>(["Sopa", "Segundo", "Jugo"]);
  const [visibleMarketplace, setVisibleMarketplace] = useState<boolean>(true);

  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  const handleSelectType = (type: "Semanal" | "Quincenal" | "Mensual" | "Libre") => {
    setPlanType(type);
    if (type === "Semanal") {
      setPlanName("Plan semanal express");
      setLunches(5);
      setDays(7);
      setPrice(14);
      setSelectedDays(["L", "M1", "M2", "J", "V"]);
    } else if (type === "Quincenal") {
      setPlanName("Plan quincenal");
      setLunches(10);
      setDays(18);
      setPrice(27);
      setSelectedDays(["L", "M1", "M2", "J", "V"]);
    } else if (type === "Mensual") {
      setPlanName("Plan mensual ejecutivo");
      setLunches(20);
      setDays(35);
      setPrice(52);
      setSelectedDays(["L", "M1", "M2", "J", "V"]);
    } else {
      setPlanName("Plan libre 10");
      setLunches(10);
      setDays(60);
      setPrice(32);
      setSelectedDays(["L", "M1", "M2", "J", "V", "S", "D"]);
    }
  };

  const toggleDay = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.length > 1
          ? prev.filter((d) => d !== dayKey)
          : prev
        : [...prev, dayKey]
    );
  };

  const toggleInclude = (item: string) => {
    setIncludes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const pricePerLunch = lunches > 0 ? (price / lunches).toFixed(2).replace(".", ",") : "0,00";

  const handleSave = () => {
    const formattedPrice = `$${price},00`;
    plansRepository.savePlan({
      ...(planToEdit?.id ? { id: planToEdit.id } : {}),
      name: planName,
      lunches,
      priceCents: price * 100,
      priceFormatted: formattedPrice,
      daysValidity: days,
    });
    setUndoLabel(PLANES_COPY.savedUndo(planName, formattedPrice));
    setUndoSeconds(10);
    onSavePlan?.({
      name: planName,
      lunches,
      priceCents: price * 100,
      priceFormatted: formattedPrice,
      daysValidity: days,
    });
    onClose();
  };

  if (!isOpen) return null;

  const daysList = [
    { key: "L", label: "L" },
    { key: "M1", label: "M" },
    { key: "M2", label: "M" },
    { key: "J", label: "J" },
    { key: "V", label: "V" },
    { key: "S", label: "S" },
    { key: "D", label: "D" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-xs p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[32px] bg-surface p-5 md:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200"
      >
        {/* Cabecera idéntica al mockup */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              className="grid h-10 w-10 place-items-center rounded-full bg-background text-foreground active:scale-95 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                LA CUCHARA DE SAN BLAS
              </span>
              <h1 className="text-[20px] font-black text-foreground leading-none">
                {isEditing ? "Editar plan" : "Nuevo plan"}
              </h1>
            </div>
          </div>
          <span className="text-[13px] font-bold text-primary">Borrador</span>
        </div>

        {state === "cargando" && (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <span className="mt-3 block text-[13px] font-bold text-foreground">
              {PLANES_COPY.loadingTitle}
            </span>
          </div>
        )}

        {state === "error" && (
          <div className="my-4 rounded-[24px] bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-[17px] font-extrabold">{PLANES_COPY.errorTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold">{PLANES_COPY.errorDesc}</p>
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
            <span>{PLANES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Tarjeta VISTA PREVIA PARA COMENSALES (Exacta a la imagen) */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-background to-primary-container p-4 border border-primary-container shadow-xs">
              <div className="absolute -right-4 -top-6 h-28 w-28 rounded-full bg-primary/15 pointer-events-none" />
              <div className="relative">
                <span className="text-[9px] font-black uppercase tracking-wider text-primary block">
                  VISTA PREVIA PARA COMENSALES
                </span>
                <div className="mt-1 flex items-end justify-between">
                  <div>
                    <h3 className="text-[17px] font-black text-foreground leading-tight">
                      {planName}
                    </h3>
                    <p className="text-[12px] font-bold text-muted-foreground">
                      {lunches} almuerzos · vigencia {days} días
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[24px] font-black text-foreground leading-none block">
                      ${price},00
                    </span>
                    <span className="text-[11px] font-bold text-primary">
                      ${pricePerLunch} c/u
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOMBRE DEL PLAN */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                NOMBRE DEL PLAN
              </label>
              <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-2.5 border border-border">
                {isEditingName ? (
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    className="w-full bg-transparent text-[14px] font-bold text-foreground focus:outline-hidden"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingName(true)}
                    className="text-[14px] font-bold text-foreground cursor-pointer flex-1"
                  >
                    {planName}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Editar nombre del plan"
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* TIPO DE PLAN */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                TIPO DE PLAN
              </label>
              <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-background p-1 border border-border">
                {(["Semanal", "Quincenal", "Mensual", "Libre"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectType(type)}
                    className={`rounded-xl py-2 text-[12px] font-black transition-all ${
                      planType === type
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* FILA 1: ALMUERZOS Y VIGENCIA */}
            <div className="grid grid-cols-2 gap-3">
              {/* Almuerzos */}
              <div className="rounded-2xl bg-background p-3 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1">Almuerzos</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Disminuir un almuerzo"
                    onClick={() => setLunches((prev) => Math.max(1, prev - 1))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[18px] font-black text-foreground">{lunches}</span>
                  <button
                    type="button"
                    aria-label="Aumentar un almuerzo"
                    onClick={() => setLunches((prev) => prev + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Vigencia */}
              <div className="rounded-2xl bg-background p-3 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1">Vigencia (días)</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Disminuir un día de vigencia"
                    onClick={() => setDays((prev) => Math.max(1, prev - 1))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[18px] font-black text-foreground">{days}</span>
                  <button
                    type="button"
                    aria-label="Aumentar un día de vigencia"
                    onClick={() => setDays((prev) => prev + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* FILA 2: PRECIO DEL PLAN Y CUPOS */}
            <div className="grid grid-cols-2 gap-3">
              {/* Precio */}
              <div className="rounded-2xl bg-background p-3 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1">Precio del plan</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Disminuir un dólar"
                    onClick={() => setPrice((prev) => Math.max(1, prev - 1))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[18px] font-black text-foreground">${price},00</span>
                  <button
                    type="button"
                    aria-label="Aumentar un dólar"
                    onClick={() => setPrice((prev) => prev + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Cupos */}
              <div className="rounded-2xl bg-background p-3 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block mb-1">Cupos disponibles</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Disminuir cinco cupos"
                    onClick={() => setQuota((prev) => Math.max(5, prev - 5))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[15px] font-black text-foreground">{quota} clientes</span>
                  <button
                    type="button"
                    aria-label="Aumentar cinco cupos"
                    onClick={() => setQuota((prev) => prev + 5)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* DÍAS DE CONSUMO */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                DÍAS DE CONSUMO
              </label>
              <div className="flex items-center gap-2">
                {daysList.map((d) => {
                  const isActive = selectedDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`h-9 w-9 rounded-full text-[13px] font-black transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EL ALMUERZO INCLUYE */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                EL ALMUERZO INCLUYE
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Sopa", "Segundo", "Jugo", "Postre"] as const).map((item) => {
                  const isInc = includes.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInclude(item)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                        isInc
                          ? "bg-primary-container text-primary border border-primary-container"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      {isInc ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOGGLE VISIBLE EN MARKETPLACE */}
            <div className="flex items-center justify-between rounded-2xl bg-background p-3.5 border border-border">
              <div>
                <span className="block text-[13px] font-black text-foreground">
                  Visible en el marketplace
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Los comensales pueden comprarlo en la app
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-label="Visible en el marketplace"
                aria-checked={visibleMarketplace}
                onClick={() => setVisibleMarketplace(!visibleMarketplace)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  visibleMarketplace ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    visibleMarketplace ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* BOTÓN GUARDAR Y PUBLICAR PLAN */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                aria-label={PLANES_COPY.saveButton}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-black text-primary-foreground shadow-lg active:scale-98 transition-all hover:bg-primary-hover"
              >
                <Check className="h-4 w-4" />
                <span>{PLANES_COPY.saveButton}</span>
              </button>
              <p className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">
                Gratis para publicar. Bocadoo cobra un porcentaje solo cuando se canjea la oferta.
              </p>
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
    </div>
  );
};
