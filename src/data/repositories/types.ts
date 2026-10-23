import { type PlanItem } from "@/domain/plans";
import { type Cents } from "@/domain/money";

export interface DinerClient {
  id: string;
  nombre: string;
  celular: string;
  correo: string;
  planActivoId?: string;
  almuerzosRestantes: number;
}

export interface MenuItemDish {
  id: string;
  seccion: "sopa" | "segundo" | "jugo" | "postre";
  nombre: string;
  precioCents?: Cents;
  agotado: boolean;
  fotoUrl?: string;
}

export interface SaleTransaction {
  id: string;
  restauranteId: string;
  montoCents: Cents;
  metodo: "EFECTIVO" | "TRANSFERENCIA";
  tipo: "PLAN" | "POS_SUELTO" | "PREMIO";
  fecha: string;
  anulada: boolean;
}

export interface IPlansRepository {
  getActivePlansByClient(clienteId: string): Promise<PlanItem[]>;
  savePlan(plan: PlanItem): Promise<void>;
  updatePlan(planId: string, patch: Partial<PlanItem>): Promise<void>;
}

export interface IClientsRepository {
  getClient(id: string): Promise<DinerClient | null>;
  searchClients(query: string): Promise<DinerClient[]>;
  saveClient(client: DinerClient): Promise<void>;
}

export interface ISalesRepository {
  recordSale(sale: SaleTransaction): Promise<void>;
  getTodaySales(restauranteId: string): Promise<SaleTransaction[]>;
}
