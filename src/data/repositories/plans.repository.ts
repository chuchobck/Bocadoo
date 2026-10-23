import { storageSync } from "@/data/local/sync";

export interface PlanConfig {
  id: string;
  name: string;
  lunches: number;
  priceCents: number;
  priceFormatted: string;
  daysValidity: number;
  active: boolean;
}

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: "p-10",
    name: "Plan quincenal",
    lunches: 10,
    priceCents: 3200,
    priceFormatted: "$32,00",
    daysValidity: 15,
    active: true,
  },
  {
    id: "p-20",
    name: "Plan mensual",
    lunches: 20,
    priceCents: 6000,
    priceFormatted: "$60,00",
    daysValidity: 30,
    active: true,
  },
];

const STORAGE_KEY = "bocadoo-plans-config";

export class PlansRepository {
  getPlans(): PlanConfig[] {
    return storageSync.getItem<PlanConfig[]>(STORAGE_KEY, DEFAULT_PLANS);
  }

  savePlan(plan: Omit<PlanConfig, "id" | "active"> & { id?: string }): PlanConfig {
    const plans = this.getPlans();
    if (plan.id) {
      const idx = plans.findIndex((p) => p.id === plan.id);
      if (idx !== -1) {
        const updated: PlanConfig = {
          ...plans[idx],
          ...plan,
          id: plan.id,
          active: true,
        };
        plans[idx] = updated;
        storageSync.setItem(STORAGE_KEY, plans);
        return updated;
      }
    }

    const newPlan: PlanConfig = {
      ...plan,
      id: `p-${Date.now()}`,
      active: true,
    };
    plans.push(newPlan);
    storageSync.setItem(STORAGE_KEY, plans);
    return newPlan;
  }
}

export const plansRepository = new PlansRepository();
