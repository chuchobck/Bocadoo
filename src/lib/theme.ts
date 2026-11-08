/**
 * Tema claro / oscuro / sistema.
 *
 * - Estrategia por clase: `.dark` en <html> (ver `@custom-variant dark` en src/styles.css).
 * - La elección vive en localStorage ("bocadoo-theme"). Sin valor = "system" (sigue prefers-color-scheme).
 * - THEME_SCRIPT corre inline en el <head> (ver __root.tsx) para fijar la clase antes del primer
 *   render y evitar el parpadeo; el resto del archivo mantiene el estado vivo en el cliente.
 * - Toda lectura/escritura de localStorage va en try/catch: puede lanzar en ventanas privadas o con
 *   datos de sitio bloqueados, y la app debe verse bien igual.
 */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "bocadoo-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Misma lógica que `applyTheme`, en ES5 y autocontenida: se inyecta tal cual en el <head>. */
export const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}var d=t==='dark'||(t!=='light'&&window.matchMedia('${DARK_QUERY}').matches);document.documentElement.classList.toggle('dark',d)})();`;

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function applyTheme(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolveTheme(preference) === "dark");
}

// --- Estado externo (para useSyncExternalStore) ---------------------------------------------

const listeners = new Set<() => void>();
let cachedPreference: ThemePreference | null = null;
let detach: (() => void) | null = null;

export function getThemePreference(): ThemePreference {
  if (cachedPreference === null) cachedPreference = readStoredTheme();
  return cachedPreference;
}

export function getResolvedTheme(): ResolvedTheme {
  return resolveTheme(getThemePreference());
}

function notify(): void {
  applyTheme(getThemePreference());
  listeners.forEach((listener) => listener());
}

export function setThemePreference(preference: ThemePreference): void {
  cachedPreference = preference;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Sin almacenamiento: el tema aplica en esta sesión pero no se recuerda.
  }
  notify();
}

function attach(): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const onMedia = () => notify();
  // `storage` también llega al prototipo embebido en la landing (iframe del mismo origen).
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    cachedPreference = null;
    notify();
  };
  media.addEventListener("change", onMedia);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onMedia);
    window.removeEventListener("storage", onStorage);
  };
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") detach = attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detach?.();
      detach = null;
    }
  };
}
