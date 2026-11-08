import { describe, it, expect } from "vitest";
import {
  haversineDistanceMeters,
  estimateWalkingTimeMinutes,
  COMMERCIAL_ZONES,
} from "../donde-comer/data/zones";

describe("Cálculos de ubicación y mapa de restaurantes", () => {
  it("calcula correctamente la distancia entre dos puntos en Quito", () => {
    // PUCE (-0.2115, -78.4912) y La Floresta (-0.2085, -78.4870)
    const dist = haversineDistanceMeters(-0.2115, -78.4912, -0.2085, -78.487);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(700);
  });

  it("calcula distancia cero para las mismas coordenadas", () => {
    const dist = haversineDistanceMeters(-0.2115, -78.4912, -0.2115, -78.4912);
    expect(dist).toBe(0);
  });

  it("estima el tiempo de caminata a pie de forma realista", () => {
    // 400 metros -> aprox 5 min a pie
    const time400 = estimateWalkingTimeMinutes(400);
    expect(time400).toBe(5);

    // 80 metros -> aprox 1 min a pie
    const time80 = estimateWalkingTimeMinutes(80);
    expect(time80).toBe(1);
  });

  it("contiene zonas comerciales con coordenadas válidas para Quito", () => {
    expect(COMMERCIAL_ZONES.length).toBeGreaterThanOrEqual(5);
    COMMERCIAL_ZONES.forEach((zone) => {
      expect(zone.name).toBeTruthy();
      expect(zone.lat).toBeLessThan(0); // Hemisferio sur (Quito)
      expect(zone.lng).toBeLessThan(-78); // Longitud de Quito
    });
  });
});

