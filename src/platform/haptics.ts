import { type PlatformType } from "./usePlatform";

/**
 * Dispara patrones de vibración háptica adaptados a iOS o Android.
 */
export function triggerHaptic(type: "tap" | "success" | "warning" | "error", platform: PlatformType = "ios") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    if (platform === "ios") {
      // Impactos sutiles estilo Taptic Engine
      switch (type) {
        case "tap":
          navigator.vibrate?.(10);
          break;
        case "success":
          navigator.vibrate?.([15, 40, 20]);
          break;
        case "warning":
          navigator.vibrate?.([25, 50, 25]);
          break;
        case "error":
          navigator.vibrate?.([40, 60, 40, 60, 40]);
          break;
      }
    } else {
      // Material 3 haptic patterns
      switch (type) {
        case "tap":
          navigator.vibrate?.(15);
          break;
        case "success":
          navigator.vibrate?.([20, 50, 20]);
          break;
        case "warning":
          navigator.vibrate?.(35);
          break;
        case "error":
          navigator.vibrate?.([50, 70, 50]);
          break;
      }
    }
  } catch {
    // Si el dispositivo bloquea la vibración, continúa silencioso
  }
}
