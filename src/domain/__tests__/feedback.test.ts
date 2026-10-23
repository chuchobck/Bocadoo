import { describe, it, expect } from "vitest";
import { shouldShowFeedback, FEEDBACK_DELAY_MIN, FEEDBACK_EXPIRY_HOURS } from "../feedback";

describe("Dominio de Feedback Post-Almuerzo", () => {
  const baseTime = 1700000000000;

  it("no se muestra antes de los 25 minutos del almuerzo", () => {
    const feedback = {
      redemptionId: "red-1",
      restaurantId: "r1",
      validatedAt: baseTime,
    };

    // A los 10 minutos
    expect(shouldShowFeedback(feedback, baseTime + 10 * 60 * 1000)).toBe(false);
    // A los 24 minutos y 59 segundos
    expect(shouldShowFeedback(feedback, baseTime + 24.9 * 60 * 1000)).toBe(false);
  });

  it("sí se muestra exactamente a los 25 minutos y hasta antes de 24 horas", () => {
    const feedback = {
      redemptionId: "red-1",
      restaurantId: "r1",
      validatedAt: baseTime,
    };

    // A los 25 minutos exactos
    expect(shouldShowFeedback(feedback, baseTime + 25 * 60 * 1000)).toBe(true);
    // A las 2 horas
    expect(shouldShowFeedback(feedback, baseTime + 2 * 60 * 60 * 1000)).toBe(true);
    // A las 23 horas
    expect(shouldShowFeedback(feedback, baseTime + 23 * 60 * 60 * 1000)).toBe(true);
  });

  it("no se muestra si el comensal ya respondió", () => {
    const feedback = {
      redemptionId: "red-1",
      restaurantId: "r1",
      validatedAt: baseTime,
      answeredAt: baseTime + 30 * 60 * 1000,
    };

    expect(shouldShowFeedback(feedback, baseTime + 35 * 60 * 1000)).toBe(false);
  });

  it("no se muestra si fue descartada", () => {
    const feedback = {
      redemptionId: "red-1",
      restaurantId: "r1",
      validatedAt: baseTime,
      dismissedAt: baseTime + 26 * 60 * 1000,
    };

    expect(shouldShowFeedback(feedback, baseTime + 30 * 60 * 1000)).toBe(false);
  });

  it("caduca y no se muestra pasadas las 24 horas", () => {
    const feedback = {
      redemptionId: "red-1",
      restaurantId: "r1",
      validatedAt: baseTime,
    };

    // A las 24 horas y 1 minuto
    expect(shouldShowFeedback(feedback, baseTime + 24 * 60 * 60 * 1000 + 60000)).toBe(false);
    // A los 3 días
    expect(shouldShowFeedback(feedback, baseTime + 3 * 24 * 60 * 60 * 1000)).toBe(false);
  });

  it("maneja feedback nulo o indefinido de forma segura", () => {
    expect(shouldShowFeedback(null, baseTime)).toBe(false);
    expect(shouldShowFeedback(undefined, baseTime)).toBe(false);
  });
});
