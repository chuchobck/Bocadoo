import { useSyncExternalStore } from "react";

import {
  getResolvedTheme,
  getThemePreference,
  setThemePreference,
  subscribeTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

/**
 * Tema actual de Bocadoo.
 * - `theme`: la elección guardada ("system" por defecto).
 * - `resolvedTheme`: lo que realmente se ve ("light" | "dark"), resolviendo "system".
 * En el servidor no hay localStorage: se devuelve "system"/"light" y el cliente corrige al hidratar.
 */
export function useTheme(): {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
} {
  const theme = useSyncExternalStore<ThemePreference>(
    subscribeTheme,
    getThemePreference,
    () => "system",
  );
  const resolvedTheme = useSyncExternalStore<ResolvedTheme>(
    subscribeTheme,
    getResolvedTheme,
    () => "light",
  );
  return { theme, resolvedTheme, setTheme: setThemePreference };
}
