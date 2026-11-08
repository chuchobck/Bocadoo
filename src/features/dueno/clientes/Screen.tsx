import React, { useMemo, useState } from "react";
import {
  Users,
  Search,
  Banknote,
  Smartphone,
  AlertCircle,
  WifiOff,
  Loader2,
  ArrowLeft,
  CreditCard,
  Plus,
  Minus,
  Edit2,
  Archive,
  Pause,
  Play,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { CLIENTES_COPY } from "./copy";
import { clientsRepository, type ClientRecord } from "@/data/repositories/clients.repository";
import { sellPlanSubscription, type PlanTemplate } from "@/domain/plans";
import {
  useBocadoo,
  PLAN_CATEGORY_LABEL,
  RESTAURANT_ID,
  type PlanCategory,
} from "@/components/bocadoo/store";
import type { ComponentState } from "@/design-system";

export interface ClientesScreenProps {
  clients?: ClientRecord[];
  initialSegment?: "planes" | "clientes";
  initialSearchTerm?: string;
  autoFocusSearch?: boolean;
  onSellPlan?: (client: ClientRecord, method: "EFECTIVO" | "TRANSFERENCIA") => void;
  onMigrateCard?: () => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

interface LocalPlanItem {
  id: string;
  name: string;
  lunches: number;
  daysValidity: number;
  priceCents: number;
  includes: string[];
  rules: { maxPerDay: number; validDays: string };
  active: boolean;
  archived?: boolean;
  salesCount: number;
  categoria: PlanCategory;
  visible: boolean;
  cupos: number;
}

const TIPO_BY_TYPE = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  libre: "Libre",
} as const;

const includesFor = (c: PlanCategory): string[] =>
  c === "DESAYUNO" ? ["Plato principal", "Bebida"] : c === "MIXTO" ? ["Desayuno", "Sopa", "Segundo"] : ["Sopa", "Segundo", "Jugo"];

const includeOptionsFor = (c: PlanCategory): string[] =>
  c === "DESAYUNO"
    ? ["Plato principal", "Bebida", "Fruta"]
    : c === "MIXTO"
      ? ["Desayuno", "Sopa", "Segundo", "Jugo"]
      : ["Sopa", "Segundo", "Jugo", "Postre"];

const unitFor = (c: PlanCategory): string =>
  c === "DESAYUNO" ? "desayunos" : c === "MIXTO" ? "combos" : "almuerzos";

export const ClientesScreen: React.FC<ClientesScreenProps> = ({
  clients,
  initialSegment = "planes",
  initialSearchTerm = "",
  autoFocusSearch = false,
  onSellPlan,
  onMigrateCard,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const { chargePlan, planTemplates, subscriptions, addPlan, updatePlan, togglePlan } = useBocadoo();

  const [activeSegment, setActiveSegment] = useState<"planes" | "clientes">(initialSegment);
  const initialClients = clients ?? clientsRepository.getAll();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedPlanToSell, setSelectedPlanToSell] = useState<LocalPlanItem | null>(null);
  const [clientList, setClientList] = useState<ClientRecord[]>(initialClients);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const plansList: LocalPlanItem[] = useMemo(
    () =>
      planTemplates
        .filter((t) => t.restaurantId === RESTAURANT_ID)
        .map((t) => {
          const categoria = t.categoriaPlan ?? "ALMUERZO";
          return {
            id: t.id,
            name: t.nombre,
            lunches: t.almuerzos,
            daysValidity: t.vigenciaDias,
            priceCents: t.precioCents,
            includes: t.incluye ?? includesFor(categoria),
            rules: { maxPerDay: 1, validDays: "Todos los días" },
            active: t.activo,
            archived: archivedIds.includes(t.id),
            salesCount: subscriptions.filter((sub) => sub.templateId === t.id).length,
            categoria,
            visible: t.visibleEnMarketplace,
            cupos: t.cupos,
          };
        }),
    [planTemplates, subscriptions, archivedIds],
  );
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Modal para crear / editar plan (estilo Image 2)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("Plan mensual ejecutivo");
  const [planType, setPlanType] = useState<"semanal" | "quincenal" | "mensual" | "libre">("mensual");
  const [planLunches, setPlanLunches] = useState(20);
  const [planValidityDays, setPlanValidityDays] = useState(35);
  const [planPriceDollars, setPlanPriceDollars] = useState(52);
  const [planCupos, setPlanCupos] = useState(40);
  const [selectedDays, setSelectedDays] = useState<string[]>(["L", "M", "X", "J", "V"]);
  const [planCategory, setPlanCategory] = useState<PlanCategory>("ALMUERZO");
  const [planIncludes, setPlanIncludes] = useState<string[]>(["Sopa", "Segundo", "Jugo"]);
  const [visibleInMarketplace, setVisibleInMarketplace] = useState(true);

  const filteredClients = clientList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const unitLabel = unitFor(planCategory);
  const unitTitle = unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1);

  const handleSelectCategory = (next: PlanCategory) => {
    setPlanCategory(next);
    setPlanIncludes(includesFor(next));
  };

  const pricePerLunch = planLunches > 0 ? (planPriceDollars / planLunches).toFixed(2).replace(".", ",") : "0,00";

  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanName("Plan mensual ejecutivo");
    setPlanType("mensual");
    setPlanLunches(20);
    setPlanValidityDays(35);
    setPlanPriceDollars(52);
    setPlanCupos(40);
    setSelectedDays(["L", "M", "X", "J", "V"]);
    setPlanCategory("ALMUERZO");
    setPlanIncludes(["Sopa", "Segundo", "Jugo"]);
    setVisibleInMarketplace(true);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: LocalPlanItem) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanLunches(plan.lunches);
    setPlanValidityDays(plan.daysValidity);
    setPlanPriceDollars(Math.round(plan.priceCents / 100));
    setPlanIncludes(plan.includes);
    setPlanCategory(plan.categoria);
    setVisibleInMarketplace(plan.visible);
    setPlanCupos(plan.cupos);
    setPlanType(plan.lunches <= 5 ? "semanal" : plan.lunches <= 10 ? "quincenal" : "mensual");
    setIsPlanModalOpen(true);
  };

  const handleApplyTemplate = (type: "semanal" | "quincenal" | "mensual" | "libre") => {
    setPlanType(type);
    if (type === "semanal") {
      setPlanName("Plan semanal");
      setPlanLunches(5);
      setPlanValidityDays(7);
      setPlanPriceDollars(15);
      setPlanCupos(20);
      setPlanIncludes(["Sopa", "Segundo", "Bebida"]);
      setSelectedDays(["L", "M", "X", "J", "V"]);
    } else if (type === "quincenal") {
      setPlanName("Plan quincenal");
      setPlanLunches(10);
      setPlanValidityDays(18);
      setPlanPriceDollars(28);
      setPlanCupos(30);
      setPlanIncludes(["Sopa", "Segundo", "Bebida"]);
      setSelectedDays(["L", "M", "X", "J", "V", "S"]);
    } else if (type === "mensual") {
      setPlanName("Plan mensual ejecutivo");
      setPlanLunches(20);
      setPlanValidityDays(35);
      setPlanPriceDollars(52);
      setPlanCupos(40);
      setPlanIncludes(["Sopa", "Segundo", "Jugo"]);
      setSelectedDays(["L", "M", "X", "J", "V"]);
    } else {
      setPlanType("libre");
    }
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;

    const fields = {
      nombre: planName.trim(),
      almuerzos: planLunches,
      vigenciaDias: planValidityDays,
      precioCents: Math.round(planPriceDollars * 100),
      cupos: planCupos,
      visibleEnMarketplace: visibleInMarketplace,
      categoriaPlan: planCategory,
      incluye: planIncludes,
      tipo: TIPO_BY_TYPE[planType],
    };

    if (editingPlanId) {
      updatePlan(editingPlanId, fields);
    } else {
      addPlan({ ...fields, activo: true });
    }

    setIsPlanModalOpen(false);
  };

  const handleTogglePlanActive = (planId: string) => {
    togglePlan(planId);
  };

  const handleArchivePlan = (planId: string) => {
    setArchivedIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId],
    );
  };

  const handleStartSell = (client: ClientRecord) => {
    setSelectedClient(client);
    setSelectedPlanToSell(plansList[0] || null);
  };

  const handleConfirmSale = (client: ClientRecord, method: "EFECTIVO" | "TRANSFERENCIA") => {
    const plan = selectedPlanToSell || plansList[0];
    if (!plan) return;

    // Dominio puro: al vender, se genera una copia inmutable congelada
    const template: PlanTemplate = {
      id: plan.id,
      name: plan.name,
      lunches: plan.lunches,
      priceCents: plan.priceCents,
      daysValidity: plan.daysValidity,
      includes: plan.includes,
      active: true,
    };
    sellPlanSubscription(template, client.id, "r1");

    // Actualizar cliente localmente
    const updated = clientsRepository.renewPlan(client.id, plan.lunches);
    if (updated) {
      setClientList(clientsRepository.getAll());
    }

    // Integración de caja rápida
    chargePlan(
      {
        kind: "client",
        client: { id: client.id, restaurantId: "r1", nombre: client.name, telefono: client.phone, correo: "" },
      },
      { id: plan.id }
    );

    setSelectedClient(null);
    setUndoLabel(
      CLIENTES_COPY.soldUndo(client.name, method === "EFECTIVO" ? CLIENTES_COPY.cash : CLIENTES_COPY.transfer)
    );
    setUndoSeconds(10);
    onSellPlan?.(client, method);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Planes y clientes"
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3.5 border-b border-border bg-surface sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver a caja"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <span className="block text-[13px] font-extrabold uppercase tracking-widest text-primary">
                LA CUCHARA DE SAN BLAS
              </span>
              <h1 className="text-[24px] font-black tracking-tight text-foreground">
                {activeSegment === "planes" ? "Mis planes" : "Clientes"}
              </h1>
            </div>
          </div>

          {activeSegment === "clientes" ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-muted-foreground">
                {CLIENTES_COPY.countComensales(filteredClients.length)}
              </span>
              {onMigrateCard && (
                <button
                  type="button"
                  onClick={onMigrateCard}
                  className="flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-[13px] font-bold text-primary active:scale-95 transition-all"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{CLIENTES_COPY.migrateCardButton}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreatePlan}
              aria-label="Nuevo plan"
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md active:scale-95 transition-all hover:bg-primary-hover"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Dos segmentos: Planes y Clientes */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-background p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveSegment("planes")}
            aria-pressed={activeSegment === "planes"}
            className={`rounded-xl py-2 text-center text-[14px] font-bold transition-all ${
              activeSegment === "planes"
                ? "bg-surface text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {CLIENTES_COPY.segmentPlanes}
          </button>
          <button
            type="button"
            onClick={() => setActiveSegment("clientes")}
            aria-pressed={activeSegment === "clientes"}
            className={`rounded-xl py-2 text-center text-[14px] font-bold transition-all ${
              activeSegment === "clientes"
                ? "bg-surface text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {CLIENTES_COPY.segmentClientes}
          </button>
        </div>

        {/* Buscador solo en segmento Clientes */}
        {activeSegment === "clientes" && (
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              autoFocus={autoFocusSearch || activeSegment === "clientes"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={CLIENTES_COPY.searchPlaceholder}
              className="w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-[13px] font-semibold text-foreground placeholder-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 pb-20">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-3 text-[17px] font-extrabold text-foreground">{CLIENTES_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{CLIENTES_COPY.errorTitle}</h2>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{CLIENTES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* SEGMENTO 1: PLANES (Estilo exacto Mockup Image 1) */}
            {activeSegment === "planes" && (
              <div className="space-y-4">
                {plansList.map((plan) => {
                  const lunchUnitPrice = (plan.priceCents / (plan.lunches * 100))
                    .toFixed(2)
                    .replace(".", ",");
                  const totalPrice = (plan.priceCents / 100).toFixed(2).replace(".", ",");
                  const planTag = plan.name.replace(/plan\s*/i, "").toUpperCase();

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-[28px] border bg-surface p-5 transition-all shadow-xs ${
                        plan.active && !plan.archived
                          ? "border-border"
                          : "border-border opacity-60 bg-background"
                      }`}
                    >
                      {/* Fila superior: Badge de tipo y Switch iOS */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-primary-container px-3 py-1 text-[13px] font-black uppercase tracking-wider text-primary">
                            {planTag}
                          </span>
                          <span
                            data-testid="plan-categoria"
                            className="rounded-full border border-border bg-background px-2.5 py-1 text-[13px] font-bold text-muted-foreground"
                          >
                            {PLAN_CATEGORY_LABEL[plan.categoria]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={plan.active}
                            aria-label={`Estado de ${plan.name}`}
                            onClick={() => handleTogglePlanActive(plan.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus:outline-hidden ${
                              plan.active ? "bg-primary" : "bg-border"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-md transition-transform ${
                                plan.active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Título grande: 5 almuerzos, 10 almuerzos... */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditPlan(plan)}
                        className="mt-2.5 text-left w-full group"
                      >
                        <h3 className="text-[22px] font-black text-foreground group-hover:text-primary transition-colors">
                          {plan.lunches} {unitFor(plan.categoria)}
                        </h3>
                      </button>

                      {/* Línea divisoria */}
                      <div className="border-t border-border my-3.5" />

                      {/* 3 Columnas: Precio, Vigencia, Clientes */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="block text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                            Precio
                          </span>
                          <span className="text-[17px] font-black text-foreground block mt-0.5">
                            ${totalPrice}
                          </span>
                          <span className="text-[13px] font-bold text-primary">
                            ${lunchUnitPrice} c/u
                          </span>
                        </div>

                        <div>
                          <span className="block text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                            Vigencia
                          </span>
                          <span className="text-[16px] font-black text-foreground block mt-0.5">
                            {plan.daysValidity} días
                          </span>
                        </div>

                        <div>
                          <span className="block text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                            Clientes
                          </span>
                          <span className="text-[16px] font-black text-foreground block mt-0.5">
                            {plan.salesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SEGMENTO 2: CLIENTES */}
            {activeSegment === "clientes" && (
              <div className="space-y-3">
                {filteredClients.length === 0 ? (
                  <div className="py-14 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <h2 className="text-[17px] font-extrabold text-foreground">
                      {searchTerm ? `No se encontró "${searchTerm}"` : CLIENTES_COPY.emptyTitle}
                    </h2>
                    <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                      {searchTerm
                        ? "¿Cliente nuevo? Regístralo al instante para venderle el plan."
                        : CLIENTES_COPY.emptyDesc}
                    </p>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          const newC = clientsRepository.registerPhysicalCard(searchTerm.trim(), "0990000000", 0);
                          setClientList(clientsRepository.getAll());
                          handleStartSell(newC);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-xs active:scale-95 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Vender plan a "{searchTerm.trim()}"</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="rounded-[24px] border border-border bg-surface p-4 shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <h3 className="text-[16px] font-black text-foreground">{client.name}</h3>
                        <p className="text-[13px] font-semibold text-muted-foreground">{client.phone}</p>
                        {/* Muestra solo el nombre del plan, sin texto truncado */}
                        <div className="pt-1">
                          <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-[13px] font-bold text-primary">
                            {(client.habitualPlanName || "Plan mensual").split("(")[0]?.trim() || "Plan mensual"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartSell(client)}
                        className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground shadow-xs active:scale-95 transition-all"
                      >
                        {CLIENTES_COPY.sellPlanButton}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal: Crear / Editar Plan (Estilo exacto Mockup Image 2) */}
      {isPlanModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/50 backdrop-blur-[6px] p-2 sm:p-4 animate-in fade-in"
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[32px] bg-surface p-5 shadow-2xl animate-in slide-in-from-bottom space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar border border-border"
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  aria-label="Cerrar modal"
                  className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <span className="block text-[13px] font-black tracking-widest uppercase text-primary">
                    LA CUCHARA DE SAN BLAS
                  </span>
                  <h3 className="text-[18px] font-black text-foreground">
                    {editingPlanId ? "Editar plan" : "Nuevo plan"}
                  </h3>
                </div>
              </div>

              <span className="text-[13px] font-extrabold text-primary">
                {editingPlanId ? "Activo" : "Borrador"}
              </span>
            </div>

            {/* VISTA PREVIA PARA COMENSALES (Tarjeta oscura Mockup Image 2) */}
            <div className="relative overflow-hidden rounded-[24px] bg-hero-gradient p-4 text-image-foreground shadow-lg">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/30 blur-2xl pointer-events-none" />
              <span className="block text-[13px] font-black tracking-widest uppercase text-image-foreground/85 mb-1.5">
                VISTA PREVIA PARA COMENSALES
              </span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-[17px] font-black text-image-foreground leading-tight">
                    {planName || `Plan ${planLunches} ${unitLabel}`}
                  </h4>
                  <p className="mt-1 text-[13px] font-semibold text-image-foreground/85">
                    {planLunches} {unitLabel} · vigencia {planValidityDays} días
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[24px] font-black text-image-foreground leading-none">
                    ${planPriceDollars},00
                  </span>
                  <span className="text-[13px] font-bold text-image-foreground/85">
                    ${pricePerLunch} c/u
                  </span>
                </div>
              </div>
            </div>

            {/* NOMBRE DEL PLAN */}
            <div>
              <label className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
                NOMBRE DEL PLAN
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ej. Plan mensual ejecutivo"
                className="w-full rounded-[16px] border border-border bg-background p-3 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* TIPO DE PLAN (Semanal, Quincenal, Mensual, Libre) */}
            <div>
              <label className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                TIPO DE PLAN
              </label>
              <div className="grid grid-cols-4 gap-1 rounded-full bg-background p-1 border border-border">
                {(["semanal", "quincenal", "mensual", "libre"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className={`rounded-full py-1.5 text-center text-[13px] font-extrabold capitalize transition-all ${
                      planType === t
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* QUÉ CUBRE EL PLAN (Almuerzos, Desayunos, Combos/Mixto) */}
            <div>
              <label className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                QUÉ CUBRE EL PLAN
              </label>
              <div
                role="radiogroup"
                aria-label="Qué cubre el plan"
                className="grid grid-cols-3 gap-1 rounded-full bg-background p-1 border border-border"
              >
                {(["ALMUERZO", "DESAYUNO", "MIXTO"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={planCategory === c}
                    onClick={() => handleSelectCategory(c)}
                    className={`rounded-full py-1.5 text-center text-[13px] font-extrabold transition-all ${
                      planCategory === c
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {PLAN_CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuadrícula 2x2 de Steppers (Almuerzos, Vigencia, Precio, Cupos) */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Stepper 1: Almuerzos */}
              <div className="rounded-[20px] bg-background p-3 text-center border border-border">
                <span className="block text-[13px] font-bold text-muted-foreground mb-2">
                  {unitTitle}
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    aria-label={`Menos ${unitLabel}`}
                    onClick={() => setPlanLunches((prev) => Math.max(1, prev - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-[17px] font-black text-foreground">{planLunches}</span>
                  <button
                    type="button"
                    aria-label={`Más ${unitLabel}`}
                    onClick={() => setPlanLunches((prev) => prev + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stepper 2: Vigencia */}
              <div className="rounded-[20px] bg-background p-3 text-center border border-border">
                <span className="block text-[13px] font-bold text-muted-foreground mb-2">
                  Vigencia (días)
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    aria-label="Menos días"
                    onClick={() => setPlanValidityDays((prev) => Math.max(1, prev - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-[17px] font-black text-foreground">{planValidityDays}</span>
                  <button
                    type="button"
                    aria-label="Más días"
                    onClick={() => setPlanValidityDays((prev) => prev + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stepper 3: Precio */}
              <div className="rounded-[20px] bg-background p-3 text-center border border-border">
                <span className="block text-[13px] font-bold text-muted-foreground mb-2">
                  Precio del plan
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    aria-label="Menos precio"
                    onClick={() => setPlanPriceDollars((prev) => Math.max(1, prev - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-[17px] font-black text-foreground">${planPriceDollars},00</span>
                  <button
                    type="button"
                    aria-label="Más precio"
                    onClick={() => setPlanPriceDollars((prev) => prev + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stepper 4: Cupos */}
              <div className="rounded-[20px] bg-background p-3 text-center border border-border">
                <span className="block text-[13px] font-bold text-muted-foreground mb-2">
                  Cupos disponibles
                </span>
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    aria-label="Menos cupos"
                    onClick={() => setPlanCupos((prev) => Math.max(1, prev - 5))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground shadow-xs active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-[17px] font-black text-foreground">{planCupos}</span>
                  <button
                    type="button"
                    aria-label="Más cupos"
                    onClick={() => setPlanCupos((prev) => prev + 5)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* DÍAS DE CONSUMO (L, M, M, J, V, S, D) */}
            <div>
              <label className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                DÍAS DE CONSUMO
              </label>
              <div className="flex items-center justify-between">
                {["L", "M", "X", "J", "V", "S", "D"].map((day, idx) => {
                  const displayDay = day === "X" ? "M" : day;
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={`${day}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                        );
                      }}
                      className={`h-9 w-9 rounded-full text-[13px] font-black transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-background text-muted-foreground hover:bg-secondary-container"
                      }`}
                    >
                      {displayDay}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EL ALMUERZO INCLUYE */}
            <div>
              <label className="block text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                {planCategory === "DESAYUNO"
                  ? "EL DESAYUNO INCLUYE"
                  : planCategory === "MIXTO"
                    ? "EL COMBO INCLUYE"
                    : "EL ALMUERZO INCLUYE"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {includeOptionsFor(planCategory).map((sec) => {
                  const included = planIncludes.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        setPlanIncludes((prev) =>
                          included ? prev.filter((s) => s !== sec) : [...prev, sec]
                        );
                      }}
                      className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all flex items-center gap-1 ${
                        included
                          ? "bg-primary-container text-primary border border-primary-container"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      {included ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3" />}
                      <span>{sec}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch: Visible en el marketplace */}
            <div className="flex items-center justify-between rounded-2xl bg-background p-3 border border-border">
              <div>
                <p className="text-[13px] font-bold text-foreground">Visible en el marketplace</p>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  Los comensales pueden comprarlo en la app
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={visibleInMarketplace}
                onClick={() => setVisibleInMarketplace((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus:outline-hidden ${
                  visibleInMarketplace ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-md transition-transform ${
                    visibleInMarketplace ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Botón principal */}
            <button
              type="button"
              onClick={handleSavePlan}
              aria-label="Guardar plan"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-black text-primary-foreground shadow-md active:scale-95 transition-all hover:bg-primary-hover"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Guardar plan</span>
            </button>

            <p className="text-center text-[13px] font-semibold text-muted-foreground">
              Gratis para publicar. Bocadoo cobra un porcentaje solo con cada almuerzo servido.
            </p>
          </div>
        </div>
      )}

      {/* Modal de cobro de plan con los planes del restaurante */}
      {selectedClient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-6 shadow-xl animate-in slide-in-from-bottom space-y-4"
          >
            <h3 className="text-[17px] font-extrabold text-foreground text-center">
              {CLIENTES_COPY.modalTitle(selectedClient.name)}
            </h3>

            {/* Selector de plan del restaurante */}
            <div>
              <label className="block text-[13px] font-bold text-muted-foreground mb-1.5">
                Plan a vender
              </label>
              <div className="space-y-1.5">
                {plansList.filter((p) => p.active && !p.archived).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanToSell(p)}
                    className={`w-full rounded-2xl p-3 text-left font-bold text-[14px] border transition-all flex items-center justify-between ${
                      (selectedPlanToSell?.id || plansList[0]?.id) === p.id
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-surface text-foreground"
                    }`}
                  >
                    <span>{p.name} ({p.lunches} alm.)</span>
                    <span className="font-black">${(p.priceCents / 100).toFixed(2).replace(".", ",")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Métodos de pago en 1 toque */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleConfirmSale(selectedClient, "EFECTIVO")}
                className="w-full rounded-2xl bg-background p-3 text-left font-bold text-foreground border border-border hover:border-primary active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-success-container text-success">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <span>{CLIENTES_COPY.cash}</span>
                </div>
                <span className="text-[14px] font-black">
                  ${((selectedPlanToSell?.priceCents || 5500) / 100).toFixed(2).replace(".", ",")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmSale(selectedClient, "TRANSFERENCIA")}
                className="w-full rounded-2xl bg-background p-3 text-left font-bold text-foreground border border-border hover:border-primary active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-container text-primary">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span>{CLIENTES_COPY.transfer}</span>
                </div>
                <span className="text-[14px] font-black">
                  ${((selectedPlanToSell?.priceCents || 5500) / 100).toFixed(2).replace(".", ",")}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="w-full rounded-full py-2 text-[13px] font-bold text-muted-foreground"
            >
              {CLIENTES_COPY.cancel}
            </button>
          </div>
        </div>
      )}

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            setClientList(initialClients);
          }}
          label={undoLabel}
        />
      )}
    </div>
  );
};
