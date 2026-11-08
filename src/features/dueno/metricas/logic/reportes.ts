/**
 * Cálculos de los 7 reportes del dueño + resumen semanal de WhatsApp.
 * Funciones puras: reciben la fuente de datos y "hoy", no tocan React ni el mock.
 */
import type {
  ClienteReporte,
  FuenteReportes,
  MetodoPago,
  PlanVendido,
  Plato,
  TipoPlan,
} from "../data/reportes.mock";

const DIA_MS = 24 * 60 * 60 * 1000;

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;
export const FRANJAS = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"] as const;
export const DIAS_POR_RENOVAR = 5;
export const DIAS_EN_RIESGO = 7;

function inicioDelDia(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function mismoDia(a: Date, b: Date): boolean {
  return inicioDelDia(a).getTime() === inicioDelDia(b).getTime();
}

function diasEntre(desde: Date, hasta: Date): number {
  return Math.round((inicioDelDia(hasta).getTime() - inicioDelDia(desde).getTime()) / DIA_MS);
}

export function precioPorAlmuerzo(plan: PlanVendido): number {
  return plan.precio / plan.almuerzosTotales;
}

export function almuerzosRestantes(plan: PlanVendido): number {
  return Math.max(0, plan.almuerzosTotales - plan.almuerzosUsados);
}

export function planActivo(plan: PlanVendido, hoy: Date): boolean {
  return new Date(plan.venceEl).getTime() >= hoy.getTime() && almuerzosRestantes(plan) > 0;
}

/** $1.234,50 → formato de Ecuador con coma decimal. */
export function formatearDolares(valor: number, decimales = 2): string {
  return `$${valor.toLocaleString("es-EC", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`;
}

export function formatearNumero(valor: number): string {
  return valor.toLocaleString("es-EC");
}

// ─── 1. Resumen del día ──────────────────────────────────────────────────────

export type Tendencia = "sube" | "baja" | "igual";

export interface ResumenDia {
  servidosHoy: number;
  servidosSemanaPasada: number;
  /** null cuando la semana pasada no hubo almuerzos (no se puede comparar). */
  variacionPct: number | null;
  tendencia: Tendencia;
  porUsar: number;
  planesActivos: number;
}

export function calcularResumenDia(fuente: FuenteReportes, hoy: Date): ResumenDia {
  const semanaPasada = new Date(hoy.getTime() - 7 * DIA_MS);
  let servidosHoy = 0;
  let servidosSemanaPasada = 0;
  for (const c of fuente.consumos) {
    const fecha = new Date(c.fecha);
    if (mismoDia(fecha, hoy) && fecha.getTime() <= hoy.getTime()) servidosHoy++;
    // Se compara contra el mismo día de la semana pasada hasta la misma hora.
    else if (mismoDia(fecha, semanaPasada) && fecha.getTime() <= semanaPasada.getTime())
      servidosSemanaPasada++;
  }

  const activos = fuente.planes.filter((p) => planActivo(p, hoy));
  const variacionPct =
    servidosSemanaPasada === 0
      ? null
      : Math.round(((servidosHoy - servidosSemanaPasada) / servidosSemanaPasada) * 100);

  return {
    servidosHoy,
    servidosSemanaPasada,
    variacionPct,
    tendencia:
      servidosHoy > servidosSemanaPasada
        ? "sube"
        : servidosHoy < servidosSemanaPasada
          ? "baja"
          : "igual",
    porUsar: activos.reduce((acc, p) => acc + almuerzosRestantes(p), 0),
    planesActivos: activos.length,
  };
}

// ─── 2. Almuerzos pendientes (ya cobrados, por servir) ───────────────────────

export interface AlmuerzosPendientes {
  cantidad: number;
  valor: number;
  clientes: number;
}

export function calcularAlmuerzosPendientes(
  fuente: FuenteReportes,
  hoy: Date,
): AlmuerzosPendientes {
  const activos = fuente.planes.filter((p) => planActivo(p, hoy));
  return {
    cantidad: activos.reduce((acc, p) => acc + almuerzosRestantes(p), 0),
    valor: activos.reduce((acc, p) => acc + almuerzosRestantes(p) * precioPorAlmuerzo(p), 0),
    clientes: new Set(activos.map((p) => p.clienteId)).size,
  };
}

// ─── 3. Ventas de planes por periodo ─────────────────────────────────────────

export type Periodo = "semana" | "mes";
export const DIAS_PERIODO: Record<Periodo, number> = { semana: 7, mes: 30 };

export interface VentaPorTipo {
  tipo: TipoPlan;
  nombre: string;
  cantidad: number;
  efectivo: number;
  transferencia: number;
  total: number;
}

export interface VentasPlanes {
  periodo: Periodo;
  porTipo: VentaPorTipo[];
  total: number;
  efectivo: number;
  transferencia: number;
  planesVendidos: number;
}

export function calcularVentasPlanes(
  fuente: FuenteReportes,
  hoy: Date,
  periodo: Periodo,
): VentasPlanes {
  const desde = inicioDelDia(hoy).getTime() - (DIAS_PERIODO[periodo] - 1) * DIA_MS;
  const enPeriodo = fuente.planes.filter((p) => {
    const t = new Date(p.compradoEl).getTime();
    return t >= desde && t <= hoy.getTime();
  });

  const porTipo = fuente.catalogo.map<VentaPorTipo>((cat) => {
    const delTipo = enPeriodo.filter((p) => p.tipo === cat.tipo);
    const suma = (metodo: MetodoPago) =>
      delTipo.filter((p) => p.metodoPago === metodo).reduce((acc, p) => acc + p.precio, 0);
    const efectivo = suma("EFECTIVO");
    const transferencia = suma("TRANSFERENCIA");
    return {
      tipo: cat.tipo,
      nombre: cat.nombre,
      cantidad: delTipo.length,
      efectivo,
      transferencia,
      total: efectivo + transferencia,
    };
  });

  const efectivo = porTipo.reduce((acc, t) => acc + t.efectivo, 0);
  const transferencia = porTipo.reduce((acc, t) => acc + t.transferencia, 0);
  return {
    periodo,
    porTipo,
    total: efectivo + transferencia,
    efectivo,
    transferencia,
    planesVendidos: enPeriodo.length,
  };
}

// ─── 4. Clientes por renovar y en riesgo ─────────────────────────────────────

export interface ClientePorRenovar {
  cliente: ClienteReporte;
  plan: PlanVendido;
  diasParaVencer: number;
  restantes: number;
}

export interface ClienteEnRiesgo {
  cliente: ClienteReporte;
  plan: PlanVendido;
  diasSinVenir: number;
  restantes: number;
}

/** Último plan de cada cliente (el comprado más recientemente). */
function ultimoPlanPorCliente(planes: PlanVendido[]): Map<string, PlanVendido> {
  const ultimo = new Map<string, PlanVendido>();
  for (const p of planes) {
    const previo = ultimo.get(p.clienteId);
    if (!previo || p.compradoEl > previo.compradoEl) ultimo.set(p.clienteId, p);
  }
  return ultimo;
}

export function calcularClientesPorRenovar(
  fuente: FuenteReportes,
  hoy: Date,
  dias = DIAS_POR_RENOVAR,
): ClientePorRenovar[] {
  const clientes = new Map(fuente.clientes.map((c) => [c.id, c]));
  const resultado: ClientePorRenovar[] = [];
  for (const plan of ultimoPlanPorCliente(fuente.planes).values()) {
    const vence = new Date(plan.venceEl);
    const diasParaVencer = diasEntre(hoy, vence);
    const cliente = clientes.get(plan.clienteId);
    if (!cliente || vence.getTime() < hoy.getTime() || diasParaVencer > dias) continue;
    resultado.push({ cliente, plan, diasParaVencer, restantes: almuerzosRestantes(plan) });
  }
  return resultado.sort((a, b) => a.diasParaVencer - b.diasParaVencer || b.restantes - a.restantes);
}

/** Clientes con plan vigente que llevan más de `dias` sin venir a almorzar. */
export function calcularClientesEnRiesgo(
  fuente: FuenteReportes,
  hoy: Date,
  dias = DIAS_EN_RIESGO,
): ClienteEnRiesgo[] {
  const clientes = new Map(fuente.clientes.map((c) => [c.id, c]));
  const ultimaVisita = new Map<string, string>();
  for (const c of fuente.consumos) {
    const previa = ultimaVisita.get(c.clienteId);
    if (!previa || c.fecha > previa) ultimaVisita.set(c.clienteId, c.fecha);
  }

  const resultado: ClienteEnRiesgo[] = [];
  for (const plan of ultimoPlanPorCliente(fuente.planes).values()) {
    const cliente = clientes.get(plan.clienteId);
    if (!cliente || !planActivo(plan, hoy)) continue;
    const referencia = ultimaVisita.get(plan.clienteId) ?? plan.compradoEl;
    const diasSinVenir = diasEntre(new Date(referencia), hoy);
    if (diasSinVenir <= dias) continue;
    resultado.push({ cliente, plan, diasSinVenir, restantes: almuerzosRestantes(plan) });
  }
  return resultado.sort((a, b) => b.diasSinVenir - a.diasSinVenir);
}

export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

export function enlaceWhatsApp(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

function cuandoVence(dias: number): string {
  if (dias === 0) return "hoy";
  if (dias === 1) return "mañana";
  return `en ${dias} días`;
}

export function mensajeRenovar(item: ClientePorRenovar, nombreLocal: string): string {
  const quedan =
    item.restantes > 0
      ? ` y aún te quedan ${item.restantes} almuerzo${item.restantes === 1 ? "" : "s"}`
      : "";
  return `¡Hola, ${primerNombre(item.cliente.nombre)}! Tu plan en ${nombreLocal} vence ${cuandoVence(
    item.diasParaVencer,
  )}${quedan}. ¿Te lo renovamos para que sigas almorzando sin pensar? 🍲`;
}

export function mensajeEnRiesgo(item: ClienteEnRiesgo, nombreLocal: string): string {
  return `¡Hola, ${primerNombre(item.cliente.nombre)}! Te extrañamos en ${nombreLocal}. Todavía tienes ${
    item.restantes
  } almuerzo${item.restantes === 1 ? "" : "s"} en tu plan. ¡Te esperamos esta semana! 😊`;
}

// ─── 5. Almuerzos vencidos sin consumir ──────────────────────────────────────

export interface AlmuerzosVencidos {
  cantidad: number;
  valor: number;
  planesVencidos: number;
  /** Promedio de almuerzos que quedaron sin usar por plan vencido. */
  promedioPorPlan: number;
}

export function calcularAlmuerzosVencidos(
  fuente: FuenteReportes,
  hoy: Date,
  dias = 30,
): AlmuerzosVencidos {
  const desde = hoy.getTime() - dias * DIA_MS;
  const vencidos = fuente.planes.filter((p) => {
    const t = new Date(p.venceEl).getTime();
    return t >= desde && t < hoy.getTime();
  });
  const cantidad = vencidos.reduce((acc, p) => acc + almuerzosRestantes(p), 0);
  return {
    cantidad,
    valor: vencidos.reduce((acc, p) => acc + almuerzosRestantes(p) * precioPorAlmuerzo(p), 0),
    planesVencidos: vencidos.length,
    promedioPorPlan: vencidos.length === 0 ? 0 : cantidad / vencidos.length,
  };
}

// ─── 6. Horas pico y días fuertes ────────────────────────────────────────────

export interface HorasPico {
  /** matriz[dia 0-4][franja 0-5] = almuerzos en el periodo */
  matriz: number[][];
  maximo: number;
  pico: { dia: number; franja: number } | null;
  diaFuerte: number | null;
  total: number;
}

export function calcularHorasPico(fuente: FuenteReportes, hoy: Date, semanas = 4): HorasPico {
  const desde = inicioDelDia(hoy).getTime() - (semanas * 7 - 1) * DIA_MS;
  const matriz = DIAS_SEMANA.map(() => FRANJAS.map(() => 0));
  let total = 0;
  for (const c of fuente.consumos) {
    const fecha = new Date(c.fecha);
    if (fecha.getTime() < desde || fecha.getTime() > hoy.getTime()) continue;
    const dia = fecha.getDay() - 1;
    const franja = Math.floor(((fecha.getHours() - 12) * 60 + fecha.getMinutes()) / 30);
    const fila = matriz[dia];
    if (!fila || franja < 0 || franja >= FRANJAS.length) continue;
    fila[franja] = (fila[franja] ?? 0) + 1;
    total++;
  }

  let maximo = 0;
  let pico: HorasPico["pico"] = null;
  matriz.forEach((fila, dia) =>
    fila.forEach((valor, franja) => {
      if (valor > maximo) {
        maximo = valor;
        pico = { dia, franja };
      }
    }),
  );
  const totalesDia = matriz.map((fila) => fila.reduce((a, b) => a + b, 0));
  const mayorDia = Math.max(...totalesDia);
  return {
    matriz,
    maximo,
    pico,
    diaFuerte: mayorDia > 0 ? totalesDia.indexOf(mayorDia) : null,
    total,
  };
}

// ─── 7. Platos más pedidos y calificaciones ──────────────────────────────────

export interface PlatoRanking {
  plato: Plato;
  pedidos: number;
  /** null si nadie lo calificó. */
  calificacion: number | null;
  calificaciones: number;
}

export interface RankingPlatos {
  top: PlatoRanking[];
  peor: PlatoRanking | null;
  totalPedidos: number;
}

/** Mínimo de calificaciones para considerar a un plato "el peor" (evita injusticias). */
export const MIN_CALIFICACIONES_PEOR = 5;

export function calcularRankingPlatos(fuente: FuenteReportes, hoy: Date, dias = 30): RankingPlatos {
  const desde = hoy.getTime() - dias * DIA_MS;
  const acumulado = new Map<string, { pedidos: number; suma: number; n: number }>();
  let totalPedidos = 0;
  for (const c of fuente.consumos) {
    const t = new Date(c.fecha).getTime();
    if (t < desde || t > hoy.getTime()) continue;
    const a = acumulado.get(c.platoId) ?? { pedidos: 0, suma: 0, n: 0 };
    a.pedidos++;
    if (c.calificacion !== undefined) {
      a.suma += c.calificacion;
      a.n++;
    }
    acumulado.set(c.platoId, a);
    totalPedidos++;
  }

  const ranking = fuente.platos
    .map<PlatoRanking>((plato) => {
      const a = acumulado.get(plato.id) ?? { pedidos: 0, suma: 0, n: 0 };
      return {
        plato,
        pedidos: a.pedidos,
        calificacion: a.n > 0 ? a.suma / a.n : null,
        calificaciones: a.n,
      };
    })
    .filter((r) => r.pedidos > 0)
    .sort((a, b) => b.pedidos - a.pedidos);

  const top = ranking.slice(0, 3);
  const candidatosPeor = ranking
    .slice(3)
    .filter((r) => r.calificacion !== null && r.calificaciones >= MIN_CALIFICACIONES_PEOR)
    .sort((a, b) => (a.calificacion ?? 0) - (b.calificacion ?? 0));

  return { top, peor: candidatosPeor[0] ?? null, totalPedidos };
}

// ─── Extra: resumen semanal por WhatsApp ─────────────────────────────────────

export interface ResumenSemanal {
  servidos: number;
  cobrado: number;
  porRenovar: number;
  platoEstrella: string | null;
}

export function calcularResumenSemanal(fuente: FuenteReportes, hoy: Date): ResumenSemanal {
  const desde = inicioDelDia(hoy).getTime() - 6 * DIA_MS;
  return {
    servidos: fuente.consumos.filter((c) => {
      const t = new Date(c.fecha).getTime();
      return t >= desde && t <= hoy.getTime();
    }).length,
    cobrado: calcularVentasPlanes(fuente, hoy, "semana").total,
    porRenovar: calcularClientesPorRenovar(fuente, hoy).length,
    platoEstrella: calcularRankingPlatos(fuente, hoy, 7).top[0]?.plato.nombre ?? null,
  };
}
