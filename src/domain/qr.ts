/**
 * Dominio de Códigos QR Rotativos — Bocadoo
 * Mecanismo de seguridad anti-captura de pantalla:
 * - El código se regenera cada 30 segundos.
 * - Formato: `BCD1.{userId}.{timeStep}.{hash}`.
 * - Validación de expiración en caja: si el step recibido tiene más de 1 intervalo de retraso (> 30s), se rechaza.
 */

export interface QrPassPayload {
  version: "BCD1";
  userId: string;
  timeStep: number;
  hash: string;
}

/**
 * Calcula el timeStep actual de 30 segundos.
 */
export function getCurrentTimeStep(now = Date.now()): number {
  return Math.floor(now / 30000);
}

/**
 * Calcula los segundos restantes en el ciclo actual de 30 segundos.
 */
export function getRemainingSecondsInCycle(now = Date.now()): number {
  const currentSec = Math.floor(now / 1000);
  return 30 - (currentSec % 30);
}

/**
 * Genera el hash determinista simulado de 4 dígitos.
 */
export function generateStepHash(userId: string, timeStep: number): string {
  const seed = (timeStep * 31 + userId.charCodeAt(0)) % 10000;
  return String(seed).padStart(4, "0");
}

/**
 * Genera la cadena completa del QR para renderizar.
 */
export function generateQrPayload(userId: string, now = Date.now()): string {
  const timeStep = getCurrentTimeStep(now);
  const hash = generateStepHash(userId, timeStep);
  return `BCD1.${userId}.${timeStep}.${hash}`;
}

/**
 * Parsea y valida un código QR escaneado.
 */
export function parseAndValidateQr(
  rawPayload: string,
  now = Date.now()
): {
  valid: boolean;
  userId?: string | undefined;
  isExpired?: boolean | undefined;
} {
  const parts = rawPayload.split(".");
  if (parts.length !== 4 || parts[0] !== "BCD1") {
    return { valid: false };
  }

  const [, userId, rawTimeStep, hash] = parts;
  if (!userId || !rawTimeStep || !hash) {
    return { valid: false };
  }
  const timeStep = parseInt(rawTimeStep, 10);
  if (isNaN(timeStep)) return { valid: false };

  // Verificar hash
  const expectedHash = generateStepHash(userId, timeStep);
  if (hash !== expectedHash) {
    return { valid: false };
  }

  // Verificar expiración (máximo 1 paso de tolerancia = 30 segundos)
  const currentStep = getCurrentTimeStep(now);
  const difference = currentStep - timeStep;

  if (difference > 1 || difference < -1) {
    return {
      valid: false,
      userId,
      isExpired: true,
    };
  }

  return {
    valid: true,
    userId,
    isExpired: false,
  };
}
