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
    timestamp: Date.now() - 3600000,
  },
  {
    id: "s-2",
    type: "PLAN",
    amountFormatted: "$60,00",
    amountCents: 6000,
    method: "TRANSFERENCIA",
    clientName: "Carlos Mejía",
    timestamp: Date.now() - 7200000,
  },
];

const STORAGE_KEY = "bocadoo-sales-records";

export class SalesRepository {
  getSales(): SaleEntry[] {
    return storageSync.getItem<SaleEntry[]>(STORAGE_KEY, DEFAULT_SALES);
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
    };
  }
}

export const salesRepository = new SalesRepository();
