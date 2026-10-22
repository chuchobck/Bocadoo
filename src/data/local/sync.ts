/**
 * Sincronización Local y Multiventana — Bocadoo
 * Permite que dos pestañas (Dueño en una, Comensal en otra) se sincronicen en vivo.
 */

const SYNC_CHANNEL_NAME = "bocadoo-multitab-sync";

class StorageSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(event: { key: string; value: unknown }) => void> = [];

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const data = event.data;
        if (data && data.key) {
          this.listeners.forEach((l) => l(data));
        }
      };
    }
  }

  getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  setItem<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.channel?.postMessage({ key, value });
    } catch {
      // Quota exceeded o storage deshabilitado
    }
  }

  subscribe(listener: (event: { key: string; value: unknown }) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const storageSync = new StorageSync();
