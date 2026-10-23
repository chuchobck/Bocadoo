import { storageSync } from "@/data/local/sync";

export interface LocalConfig {
  restaurantId: string;
  name: string;
  address: string;
  totalSeats: number;
  singleLunchPriceFormatted: string;
  singleLunchPriceCents: number;
  occupancy: "LIBRE" | "MOVIDO" | "LLENO";
  isManualBusy: boolean;
  manualBusyExpiresAt?: number | null;
  logoUrl?: string | null;
}

const DEFAULT_LOCAL_CONFIG: LocalConfig = {
  restaurantId: "r-sanblas",
  name: "La Cuchara de San Blas",
  address: "San Blas, Quito",
  totalSeats: 24,
  singleLunchPriceFormatted: "$3,00",
  singleLunchPriceCents: 300,
  occupancy: "LIBRE",
  isManualBusy: false,
  logoUrl: null,
};

const STORAGE_KEY = "bocadoo-local-config";

export class LocalRepository {
  getConfig(): LocalConfig {
    return storageSync.getItem<LocalConfig>(STORAGE_KEY, DEFAULT_LOCAL_CONFIG);
  }

  updateConfig(patch: Partial<LocalConfig>): LocalConfig {
    const current = this.getConfig();
    const updated = { ...current, ...patch };
    storageSync.setItem(STORAGE_KEY, updated);
    return updated;
  }

  setManualBusy(minutes: number = 20): LocalConfig {
    const expiresAt = Date.now() + minutes * 60 * 1000;
    return this.updateConfig({
      occupancy: "LLENO",
      isManualBusy: true,
      manualBusyExpiresAt: expiresAt,
    });
  }

  clearManualBusy(): LocalConfig {
    return this.updateConfig({
      occupancy: "LIBRE",
      isManualBusy: false,
      manualBusyExpiresAt: null,
    });
  }

  subscribe(callback: (config: LocalConfig) => void) {
    return storageSync.subscribe((event) => {
      if (event.key === STORAGE_KEY) {
        callback(event.value as LocalConfig);
      }
    });
  }
}

export const localRepository = new LocalRepository();
