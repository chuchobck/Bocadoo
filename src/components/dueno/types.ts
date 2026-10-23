import type { ComponentState } from "@/design-system";

export type RolDueno = "dueno" | "cajero";

export type NivelOcupacion = "LIBRE" | "MOVIDO" | "LLENO";

export interface DuenoBaseProps {
  state?: ComponentState;
  role?: RolDueno;
}

export interface PedidoEnCamino {
  id: string;
  orderNumber: string;
  dinerName: string;
  soup: string;
  main: string;
  minutesAgo: number;
  status: "EN_CAMINO" | "ENTREGADO";
}

export interface PlanConfig {
  id: string;
  name: string;
  lunches: number;
  priceFormatted: string;
  priceCents: number;
  daysValidity: number;
  active: boolean;
}

export interface ClienteDueno {
  id: string;
  name: string;
  phone: string;
  remainingLunches: number;
  habitualPlanId: string;
  habitualPlanName: string;
  lastVisit: string;
}

export interface OpinionComensal {
  id: string;
  dinerName: string;
  tag: string;
  comment?: string;
  timeAgo: string;
  resolved: boolean;
}
