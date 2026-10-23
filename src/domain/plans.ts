/**
 * Dominio de Planes de Almuerzo — Bocadoo
 * Reglas de negocio:
 * 1. FIFO: el consumo descuenta siempre del plan que vence más pronto.
 * 2. Un cliente puede tener múltiples compras activas; NUNCA se suman fechas de vencimiento.
 * 3. Estados: ACTIVO, POR_VENCER (≤ 3 almuerzos o ≤ 3 días), AGOTADO, VENCIDO.
 * 4. Pasivo: "Almuerzos que debes" a comensales.
 */

import { differenceInCalendarDays } from "./dates";
import { type Cents } from "./money";

export interface PlanItem {
  id: string;
  clienteId: string;
  restauranteId: string;
  nombrePlan: string;
  almuerzosTotales: number;
  almuerzosRestantes: number;
  precioTotalCents: Cents;
  precioUnitarioCents: Cents;
  compradoEn: string;
  venceEn: string;
  estado: "ACTIVO" | "AGOTADO" | "VENCIDO" | "ANULADO";
}

export type PlanStatus = "ACTIVO" | "POR_VENCER" | "AGOTADO" | "VENCIDO";

/**
 * Determina el estado de un plan individual en relación a la fecha actual.
 */
export function getPlanStatus(plan: PlanItem, now = new Date()): PlanStatus {
  if (plan.almuerzosRestantes <= 0) return "AGOTADO";
  const daysLeft = differenceInCalendarDays(plan.venceEn, now);
  if (daysLeft < 0) return "VENCIDO";
  if (daysLeft <= 3 || plan.almuerzosRestantes <= 3) return "POR_VENCER";
  return "ACTIVO";
}

/**
 * Ordena los planes activos de un cliente usando el criterio FIFO (el que vence primero).
 */
export function sortPlansFIFO(plans: PlanItem[]): PlanItem[] {
  return [...plans].sort((a, b) => new Date(a.venceEn).getTime() - new Date(b.venceEn).getTime());
}

/**
 * Descuenta 1 almuerzo aplicando la regla FIFO.
 * Retorna el plan modificado y el saldo total restante del cliente.
 */
export function deductLunchFIFO(
  plans: PlanItem[],
  now = new Date()
): {
  success: boolean;
  deductedPlanId?: string;
  updatedPlans: PlanItem[];
  totalRemainingLunches: number;
  errorReason?: "SIN_PLAN" | "PLAN_VENCIDO" | "SIN_SALDO";
} {
  // Filtrar planes con saldo
  const withBalance = plans.filter((p) => p.almuerzosRestantes > 0 && p.estado !== "ANULADO");
  if (withBalance.length === 0) {
    return {
      success: false,
      updatedPlans: plans,
      totalRemainingLunches: 0,
      errorReason: plans.length === 0 ? "SIN_PLAN" : "SIN_SALDO",
    };
  }

  // Ordenar por vencimiento FIFO
  const sorted = sortPlansFIFO(withBalance);
  const activePlan = sorted.find((p) => differenceInCalendarDays(p.venceEn, now) >= 0);

  if (!activePlan) {
    return {
      success: false,
      updatedPlans: plans,
      totalRemainingLunches: 0,
      errorReason: "PLAN_VENCIDO",
    };
  }

  const updatedPlans = plans.map((p) => {
    if (p.id === activePlan.id) {
      const nextRemaining = p.almuerzosRestantes - 1;
      return {
        ...p,
        almuerzosRestantes: nextRemaining,
        estado: nextRemaining === 0 ? ("AGOTADO" as const) : p.estado,
      };
    }
    return p;
  });

  const totalRemaining = updatedPlans
    .filter((p) => p.estado === "ACTIVO" && differenceInCalendarDays(p.venceEn, now) >= 0)
    .reduce((acc, curr) => acc + curr.almuerzosRestantes, 0);

  return {
    success: true,
    deductedPlanId: activePlan.id,
    updatedPlans,
    totalRemainingLunches: totalRemaining,
  };
}

/**
 * Calcula el pasivo total ("Almuerzos que debes") de un restaurante.
 */
export function calculateOwedLunchesLiability(
  plans: PlanItem[],
  now = new Date()
): {
  totalLunchesOwed: number;
  totalLiabilityCents: Cents;
} {
  let totalLunches = 0;
  let totalLiabilityCents = 0;

  for (const plan of plans) {
    if (plan.almuerzosRestantes > 0 && plan.estado !== "ANULADO") {
      const isExpired = differenceInCalendarDays(plan.venceEn, now) < 0;
      if (!isExpired) {
        totalLunches += plan.almuerzosRestantes;
        totalLiabilityCents += plan.almuerzosRestantes * plan.precioUnitarioCents;
      }
    }
  }

  return {
    totalLunchesOwed: totalLunches,
    totalLiabilityCents,
  };
}

export interface PlanTemplate {
  id: string;
  name: string;
  lunches: number;
  priceCents: Cents;
  daysValidity: number;
  includes: string[];
  rules?: {
    validDays?: string[];
    maxPerDay?: number;
  };
  active: boolean;
  archived?: boolean;
}

export interface SoldSubscription {
  id: string;
  clienteId: string;
  restauranteId: string;
  templatePlanId: string;
  // Copia inmutable congelada al momento de la venta
  snapshot: {
    name: string;
    lunchesTotal: number;
    priceCents: Cents;
    daysValidity: number;
    includes: string[];
  };
  lunchesRemaining: number;
  purchasedAt: string;
  expiresAt: string;
  status: "ACTIVO" | "AGOTADO" | "VENCIDO" | "ANULADO";
}

/**
 * Vende un plan a un cliente creando un pase con copia inmutable
 * de todos los datos del plan y fecha de vencimiento propia.
 * Editar o archivar la plantilla original NO altera este plan ya vendido.
 */
export function sellPlanSubscription(
  template: PlanTemplate,
  clienteId: string,
  restauranteId: string,
  purchasedAt: Date = new Date()
): SoldSubscription {
  const expiresAtDate = new Date(purchasedAt.getTime() + template.daysValidity * 24 * 60 * 60 * 1000);

  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clienteId,
    restauranteId,
    templatePlanId: template.id,
    snapshot: {
      name: template.name,
      lunchesTotal: template.lunches,
      priceCents: template.priceCents,
      daysValidity: template.daysValidity,
      includes: [...(template.includes || ["sopa", "segundo"])],
    },
    lunchesRemaining: template.lunches,
    purchasedAt: purchasedAt.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    status: "ACTIVO",
  };
}
