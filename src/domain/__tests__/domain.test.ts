import { describe, expect, it } from "vitest";
import {
  calculateCashClosure,
  calculateCommission,
  calculateOccupancy,
  calculateOwedLunchesLiability,
  deductLunchFIFO,
  differenceInCalendarDays,
  formatMoney,
  formatMovementDate,
  formatPlanExpiration,
  formatTime24h,
  generateQrPayload,
  getCurrentTimeStep,
  getEndOfCurrentMonth,
  getPlanStatus,
  parseAndValidateQr,
  parseToCents,
  sortPlansFIFO,
  validateLunchRedemption,
  sellPlanSubscription,
  type PlanItem,
  type PlanTemplate,
} from "../index";

describe("Dominio de Moneda (money.ts)", () => {
  it("formatea centavos al estándar oficial de Ecuador ($X,XX)", () => {
    expect(formatMoney(275)).toBe("$2,75");
    expect(formatMoney(5500)).toBe("$55,00");
    expect(formatMoney(0)).toBe("$0,00");
    expect(formatMoney(-300)).toBe("-$3,00");
  });

  it("parsea strings con coma o punto a centavos enteros", () => {
    expect(parseToCents("2,75")).toBe(275);
    expect(parseToCents("$55,00")).toBe(5500);
    expect(parseToCents("3.25")).toBe(325);
    expect(parseToCents(15)).toBe(1500);
  });

  it("calcula la comisión del 7% transparente", () => {
    expect(calculateCommission(275)).toBe(19);
    expect(calculateCommission(5500)).toBe(385);
  });
});

describe("Dominio de Fechas (dates.ts)", () => {
  it("formatea vencimiento de plan en 'Vence DD mmm'", () => {
    const d = new Date(2026, 9, 30); // 30 de octubre
    expect(formatPlanExpiration(d)).toBe("Vence 30 oct");
  });

  it("formatea hora corta en 24h", () => {
    const d = new Date(2026, 9, 30, 13, 12);
    expect(formatTime24h(d)).toBe("13:12");
  });

  it("formatea movimientos con Hoy", () => {
    const today = new Date(2026, 9, 22, 13, 12);
    expect(formatMovementDate(today, today)).toBe("Hoy 13:12");
  });

  it("calcula fin de mes correctamente", () => {
    const oct = new Date(2026, 9, 15);
    const end = getEndOfCurrentMonth(oct);
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(9);
  });
});

describe("Dominio de Planes y FIFO (plans.ts)", () => {
  const planA: PlanItem = {
    id: "p1",
    clienteId: "c1",
    restauranteId: "r1",
    nombrePlan: "Plan Quincenal",
    almuerzosTotales: 10,
    almuerzosRestantes: 5,
    precioTotalCents: 2800,
    precioUnitarioCents: 280,
    compradoEn: "2026-10-01T12:00:00Z",
    venceEn: "2026-10-25T23:59:59Z", // vence primero
    estado: "ACTIVO",
  };

  const planB: PlanItem = {
    id: "p2",
    clienteId: "c1",
    restauranteId: "r1",
    nombrePlan: "Plan Mensual",
    almuerzosTotales: 20,
    almuerzosRestantes: 14,
    precioTotalCents: 5500,
    precioUnitarioCents: 275,
    compradoEn: "2026-10-10T12:00:00Z",
    venceEn: "2026-11-10T23:59:59Z", // vence después
    estado: "ACTIVO",
  };

  it("ordena planes estrictamente por vencimiento (FIFO)", () => {
    const sorted = sortPlansFIFO([planB, planA]);
    expect(sorted[0]?.id).toBe("p1");
    expect(sorted[1]?.id).toBe("p2");
  });

  it("descuenta del plan que vence primero", () => {
    const now = new Date(2026, 9, 22);
    const res = deductLunchFIFO([planB, planA], now);
    expect(res.success).toBe(true);
    expect(res.deductedPlanId).toBe("p1");
    const updatedA = res.updatedPlans.find((p) => p.id === "p1");
    expect(updatedA?.almuerzosRestantes).toBe(4);
    expect(res.totalRemainingLunches).toBe(18); // 4 + 14
  });

  it("determina el pasivo de almuerzos que debes", () => {
    const now = new Date(2026, 9, 22);
    const liability = calculateOwedLunchesLiability([planA, planB], now);
    expect(liability.totalLunchesOwed).toBe(19);
    expect(liability.totalLiabilityCents).toBe(5 * 280 + 14 * 275);
  });
});

describe("Dominio de Validaciones e Idempotencia (redemption.ts)", () => {
  const plan: PlanItem = {
    id: "p1",
    clienteId: "c1",
    restauranteId: "r1",
    nombrePlan: "Plan Mensual",
    almuerzosTotales: 20,
    almuerzosRestantes: 5,
    precioTotalCents: 5500,
    precioUnitarioCents: 275,
    compradoEn: "2026-10-01T12:00:00Z",
    venceEn: "2026-11-01T23:59:59Z",
    estado: "ACTIVO",
  };

  it("valida exitosamente y devuelve VERDE", () => {
    const now = new Date(2026, 9, 22, 12, 0);
    const { result } = validateLunchRedemption({
      clienteId: "c1",
      comensalNombre: "Carlos Mejía",
      restauranteId: "r1",
      targetRestauranteId: "r1",
      plans: [plan],
      recentRedemptions: [],
      now,
    });
    expect(result.outcome).toBe("VERDE");
    expect(result.title).toBe("Validado");
    expect(result.almuerzosRestantes).toBe(4);
  });

  it("rechaza validación duplicada en < 60s con resultado GRIS", () => {
    const now = new Date(2026, 9, 22, 12, 0, 30);
    const { result } = validateLunchRedemption({
      clienteId: "c1",
      comensalNombre: "Carlos Mejía",
      restauranteId: "r1",
      targetRestauranteId: "r1",
      plans: [plan],
      recentRedemptions: [
        {
          id: "r_prev",
          clienteId: "c1",
          restauranteId: "r1",
          timestamp: new Date(2026, 9, 22, 12, 0, 0).toISOString(),
          anulada: false,
        },
      ],
      now,
    });
    expect(result.outcome).toBe("GRIS");
    expect(result.title).toBe("Ya validado");
  });

  it("rechaza si el plan pertenece a otro restaurante con ROJO", () => {
    const now = new Date(2026, 9, 22, 12, 0);
    const { result } = validateLunchRedemption({
      clienteId: "c1",
      comensalNombre: "Carlos Mejía",
      restauranteId: "r_otro",
      targetRestauranteId: "r1",
      plans: [plan],
      recentRedemptions: [],
      now,
    });
    expect(result.outcome).toBe("ROJO");
    expect(result.title).toBe("Es de otro local");
  });
});

describe("Dominio de Semáforo de Ocupación (occupancy.ts)", () => {
  it("determina estado LIBRE cuando ocupación < 60%", () => {
    const res = calculateOccupancy({ totalSeats: 30, dinersLast25Min: 10 });
    expect(res.level).toBe("LIBRE");
    expect(res.label).toBe("Libre");
  });

  it("determina estado MOVIDO entre 60% y 85%", () => {
    const res = calculateOccupancy({ totalSeats: 30, dinersLast25Min: 22 });
    expect(res.level).toBe("MOVIDO");
    expect(res.label).toBe("Movido");
  });

  it("determina estado LLENO cuando > 85%", () => {
    const res = calculateOccupancy({ totalSeats: 30, dinersLast25Min: 27 });
    expect(res.level).toBe("LLENO");
    expect(res.label).toBe("Lleno");
  });

  it("respeta interruptor manual [Local lleno]", () => {
    const now = new Date();
    const busyUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
    const res = calculateOccupancy({ totalSeats: 30, dinersLast25Min: 5, manualBusyUntil: busyUntil, now });
    expect(res.level).toBe("LLENO");
    expect(res.isManual).toBe(true);
  });
});

describe("Dominio de Cierre de Caja (cash.ts)", () => {
  it("calcula caja cuadrada exacta", () => {
    const res = calculateCashClosure({
      efectivoContadoCents: 8500, // $85,00 contado
      ventasPosEfectivoCents: 3000, // $30,00 pos
      ventasPosTransferenciaCents: 1500,
      planesEfectivoCents: 5500, // $55,00 planes
      planesTransferenciaCents: 2800,
      almuerzosServidosHoy: 37,
    });
    expect(res.estado).toBe("CUADRA");
    expect(res.diferenciaCents).toBe(0);
    expect(res.etiquetaDiferencia).toBe("Cuadra");
  });

  it("calcula faltante de dinero", () => {
    const res = calculateCashClosure({
      efectivoContadoCents: 8200,
      ventasPosEfectivoCents: 3000,
      ventasPosTransferenciaCents: 0,
      planesEfectivoCents: 5500,
      planesTransferenciaCents: 0,
      almuerzosServidosHoy: 30,
    });
    expect(res.estado).toBe("FALTA");
    expect(res.diferenciaCents).toBe(-300);
    expect(res.etiquetaDiferencia).toBe("Faltan $3,00");
  });
});

describe("Dominio de Códigos QR Rotativos (qr.ts)", () => {
  it("genera y valida payload QR determinista", () => {
    const now = 1700000000000;
    const payload = generateQrPayload("u1", now);
    const parsed = parseAndValidateQr(payload, now);
    expect(parsed.valid).toBe(true);
    expect(parsed.userId).toBe("u1");
    expect(parsed.isExpired).toBe(false);
  });

  it("detecta código expirado tras más de 30 segundos", () => {
    const now = 1700000000000;
    const future = now + 90000; // 90s después = 3 steps
    const payload = generateQrPayload("u1", now);
    const parsed = parseAndValidateQr(payload, future);
    expect(parsed.valid).toBe(false);
    expect(parsed.isExpired).toBe(true);
  });
});

describe("Venta de Planes con Copia Inmutable (plans.ts)", () => {
  it("guarda copia inmutable al vender y no cambia si la plantilla se edita o archiva", () => {
    const template: PlanTemplate = {
      id: "tpl-1",
      name: "Plan Mensual",
      lunches: 20,
      priceCents: 5500,
      daysValidity: 30,
      includes: ["sopa", "segundo"],
      active: true,
    };

    const soldDate = new Date(2026, 9, 1);
    const subscription = sellPlanSubscription(template, "c1", "r1", soldDate);

    expect(subscription.snapshot.name).toBe("Plan Mensual");
    expect(subscription.snapshot.lunchesTotal).toBe(20);
    expect(subscription.snapshot.priceCents).toBe(5500);
    expect(subscription.snapshot.includes).toEqual(["sopa", "segundo"]);
    expect(subscription.lunchesRemaining).toBe(20);

    // Si el dueño luego edita la plantilla original (cambia precio a $65 o archiva)
    template.name = "Plan Mensual Premium";
    template.priceCents = 6500;
    template.includes.push("postre");
    template.archived = true;

    // La suscripción ya vendida al cliente permanece intacta
    expect(subscription.snapshot.name).toBe("Plan Mensual");
    expect(subscription.snapshot.priceCents).toBe(5500);
    expect(subscription.snapshot.includes).toEqual(["sopa", "segundo"]);
  });

  it("cada compra genera una suscripción independiente y no suma saldos", () => {
    const template: PlanTemplate = {
      id: "tpl-1",
      name: "Plan Quincenal",
      lunches: 10,
      priceCents: 3000,
      daysValidity: 15,
      includes: ["sopa", "segundo"],
      active: true,
    };

    const sub1 = sellPlanSubscription(template, "c1", "r1", new Date(2026, 9, 1));
    const sub2 = sellPlanSubscription(template, "c1", "r1", new Date(2026, 9, 10));

    expect(sub1.id).not.toBe(sub2.id);
    expect(sub1.expiresAt).not.toBe(sub2.expiresAt);
    expect(sub1.lunchesRemaining).toBe(10);
    expect(sub2.lunchesRemaining).toBe(10);
  });
});

describe("Dominio de Ofertas Flash y Comisión (money.ts)", () => {
  it("calcula la comisión del 7% y el valor neto recibido por el dueño", () => {
    const saleAmountCents = 270; // $2,70 por plato en oferta
    const commissionCents = calculateCommission(saleAmountCents, 0.07);
    const netReceivedCents = saleAmountCents - commissionCents;

    expect(commissionCents).toBe(19); // 270 * 0.07 = 18.9 -> 19 centavos
    expect(netReceivedCents).toBe(251); // Dueño recibe $2,51
  });

  it("calcula con tasa configurable (ej. 10%)", () => {
    const saleAmountCents = 250; // $2,50
    const commissionCents = calculateCommission(saleAmountCents, 0.10);
    expect(commissionCents).toBe(25);
    expect(saleAmountCents - commissionCents).toBe(225); // Dueño recibe $2,25
  });
});
