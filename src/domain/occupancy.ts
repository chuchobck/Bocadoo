/**
 * Dominio de Ocupación y Semáforo de Restaurante — Bocadoo
 * Reglas de negocio:
 * - Ocupación dinámica = (comensales sentados en últimos 25 min) ÷ puestos del local.
 * - Estados:
 *   · LIBRE: < 60% ("Libre: llegas y te sientas")
 *   · MOVIDO: 60% – 85% ("Movido: pocas mesas")
 *   · LLENO: > 85% ("Lleno: espera 10 min")
 * - Interruptor manual [Local lleno] con expiración automática tras 20 minutos.
 */

import { differenceInMinutes } from "./dates";

export type OccupancyLevel = "LIBRE" | "MOVIDO" | "LLENO";

export interface OccupancyState {
  level: OccupancyLevel;
  pct: number;
  label: string;
  isManual: boolean;
  minutesRemaining?: number;
}

/**
 * Calcula el estado de ocupación del restaurante.
 */
export function calculateOccupancy({
  totalSeats,
  dinersLast25Min,
  manualBusyUntil,
  now = new Date(),
}: {
  totalSeats: number;
  dinersLast25Min: number;
  manualBusyUntil?: string | null | undefined;
  now?: Date | undefined;
}): OccupancyState {
  // 1. Verificar si hay interruptor manual activo (20 min)
  if (manualBusyUntil) {
    const remaining = differenceInMinutes(new Date(manualBusyUntil), now);
    if (remaining > 0) {
      return {
        level: "LLENO",
        pct: 100,
        label: "Lleno",
        isManual: true,
        minutesRemaining: remaining,
      };
    }
  }

  // 2. Cálculo dinámico
  const safeSeats = Math.max(totalSeats, 1);
  const ratio = dinersLast25Min / safeSeats;
  const pct = Math.min(Math.round(ratio * 100), 100);

  if (ratio > 0.85) {
    return {
      level: "LLENO",
      pct,
      label: "Lleno",
      isManual: false,
    };
  }

  if (ratio >= 0.6) {
    return {
      level: "MOVIDO",
      pct,
      label: "Movido",
      isManual: false,
    };
  }

  return {
    level: "LIBRE",
    pct,
    label: "Libre",
    isManual: false,
  };
}
