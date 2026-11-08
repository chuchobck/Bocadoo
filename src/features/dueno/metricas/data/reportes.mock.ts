/**
 * Datos de ejemplo de los reportes del dueño — ÚNICO archivo mock.
 *
 * Los tipos de abajo son el contrato que debería devolver la API real
 * (GET /reportes/fuente). Para conectar el backend basta con reemplazar
 * `obtenerFuenteReportes()` por un fetch que devuelva `FuenteReportes`;
 * los cálculos de `logic/reportes.ts` y los componentes no cambian.
 *
 * La simulación es determinista (semilla fija) y relativa a "hoy", así los
 * números son estables y siempre recientes: ~70 clientes, planes de
 * 5/10/20 almuerzos a $15/$28/$52, servicio de 12:00 a 15:00 de lunes a viernes.
 */

export type TipoPlan = "SEMANAL" | "QUINCENAL" | "MENSUAL";
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA";

export interface PlanCatalogo {
  tipo: TipoPlan;
  nombre: string;
  almuerzos: number;
  precio: number;
  vigenciaDias: number;
}

export interface ClienteReporte {
  id: string;
  nombre: string;
  /** Formato internacional sin "+" (listo para wa.me). */
  telefono: string;
}

export interface PlanVendido {
  id: string;
  clienteId: string;
  tipo: TipoPlan;
  metodoPago: MetodoPago;
  precio: number;
  almuerzosTotales: number;
  almuerzosUsados: number;
  /** ISO 8601 */
  compradoEl: string;
  /** ISO 8601 — último día en que el plan se puede usar. */
  venceEl: string;
}

export interface Plato {
  id: string;
  nombre: string;
}

export interface Consumo {
  id: string;
  clienteId: string;
  planId: string;
  platoId: string;
  /** ISO 8601 con hora del almuerzo validado. */
  fecha: string;
  /** Respuesta a "¿Qué tal hoy?" (1 a 5). Ausente si el comensal no calificó. */
  calificacion?: number;
}

export interface FuenteReportes {
  generadoEl: string;
  catalogo: PlanCatalogo[];
  clientes: ClienteReporte[];
  planes: PlanVendido[];
  platos: Plato[];
  consumos: Consumo[];
}

export const PLANES_CATALOGO: PlanCatalogo[] = [
  { tipo: "SEMANAL", nombre: "Semanal", almuerzos: 5, precio: 15, vigenciaDias: 7 },
  { tipo: "QUINCENAL", nombre: "Quincenal", almuerzos: 10, precio: 28, vigenciaDias: 15 },
  { tipo: "MENSUAL", nombre: "Mensual", almuerzos: 20, precio: 52, vigenciaDias: 30 },
];

const NOMBRES = [
  "María José Andrade",
  "Carlos Pazmiño",
  "Daniela Cevallos",
  "Andrés Viteri",
  "Gabriela Ruiz",
  "Jorge Salazar",
  "Paola Mena",
  "Santiago Proaño",
  "Valeria Herrera",
  "Diego Benítez",
  "Fernanda Ortiz",
  "Luis Chiriboga",
  "Carolina Vásquez",
  "Pablo Guerrero",
  "Ana Lucía Torres",
  "Esteban Morales",
  "Camila Jaramillo",
  "Ricardo Espinosa",
  "Natalia Páez",
  "Sebastián Calle",
  "Lorena Albán",
  "Mateo Villacís",
  "Verónica Narváez",
  "Javier Hidalgo",
  "Daniela Moncayo",
  "Cristian Yépez",
  "Mónica Recalde",
  "Felipe Tapia",
  "Sofía Montalvo",
  "Héctor Pinto",
  "Alejandra Bravo",
  "Marco Vinueza",
  "Patricia León",
  "Iván Carrera",
  "Karla Zambrano",
  "Raúl Endara",
  "Tatiana Granda",
  "Wilson Ayala",
  "Isabel Robalino",
  "Fabián Correa",
  "Diana Lozada",
  "Óscar Mejía",
  "Cristina Arias",
  "Bryan Quishpe",
  "Silvia Montesdeoca",
  "Geovanny Chávez",
  "Elena Burbano",
  "Adrián Flores",
  "Rocío Delgado",
  "Kevin Toapanta",
  "Johanna Vaca",
  "Mauricio Peñafiel",
  "Lucía Sánchez",
  "Edison Cando",
  "Andrea Pozo",
  "Roberto Játiva",
  "Pamela Rivadeneira",
  "Hugo Llerena",
  "Estefanía Ponce",
  "Marcelo Cueva",
  "Gissela Paredes",
  "Fernando Lara",
  "Ximena Ordóñez",
  "Christian Mosquera",
  "Nathaly Rosero",
  "Darwin Simbaña",
  "Melissa Carrión",
  "Jaime Gallegos",
  "Viviana Cortez",
  "Leonardo Aguirre",
];

/** Platos de segundo con su popularidad y calificación media "real" de la simulación. */
const PLATOS_SIM = [
  { id: "p01", nombre: "Seco de pollo", popularidad: 1.6, nota: 4.6 },
  { id: "p02", nombre: "Fritada con mote", popularidad: 1.4, nota: 4.5 },
  { id: "p03", nombre: "Arroz con menestra y carne", popularidad: 1.3, nota: 4.3 },
  { id: "p04", nombre: "Pollo al jugo", popularidad: 1.1, nota: 4.2 },
  { id: "p05", nombre: "Estofado de carne", popularidad: 1.0, nota: 4.1 },
  { id: "p06", nombre: "Tilapia frita", popularidad: 0.9, nota: 4.0 },
  { id: "p07", nombre: "Guatita", popularidad: 0.8, nota: 4.4 },
  { id: "p08", nombre: "Chuleta a la plancha", popularidad: 0.9, nota: 3.9 },
  { id: "p09", nombre: "Tallarín con pollo", popularidad: 0.7, nota: 3.1 },
];

/** Peso de cada franja de 30 min (12:00 … 14:30) y de cada día (lun … vie). */
const PESO_FRANJA = [0.08, 0.18, 0.3, 0.22, 0.14, 0.08];
const ASISTENCIA_DIA = [0.95, 0.88, 1.0, 1.12, 0.82];

const DIA_MS = 24 * 60 * 60 * 1000;

function crearAzar(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inicioDelDia(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * DIA_MS);
}

function esDiaLaboral(fecha: Date): boolean {
  const dia = fecha.getDay();
  return dia >= 1 && dia <= 5;
}

function elegirPorPeso<T>(items: T[], peso: (item: T) => number, azar: () => number): T {
  const total = items.reduce((acc, it) => acc + peso(it), 0);
  let r = azar() * total;
  for (const it of items) {
    r -= peso(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1] as T;
}

export function generarFuenteReportes(hoy: Date = new Date(), semilla = 20261102): FuenteReportes {
  const azar = crearAzar(semilla);
  const hoyInicio = inicioDelDia(hoy);

  const clientes: ClienteReporte[] = NOMBRES.map((nombre, i) => ({
    id: `c${String(i + 1).padStart(2, "0")}`,
    nombre,
    telefono: `5939${String(80000000 + Math.floor(azar() * 19999999)).slice(0, 8)}`,
  }));

  // Menú del día: 3 segundos distintos por cada día laboral simulado.
  const menuPorDia = new Map<number, typeof PLATOS_SIM>();
  const menuDe = (dia: Date) => {
    const clave = dia.getTime();
    let menu = menuPorDia.get(clave);
    if (!menu) {
      const disponibles = [...PLATOS_SIM];
      menu = [];
      for (let k = 0; k < 3; k++) {
        const elegido = elegirPorPeso(disponibles, () => 1, azar);
        menu.push(elegido);
        disponibles.splice(disponibles.indexOf(elegido), 1);
      }
      menuPorDia.set(clave, menu);
    }
    return menu;
  };

  const planes: PlanVendido[] = [];
  const consumos: Consumo[] = [];

  clientes.forEach((cliente, idx) => {
    const preferido = elegirPorPeso(
      PLANES_CATALOGO,
      (p) => ({ SEMANAL: 0.3, QUINCENAL: 0.35, MENSUAL: 0.35 })[p.tipo],
      azar,
    );
    const asistencia = 0.68 + azar() * 0.28;
    const pagaEnEfectivo = azar() < 0.55;
    // ~1 de cada 5 deja de venir hace 8 a 16 días (clientes en riesgo).
    const dejaDeVenirEl = azar() < 0.2 ? sumarDias(hoyInicio, -(8 + Math.floor(azar() * 9))) : null;

    let compra = sumarDias(hoyInicio, -(55 + Math.floor(azar() * 35)));
    let numPlan = 0;

    while (compra.getTime() <= hoyInicio.getTime()) {
      // Si un cliente no viene, igual podría comprar; pero quien ya dejó de venir no renueva.
      if (dejaDeVenirEl && compra.getTime() > dejaDeVenirEl.getTime()) break;

      const plan = azar() < 0.8 ? preferido : elegirPorPeso(PLANES_CATALOGO, () => 1, azar);
      const vence = sumarDias(compra, plan.vigenciaDias - 1);
      const registro: PlanVendido = {
        id: `pl-${cliente.id}-${++numPlan}`,
        clienteId: cliente.id,
        tipo: plan.tipo,
        metodoPago: (azar() < 0.85 ? pagaEnEfectivo : !pagaEnEfectivo)
          ? "EFECTIVO"
          : "TRANSFERENCIA",
        precio: plan.precio,
        almuerzosTotales: plan.almuerzos,
        almuerzosUsados: 0,
        compradoEl: new Date(
          compra.getTime() + (9 + Math.floor(azar() * 6)) * 60 * 60 * 1000,
        ).toISOString(),
        venceEl: new Date(vence.getTime() + (23 * 60 + 59) * 60 * 1000).toISOString(),
      };
      planes.push(registro);

      let dia = compra;
      let ultimoUso: Date | null = null;
      while (
        dia.getTime() <= vence.getTime() &&
        dia.getTime() <= hoyInicio.getTime() &&
        registro.almuerzosUsados < registro.almuerzosTotales
      ) {
        const dejoDeVenir = dejaDeVenirEl !== null && dia.getTime() >= dejaDeVenirEl.getTime();
        if (esDiaLaboral(dia) && !dejoDeVenir) {
          const factorDia = ASISTENCIA_DIA[dia.getDay() - 1] ?? 1;
          if (azar() < Math.min(0.97, asistencia * factorDia)) {
            const franja = elegirPorPeso(
              PESO_FRANJA.map((p, i) => ({ i, p: dia.getDay() === 4 && i === 2 ? p * 1.4 : p })),
              (f) => f.p,
              azar,
            ).i;
            const minuto = 12 * 60 + franja * 30 + Math.floor(azar() * 30);
            const plato = elegirPorPeso(menuDe(dia), (p) => p.popularidad, azar);
            const nota = Math.round(plato.nota + (azar() - 0.5) * 1.6);
            const fecha = new Date(dia.getTime() + minuto * 60 * 1000);
            const calificacion = azar() < 0.62 ? Math.max(1, Math.min(5, nota)) : undefined;
            // Hoy solo existen los almuerzos que ya se sirvieron hasta esta hora.
            if (fecha.getTime() <= hoy.getTime()) {
              consumos.push({
                id: `co-${consumos.length + 1}`,
                clienteId: cliente.id,
                planId: registro.id,
                platoId: plato.id,
                fecha: fecha.toISOString(),
                ...(calificacion !== undefined ? { calificacion } : {}),
              });
              registro.almuerzosUsados++;
              ultimoUso = dia;
            }
          }
        }
        dia = sumarDias(dia, 1);
      }

      // Renovación: al terminar los almuerzos o al vencer; algunos tardan unos días.
      const terminoAntes = registro.almuerzosUsados === registro.almuerzosTotales && ultimoUso;
      const base = terminoAntes ? sumarDias(ultimoUso as Date, 1) : sumarDias(vence, 1);
      if (azar() > 0.88 && idx % 3 === 0) break; // se va sin renovar
      compra = sumarDias(base, azar() < 0.7 ? 0 : 1 + Math.floor(azar() * 3));
    }
  });

  return {
    generadoEl: hoy.toISOString(),
    catalogo: PLANES_CATALOGO,
    clientes,
    planes,
    platos: PLATOS_SIM.map(({ id, nombre }) => ({ id, nombre })),
    consumos,
  };
}

/** Simula la llamada a la API. Reemplazar por el fetch real. */
export async function obtenerFuenteReportes(hoy: Date = new Date()): Promise<FuenteReportes> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return generarFuenteReportes(hoy);
}
