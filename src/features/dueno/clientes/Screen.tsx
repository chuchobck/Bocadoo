import React, { useState } from "react";
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
import { plansRepository, type PlanConfig } from "@/data/repositories/plans.repository";
import { sellPlanSubscription, type PlanTemplate } from "@/domain/plans";
import { useBocadoo } from "@/components/bocadoo/store";
import type { ComponentState } from "@/design-system";

export interface ClientesScreenProps {
  clients?: ClientRecord[];
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
}

const INITIAL_PLANS: LocalPlanItem[] = [
  {
    id: "p-semanal",
    name: "Plan semanal",
    lunches: 5,
    daysValidity: 7,
    priceCents: 1500,
    includes: ["Sopa", "Segundo", "Bebida"],
    rules: { maxPerDay: 1, validDays: "Lun a Vie" },
    active: true,
    salesCount: 12,
  },
  {
    id: "p-quincenal",
    name: "Plan quincenal",
    lunches: 10,
    daysValidity: 15,
    priceCents: 2800,
    includes: ["Sopa", "Segundo", "Bebida"],
    rules: { maxPerDay: 1, validDays: "Lun a Sáb" },
    active: true,
    salesCount: 25,
  },
  {
    id: "p-mensual",
    name: "Plan mensual",
    lunches: 20,
    daysValidity: 30,
    priceCents: 5500,
    includes: ["Sopa", "Segundo", "Bebida", "Postre"],
    rules: { maxPerDay: 1, validDays: "Todos los días" },
    active: true,
    salesCount: 48,
  },
];

export const ClientesScreen: React.FC<ClientesScreenProps> = ({
  clients,
  onSellPlan,
  onMigrateCard,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const { chargePlan } = useBocadoo();

  const [activeSegment, setActiveSegment] = useState<"planes" | "clientes">("planes");
  const initialClients = clients ?? clientsRepository.getAll();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedPlanToSell, setSelectedPlanToSell] = useState<LocalPlanItem | null>(null);
  const [clientList, setClientList] = useState<ClientRecord[]>(initialClients);
  const [plansList, setPlansList] = useState<LocalPlanItem[]>(INITIAL_PLANS);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Modal para crear / editar plan
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [planLunches, setPlanLunches] = useState(10);
  const [planValidityDays, setPlanValidityDays] = useState(15);
  const [planPriceDollars, setPlanPriceDollars] = useState(28);
  const [planIncludes, setPlanIncludes] = useState<string[]>(["Sopa", "Segundo", "Bebida"]);

  const filteredClients = clientList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const pricePerLunch = planLunches > 0 ? (planPriceDollars / planLunches).toFixed(2).replace(".", ",") : "0,00";

  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanName("Plan quincenal");
    setPlanLunches(10);
    setPlanValidityDays(15);
    setPlanPriceDollars(28);
    setPlanIncludes(["Sopa", "Segundo", "Bebida"]);
    setIsPlanModalOpen(true);
  };

  const handleApplyTemplate = (type: "semanal" | "quincenal" | "mensual") => {
    if (type === "semanal") {
      setPlanName("Plan semanal");
      setPlanLunches(5);
      setPlanValidityDays(7);
      setPlanPriceDollars(15);
      setPlanIncludes(["Sopa", "Segundo", "Bebida"]);
    } else if (type === "quincenal") {
      setPlanName("Plan quincenal");
      setPlanLunches(10);
      setPlanValidityDays(15);
      setPlanPriceDollars(28);
      setPlanIncludes(["Sopa", "Segundo", "Bebida"]);
    } else {
      setPlanName("Plan mensual");
      setPlanLunches(20);
      setPlanValidityDays(30);
      setPlanPriceDollars(55);
      setPlanIncludes(["Sopa", "Segundo", "Bebida", "Postre"]);
    }
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;

    if (editingPlanId) {
      setPlansList((prev) =>
        prev.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: planName.trim(),
                lunches: planLunches,
                daysValidity: planValidityDays,
                priceCents: Math.round(planPriceDollars * 100),
                includes: planIncludes,
              }
            : p
        )
      );
    } else {
      const newPlan: LocalPlanItem = {
        id: `p-${Date.now()}`,
        name: planName.trim(),
        lunches: planLunches,
        daysValidity: planValidityDays,
        priceCents: Math.round(planPriceDollars * 100),
        includes: planIncludes,
        rules: { maxPerDay: 1, validDays: "Todos los días" },
        active: true,
        salesCount: 0,
      };
      setPlansList((prev) => [...prev, newPlan]);
    }

    setIsPlanModalOpen(false);
  };

  const handleTogglePlanActive = (planId: string) => {
    setPlansList((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, active: !p.active } : p))
    );
  };

  const handleArchivePlan = (planId: string) => {
    setPlansList((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, archived: !p.archived } : p))
    );
  };

  const handleStartSell = (client: ClientRecord) => {
    setSelectedClient(client);
    setSelectedPlanToSell(plansList[0] || null);
  };

  const handleConfirmSale = (client: ClientRecord, method: "EFECTIVO" | "TRANSFERENCIA") => {
    const plan = selectedPlanToSell || plansList[0] || INITIAL_PLANS[0];
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

    // Incrementar conteo de ventas del plan
    setPlansList((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, salesCount: p.salesCount + 1 } : p))
    );

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
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver a caja"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-[20px] font-black text-[#4A0E78]">{CLIENTES_COPY.title}</h1>
          </div>

          {activeSegment === "clientes" ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#6B5B7B]">
                {CLIENTES_COPY.countComensales(filteredClients.length)}
              </span>
              {onMigrateCard && (
                <button
                  type="button"
                  onClick={onMigrateCard}
                  className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3 py-1 text-[13px] font-bold text-[#7B2CBF] active:scale-95 transition-all"
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
              className="flex items-center gap-1 rounded-full bg-[#7B2CBF] px-3.5 py-1 text-[13px] font-bold text-white shadow-xs active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuevo plan</span>
            </button>
          )}
        </div>

        {/* Dos segmentos: Planes y Clientes */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F5F3FA] p-1 border border-[#E7E1F2]">
          <button
            type="button"
            onClick={() => setActiveSegment("planes")}
            aria-pressed={activeSegment === "planes"}
            className={`rounded-xl py-2 text-center text-[14px] font-bold transition-all ${
              activeSegment === "planes"
                ? "bg-white text-[#7B2CBF] shadow-xs"
                : "text-[#6B5B7B] hover:text-[#4A0E78]"
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
                ? "bg-white text-[#7B2CBF] shadow-xs"
                : "text-[#6B5B7B] hover:text-[#4A0E78]"
            }`}
          >
            {CLIENTES_COPY.segmentClientes}
          </button>
        </div>

        {/* Buscador solo en segmento Clientes */}
        {activeSegment === "clientes" && (
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B5B7B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={CLIENTES_COPY.searchPlaceholder}
              className="w-full rounded-full border border-[#E7E1F2] bg-[#F5F3FA] py-2 pl-10 pr-4 text-[13px] font-semibold text-[#4A0E78] placeholder-[#6B5B7B] focus:border-[#7B2CBF] focus:outline-hidden"
            />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 pb-20">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{CLIENTES_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{CLIENTES_COPY.errorTitle}</h2>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{CLIENTES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* SEGMENTO 1: PLANES */}
            {activeSegment === "planes" && (
              <div className="space-y-4">
                {plansList.map((plan) => {
                  const lunchUnitPrice = (plan.priceCents / (plan.lunches * 100))
                    .toFixed(2)
                    .replace(".", ",");
                  const totalPrice = (plan.priceCents / 100).toFixed(2).replace(".", ",");

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-[24px] border bg-white p-4 transition-all ${
                        plan.active && !plan.archived
                          ? "border-[#E7E1F2] shadow-xs"
                          : "border-[#E7E1F2] opacity-60 bg-[#FAF8FC]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[16px] font-black text-[#4A0E78]">{plan.name}</h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[13px] font-bold ${
                                plan.active && !plan.archived
                                  ? "bg-[#E6F6EC] text-[#157A41]"
                                  : "bg-[#F5F3FA] text-[#6B5B7B]"
                              }`}
                            >
                              {plan.archived ? "Archivado" : plan.active ? "Activo" : "Pausado"}
                            </span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#6B5B7B] mt-0.5 block">
                            {plan.lunches} almuerzos · Vigencia {plan.daysValidity} días
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[17px] font-black text-[#7B2CBF] block">
                            ${totalPrice}
                          </span>
                          <span className="text-[13px] font-bold text-[#6B5B7B]">
                            ${lunchUnitPrice} c/u
                          </span>
                        </div>
                      </div>

                      {/* Qué incluye (chips de secciones) */}
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#E7E1F2] pt-2.5">
                        {plan.includes.map((inc) => (
                          <span
                            key={inc}
                            className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[13px] font-bold text-[#4A0E78]"
                          >
                            {inc}
                          </span>
                        ))}
                      </div>

                      {/* Acciones del dueño */}
                      <div className="mt-3 flex items-center justify-between border-t border-[#E7E1F2] pt-2.5">
                        <span className="text-[13px] font-semibold text-[#6B5B7B]">
                          {plan.salesCount} ventas
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(plan.id);
                              setPlanName(plan.name);
                              setPlanLunches(plan.lunches);
                              setPlanValidityDays(plan.daysValidity);
                              setPlanPriceDollars(plan.priceCents / 100);
                              setPlanIncludes(plan.includes);
                              setIsPlanModalOpen(true);
                            }}
                            className="rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePlanActive(plan.id)}
                            className="rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#6B5B7B] border border-[#E7E1F2] active:scale-95"
                          >
                            {plan.active ? "Pausar" : "Activar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchivePlan(plan.id)}
                            className="rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#6B5B7B] border border-[#E7E1F2] active:scale-95"
                          >
                            {plan.archived ? "Restaurar" : "Archivar"}
                          </button>
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
                  <div className="py-16 text-center">
                    <Users className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
                    <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{CLIENTES_COPY.emptyTitle}</h2>
                    <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">
                      {CLIENTES_COPY.emptyDesc}
                    </p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="rounded-[24px] border border-[#E7E1F2] bg-white p-4 shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <h3 className="text-[16px] font-black text-[#4A0E78]">{client.name}</h3>
                        <p className="text-[13px] font-semibold text-[#6B5B7B]">{client.phone}</p>
                        {/* Muestra solo el nombre del plan, sin texto truncado */}
                        <div className="pt-1">
                          <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[13px] font-bold text-[#7B2CBF]">
                            {(client.habitualPlanName || "Plan mensual").split("(")[0]?.trim() || "Plan mensual"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartSell(client)}
                        className="rounded-full bg-[#7B2CBF] px-4 py-2 text-[13px] font-bold text-white shadow-xs active:scale-95 transition-all"
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

      {/* Modal: Crear / Editar Plan en 3 toques */}
      {isPlanModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-xl animate-in slide-in-from-bottom space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-black text-[#4A0E78]">
                {editingPlanId ? "Editar plan" : "Nuevo plan"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chips de plantillas rápidas (3 toques) */}
            {!editingPlanId && (
              <div>
                <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1.5">
                  Plantillas editables
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("semanal")}
                    className="rounded-xl bg-[#F5F3FA] p-2 text-center border border-[#E7E1F2] active:scale-95"
                  >
                    <p className="text-[13px] font-bold text-[#4A0E78]">Semanal</p>
                    <p className="text-[13px] font-semibold text-[#7B2CBF]">$15,00</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("quincenal")}
                    className="rounded-xl bg-[#F5F3FA] p-2 text-center border border-[#E7E1F2] active:scale-95"
                  >
                    <p className="text-[13px] font-bold text-[#4A0E78]">Quincenal</p>
                    <p className="text-[13px] font-semibold text-[#7B2CBF]">$28,00</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("mensual")}
                    className="rounded-xl bg-[#F5F3FA] p-2 text-center border border-[#E7E1F2] active:scale-95"
                  >
                    <p className="text-[13px] font-bold text-[#4A0E78]">Mensual</p>
                    <p className="text-[13px] font-semibold text-[#7B2CBF]">$55,00</p>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                Nombre del plan
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ej. Plan mensual"
                className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78] focus:border-[#7B2CBF] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                  Almuerzos
                </label>
                <input
                  type="number"
                  value={planLunches}
                  onChange={(e) => setPlanLunches(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                  Vigencia (días)
                </label>
                <input
                  type="number"
                  value={planValidityDays}
                  onChange={(e) => setPlanValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[13px] font-bold text-[#6B5B7B]">
                  Precio total
                </label>
                <span className="text-[13px] font-bold text-[#7B2CBF]">
                  ${pricePerLunch} c/u
                </span>
              </div>
              <input
                type="number"
                value={planPriceDollars}
                onChange={(e) => setPlanPriceDollars(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[14px] font-bold text-[#4A0E78]"
              />
            </div>

            {/* Qué incluye (casillas por sección) */}
            <div>
              <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1.5">
                Qué incluye cada almuerzo
              </label>
              <div className="flex flex-wrap gap-2">
                {["Sopa", "Segundo", "Bebida", "Postre"].map((sec) => {
                  const on = planIncludes.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() =>
                        setPlanIncludes((prev) =>
                          prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition-all ${
                        on
                          ? "bg-[#7B2CBF] text-white shadow-xs"
                          : "bg-[#F5F3FA] text-[#4A0E78] border border-[#E7E1F2]"
                      }`}
                    >
                      {sec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <ButtonPrimary onClick={handleSavePlan}>
                Guardar plan
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cobro de plan con los planes del restaurante */}
      {selectedClient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl animate-in slide-in-from-bottom space-y-4"
          >
            <h3 className="text-[17px] font-extrabold text-[#4A0E78] text-center">
              {CLIENTES_COPY.modalTitle(selectedClient.name)}
            </h3>

            {/* Selector de plan del restaurante */}
            <div>
              <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1.5">
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
                        ? "border-[#7B2CBF] bg-[#FAF8FC] text-[#7B2CBF]"
                        : "border-[#E7E1F2] bg-white text-[#4A0E78]"
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
                className="w-full rounded-2xl bg-[#F5F3FA] p-3 text-left font-bold text-[#4A0E78] border border-[#E7E1F2] hover:border-[#7B2CBF] active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E6F6EC] text-[#157A41]">
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
                className="w-full rounded-2xl bg-[#F5F3FA] p-3 text-left font-bold text-[#4A0E78] border border-[#E7E1F2] hover:border-[#7B2CBF] active:scale-98 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
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
              className="w-full rounded-full py-2 text-[13px] font-bold text-[#6B5B7B]"
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
