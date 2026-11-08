import { storageSync } from "@/data/local/sync";

export interface SaleEntry {
  id: string;
  type: "SUELTO" | "PLAN" | "OFERTA";
  amountFormatted: string;
  amountCents: number;
  method: "EFECTIVO" | "TRANSFERENCIA";
  clientName?: string;
  timestamp: number;
}

const DEFAULT_SALES: SaleEntry[] = [
  {
    id: "s-1",
    type: "SUELTO",
    amountFormatted: "$3,00",
    amountCents: 300,
    method: "EFECTIVO",
    clientName: "Carlos Mejía",
    timestamp: Date.now() - 1800000,
  },
  {
    id: "s-2",
    type: "PLAN",
    amountFormatted: "$55,00",
    amountCents: 5500,
    method: "TRANSFERENCIA",
    clientName: "Laura Méndez",
    timestamp: Date.now() - 3600000,
  },
  {
    id: "s-3",
    type: "SUELTO",
    amountFormatted: "$3,50",
    amountCents: 350,
    method: "EFECTIVO",
    clientName: "Diego Ramos",
    timestamp: Date.now() - 5400000,
  },
  {
    id: "s-4",
    type: "PLAN",
    amountFormatted: "$28,00",
    amountCents: 2800,
    method: "TRANSFERENCIA",
    clientName: "Sofía Cruz",
    timestamp: Date.now() - 7200000,
  },
  {
    id: "s-5",
    type: "SUELTO",
    amountFormatted: "$3,25",
    amountCents: 325,
    method: "EFECTIVO",
    clientName: "Valentina Ortiz",
    timestamp: Date.now() - 9000000,
  },
  {
    id: "s-6",
    type: "PLAN",
    amountFormatted: "$17,50",
    amountCents: 1750,
    method: "EFECTIVO",
    clientName: "Juan Pérez",
    timestamp: Date.now() - 12000000,
  },
  {
    id: "s-7",
    type: "SUELTO",
    amountFormatted: "$3,00",
    amountCents: 300,
    method: "EFECTIVO",
    clientName: "Andrea Villacís",
    timestamp: Date.now() - 14400000,
  },
  {
    id: "s-8",
    type: "OFERTA",
    amountFormatted: "$2,70",
    amountCents: 270,
    method: "TRANSFERENCIA",
    clientName: "Mateo Cárdenas",
    timestamp: Date.now() - 18000000,
  },
  {
    id: "s-9",
    type: "PLAN",
    amountFormatted: "$55,00",
    amountCents: 5500,
    method: "TRANSFERENCIA",
    clientName: "Gabriela Morales",
    timestamp: Date.now() - 21600000,
  },
  {
    id: "s-10",
    type: "SUELTO",
    amountFormatted: "$3,50",
    amountCents: 350,
    method: "EFECTIVO",
    clientName: "Fernando Paredes",
    timestamp: Date.now() - 25200000,
  },
  {
    id: "s-11",
    type: "PLAN",
    amountFormatted: "$28,00",
    amountCents: 2800,
    method: "TRANSFERENCIA",
    clientName: "Patricia Espinosa",
    timestamp: Date.now() - 28800000,
  },
  {
    id: "s-12",
    type: "SUELTO",
    amountFormatted: "$3,25",
    amountCents: 325,
    method: "EFECTIVO",
    clientName: "Roberto Noboa",
    timestamp: Date.now() - 32400000,
  },
];

const STORAGE_KEY = "bocadoo-sales-records";

export class SalesRepository {
  getSales(): SaleEntry[] {
    const stored = storageSync.getItem<SaleEntry[]>(STORAGE_KEY, DEFAULT_SALES);
    if (!stored || stored.length === 0) {
      return DEFAULT_SALES;
    }
    // Asegurar que los datos por defecto enriquezcan la vista sin sobrescribir ventas del usuario
    if (stored.length < DEFAULT_SALES.length) {
      const existingIds = new Set(stored.map((s) => s.id));
      const missing = DEFAULT_SALES.filter((d) => !existingIds.has(d.id));
      const combined = [...stored, ...missing];
      storageSync.setItem(STORAGE_KEY, combined);
      return combined;
    }
    return stored;
  }

  recordSale(entry: Omit<SaleEntry, "id" | "timestamp">): SaleEntry {
    const sales = this.getSales();
    const newEntry: SaleEntry = {
      ...entry,
      id: `s-${Date.now()}`,
      timestamp: Date.now(),
    };
    sales.unshift(newEntry);
    storageSync.setItem(STORAGE_KEY, sales);
    return newEntry;
  }

  getTodayTotals() {
    const sales = this.getSales();
    const totalCents = sales.reduce((acc, s) => acc + s.amountCents, 0);
    const cashCents = sales
      .filter((s) => s.method === "EFECTIVO")
      .reduce((acc, s) => acc + s.amountCents, 0);
    const transferCents = sales
      .filter((s) => s.method === "TRANSFERENCIA")
      .reduce((acc, s) => acc + s.amountCents, 0);

    return {
      totalFormatted: `$${(totalCents / 100).toFixed(2).replace(".", ",")}`,
      cashFormatted: `$${(cashCents / 100).toFixed(2).replace(".", ",")}`,
      transferFormatted: `$${(transferCents / 100).toFixed(2).replace(".", ",")}`,
      lunchesServed: 28 + sales.filter((s) => s.type === "SUELTO").length,
      cashCents,
      transferCents,
      totalCents,
    };
  }
}

export const salesRepository = new SalesRepository();
