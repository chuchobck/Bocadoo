import { type PlatformType } from "./usePlatform";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Retorna las dimensiones de zona segura simuladas y reales para el marco móvil.
 */
export function getPlatformSafeAreas(platform: PlatformType): SafeAreaInsets {
  if (platform === "ios") {
    return {
      top: 47, // Dynamic Island / Notch
      bottom: 34, // Home indicator
      left: 0,
      right: 0,
    };
  }

  return {
    top: 24, // Barra de estado Android
    bottom: 16, // Barra de navegación gestual
    left: 0,
    right: 0,
  };
}
