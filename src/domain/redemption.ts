/**
 * Dominio de Validaciones de Almuerzo — Bocadoo
 * Reglas de negocio:
 * 1. Idempotencia: el mismo comensal no puede validarse dos veces seguidas en < 60 s.
 * 2. Resultados:
 *    - VERDE: ✓ Éxito normal con nombre y saldo.
 *    - ADVERTENCIA (Morado medio): ! Último almuerzo o vence pronto.
 *    - ROJO: × Error (vencido, sin saldo, otro local, QR expirado).
 *    - GRIS: Ya validado hace menos de un minuto.
 * 3. Búfer de deshacer: 10 s para revertir el descuento sin penalidad.
 */

import { differenceInCalendarDays, differenceInMinutes } from "./dates";
import { type PlanItem, deductLunchFIFO } from "./plans";

export type ValidationOutcomeType = "VERDE" | "ADVERTENCIA" | "ROJO" | "GRIS";

export interface ValidationResult {
  outcome: ValidationOutcomeType;
  title: string;
  supportingLine: string;
  comensalNombre?: string | undefined;
  almuerzosRestantes?: number | undefined;
  redemptionId?: string | undefined;
  actionRequired?: "VENDER_PLAN" | "COBRAR_SUELTO" | "NINGUNA" | undefined;
}

export interface PastRedemption {
  id: string;
  clienteId: string;
  restauranteId: string;
  planId?: string | undefined;
  timestamp: string;
  anulada: boolean;
}

/**
 * Valida un almuerzo con QR o búsqueda manual.
 */
export function validateLunchRedemption({
  clienteId,
  comensalNombre,
  restauranteId,
  targetRestauranteId,
  plans,
  recentRedemptions,
  now = new Date(),
  isQrExpired = false,
}: {
  clienteId: string;
  comensalNombre: string;
  restauranteId: string;
  targetRestauranteId: string;
  plans: PlanItem[];
  recentRedemptions: PastRedemption[];
  now?: Date;
  isQrExpired?: boolean;
}): {
  result: ValidationResult;
  updatedPlans: PlanItem[];
  newRedemption?: PastRedemption;
} {
  // 1. Verificar si el QR expiró (> 30s)
  if (isQrExpired) {
    return {
      result: {
        outcome: "ROJO",
        title: "Código vencido",
        supportingLine: "Pide al comensal abrir su app.",
        actionRequired: "COBRAR_SUELTO",
      },
      updatedPlans: plans,
    };
  }

  // 2. Verificar pertenencia de restaurante
  if (restauranteId !== targetRestauranteId) {
    return {
      result: {
        outcome: "ROJO",
        title: "Es de otro local",
        supportingLine: "Este plan pertenece a otro restaurante.",
        actionRequired: "VENDER_PLAN",
      },
      updatedPlans: plans,
    };
  }

  // 3. Verificar idempotencia: validación reciente (< 60 s)
  const lastRedemption = recentRedemptions.find(
    (r) => r.clienteId === clienteId && !r.anulada
  );
  if (lastRedemption) {
    const elapsedMinutes = differenceInMinutes(now, lastRedemption.timestamp);
    if (elapsedMinutes < 1) {
      return {
        result: {
          outcome: "GRIS",
          title: "Ya validado",
          supportingLine: "Ya se descontó hace un momento.",
          comensalNombre,
          actionRequired: "NINGUNA",
        },
        updatedPlans: plans,
      };
    }
  }

  // 4. Intentar deducción FIFO de almuerzo
  const deduction = deductLunchFIFO(plans, now);

  if (!deduction.success) {
    if (deduction.errorReason === "PLAN_VENCIDO") {
      return {
        result: {
          outcome: "ROJO",
          title: "Plan vencido",
          supportingLine: "El plan caducó. Ofrécele renovar hoy.",
          comensalNombre,
          actionRequired: "VENDER_PLAN",
        },
        updatedPlans: plans,
      };
    }

    return {
      result: {
        outcome: "ROJO",
        title: "Sin almuerzos",
        supportingLine: "No le quedan almuerzos disponibles.",
        comensalNombre,
        actionRequired: "VENDER_PLAN",
      },
      updatedPlans: plans,
    };
  }

  const newRedemption: PastRedemption = {
    id: `red_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    clienteId,
    restauranteId,
    planId: deduction.deductedPlanId,
    timestamp: now.toISOString(),
    anulada: false,
  };

  // 5. Determinar si es advertencia (último almuerzo o vence en ≤ 3 días)
  const deductedPlan = deduction.updatedPlans.find((p) => p.id === deduction.deductedPlanId);
  const daysLeft = deductedPlan ? differenceInCalendarDays(deductedPlan.venceEn, now) : 99;

  if (deduction.totalRemainingLunches === 0) {
    return {
      result: {
        outcome: "ADVERTENCIA",
        title: "Último almuerzo",
        supportingLine: "¡Se agotó su plan! Ofrécele renovar.",
        comensalNombre,
        almuerzosRestantes: 0,
        redemptionId: newRedemption.id,
        actionRequired: "VENDER_PLAN",
      },
      updatedPlans: deduction.updatedPlans,
      newRedemption,
    };
  }

  if (daysLeft <= 3) {
    return {
      result: {
        outcome: "ADVERTENCIA",
        title: "Vence pronto",
        supportingLine: `Su plan vence en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}.`,
        comensalNombre,
        almuerzosRestantes: deduction.totalRemainingLunches,
        redemptionId: newRedemption.id,
        actionRequired: "VENDER_PLAN",
      },
      updatedPlans: deduction.updatedPlans,
      newRedemption,
    };
  }

  // 6. Éxito normal (Verde)
  return {
    result: {
      outcome: "VERDE",
      title: "Validado",
      supportingLine: `Le quedan ${deduction.totalRemainingLunches}.`,
      comensalNombre,
      almuerzosRestantes: deduction.totalRemainingLunches,
      redemptionId: newRedemption.id,
      actionRequired: "NINGUNA",
    },
    updatedPlans: deduction.updatedPlans,
    newRedemption,
  };
}
