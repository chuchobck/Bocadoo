import { storageSync } from "@/data/local/sync";

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  remainingLunches: number;
  habitualPlanId: string;
  habitualPlanName: string;
  lastVisit: string;
}

const DEFAULT_CLIENTS: ClientRecord[] = [
  {
    id: "c-1",
    name: "Carlos Mejía",
    phone: "0991234567",
    remainingLunches: 14,
    habitualPlanId: "p-20",
    habitualPlanName: "Plan mensual",
    lastVisit: "Hoy",
  },
  {
    id: "c-2",
    name: "Andrea Morales",
    phone: "0987654321",
    remainingLunches: 1,
    habitualPlanId: "p-10",
    habitualPlanName: "Plan quincenal",
    lastVisit: "Ayer",
  },
  {
    id: "c-3",
    name: "Luis Paredes",
    phone: "0971122334",
    remainingLunches: 0,
    habitualPlanId: "p-20",
    habitualPlanName: "Plan mensual",
    lastVisit: "Hace 3 días",
  },
];

const STORAGE_KEY = "bocadoo-clients-records";

export class ClientsRepository {
  getAll(): ClientRecord[] {
    return storageSync.getItem<ClientRecord[]>(STORAGE_KEY, DEFAULT_CLIENTS);
  }

  getById(id: string): ClientRecord | null {
    return this.getAll().find((c) => c.id === id) ?? null;
  }

  search(query: string): ClientRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAll();
    return this.getAll().filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  renewPlan(clientId: string, additionalLunches: number = 20): ClientRecord | null {
    const clients = this.getAll();
    const current = clients.find((c) => c.id === clientId);
    if (!current) return null;

    const updated: ClientRecord = {
      ...current,
      remainingLunches: current.remainingLunches + additionalLunches,
      lastVisit: "Hoy",
    };
    const nextList = clients.map((c) => (c.id === clientId ? updated : c));
    storageSync.setItem(STORAGE_KEY, nextList);
    return updated;
  }

  registerPhysicalCard(name: string, phone: string, lunches: number): ClientRecord {
    const clients = this.getAll();
    const newClient: ClientRecord = {
      id: `c-${Date.now()}`,
      name,
      phone,
      remainingLunches: lunches,
      habitualPlanId: "p-cartulina",
      habitualPlanName: `Plan digital (${lunches} almuerzos)`,
      lastVisit: "Hoy",
    };
    clients.unshift(newClient);
    storageSync.setItem(STORAGE_KEY, clients);
    return newClient;
  }
}

export const clientsRepository = new ClientsRepository();
