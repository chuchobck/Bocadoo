/**
 * Dominio de Calificación / Feedback Post-Consumo — Bocadoo
 * Reglas de negocio:
 * 1. FEEDBACK_DELAY_MIN = 25: La tarjeta aparece 25 minutos después de validar el almuerzo.
 * 2. Caducidad: Si el comensal no abre la app, la tarjeta caduca a las 24 horas del almuerzo.
 * 3. Unicidad: Una tarjeta por almuerzo validado. Si ya respondió o descartó, no vuelve a salir.
 */

export const FEEDBACK_DELAY_MIN = 25;
export const FEEDBACK_EXPIRY_HOURS = 24;

export interface FeedbackTarget {
  redemptionId: string;
  restaurantId: string;
  validatedAt: number; // Timestamp en milisegundos
  answeredAt?: number | null;
  dismissedAt?: number | null;
}

/**
 * Determina si la tarjeta "¿Qué tal hoy?" debe mostrarse al comensal en el momento actual.
 */
export function shouldShowFeedback(
  feedback: FeedbackTarget | null | undefined,
  nowTimestamp: number = Date.now(),
  delayMinutes: number = FEEDBACK_DELAY_MIN,
): boolean {
  if (!feedback) return false;
  if (feedback.answeredAt || feedback.dismissedAt) return false;

  const delayMs = delayMinutes * 60 * 1000;
  const expiryMs = FEEDBACK_EXPIRY_HOURS * 60 * 60 * 1000;

  const elapsed = nowTimestamp - feedback.validatedAt;

  // Antes de que pasen los minutos requeridos no se muestra
  if (elapsed < delayMs) {
    return false;
  }

  // Después de 24 horas caduca y ya no se muestra
  if (elapsed > expiryMs) {
    return false;
  }

  return true;
}
