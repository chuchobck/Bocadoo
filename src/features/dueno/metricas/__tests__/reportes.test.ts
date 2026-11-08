import { describe, it, expect } from "vitest";
import {
  PLANES_CATALOGO,
  generarFuenteReportes,
  type FuenteReportes,
  type PlanVendido,
} from "../data/reportes.mock";
import {
  calcularAlmuerzosPendientes,
  calcularAlmuerzosVencidos,
  calcularClientesEnRiesgo,
  calcularClientesPorRenovar,
  calcularHorasPico,
  calcularRankingPlatos,
  calcularResumenDia,
  calcularVentasPlanes,
  enlaceWhatsApp,
  mensajeRenovar,
} from "../logic/reportes";

// Jueves 5 de noviembre de 2026, 13:40 (hora local)
const HOY = new Date(2026, 10, 5, 13, 40);
const dia = (offset: number, h = 12, m = 0) => new Date(2026, 10, 5 + offset, h, m).toISOString();

function plan(p: Partial<PlanVendido> & Pick<PlanVendido, "id" | "clienteId">): PlanVendido {
  return {
    tipo: "QUINCENAL",
    metodoPago: "EFECTIVO",
    precio: 28,
    almuerzosTotales: 10,
    almuerzosUsados: 0,
    compradoEl: dia(-5),
    venceEl: dia(9, 23, 59),
    ...p,
  };
}

function fuente(parcial: Partial<FuenteReportes>): FuenteReportes {
  return {
    generadoEl: HOY.toISOString(),
    catalogo: PLANES_CATALOGO,
    clientes: [
      { id: "c1", nombre: "María José Andrade", telefono: "593987654321" },
      { id: "c2", nombre: "Carlos Pazmiño", telefono: "593998877665" },
    ],
    planes: [],
    platos: [
      { id: "p1", nombre: "Seco de pollo" },
      { id: "p2", nombre: "Guatita" },
    ],
    consumos: [],
    ...parcial,
  };
}

describe("Reporte 1 · Resumen del día", () => {
  it("compara contra el mismo día de la semana pasada hasta la misma hora", () => {
    const f = fuente({
      planes: [plan({ id: "a", clienteId: "c1", almuerzosUsados: 4 })],
      consumos: [
        { id: "1", clienteId: "c1", planId: "a", platoId: "p1", fecha: dia(0, 12, 30) },
        { id: "2", clienteId: "c2", planId: "a", platoId: "p1", fecha: dia(0, 13, 10) },
        { id: "3", clienteId: "c1", planId: "a", platoId: "p1", fecha: dia(-7, 12, 15) },
        // Después de las 13:40 de la semana pasada: no cuenta
        { id: "4", clienteId: "c2", planId: "a", platoId: "p1", fecha: dia(-7, 14, 20) },
      ],
    });
    const r = calcularResumenDia(f, HOY);
    expect(r.servidosHoy).toBe(2);
    expect(r.servidosSemanaPasada).toBe(1);
    expect(r.variacionPct).toBe(100);
    expect(r.tendencia).toBe("sube");
    expect(r.porUsar).toBe(6);
  });

  it("no inventa un porcentaje si la semana pasada no hubo almuerzos", () => {
    const r = calcularResumenDia(fuente({}), HOY);
    expect(r.variacionPct).toBeNull();
    expect(r.tendencia).toBe("igual");
  });
});

describe("Reporte 2 · Almuerzos pendientes", () => {
  it("valora lo pendiente al precio por almuerzo de cada plan e ignora vencidos", () => {
    const f = fuente({
      planes: [
        plan({ id: "a", clienteId: "c1", almuerzosUsados: 4 }), // 6 × 2,80
        plan({
          id: "b",
          clienteId: "c2",
          tipo: "SEMANAL",
          precio: 15,
          almuerzosTotales: 5,
          almuerzosUsados: 1,
        }), // 4 × 3
        plan({ id: "c", clienteId: "c2", venceEl: dia(-1, 23, 59), almuerzosUsados: 2 }), // vencido
      ],
    });
    const r = calcularAlmuerzosPendientes(f, HOY);
    expect(r.cantidad).toBe(10);
    expect(r.valor).toBeCloseTo(6 * 2.8 + 4 * 3);
    expect(r.clientes).toBe(2);
  });
});

describe("Reporte 3 · Ventas de planes", () => {
  it("separa por tipo y método de pago dentro del periodo", () => {
    const f = fuente({
      planes: [
        plan({ id: "a", clienteId: "c1", compradoEl: dia(-2) }),
        plan({
          id: "b",
          clienteId: "c2",
          metodoPago: "TRANSFERENCIA",
          tipo: "MENSUAL",
          precio: 52,
          compradoEl: dia(-6),
        }),
        plan({ id: "c", clienteId: "c2", compradoEl: dia(-20) }), // fuera de la semana, dentro del mes
      ],
    });
    const semana = calcularVentasPlanes(f, HOY, "semana");
    expect(semana.total).toBe(80);
    expect(semana.efectivo).toBe(28);
    expect(semana.transferencia).toBe(52);
    expect(semana.porTipo.find((t) => t.tipo === "MENSUAL")?.transferencia).toBe(52);
    expect(calcularVentasPlanes(f, HOY, "mes").total).toBe(108);
  });
});

describe("Reporte 4 · Clientes por renovar y en riesgo", () => {
  const f = fuente({
    planes: [
      plan({ id: "a", clienteId: "c1", venceEl: dia(2, 23, 59), almuerzosUsados: 7 }),
      plan({
        id: "b",
        clienteId: "c2",
        compradoEl: dia(-14),
        venceEl: dia(12, 23, 59),
        almuerzosUsados: 3,
      }),
    ],
    consumos: [
      { id: "1", clienteId: "c1", planId: "a", platoId: "p1", fecha: dia(-1) },
      { id: "2", clienteId: "c2", planId: "b", platoId: "p1", fecha: dia(-10) },
    ],
  });

  it("lista los planes que vencen en los próximos 5 días", () => {
    const r = calcularClientesPorRenovar(f, HOY);
    expect(r.map((x) => x.cliente.id)).toEqual(["c1"]);
    expect(r[0]?.diasParaVencer).toBe(2);
  });

  it("marca en riesgo a quien lleva más de 7 días sin venir con plan vigente", () => {
    const r = calcularClientesEnRiesgo(f, HOY);
    expect(r.map((x) => x.cliente.id)).toEqual(["c2"]);
    expect(r[0]?.diasSinVenir).toBe(10);
    expect(r[0]?.restantes).toBe(7);
  });

  it("arma el enlace de WhatsApp con el nombre del cliente", () => {
    const item = calcularClientesPorRenovar(f, HOY)[0];
    expect(item).toBeDefined();
    const url = enlaceWhatsApp("+593 98 765 4321", mensajeRenovar(item!, "La Cuchara"));
    expect(url.startsWith("https://wa.me/593987654321?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1] ?? "")).toContain("¡Hola, María!");
  });
});

describe("Reporte 5 · Almuerzos vencidos", () => {
  it("suma solo lo que quedó sin usar en planes vencidos el último mes", () => {
    const f = fuente({
      planes: [
        plan({ id: "a", clienteId: "c1", venceEl: dia(-3, 23, 59), almuerzosUsados: 8 }), // 2 sin usar
        plan({ id: "b", clienteId: "c2", venceEl: dia(-10, 23, 59), almuerzosUsados: 10 }), // 0
        plan({ id: "c", clienteId: "c2", venceEl: dia(-45, 23, 59), almuerzosUsados: 0 }), // fuera del mes
      ],
    });
    const r = calcularAlmuerzosVencidos(f, HOY);
    expect(r.cantidad).toBe(2);
    expect(r.valor).toBeCloseTo(5.6);
    expect(r.planesVencidos).toBe(2);
    expect(r.promedioPorPlan).toBe(1);
  });
});

describe("Reporte 6 · Horas pico", () => {
  it("ubica el almuerzo en su día y franja de 30 minutos", () => {
    const f = fuente({
      consumos: [
        { id: "1", clienteId: "c1", planId: "a", platoId: "p1", fecha: dia(0, 13, 5) }, // jueves 13:00
        { id: "2", clienteId: "c2", planId: "a", platoId: "p1", fecha: dia(0, 13, 25) }, // jueves 13:00
        { id: "3", clienteId: "c2", planId: "a", platoId: "p1", fecha: dia(-3, 12, 45) }, // lunes 12:30
      ],
    });
    const r = calcularHorasPico(f, HOY);
    expect(r.pico).toEqual({ dia: 3, franja: 2 });
    expect(r.diaFuerte).toBe(3);
    expect(r.matriz[0]?.[1]).toBe(1);
    expect(r.total).toBe(3);
  });
});

describe("Reporte 7 · Platos y calificaciones", () => {
  it("promedia solo los almuerzos calificados y exige mínimo de notas para el peor", () => {
    const consumos = Array.from({ length: 6 }, (_, i) => ({
      id: `s${i}`,
      clienteId: "c1",
      planId: "a",
      platoId: "p1",
      fecha: dia(-i),
      ...(i < 4 ? { calificacion: i % 2 === 0 ? 5 : 4 } : {}),
    }));
    const r = calcularRankingPlatos(fuente({ consumos }), HOY);
    expect(r.top[0]?.plato.nombre).toBe("Seco de pollo");
    expect(r.top[0]?.pedidos).toBe(6);
    expect(r.top[0]?.calificacion).toBeCloseTo(4.5);
    expect(r.peor).toBeNull();
  });
});

describe("Datos de ejemplo", () => {
  it("son deterministas y con precios del catálogo", () => {
    const a = generarFuenteReportes(HOY);
    const b = generarFuenteReportes(HOY);
    expect(a.planes.length).toBe(b.planes.length);
    expect(a.consumos.length).toBe(b.consumos.length);
    expect(a.planes.every((p) => [15, 28, 52].includes(p.precio))).toBe(true);
    expect(a.consumos.every((c) => new Date(c.fecha).getTime() <= HOY.getTime())).toBe(true);
  });
});
