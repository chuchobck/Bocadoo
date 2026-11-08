import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_COMMISSION_RATE, calculateCommission } from "@/domain/money";
import { FEEDBACK_DELAY_MIN, shouldShowFeedback } from "@/domain/feedback";

// ============================================================================
// BOCADOO V3 STORE — ESTADO INTERACTIVO SINCRONIZADO EN LOCALSTORAGE
// ============================================================================

export const STORAGE_KEY = "bocadoo-demo-v3";
const BROADCAST_CHANNEL_NAME = "bocadoo-sync-v3";
export const COMMISSION_RATE = DEFAULT_COMMISSION_RATE; // Comisión configurable en ofertas flash / marketplace

// ----------------------------------------------------------------------------
// MONEDA & FORMATEO (DINERO SIEMPRE EN CENTAVOS ENTEROS)
// ----------------------------------------------------------------------------
export const money = (cents: number): string => {
  const isNegative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `$${dollars},${remainder.toString().padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
};

export const moneyShort = (cents: number): string => {
  const isNegative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.round(abs / 100);
  const formatted = `$${dollars}`;
  return isNegative ? `-${formatted}` : formatted;
};

export const parseMoneyToCents = (input: string | number): number => {
  if (typeof input === "number") return Math.round(input * 100);
  const clean = input.replace(/[^\d.,-]/g, "").replace(",", ".");
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.round(val * 100);
};

export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("593") ? `0${digits.slice(3)}` : digits;
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const DAILY_GOAL = 50;

export const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ----------------------------------------------------------------------------
// TIPOS DEL DOMINIO
// ----------------------------------------------------------------------------

export type StaffRole = "OWNER" | "CASHIER";

export type Restaurant = {
  id: string;
  nombre: string;
  zona: string;
  puestos: number;
  anotarMesa: boolean;
  precioSueltoCents: number; // Ej: 300 = $3,00
  recargoParaLlevarCents: number; // Ej: 25 = $0,25
  lat: number;
  lng: number;
  horario: string;
  abierto: boolean;
  descripcionCorta?: string | undefined;
  tags?: string[] | undefined;
  manualBusyUntil?: string | undefined; // ISO timestamp: cuando el dueño activa "Local lleno" (dura 20 min)
  logoUrl?: string | null | undefined;
  direccion?: string | undefined;
};

export type Staff = {
  id: string;
  userId: string;
  restaurantId: string;
  rol: StaffRole;
  nombre: string;
  telefono?: string | undefined;
};

export type AppUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
};

export type Client = {
  id: string;
  restaurantId: string;
  userId?: string | undefined; // Sin userId = contacto sin app migrado o anotado a mano
  nombre: string;
  telefono: string;
  correo: string;
};

export type PlanType = "Semanal" | "Quincenal" | "Mensual" | "Libre";

export type PlanCategory = "ALMUERZO" | "DESAYUNO" | "MIXTO";

export const PLAN_CATEGORY_LABEL: Record<PlanCategory, string> = {
  ALMUERZO: "Almuerzos",
  DESAYUNO: "Desayunos",
  MIXTO: "Combos / Mixto",
};

export type PlanTemplate = {
  id: string;
  restaurantId: string;
  /** Qué cubre el plan; si falta se asume "ALMUERZO". */
  categoriaPlan?: PlanCategory | undefined;
  /** Qué incluye cada canje (ej. Sopa, Segundo); solo informativo. */
  incluye?: string[] | undefined;
  tipo: PlanType;
  nombre: string;
  almuerzos: number;
  precioCents: number; // Ej: 5500 = $55,00
  vigenciaDias: number; // Ej: 35
  cupos: number; // Ej: 40
  visibleEnMarketplace: boolean;
  activo: boolean;
};

export type SubscriptionOrigin = "VENTA" | "MIGRADA";
export type SubscriptionStatus = "ACTIVA" | "AGOTADA" | "VENCIDA" | "ANULADA";

export type Subscription = {
  id: string;
  clientId: string;
  templateId: string;
  origen: SubscriptionOrigin;
  almuerzosTotales: number;
  almuerzosRestantes: number;
  compradaEn: string; // ISO
  venceEn: string; // ISO
  estado: SubscriptionStatus;
  anotacion?: string | undefined; // Ej: "Cartulina #14"
};

export type Redemption = {
  id: string;
  subscriptionId: string;
  restaurantId: string;
  staffId: string;
  creadoEn: string; // ISO
  paraLlevar: boolean;
  idempotencyKey: string;
  revierteA?: string | undefined; // ID de redención que anula
};

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "DEUNA";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DEUNA: "Deuna",
};

export type Payment = {
  id: string;
  montoCents: number;
  metodo: PaymentMethod;
  subscriptionId?: string | undefined;
  saleId?: string | undefined;
  cobradoPor: string;
  creadoEn: string; // ISO
  revierteA?: string | undefined; // ID de pago que anula
  fotoComprobante?: string | undefined;
};

export type SaleItem = {
  platoId: string;
  nombre: string;
  cant: number;
  precioCents: number;
  isLunch?: boolean | undefined;
};

export type Sale = {
  id: string;
  restaurantId: string;
  ticket: number;
  items: SaleItem[];
  totalCents: number;
  paraLlevar: boolean;
  mesa?: string | undefined;
  creadoEn: string; // ISO
  revierteA?: string | undefined;
  /** Sellos sumados con esta venta (tarjeta "por plato"), para poder revertirlos al deshacer. */
  sellos?: { clientId: string; cant: number } | undefined;
};

export type MenuDish = {
  id: string;
  nombre: string;
  descripcion: string;
  precioCents?: number | undefined;
  agotado: boolean;
  porciones?: number | undefined;
  foto?: string | undefined;
};

export type MenuSectionId = "desayuno" | "jugo" | "sopa" | "fuerte" | "postre" | "adicional";

/** Secciones que forman el almuerzo del día (todo menos desayunos). */
export const LUNCH_SECTION_IDS: MenuSectionId[] = ["jugo", "sopa", "fuerte", "postre", "adicional"];

/** Desayunos publicados hoy (o [] si el local no publicó ninguno). */
export const breakfastDishes = (menu?: MenuDay): MenuDish[] => menu?.secciones?.desayuno ?? [];

export type MenuDay = {
  restaurantId?: string | undefined;
  fecha: string; // YYYY-MM-DD
  secciones: Record<MenuSectionId, MenuDish[]>;
  publicadoEn?: string | undefined; // ISO
};

export type PlanRequestStatus = "PENDIENTE" | "COBRADA" | "EXPIRADA";

export type PlanRequest = {
  id: string;
  clientId: string;
  templateId: string;
  estado: PlanRequestStatus;
  creadaEn: string; // ISO
};

export type ClaimStatus = "PENDIENTE" | "DEVUELTO" | "RECHAZADO";

export type Claim = {
  id: string;
  redemptionId: string;
  mensaje: string;
  estado: ClaimStatus;
  creadoEn: string; // ISO
  respuesta?: string | undefined;
  resueltoEn?: string | undefined;
};

export type CashClosure = {
  id: string;
  fecha: string; // YYYY-MM-DD
  esperadoCents: number;
  contadoCents: number;
  diferenciaCents: number;
  cerradoEn: string; // ISO
  cerradoPor: string;
  desglose: {
    efectivoCents: number;
    transferenciasCents: number;
    planesCents: number;
    posCents: number;
    almuerzosServidos: number;
    almuerzosLlevar: number;
  };
};

// ----------------------------------------------------------------------------
// P11: OCUPACIÓN & SEMÁFORO
// ----------------------------------------------------------------------------
export type OccupancyStatus = "FLUIDO" | "MOVIDO" | "LLENO";

export type OccupancyInfo = {
  status: OccupancyStatus;
  label: string; // "Fluido" | "Movido" | "Lleno"
  detail: string; // "Llegas y te sientas" | "Hora pico: quizá compartas mesa" | "Lleno ahora. Pídelo para llevar"
  colorClass: string;
  bgClass: string;
  badgeClass: string;
  ratio: number;
  isManual: boolean;
  manualMinutesLeft?: number | undefined;
};

export const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Frente a la PUCE": { lat: -0.2115, lng: -78.4912 },
  "La Floresta": { lat: -0.2085, lng: -78.487 },
  "La Mariscal": { lat: -0.203, lng: -78.4925 },
  "Centro Histórico": { lat: -0.2195, lng: -78.5028 },
  "Cumbayá": { lat: -0.198, lng: -78.435 },
  "Villaflora": { lat: -0.245, lng: -78.521 },
  "UDLA Granados": { lat: -0.165, lng: -78.472 },
  "EPN / Salesiana": { lat: -0.212, lng: -78.49 },
};

export function getSimulatedDistanceKm(fromZone: string | null, toLat: number, toLng: number): number {
  const coords = (fromZone && ZONE_COORDINATES[fromZone]) || ZONE_COORDINATES["Frente a la PUCE"]!;
  const dLat = (toLat - coords.lat) * 111;
  const dLng = (toLng - coords.lng) * 111 * Math.cos((coords.lat * Math.PI) / 180);
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  return Math.max(0.2, Number(dist.toFixed(1)));
}

// ----------------------------------------------------------------------------
// P12: PREÓRDENES INDIVIDUALES Y PARA LLEVAR
// ----------------------------------------------------------------------------
export type OrderStatus = "BORRADOR" | "EN_CAMINO" | "CANJEADA" | "SERVIDA" | "EXPIRADA" | "CANCELADA";
export type OrderType = "AQUI" | "LLEVAR";

export type OrderItem = {
  platoId: string;
  nombre: string;
  seccion: string;
  precioCents?: number | undefined;
};

export type Order = {
  id: string;
  comensalId: string;
  comensalNombre: string;
  restaurantId: string;
  items: OrderItem[];
  tipo: OrderType;
  totalCents: number;
  recargoLlevarCents: number;
  estado: OrderStatus;
  creadaEn: string; // ISO
  venceEn: string; // ISO (30 min desde creada)
  qrPayload: string;
  canjeadaEn?: string | undefined;
  subscriptionIdUsed?: string | undefined;
  paymentIdUsed?: string | undefined;
};

// ----------------------------------------------------------------------------
// P13: TARJETA DE SELLOS
// ----------------------------------------------------------------------------
export type StampCardConfig = {
  restaurantId: string;
  activa: boolean;
  meta: number; // Por defecto 10
  premio: string; // "Almuerzo gratis" | "Postre de la casa"
  /** Nombre que ve el comensal en su tarjeta ("Club La Cuchara"). Opcional por datos guardados antes. */
  nombre?: string | undefined;
  /**
   * Qué suma sellos. "almuerzo": 1 por almuerzo (plan, preorden o mesa).
   * "plato": además, cada plato cobrado en caja (almuerzo suelto o a la carta) suma 1
   * si el dueño elige al cliente al cobrar. Sin valor = "almuerzo".
   */
  cuenta?: StampCountMode | undefined;
};

export type StampCountMode = "almuerzo" | "plato";

export type StampRecord = {
  clientId: string;
  restaurantId: string;
  sellos: number;
  premiosDisponibles: number;
  historiaCanjes: Array<{ fecha: string; motivo: string }>;
};

// ----------------------------------------------------------------------------
// P14: FEEDBACK DE COMENSAL
// ----------------------------------------------------------------------------
export type FeedbackItem = {
  id: string;
  redemptionId: string;
  restaurantId: string;
  clientId: string;
  clientName: string;
  tags: string[]; // "Buena sazón" | "Buena porción" | "Atención rápida" | "Algo no estuvo bien"
  comentarioPrivado?: string | undefined;
  creadoEn: string;
  respuestaRestaurante?: string | undefined;
  respondidoEn?: string | undefined;
};

// ----------------------------------------------------------------------------
// P15: OFERTAS FLASH & REGISTRO DE COMISIONES
// ----------------------------------------------------------------------------
export type FlashOffer = {
  id: string;
  restaurantId: string;
  titulo: string;
  descripcion: string;
  precioCents: number;
  precioOriginalCents: number;
  stockTotal: number;
  stockRestante: number;
  expiraEn: string;
  activa: boolean;
  creadaEn: string;
  /** Sin valor se trata como "FLASH_HOY" (ofertas guardadas antes de existir las modalidades). */
  modalidad?: FlashOfferMode | undefined;
  /** Solo HORA_VALLE: días en que aplica, con el nombre completo (ej. ["Martes", "Jueves"]). */
  diasSemana?: string[] | undefined;
  /** Solo HORA_VALLE: rango "HH:MM - HH:MM" (ej. "16:00 - 18:00"). */
  horarioPromo?: string | undefined;
  porcentajeDescuento?: number | undefined;
};

export type FlashOfferMode = "FLASH_HOY" | "HORA_VALLE";

/** Nombres de día en el orden de Date.getDay() (0 = Domingo). */
export const WEEK_DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
/** Orden de lunes a domingo, para mostrar y guardar los días de una promo. */
export const WEEK_DAYS_MON_FIRST = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

/** Una promo HORA_VALLE vive 30 días desde que se publica; el dueño puede cancelarla antes. */
export const PROMO_VALLE_DURATION_MINUTES = 30 * 24 * 60;

export const offerMode = (offer: Pick<FlashOffer, "modalidad">): FlashOfferMode =>
  offer.modalidad ?? "FLASH_HOY";

const offerTimeLabel = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** "Mar y Jue", "Lun a Vie" o "Todos los días". */
export const promoDaysLabel = (dias: readonly string[]): string => {
  const ordered = WEEK_DAYS_MON_FIRST.filter((d) => dias.includes(d));
  if (ordered.length === 0) return "";
  if (ordered.length === 7) return "Todos los días";
  const short = ordered.map((d) => d.slice(0, 3));
  const idx = ordered.map((d) => WEEK_DAYS_MON_FIRST.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === (idx[i - 1] ?? 0) + 1);
  if (ordered.length >= 3 && consecutive) return `${short[0]} a ${short[short.length - 1]}`;
  if (short.length === 1) return short[0] ?? "";
  return `${short.slice(0, -1).join(", ")} y ${short[short.length - 1]}`;
};

/** ¿Ahora cae dentro del día y horario de la promo? Una oferta flash siempre devuelve true. */
export const isPromoWindowOpen = (offer: FlashOffer, now: Date): boolean => {
  if (offerMode(offer) !== "HORA_VALLE") return true;
  const dias = offer.diasSemana ?? [];
  if (!dias.includes(WEEK_DAYS_ES[now.getDay()] ?? "")) return false;
  const m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(offer.horarioPromo ?? "");
  if (!m) return false;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= start && current < end;
};

/** La promo aplica hoy (día de la semana), aunque todavía no sea su horario. */
export const promoAppliesToday = (offer: FlashOffer, now: Date): boolean =>
  offerMode(offer) !== "HORA_VALLE" ||
  (offer.diasSemana ?? []).includes(WEEK_DAYS_ES[now.getDay()] ?? "");

/** Se puede reservar/comprar ahora mismo: activa, con cupos, vigente y dentro de su horario. */
export const isOfferLiveNow = (offer: FlashOffer, now: Date): boolean =>
  offer.activa &&
  offer.stockRestante > 0 &&
  new Date(offer.expiraEn) >= now &&
  isPromoWindowOpen(offer, now);

/** Etiqueta que ve el comensal: "⚡ Flash · Quedan 5 cupos · hasta 14:00" o "📅 Promo Mar y Jue 16:00 - 18:00 · -20%". */
export const offerBadgeLabel = (offer: FlashOffer): string => {
  if (offerMode(offer) === "HORA_VALLE") {
    const pct = offer.porcentajeDescuento;
    return `📅 Promo ${promoDaysLabel(offer.diasSemana ?? [])} ${offer.horarioPromo ?? ""}${
      pct !== undefined ? ` · -${pct}%` : ""
    }`.replace(/\s+/g, " ").trim();
  }
  const cupos = offer.stockRestante;
  return `⚡ Flash · Quedan ${cupos} ${cupos === 1 ? "cupo" : "cupos"} · hasta ${offerTimeLabel(offer.expiraEn)}`;
};

export type CommissionEntry = {
  id: string;
  tipo: "FLASH_OFFER" | "MARKETPLACE_DEAL";
  referenciaId: string;
  restaurantId: string;
  montoVentaCents: number;
  tasaPorcentaje: number; // 7%
  comisionCents: number;
  creadoEn: string;
};

/** Venta, pago y comisión de una oferta (flash o promo) en centavos enteros. */
function buildOfferRedemption(args: {
  offer: FlashOffer;
  ticket: number;
  nowISO: string;
  metodo: PaymentMethod;
  staffId: string;
  rate: number;
}) {
  const { offer, ticket, nowISO, metodo, staffId, rate } = args;
  const label = offerMode(offer) === "HORA_VALLE" ? "Promo Horas Muertas" : "Oferta Flash";
  const saleId = newId("sale");
  const sale: Sale = {
    id: saleId,
    restaurantId: offer.restaurantId,
    ticket,
    items: [
      {
        platoId: offer.id,
        nombre: `${label}: ${offer.titulo}`,
        cant: 1,
        precioCents: offer.precioCents,
        isLunch: true,
      },
    ],
    totalCents: offer.precioCents,
    paraLlevar: false,
    mesa: label,
    creadoEn: nowISO,
  };
  const payment: Payment = {
    id: newId("pay"),
    montoCents: offer.precioCents,
    metodo,
    saleId,
    cobradoPor: staffId,
    creadoEn: nowISO,
  };
  const comisionCents = calculateCommission(offer.precioCents, rate);
  const commission: CommissionEntry = {
    id: newId("comm"),
    tipo: "FLASH_OFFER",
    referenciaId: offer.id,
    restaurantId: offer.restaurantId,
    montoVentaCents: offer.precioCents,
    tasaPorcentaje: rate,
    comisionCents,
    creadoEn: nowISO,
  };
  return { sale, payment, commission, comisionCents };
}

// ----------------------------------------------------------------------------
// MESA COMPARTIDA / INVITAR A AMIGOS
// ----------------------------------------------------------------------------
export type SharedTableMember = {
  id: string;
  nombre: string;
  esAnfitrion: boolean;
  sopa?: string | undefined;
  fuerte?: string | undefined;
  paraLlevar?: boolean | undefined;
  unidoEn: string;
};

export type SharedTable = {
  id: string; // ej: "m1234"
  restaurantId: string;
  restaurantNombre: string;
  anfitrionNombre: string;
  anfitrionUserId: string;
  hora: string; // ej: "13:00"
  creadaEn: string;
  miembros: SharedTableMember[];
  estado: "ABIERTA" | "EN_CAMINO" | "EN_MESA" | "FINALIZADA";
  // CADA_UNO: cada comensal usa lo suyo. INVITO_YO: el anfitrión paga con su plan todos los almuerzos.
  modo?: SharedTableMode | undefined;
  validadaEn?: string | undefined;
};

export type SharedTableMode = "CADA_UNO" | "INVITO_YO";

/** Número corto del pedido que ven comensal y cocina (#042). Mismo cálculo en ambas vistas. */
export const orderDisplayNumber = (orderId: string): string =>
  orderId.replace(/\D/g, "").padStart(2, "0").slice(-3) || "42";

/** Preorden abierta: falta validar su QR o falta entregarla. */
export const isOrderOpen = (o: { estado: OrderStatus }): boolean =>
  o.estado === "EN_CAMINO" || o.estado === "CANJEADA";

/** Preorden ya validada en caja (descontada del plan o cobrada), pendiente de entregar. */
export const isOrderValidated = (o: { estado: OrderStatus }): boolean => o.estado === "CANJEADA";

export const SHARED_TABLE_QR_PREFIX = "BCD-MESA-";
export const SHARED_TABLE_LUNCH_CENTS = 300;

export type SharedTableLine = {
  memberId: string;
  nombre: string;
  plato: string;
  via: "PLAN" | "PLAN_ANFITRION" | "SUELTO";
  montoCents: number;
};

export type SharedTablePreview =
  | { ok: true; lines: SharedTableLine[]; totalSueltoCents: number; sellos: Array<{ nombre: string; cant: number }> }
  | { ok: false; message: string };

// ----------------------------------------------------------------------------
// USUARIOS DE LA APP (COMENSALES REGISTRADOS)
// ----------------------------------------------------------------------------
export const APP_USERS: AppUser[] = [
  {
    id: "u1",
    name: "Carlos Mejía",
    username: "carlos.mejia",
    email: "carlos.mejia@email.com",
    phone: "0991234567",
  },
  {
    id: "u2",
    name: "Valentina Ortiz",
    username: "valentina.ortiz",
    email: "valentina.ortiz@email.com",
    phone: "0998765432",
  },
  {
    id: "u3",
    name: "Mateo Cevallos",
    username: "mateo.cevallos",
    email: "mateo.c@email.com",
    phone: "0981112233",
  },
  {
    id: "u4",
    name: "Sofía Almeida",
    username: "sofia.almeida",
    email: "sofia.almeida@email.com",
    phone: "0973334455",
  },
  {
    id: "u5",
    name: "Diego Salazar",
    username: "diego.salazar",
    email: "diego.salazar@email.com",
    phone: "0987654321",
  },
];

export const DINER_USER_ID = "u1";
export const RESTAURANT_ID = "r1";
export const OWNER_USER_ID = "u_owner";
export const CASHIER_USER_ID = "u_cashier";

export const DINER_ZONES = [
  "Frente a la PUCE",
  "La Floresta",
  "La Mariscal",
  "Centro Histórico",
  "Cumbayá",
  "UDLA Granados",
  "EPN / Salesiana",
];

// ----------------------------------------------------------------------------
// ESTADO GLOBAL DEL PROTOTIPO
// ----------------------------------------------------------------------------
export type State = {
  simulatedDaysOffset: number; // Adelantar días para el demo
  simulatedMinutesOffset: number; // Adelantar minutos (ej. 20 min para ver feedback y cuentas regresivas)
  activeRole: StaffRole; // "OWNER" o "CASHIER" para el ayudante
  restaurants: Restaurant[];
  staff: Staff[];
  clients: Client[];
  planTemplates: PlanTemplate[];
  subscriptions: Subscription[];
  redemptions: Redemption[];
  payments: Payment[];
  sales: Sale[];
  menuDays: Record<string, MenuDay>; // YYYY-MM-DD o YYYY-MM-DD_restId -> MenuDay
  planRequests: PlanRequest[];
  claims: Claim[];
  cashClosures: CashClosure[];
  orders: Order[];
  stampConfigs: Record<string, StampCardConfig>;
  stampRecords: Record<string, StampRecord>;
  feedbackList: FeedbackItem[];
  flashOffers: FlashOffer[];
  commissionLedger: CommissionEntry[];
  dinerZone: string | null;
  soundEnabled: boolean;
  commissionRate: number;
  scannerDemoScenario: string;
  dinerHasPlanOverride: boolean | null;
  dismissedFeedbackIds: string[];
  sharedTables: SharedTable[];
};

// ----------------------------------------------------------------------------
// FECHAS & RELOJ SIMULADO
// ----------------------------------------------------------------------------
export const getSimulatedDate = (offsetDays = 0): Date => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d;
};

export const toISODate = (d: Date): string => d.toISOString();

export const toDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (d: Date, days: number): Date => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

// ----------------------------------------------------------------------------
// DATOS INICIALES (SEMILLA COHERENTE CON LANDING Y PILOTO EN QUITO)
// ----------------------------------------------------------------------------
const baseDate = new Date();
const dateKeyToday = toDateKey(baseDate);

const initialRestaurants: Restaurant[] = [
  {
    id: RESTAURANT_ID,
    nombre: "La Cuchara de San Blas",
    zona: "Frente a la PUCE",
    puestos: 28,
    anotarMesa: false,
    precioSueltoCents: 300, // $3,00 suelto
    recargoParaLlevarCents: 25, // $0,25 tarrina
    lat: -0.2115,
    lng: -78.4912,
    horario: "11:30 - 15:30",
    abierto: true,
    descripcionCorta: "Comida casera tradicional frente a la PUCE",
    direccion: "Av. 12 de Octubre N24-110 y La Católica",
    tags: ["Comida casera", "Sazón quiteña", "Opción vegetariana"],
  },
  {
    id: "r2",
    nombre: "Verde Limón",
    zona: "La Floresta",
    puestos: 18,
    anotarMesa: false,
    precioSueltoCents: 325,
    recargoParaLlevarCents: 30,
    lat: -0.2085,
    lng: -78.487,
    horario: "12:00 - 15:30",
    abierto: true,
    descripcionCorta: "Almuerzos saludables y ensaladas en La Floresta",
    direccion: "Calle Madrid 1159 y Coruña, La Floresta",
    tags: ["Saludable", "Ensaladas frescas", "Céntrico"],
  },
  {
    id: "r3",
    nombre: "El Rincón Manabita",
    zona: "La Mariscal",
    puestos: 24,
    anotarMesa: false,
    precioSueltoCents: 350,
    recargoParaLlevarCents: 25,
    lat: -0.203,
    lng: -78.4925,
    horario: "11:30 - 16:00",
    abierto: true,
    descripcionCorta: "Especialidad en mariscos y sazón manaba tradicional",
    direccion: "Av. Amazonas N22-48 y Calle Mariscal Foch",
    tags: ["Mariscos frescos", "Plátano verde", "Porción generosa"],
  },
  {
    id: "r4",
    nombre: "Sazón Criolla",
    zona: "Cumbayá",
    puestos: 32,
    anotarMesa: false,
    precioSueltoCents: 375,
    recargoParaLlevarCents: 35,
    lat: -0.198,
    lng: -78.435,
    horario: "12:00 - 16:00",
    abierto: true,
    descripcionCorta: "Almuerzo ejecutivo universitario junto a la USFQ",
    direccion: "Av. Pampite y Vía Interoceánica, edif. Platinum Plaza",
    tags: ["Almuerzos ejecutivos", "Ambiente universitario", "Rápido"],
  },
  {
    id: "r5",
    nombre: "Don Vicho Almuerzos",
    zona: "Villaflora",
    puestos: 16,
    anotarMesa: false,
    precioSueltoCents: 275,
    recargoParaLlevarCents: 20,
    lat: -0.245,
    lng: -78.521,
    horario: "11:00 - 14:30",
    abierto: false,
    descripcionCorta: "El almuerzo rendidor y económico del sur de Quito",
    direccion: "Av. Rodrigo de Chávez OE1-24 y 5 de Junio",
    tags: ["Económico", "Sopa criolla"],
  },
];

const initialStaff: Staff[] = [
  {
    id: "st1",
    userId: OWNER_USER_ID,
    restaurantId: RESTAURANT_ID,
    rol: "OWNER",
    nombre: "María Guamán",
    telefono: "0995551122",
  },
  {
    id: "st2",
    userId: CASHIER_USER_ID,
    restaurantId: RESTAURANT_ID,
    rol: "CASHIER",
    nombre: "Juanito (Caja)",
    telefono: "0984443322",
  },
];

const initialPlanTemplates: PlanTemplate[] = [
  // La Cuchara de San Blas (r1)
  {
    id: "p-semanal",
    restaurantId: RESTAURANT_ID,
    tipo: "Semanal",
    nombre: "Plan semanal",
    almuerzos: 5,
    precioCents: 1500, // $15,00 ($3,00 c/u)
    vigenciaDias: 7,
    cupos: 20,
    visibleEnMarketplace: true,
    activo: true,
  },
  {
    id: "p-quincenal",
    restaurantId: RESTAURANT_ID,
    tipo: "Quincenal",
    nombre: "Plan quincenal",
    almuerzos: 10,
    precioCents: 2800, // $28,00 ($2,80 c/u, ahorra $2)
    vigenciaDias: 18,
    cupos: 30,
    visibleEnMarketplace: true,
    activo: true,
  },
  {
    id: "p-mensual",
    restaurantId: RESTAURANT_ID,
    tipo: "Mensual",
    nombre: "Plan mensual ejecutivo",
    almuerzos: 20,
    precioCents: 5500, // $55,00 ($2,75 c/u, ahorra $5 al mes)
    vigenciaDias: 35,
    cupos: 40,
    visibleEnMarketplace: true,
    activo: true,
  },
  // Verde Limón (r2)
  {
    id: "p-r2-semanal",
    restaurantId: "r2",
    tipo: "Semanal",
    nombre: "Semanal Verde",
    almuerzos: 5,
    precioCents: 1600,
    vigenciaDias: 7,
    cupos: 15,
    visibleEnMarketplace: true,
    activo: true,
  },
  {
    id: "p-r2-mensual",
    restaurantId: "r2",
    tipo: "Mensual",
    nombre: "Mensual Saludable",
    almuerzos: 20,
    precioCents: 6000,
    vigenciaDias: 35,
    cupos: 25,
    visibleEnMarketplace: true,
    activo: true,
  },
  // El Rincón Manabita (r3)
  {
    id: "p-r3-quincenal",
    restaurantId: "r3",
    tipo: "Quincenal",
    nombre: "Quincenal Manaba",
    almuerzos: 10,
    precioCents: 3300,
    vigenciaDias: 18,
    cupos: 20,
    visibleEnMarketplace: true,
    activo: true,
  },
  {
    id: "p-r3-mensual",
    restaurantId: "r3",
    tipo: "Mensual",
    nombre: "Mensual Costeño",
    almuerzos: 20,
    precioCents: 6500,
    vigenciaDias: 35,
    cupos: 30,
    visibleEnMarketplace: true,
    activo: true,
  },
  // Sazón Criolla (r4)
  {
    id: "p-r4-mensual",
    restaurantId: "r4",
    tipo: "Mensual",
    nombre: "Mensual USFQ",
    almuerzos: 20,
    precioCents: 6800,
    vigenciaDias: 35,
    cupos: 35,
    visibleEnMarketplace: true,
    activo: true,
  },
];

const initialClients: Client[] = [
  {
    id: "c1",
    restaurantId: RESTAURANT_ID,
    userId: "u1", // Carlos Mejía
    nombre: "Carlos Mejía",
    telefono: "0991234567",
    correo: "carlos.mejia@email.com",
  },
  {
    id: "c1-r2",
    restaurantId: "r2",
    userId: "u1", // Carlos Mejía en Verde Limón
    nombre: "Carlos Mejía",
    telefono: "0991234567",
    correo: "carlos.mejia@email.com",
  },
  {
    id: "c2",
    restaurantId: RESTAURANT_ID,
    userId: "u2", // Valentina Ortiz
    nombre: "Valentina Ortiz",
    telefono: "0998765432",
    correo: "valentina.ortiz@email.com",
  },
  {
    id: "c3",
    restaurantId: RESTAURANT_ID,
    userId: "u4", // Sofía Almeida
    nombre: "Sofía Almeida",
    telefono: "0973334455",
    correo: "sofia.almeida@email.com",
  },
  {
    id: "c4",
    restaurantId: RESTAURANT_ID,
    nombre: "Diego Salazar (Cartulina)",
    telefono: "0987654321",
    correo: "diego.salazar@gmail.com",
  },
  {
    id: "c5",
    restaurantId: RESTAURANT_ID,
    nombre: "Laura Méndez",
    telefono: "0981223344",
    correo: "laura.mendez@gmail.com",
  },
  {
    id: "c6",
    restaurantId: RESTAURANT_ID,
    nombre: "Diego Ramos",
    telefono: "0998877665",
    correo: "diego.ramos@outlook.com",
  },
  {
    id: "c7",
    restaurantId: RESTAURANT_ID,
    nombre: "Sofía Cruz",
    telefono: "0981122334",
    correo: "sofia.cruz@gmail.com",
  },
  {
    id: "c8",
    restaurantId: RESTAURANT_ID,
    nombre: "Juan Pérez",
    telefono: "0993344556",
    correo: "juan.perez@empresa.ec",
  },
  {
    id: "c9",
    restaurantId: RESTAURANT_ID,
    nombre: "Andrea Villacís",
    telefono: "0994455667",
    correo: "andrea.villacis@outlook.com",
  },
  {
    id: "c10",
    restaurantId: RESTAURANT_ID,
    nombre: "Mateo Cárdenas",
    telefono: "0985566778",
    correo: "mateo.cardenas@gmail.com",
  },
  {
    id: "c11",
    restaurantId: RESTAURANT_ID,
    nombre: "Gabriela Morales",
    telefono: "0976677889",
    correo: "gabriela.morales@empresa.ec",
  },
  {
    id: "c12",
    restaurantId: RESTAURANT_ID,
    nombre: "Fernando Paredes",
    telefono: "0997788990",
    correo: "fernando.paredes@yahoo.es",
  },
];

const initialSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    clientId: "c1", // Carlos en La Cuchara de San Blas
    templateId: "p-mensual",
    origen: "VENTA",
    almuerzosTotales: 20,
    almuerzosRestantes: 14,
    compradaEn: addDays(baseDate, -6).toISOString(),
    venceEn: addDays(baseDate, 29).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-r2-1",
    clientId: "c1-r2", // Carlos en Verde Limón
    templateId: "p-r2-semanal",
    origen: "VENTA",
    almuerzosTotales: 5,
    almuerzosRestantes: 4,
    compradaEn: addDays(baseDate, -2).toISOString(),
    venceEn: addDays(baseDate, 5).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-2",
    clientId: "c2", // Valentina
    templateId: "p-mensual",
    origen: "VENTA",
    almuerzosTotales: 20,
    almuerzosRestantes: 20,
    compradaEn: addDays(baseDate, -1).toISOString(),
    venceEn: addDays(baseDate, 34).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-3",
    clientId: "c3", // Sofía
    templateId: "p-quincenal",
    origen: "VENTA",
    almuerzosTotales: 10,
    almuerzosRestantes: 7,
    compradaEn: addDays(baseDate, -3).toISOString(),
    venceEn: addDays(baseDate, 15).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-4",
    clientId: "c4", // Diego (cartulina migrada)
    templateId: "p-quincenal",
    origen: "MIGRADA",
    almuerzosTotales: 10,
    almuerzosRestantes: 3,
    compradaEn: addDays(baseDate, -10).toISOString(),
    venceEn: addDays(baseDate, 8).toISOString(),
    estado: "ACTIVA",
    anotacion: "Cartulina física #12",
  },
  {
    id: "sub-5",
    clientId: "c5", // Laura Méndez
    templateId: "p-mensual",
    origen: "VENTA",
    almuerzosTotales: 20,
    almuerzosRestantes: 18,
    compradaEn: addDays(baseDate, -4).toISOString(),
    venceEn: addDays(baseDate, 31).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-6",
    clientId: "c6", // Diego Ramos
    templateId: "p-semanal",
    origen: "VENTA",
    almuerzosTotales: 5,
    almuerzosRestantes: 4,
    compradaEn: addDays(baseDate, -2).toISOString(),
    venceEn: addDays(baseDate, 8).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-7",
    clientId: "c7", // Sofía Cruz
    templateId: "p-quincenal",
    origen: "VENTA",
    almuerzosTotales: 10,
    almuerzosRestantes: 8,
    compradaEn: addDays(baseDate, -5).toISOString(),
    venceEn: addDays(baseDate, 14).toISOString(),
    estado: "ACTIVA",
  },
  {
    id: "sub-8",
    clientId: "c8", // Juan Pérez
    templateId: "p-semanal",
    origen: "VENTA",
    almuerzosTotales: 5,
    almuerzosRestantes: 2,
    compradaEn: addDays(baseDate, -3).toISOString(),
    venceEn: addDays(baseDate, 7).toISOString(),
    estado: "ACTIVA",
  },
];

const initialPayments: Payment[] = [
  {
    id: "pay-1",
    montoCents: 5500,
    metodo: "TRANSFERENCIA",
    subscriptionId: "sub-1",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -6).toISOString(),
  },
  {
    id: "pay-2",
    montoCents: 5500,
    metodo: "EFECTIVO",
    subscriptionId: "sub-2",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -1).toISOString(),
  },
  {
    id: "pay-3",
    montoCents: 2800,
    metodo: "TRANSFERENCIA",
    subscriptionId: "sub-3",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -3).toISOString(),
  },
  {
    id: "pay-4",
    montoCents: 600,
    metodo: "EFECTIVO",
    saleId: "sale-init-1",
    cobradoPor: "st1",
    creadoEn: new Date(baseDate.getTime() - 15 * 60000).toISOString(),
  },
  {
    id: "pay-5",
    montoCents: 5500,
    metodo: "TRANSFERENCIA",
    subscriptionId: "sub-5",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -4).toISOString(),
  },
  {
    id: "pay-6",
    montoCents: 1750,
    metodo: "EFECTIVO",
    subscriptionId: "sub-6",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -2).toISOString(),
  },
  {
    id: "pay-7",
    montoCents: 2800,
    metodo: "TRANSFERENCIA",
    subscriptionId: "sub-7",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -5).toISOString(),
  },
  {
    id: "pay-8",
    montoCents: 1750,
    metodo: "EFECTIVO",
    subscriptionId: "sub-8",
    cobradoPor: "st1",
    creadoEn: addDays(baseDate, -3).toISOString(),
  },
];

const initialRedemptions: Redemption[] = [
  {
    id: "red-1",
    subscriptionId: "sub-1",
    restaurantId: RESTAURANT_ID,
    staffId: "st1",
    creadoEn: new Date(baseDate.getTime() - 10 * 60000).toISOString(),
    paraLlevar: false,
    idempotencyKey: `init-red-1`,
  },
  {
    id: "red-2",
    subscriptionId: "sub-3",
    restaurantId: RESTAURANT_ID,
    staffId: "st1",
    creadoEn: new Date(baseDate.getTime() - 55 * 60000).toISOString(),
    paraLlevar: true,
    idempotencyKey: `init-red-2`,
  },
];

const initialSales: Sale[] = [
  {
    id: "sale-init-1",
    restaurantId: RESTAURANT_ID,
    ticket: 147,
    items: [
      { platoId: "d-fuerte-1", nombre: "Seco de pollo tierno", cant: 2, precioCents: 300 },
    ],
    totalCents: 600,
    paraLlevar: false,
    mesa: "Mesa 4",
    creadoEn: new Date(baseDate.getTime() - 15 * 60000).toISOString(),
  },
];

const initialMenuToday: MenuDay = {
  restaurantId: RESTAURANT_ID,
  fecha: dateKeyToday,
  publicadoEn: new Date(baseDate.setHours(9, 30, 0, 0)).toISOString(),
  secciones: {
    desayuno: [
      {
        id: "d-desa-1",
        nombre: "Bolón mixto + Café pasado",
        descripcion: "Bolón de verde con queso y chicharrón, café de la casa",
        precioCents: 250,
        agotado: false,
        porciones: 20,
      },
      {
        id: "d-desa-2",
        nombre: "Tigrillo con huevo y queso",
        descripcion: "Verde majado con huevo frito y queso fresco",
        precioCents: 275,
        agotado: false,
        porciones: 15,
      },
      {
        id: "d-desa-3",
        nombre: "Humita + Agua aromática",
        descripcion: "Humita tierna al vapor con agua de hierbas",
        precioCents: 200,
        agotado: false,
        porciones: 12,
      },
    ],
    sopa: [
      {
        id: "d-sopa-1",
        nombre: "Locro de papa con queso y aguacate",
        descripcion: "Sopa tradicional con papa chola y queso tierno",
        agotado: false,
        porciones: 40,
      },
    ],
    fuerte: [
      {
        id: "d-fuerte-1",
        nombre: "Seco de pollo tierno con maduro frito",
        descripcion: "Acompañado de arroz amarillo y ensalada fresca",
        precioCents: 300,
        agotado: false,
        porciones: 25,
      },
      {
        id: "d-fuerte-2",
        nombre: "Chuleta ahumada al grill con menestra",
        descripcion: "Menestra de lenteja casera y arroz blanco",
        precioCents: 325,
        agotado: false,
        porciones: 15,
      },
      {
        id: "d-fuerte-3",
        nombre: "Bowl veggie de quinoa y champiñones",
        descripcion: "Opción vegetariana balanceada del día",
        precioCents: 325,
        agotado: false,
        porciones: 8,
      },
    ],
    jugo: [
      {
        id: "d-jugo-1",
        nombre: "Jugo natural de naranjilla",
        descripcion: "Hecho con fruta fresca de temporada",
        agotado: false,
      },
    ],
    postre: [
      {
        id: "d-postre-1",
        nombre: "Higos con queso fresco",
        descripcion: "Dulce tradicional andino",
        agotado: true, // Demostración de agotado
      },
    ],
    adicional: [
      {
        id: "d-adic-1",
        nombre: "Porción de aguacate entero",
        descripcion: "Hass maduro",
        precioCents: 75,
        agotado: false,
      },
      {
        id: "d-adic-2",
        nombre: "Huevo frito a la minuta",
        descripcion: "Yema tierna",
        precioCents: 50,
        agotado: false,
      },
    ],
  },
};

const initialMenuR2: MenuDay = {
  restaurantId: "r2",
  fecha: dateKeyToday,
  publicadoEn: new Date(baseDate.setHours(10, 15, 0, 0)).toISOString(),
  secciones: {
    desayuno: [],
    sopa: [
      {
        id: "d-r2-sopa-1",
        nombre: "Crema de zapallo con semillas tostadas",
        descripcion: "Suave crema de calabaza criolla",
        agotado: false,
      },
    ],
    fuerte: [
      {
        id: "d-r2-fuerte-1",
        nombre: "Pechuga al romero con quinoa y ensalada",
        descripcion: "Pollo a la plancha con vinagreta de la casa",
        precioCents: 325,
        agotado: false,
      },
      {
        id: "d-r2-fuerte-2",
        nombre: "Salteado de vegetales crocantes y champiñones",
        descripcion: "Opción 100% vegetariana",
        precioCents: 325,
        agotado: false,
      },
    ],
    jugo: [
      {
        id: "d-r2-jugo-1",
        nombre: "Limonada de hierbabuena",
        descripcion: "Bebida refrescante sin azúcar refinada",
        agotado: false,
      },
    ],
    postre: [],
    adicional: [],
  },
};

const initialMenuR3: MenuDay = {
  restaurantId: "r3",
  fecha: dateKeyToday,
  publicadoEn: new Date(baseDate.setHours(9, 45, 0, 0)).toISOString(),
  secciones: {
    desayuno: [],
    sopa: [
      {
        id: "d-r3-sopa-1",
        nombre: "Viche de pescado manabita tradicional",
        descripcion: "Con maní tostado, choclo y plátano verde",
        agotado: false,
      },
    ],
    fuerte: [
      {
        id: "d-r3-fuerte-1",
        nombre: "Pescado frito apanado con patacones",
        descripcion: "Corvina fresca con arroz y ensalada",
        precioCents: 350,
        agotado: false,
      },
      {
        id: "d-r3-fuerte-2",
        nombre: "Cazuela de mariscos al horno de leña",
        descripcion: "Cremosa masa de verde con camarón y calamar",
        precioCents: 375,
        agotado: false,
      },
    ],
    jugo: [
      {
        id: "d-r3-jugo-1",
        nombre: "Jugo natural de maracuyá",
        descripcion: "Fruta fresca de la costa",
        agotado: false,
      },
    ],
    postre: [],
    adicional: [],
  },
};

const initialMenuR4: MenuDay = {
  restaurantId: "r4",
  fecha: dateKeyToday,
  publicadoEn: new Date(baseDate.setHours(10, 0, 0, 0)).toISOString(),
  secciones: {
    desayuno: [],
    sopa: [
      {
        id: "d-r4-sopa-1",
        nombre: "Caldo de gallina de campo",
        descripcion: "Con yuca suave y cilantro",
        agotado: false,
      },
    ],
    fuerte: [
      {
        id: "d-r4-fuerte-1",
        nombre: "Seco de carne con arroz y aguacate",
        descripcion: "Carne suave guisada a fuego lento",
        precioCents: 375,
        agotado: false,
      },
    ],
    jugo: [
      {
        id: "d-r4-jugo-1",
        nombre: "Jugo de mora silvestre",
        descripcion: "Hecho al instante",
        agotado: false,
      },
    ],
    postre: [],
    adicional: [],
  },
};

/** Migra menús guardados antes de existir "desayuno": agrega la sección y siembra los de r1. */
function normalizeMenuDays(menuDays: Record<string, MenuDay>): Record<string, MenuDay> {
  const out: Record<string, MenuDay> = {};
  for (const [key, menu] of Object.entries(menuDays)) {
    if (menu.secciones.desayuno) {
      out[key] = menu;
      continue;
    }
    const isR1Today = key === dateKeyToday || key === `${dateKeyToday}_${RESTAURANT_ID}`;
    out[key] = {
      ...menu,
      secciones: {
        ...menu.secciones,
        desayuno: isR1Today ? (initialMenuToday.secciones.desayuno ?? []) : [],
      },
    };
  }
  return out;
}

const initialOrders: Order[] = [
  {
    id: "ord-1",
    comensalId: "u1", // Carlos Mejía
    comensalNombre: "Carlos Mejía",
    restaurantId: RESTAURANT_ID,
    items: [
      { platoId: "d-sopa-1", nombre: "Locro de papa con queso y aguacate", seccion: "sopa" },
      { platoId: "d-fuerte-1", nombre: "Seco de pollo tierno con maduro frito", seccion: "fuerte" },
    ],
    tipo: "LLEVAR",
    totalCents: 325,
    recargoLlevarCents: 25,
    estado: "EN_CAMINO",
    creadaEn: new Date(baseDate.getTime() - 8 * 60000).toISOString(),
    venceEn: new Date(baseDate.getTime() + 22 * 60000).toISOString(),
    qrPayload: `BCD-ORD.ord-1.u1.${Date.now()}`,
  },
  {
    id: "ord-2",
    comensalId: "u2", // Valentina Ortiz
    comensalNombre: "Valentina Ortiz",
    restaurantId: RESTAURANT_ID,
    items: [
      { platoId: "d-sopa-1", nombre: "Locro de papa con queso y aguacate", seccion: "sopa" },
      { platoId: "d-fuerte-2", nombre: "Chuleta ahumada al grill con menestra", seccion: "fuerte" },
    ],
    tipo: "AQUI",
    totalCents: 300,
    recargoLlevarCents: 0,
    estado: "EN_CAMINO",
    creadaEn: new Date(baseDate.getTime() - 14 * 60000).toISOString(),
    venceEn: new Date(baseDate.getTime() + 16 * 60000).toISOString(),
    qrPayload: `BCD-ORD.ord-2.u2.${Date.now()}`,
  },
];

const initialStampConfigs: Record<string, StampCardConfig> = {
  [RESTAURANT_ID]: {
    restaurantId: RESTAURANT_ID,
    activa: true,
    meta: 10,
    premio: "Almuerzo gratis",
    nombre: "Club La Cuchara",
  },
  r2: {
    restaurantId: "r2",
    activa: true,
    meta: 10,
    premio: "Postre especial de la casa",
  },
  r3: {
    restaurantId: "r3",
    activa: true,
    meta: 10,
    premio: "Porción de empanadas de verde",
  },
  r4: {
    restaurantId: "r4",
    activa: true,
    meta: 10,
    premio: "Almuerzo ejecutivo gratis",
  },
};

const initialStampRecords: Record<string, StampRecord> = {
  // Misma clave que getClientStampRecord: `${clientId}_${restaurantId}`
  [`c1_${RESTAURANT_ID}`]: {
    clientId: "c1", // Carlos Mejía
    restaurantId: RESTAURANT_ID,
    sellos: 7, // 7 de 10 sellos acumulados
    premiosDisponibles: 0,
    historiaCanjes: [],
  },
};

const initialFeedbackList: FeedbackItem[] = [
  {
    id: "fb-1",
    redemptionId: "red-prev-1",
    restaurantId: RESTAURANT_ID,
    clientId: "c1",
    clientName: "Carlos Mejía",
    tags: ["Buena sazón", "Buena porción", "Atención rápida"],
    comentarioPrivado: "El locro de papa estaba insuperable hoy. Muy rápido el despacho.",
    creadoEn: addDays(baseDate, -1).toISOString(),
    respuestaRestaurante: "¡Muchas gracias Carlos! Mañana tendremos seco de carne especial.",
    respondidoEn: addDays(baseDate, -1).toISOString(),
  },
  {
    id: "fb-2",
    redemptionId: "red-prev-2",
    restaurantId: RESTAURANT_ID,
    clientId: "c3",
    clientName: "Sofía Almeida",
    tags: ["Buena sazón", "Atención rápida"],
    creadoEn: addDays(baseDate, -2).toISOString(),
  },
];

const initialFlashOffers: FlashOffer[] = [
  {
    id: "flash-1",
    restaurantId: RESTAURANT_ID,
    titulo: "Almuerzo completo + dulce de higos",
    descripcion: "Seco de pollo o chuleta + locro + dulce de higos con queso",
    precioCents: 275, // $2,75 vs regular $3,50
    precioOriginalCents: 350,
    stockTotal: 8,
    stockRestante: 5,
    expiraEn: new Date(baseDate.getTime() + 90 * 60000).toISOString(),
    // Inactiva de fábrica: solo hay oferta cuando el dueño la publica
    activa: false,
    creadaEn: baseDate.toISOString(),
  },
];

const initialCommissionLedger: CommissionEntry[] = [
  {
    id: "com-1",
    tipo: "FLASH_OFFER",
    referenciaId: "flash-prev-1",
    restaurantId: RESTAURANT_ID,
    montoVentaCents: 275,
    tasaPorcentaje: 7,
    comisionCents: 19, // $0,19
    creadoEn: addDays(baseDate, -2).toISOString(),
  },
  {
    id: "com-2",
    tipo: "FLASH_OFFER",
    referenciaId: "flash-prev-2",
    restaurantId: RESTAURANT_ID,
    montoVentaCents: 275,
    tasaPorcentaje: 7,
    comisionCents: 19, // $0,19
    creadoEn: addDays(baseDate, -1).toISOString(),
  },
];

export const initialState: State = {
  simulatedDaysOffset: 0,
  simulatedMinutesOffset: 0,
  activeRole: "OWNER",
  restaurants: initialRestaurants,
  staff: initialStaff,
  clients: initialClients,
  planTemplates: initialPlanTemplates,
  subscriptions: initialSubscriptions,
  redemptions: initialRedemptions,
  payments: initialPayments,
  sales: initialSales,
  menuDays: {
    [dateKeyToday]: initialMenuToday,
    [`${dateKeyToday}_${RESTAURANT_ID}`]: initialMenuToday,
    [`${dateKeyToday}_r2`]: initialMenuR2,
    [`${dateKeyToday}_r3`]: initialMenuR3,
    [`${dateKeyToday}_r4`]: initialMenuR4,
  },
  planRequests: [
    {
      id: "req-1",
      clientId: "c1",
      templateId: "p-mensual",
      estado: "PENDIENTE",
      creadaEn: addDays(baseDate, -0.1).toISOString(),
    },
  ],
  claims: [],
  cashClosures: [],
  orders: initialOrders,
  stampConfigs: initialStampConfigs,
  stampRecords: initialStampRecords,
  feedbackList: initialFeedbackList,
  flashOffers: initialFlashOffers,
  commissionLedger: initialCommissionLedger,
  dinerZone: "Frente a la PUCE",
  soundEnabled: true,
  commissionRate: DEFAULT_COMMISSION_RATE,
  scannerDemoScenario: "NORMAL",
  dinerHasPlanOverride: null,
  dismissedFeedbackIds: [],
  sharedTables: [
    {
      id: "m1234",
      restaurantId: RESTAURANT_ID,
      restaurantNombre: "La Cuchara de San Blas",
      anfitrionNombre: "Carlos Mejía",
      anfitrionUserId: "u1",
      hora: "13:00",
      creadaEn: new Date(baseDate.getTime() - 10 * 60000).toISOString(),
      miembros: [
        {
          id: "mem-1",
          nombre: "Carlos Mejía",
          esAnfitrion: true,
          sopa: "Locro de papa con queso y aguacate",
          fuerte: "Seco de pollo tierno con maduro frito",
          paraLlevar: false,
          unidoEn: new Date(baseDate.getTime() - 10 * 60000).toISOString(),
        },
      ],
      estado: "ABIERTA",
    },
  ],
};

// ----------------------------------------------------------------------------
// COMPATIBILIDAD CON TIPOS DE UI ANTERIORES
// ----------------------------------------------------------------------------
export type Plan = {
  id: string;
  type: string;
  name: string;
  lunches: number;
  price: number;
  days: number;
  clients: number;
  active: boolean;
};

export type TxnIcon = "user" | "bag" | "utensils";

export type Txn = {
  id: string;
  icon: TxnIcon;
  name: string;
  detail: string;
  value: string;
  positive: boolean;
  timestamp?: string;
};

export type PosLine = { name: string; qty: number; price: number; isLunch: boolean };

export type ChargeTarget = { kind: "user"; user: AppUser } | { kind: "client"; client: Client };

// ----------------------------------------------------------------------------
// STORE HOOK & PROVIDER
// ----------------------------------------------------------------------------
function useBocadooState() {
  const [state, setState] = useState<State>(initialState);
  const booted = useRef(false);
  const skipPersist = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Inicialización desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        skipPersist.current = true;
        const parsed = JSON.parse(raw) as Partial<State>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          // Conservar estructura mínima ante migraciones
          restaurants: parsed.restaurants?.length ? parsed.restaurants : prev.restaurants,
          staff: parsed.staff?.length ? parsed.staff : prev.staff,
          planTemplates: parsed.planTemplates?.length ? parsed.planTemplates : prev.planTemplates,
          clients: parsed.clients?.length
            ? [...parsed.clients, ...initialClients.filter(ic => !parsed.clients?.some(pc => pc.id === ic.id))]
            : prev.clients,
          subscriptions: parsed.subscriptions?.length
            ? [...parsed.subscriptions, ...initialSubscriptions.filter(is => !parsed.subscriptions?.some(ps => ps.id === is.id))]
            : prev.subscriptions,
          menuDays: parsed.menuDays ? normalizeMenuDays(parsed.menuDays) : prev.menuDays,
          orders: parsed.orders || prev.orders,
          stampConfigs: parsed.stampConfigs || prev.stampConfigs,
          stampRecords: parsed.stampRecords || prev.stampRecords,
          feedbackList: parsed.feedbackList || prev.feedbackList,
          flashOffers: parsed.flashOffers || prev.flashOffers,
          commissionLedger: parsed.commissionLedger || prev.commissionLedger,
          sharedTables: parsed.sharedTables || prev.sharedTables,
          simulatedMinutesOffset: parsed.simulatedMinutesOffset ?? prev.simulatedMinutesOffset,
        }));
      }
    } catch (e) {
      console.warn("No se pudo cargar localStorage:", e);
    }
    booted.current = true;
  }, []);

  // Sincronización entre pestañas (BroadcastChannel + storage event)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const ch = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = ch;
      ch.onmessage = (event) => {
        if (event.data?.type === "SYNC" && event.data.state) {
          skipPersist.current = true;
          setState(event.data.state);
        }
      };
    } catch {
      // BroadcastChannel no soportado
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          skipPersist.current = true;
          setState(parsed);
        } catch {
          // Ignorado
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      channelRef.current?.close();
    };
  }, []);

  // Guardado en localStorage y difusión a otras pestañas
  useEffect(() => {
    if (!booted.current) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      channelRef.current?.postMessage({ type: "SYNC", state });
    } catch {
      // Ignorado si almacenamiento lleno
    }
  }, [state]);

  // --------------------------------------------------------------------------
  // RELOJ & FECHAS SIMULADAS
  // --------------------------------------------------------------------------
  const simulatedToday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + state.simulatedDaysOffset);
    d.setMinutes(d.getMinutes() + state.simulatedMinutesOffset);
    return d;
  }, [state.simulatedDaysOffset, state.simulatedMinutesOffset]);

  const simulatedTodayKey = useMemo(() => toDateKey(simulatedToday), [simulatedToday]);
  const simulatedTodayISO = useMemo(() => simulatedToday.toISOString(), [simulatedToday]);

  const advanceDemoDays = useCallback((days: number) => {
    setState((s) => ({ ...s, simulatedDaysOffset: s.simulatedDaysOffset + days }));
  }, []);

  const advanceSimulatedMinutes = useCallback((mins: number) => {
    setState((s) => ({ ...s, simulatedMinutesOffset: s.simulatedMinutesOffset + mins }));
  }, []);

  const resetDemoData = useCallback(() => {
    setState(initialState);
  }, []);

  const setStaffRole = useCallback((role: StaffRole) => {
    setState((s) => ({ ...s, activeRole: role }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, soundEnabled: enabled }));
  }, []);

  // --------------------------------------------------------------------------
  // RECALCULO DE SUSCRIPCIONES (ACTIVA / AGOTADA / VENCIDA / ANULADA)
  // --------------------------------------------------------------------------
  const activeRestaurant = useMemo(
    () => state.restaurants[0] || initialRestaurants[0]!,
    [state.restaurants],
  );

  const evaluatedSubscriptions = useMemo(() => {
    return state.subscriptions.map((sub): Subscription => {
      if (sub.estado === "ANULADA") return sub;
      if (sub.almuerzosRestantes <= 0) return { ...sub, estado: "AGOTADA" };
      if (new Date(sub.venceEn) < simulatedToday) return { ...sub, estado: "VENCIDA" };
      return { ...sub, estado: "ACTIVA" };
    });
  }, [state.subscriptions, simulatedToday]);

  // Suscripciones activas para un cliente ordenadas por FIFO (vence primero)
  const activeSubsForClient = useCallback(
    (clientId: string) => {
      return evaluatedSubscriptions
        .filter((s) => s.clientId === clientId && s.estado === "ACTIVA")
        .sort((a, b) => new Date(a.venceEn).getTime() - new Date(b.venceEn).getTime());
    },
    [evaluatedSubscriptions],
  );

  // --------------------------------------------------------------------------
  // SELECTORES CALCULADOS (VENTAS, SERVIDOS HOY, CLIENTES ACTIVOS)
  // --------------------------------------------------------------------------
  // Ventas del mes: suma de pagos no revertidos en el mes simulado
  const salesThisMonthCents = useMemo(() => {
    const currentMonth = simulatedToday.getMonth();
    const currentYear = simulatedToday.getFullYear();
    const revertedIds = new Set(
      state.payments.filter((p) => p.revierteA).map((p) => p.revierteA!),
    );

    return state.payments.reduce((sum, p) => {
      if (p.revierteA || revertedIds.has(p.id)) return sum;
      const d = new Date(p.creadoEn);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + p.montoCents;
      }
      return sum;
    }, 0);
  }, [state.payments, simulatedToday]);

  // Almuerzos servidos hoy (redenciones no revertidas + ítems almuerzo en ventas POS)
  const servedToday = useMemo(() => {
    const revertedRedemptions = new Set(
      state.redemptions.filter((r) => r.revierteA).map((r) => r.revierteA!),
    );
    const redemptionsCount = state.redemptions.filter((r) => {
      if (r.revierteA || revertedRedemptions.has(r.id)) return false;
      return toDateKey(new Date(r.creadoEn)) === simulatedTodayKey;
    }).length;

    const revertedSales = new Set(state.sales.filter((s) => s.revierteA).map((s) => s.revierteA!));
    const salesLunchesCount = state.sales.reduce((sum, s) => {
      if (s.revierteA || revertedSales.has(s.id)) return sum;
      if (toDateKey(new Date(s.creadoEn)) !== simulatedTodayKey) return sum;
      const lunches = s.items.reduce(
        (isum, item) => isum + (item.isLunch ? item.cant : 0),
        0,
      );
      return sum + lunches;
    }, 0);

    return redemptionsCount + salesLunchesCount;
  }, [state.redemptions, state.sales, simulatedTodayKey]);

  // Clientes activos: cantidad de clientes con al menos 1 suscripción activa
  const activeClients = useMemo(() => {
    const activeClientIds = new Set(
      evaluatedSubscriptions
        .filter((s) => s.estado === "ACTIVA" && s.almuerzosRestantes > 0)
        .map((s) => s.clientId),
    );
    return activeClientIds.size;
  }, [evaluatedSubscriptions]);

  // Almuerzos que debes a clientes (pasivo diferido)
  const owedLunchesReport = useMemo(() => {
    const active = evaluatedSubscriptions.filter((s) => s.estado === "ACTIVA");
    const totalLunches = active.reduce((sum, s) => sum + s.almuerzosRestantes, 0);
    // Valor estimado en base al precio promedio del almuerzo en planes ($2,75)
    const approxValueCents = totalLunches * 275;
    return {
      totalLunches,
      approxValueCents,
      subscriptionsCount: active.length,
    };
  }, [evaluatedSubscriptions]);

  // Planes por renovar esta semana (le quedan <= 3 almuerzos o vencen en <= 3 días)
  const expiringSoonSubscriptions = useMemo(() => {
    const threeDaysLater = addDays(simulatedToday, 3);
    return evaluatedSubscriptions.filter((s) => {
      if (s.estado !== "ACTIVA") return false;
      const daysLeft =
        (new Date(s.venceEn).getTime() - simulatedToday.getTime()) / (1000 * 60 * 60 * 24);
      return s.almuerzosRestantes <= 3 || (daysLeft <= 3 && daysLeft >= 0);
    });
  }, [evaluatedSubscriptions, simulatedToday]);

  // --------------------------------------------------------------------------
  // HISTORIAL COMBINADO DE TRANSACCIONES (DUEÑO Y COMENSAL)
  // --------------------------------------------------------------------------
  const transactions: Txn[] = useMemo(() => {
    const list: Txn[] = [];
    const clientMap = new Map(state.clients.map((c) => [c.id, c]));
    const templateMap = new Map(state.planTemplates.map((t) => [t.id, t]));
    const subMap = new Map(evaluatedSubscriptions.map((s) => [s.id, s]));

    // 1. Pagos / Ventas de planes
    state.payments.forEach((p) => {
      if (p.subscriptionId) {
        const sub = subMap.get(p.subscriptionId);
        const client = sub ? clientMap.get(sub.clientId) : undefined;
        const template = sub ? templateMap.get(sub.templateId) : undefined;
        const isRevert = Boolean(p.revierteA);
        list.push({
          id: p.id,
          icon: "bag",
          name: client?.nombre || "Cliente Bocadoo",
          detail: isRevert
            ? `Cobro deshecho · ${new Date(p.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`
            : `${template?.nombre || "Plan"} · ${new Date(p.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
          value: isRevert ? `-${money(p.montoCents)}` : money(p.montoCents),
          positive: !isRevert,
          timestamp: p.creadoEn,
        });
      }
    });

    // 2. Redenciones de almuerzos
    state.redemptions.forEach((r) => {
      const sub = subMap.get(r.subscriptionId);
      const client = sub ? clientMap.get(sub.clientId) : undefined;
      const isRevert = Boolean(r.revierteA);
      list.push({
        id: r.id,
        icon: "utensils",
        name: client?.nombre || "Comensal",
        detail: isRevert
          ? `Almuerzo devuelto · ${new Date(r.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`
          : `Almuerzo consumido${r.paraLlevar ? " (Llevar)" : ""} · ${new Date(r.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
        value: isRevert ? "+1 almuerzo" : "Validado",
        positive: isRevert,
        timestamp: r.creadoEn,
      });
    });

    // 3. Ventas directas POS
    state.sales.forEach((s) => {
      const isRevert = Boolean(s.revierteA);
      list.push({
        id: s.id,
        icon: "utensils",
        name: `Venta sin app · Ticket #${String(s.ticket).padStart(4, "0")}`,
        detail: `${s.items.length} ${s.items.length === 1 ? "ítem" : "ítems"}${s.paraLlevar ? " · Para llevar" : ""} · ${new Date(s.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
        value: isRevert ? `-${money(s.totalCents)}` : money(s.totalCents),
        positive: !isRevert,
        timestamp: s.creadoEn,
      });
    });

    return list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [state.payments, state.redemptions, state.sales, state.clients, state.planTemplates, evaluatedSubscriptions]);

  // Historial específico para el comensal
  const dinerTransactions = useMemo(() => {
    const client = state.clients.find((c) => c.userId === DINER_USER_ID);
    if (!client) return [];
    const clientSubIds = new Set(state.subscriptions.filter((s) => s.clientId === client.id).map((s) => s.id));

    const list: Array<{ id: string; icon: TxnIcon; name: string; detail: string; value: string; positive: boolean; timestamp: string }> = [];

    state.redemptions.forEach((r) => {
      if (clientSubIds.has(r.subscriptionId)) {
        const isRevert = Boolean(r.revierteA);
        list.push({
          id: r.id,
          icon: "utensils",
          name: "La Cuchara de San Blas",
          detail: isRevert
            ? `Almuerzo restituido · ${new Date(r.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`
            : `Almuerzo consumido${r.paraLlevar ? " (Para llevar)" : ""} · ${new Date(r.creadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
          value: isRevert ? "+1 devuelto" : "− 1",
          positive: isRevert,
          timestamp: r.creadoEn,
        });
      }
    });

    state.payments.forEach((p) => {
      if (p.subscriptionId && clientSubIds.has(p.subscriptionId)) {
        list.push({
          id: p.id,
          icon: "bag",
          name: "La Cuchara de San Blas",
          detail: `Compra de plan · ${PAYMENT_METHOD_LABEL[p.metodo]}`,
          value: money(p.montoCents),
          positive: false,
          timestamp: p.creadoEn,
        });
      }
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.redemptions, state.payments, state.clients, state.subscriptions]);

  // --------------------------------------------------------------------------
  // BÚSQUEDAS & MATCHING DE CLIENTES
  // --------------------------------------------------------------------------
  const findAppUser = useCallback((email: string, phone: string) => {
    const e = normalizeEmail(email);
    const p = normalizePhone(phone);
    return APP_USERS.find(
      (u) =>
        (e && normalizeEmail(u.email) === e) ||
        (p.length >= 9 && normalizePhone(u.phone) === p),
    );
  }, []);

  const findContact = useCallback(
    (email: string, phone: string) => {
      const e = normalizeEmail(email);
      const p = normalizePhone(phone);
      return state.clients.find(
        (c) =>
          !c.userId &&
          ((e && normalizeEmail(c.correo) === e) ||
            (p.length >= 9 && normalizePhone(c.telefono) === p)),
      );
    },
    [state.clients],
  );

  const clientForUser = useCallback(
    (userId: string) => {
      const client = state.clients.find((c) => c.userId === userId);
      if (!client) return undefined;
      const subs = activeSubsForClient(client.id);
      const totalLunchesLeft = subs.reduce((sum, s) => sum + s.almuerzosRestantes, 0);
      const primarySub = subs[0];
      const template = primarySub
        ? state.planTemplates.find((t) => t.id === primarySub.templateId)
        : undefined;

      return {
        ...client,
        name: client.nombre,
        email: client.correo,
        phone: client.telefono,
        lunchesLeft: totalLunchesLeft,
        planId: primarySub?.templateId,
        planName: template?.nombre || (subs.length ? "Plan prepagado" : undefined),
        expiresAt: primarySub?.venceEn,
        activeSubscriptions: subs,
      };
    },
    [state.clients, activeSubsForClient, state.planTemplates],
  );

  // --------------------------------------------------------------------------
  // ACCIONES DEL DOMINIO
  // --------------------------------------------------------------------------

  // P1: Actualizar restaurante y puestos
  const updateRestaurant = useCallback((data: Partial<Restaurant>) => {
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r, i) => (i === 0 ? { ...r, ...data } : r)),
    }));
  }, []);

  // P2: Pasar cartulinas a Bocadoo (migración rápida sin pago)
  const migrateCard = useCallback(
    (params: {
      nombre: string;
      telefono: string;
      correo?: string;
      templateId: string;
      almuerzosRestantes: number;
      venceEnDias?: number;
      anotacion?: string;
      staffId?: string;
    }) => {
      const {
        nombre,
        telefono,
        correo = "",
        templateId,
        almuerzosRestantes,
        venceEnDias = 30,
        anotacion,
        staffId = "st1",
      } = params;

      const normPhone = normalizePhone(telefono);
      const normEmail = normalizeEmail(correo);

      // Buscar si ya existe usuario o cliente
      const appUser = APP_USERS.find(
        (u) =>
          normalizePhone(u.phone) === normPhone ||
          (normEmail && normalizeEmail(u.email) === normEmail),
      );

      let clientId = "";
      let newClients = [...state.clients];

      const existingClient = state.clients.find(
        (c) =>
          normalizePhone(c.telefono) === normPhone ||
          (normEmail && normalizeEmail(c.correo) === normEmail),
      );

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        clientId = newId("c");
        const client: Client = {
          id: clientId,
          restaurantId: RESTAURANT_ID,
          userId: appUser?.id,
          nombre: nombre.trim(),
          telefono: normPhone,
          correo: normEmail || (appUser ? appUser.email : `${clientId}@cartulina.bocadoo`),
        };
        newClients = [client, ...newClients];
      }

      const template =
        state.planTemplates.find((t) => t.id === templateId) || state.planTemplates[0];
      const templateLunches = template?.almuerzos || 20;

      const subscriptionId = newId("sub");
      const newSubscription: Subscription = {
        id: subscriptionId,
        clientId,
        templateId: template?.id || templateId,
        origen: "MIGRADA",
        almuerzosTotales: Math.max(templateLunches, almuerzosRestantes),
        almuerzosRestantes,
        compradaEn: simulatedTodayISO,
        venceEn: addDays(simulatedToday, venceEnDias).toISOString(),
        estado: almuerzosRestantes > 0 ? "ACTIVA" : "AGOTADA",
        anotacion: anotacion || "Migrado desde cartulina física",
      };

      setState((s) => ({
        ...s,
        clients: newClients,
        subscriptions: [newSubscription, ...s.subscriptions],
      }));

      return { clientId, subscriptionId, appUser };
    },
    [state.clients, state.planTemplates, simulatedToday, simulatedTodayISO],
  );

  // P3: Crear y editar planes
  const addPlan = useCallback(
    (template: Omit<PlanTemplate, "id" | "restaurantId">) => {
      const id = newId("p");
      const newT: PlanTemplate = {
        ...template,
        id,
        restaurantId: RESTAURANT_ID,
      };
      setState((s) => ({
        ...s,
        planTemplates: [...s.planTemplates, newT],
      }));
      return newT;
    },
    [],
  );

  const updatePlan = useCallback((id: string, updates: Partial<PlanTemplate>) => {
    setState((s) => ({
      ...s,
      planTemplates: s.planTemplates.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const togglePlan = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      planTemplates: s.planTemplates.map((p) =>
        p.id === id ? { ...p, activo: !p.activo } : p,
      ),
    }));
  }, []);

  // P4: Vender y activar plan en caja (1 toque, con payment)
  const sellPlan = useCallback(
    (params: {
      target: ChargeTarget;
      template: PlanTemplate;
      metodo: PaymentMethod;
      staffId?: string | undefined;
      fotoComprobante?: string | undefined;
    }) => {
      const { target, template, metodo, staffId = "st1", fotoComprobante } = params;

      // 1. Identificar o crear cliente
      let client =
        target.kind === "client"
          ? state.clients.find((c) => c.id === target.client.id)
          : state.clients.find((c) => c.userId === target.user.id);

      let newClients = [...state.clients];
      if (!client) {
        if (target.kind === "user") {
          client = {
            id: newId("c"),
            restaurantId: RESTAURANT_ID,
            userId: target.user.id,
            nombre: target.user.name,
            telefono: target.user.phone,
            correo: target.user.email,
          };
        } else {
          client = target.client;
        }
        newClients = [client, ...newClients];
      }

      // 2. Crear suscripción nueva e independiente (NUNCA SUMAR a una existente)
      const subId = newId("sub");
      const newSub: Subscription = {
        id: subId,
        clientId: client.id,
        templateId: template.id,
        origen: "VENTA",
        almuerzosTotales: template.almuerzos,
        almuerzosRestantes: template.almuerzos,
        compradaEn: simulatedTodayISO,
        venceEn: addDays(simulatedToday, template.vigenciaDias).toISOString(),
        estado: "ACTIVA",
      };

      // 3. Crear pago
      const payId = newId("pay");
      const newPay: Payment = {
        id: payId,
        montoCents: template.precioCents,
        metodo,
        subscriptionId: subId,
        cobradoPor: staffId,
        creadoEn: simulatedTodayISO,
        fotoComprobante,
      };

      // 4. Reducir cupos del plan si aplica
      const updatedTemplates = state.planTemplates.map((t) =>
        t.id === template.id ? { ...t, cupos: Math.max(0, t.cupos - 1) } : t,
      );

      setState((s) => ({
        ...s,
        clients: newClients,
        subscriptions: [newSub, ...s.subscriptions],
        payments: [newPay, ...s.payments],
        planTemplates: updatedTemplates,
      }));

      return { subscription: newSub, payment: newPay, client };
    },
    [state.clients, state.planTemplates, simulatedToday, simulatedTodayISO],
  );

  // Deshacer cobro de plan (búfer 10s)
  const undoPayment = useCallback(
    (paymentId: string, staffId = "st1") => {
      const payment = state.payments.find((p) => p.id === paymentId);
      if (!payment || payment.revierteA) return false;

      const revPayId = newId("pay-rev");
      const reversalPayment: Payment = {
        id: revPayId,
        montoCents: -payment.montoCents,
        metodo: payment.metodo,
        subscriptionId: payment.subscriptionId,
        cobradoPor: staffId,
        creadoEn: simulatedTodayISO,
        revierteA: payment.id,
      };

      // Si tenía suscripción asociada y aún no se ha usado, anularla
      let updatedSubs = state.subscriptions;
      if (payment.subscriptionId) {
        updatedSubs = state.subscriptions.map((s) =>
          s.id === payment.subscriptionId ? { ...s, estado: "ANULADA" } : s,
        );
      }

      setState((s) => ({
        ...s,
        payments: [reversalPayment, ...s.payments],
        subscriptions: updatedSubs,
      }));

      return true;
    },
    [state.payments, state.subscriptions, simulatedTodayISO],
  );

  // P5: Validar almuerzo (descuento en 1 toque usando FIFO)
  const redeemLunch = useCallback(
    (params: {
      clientId?: string | undefined;
      userId?: string | undefined;
      subscriptionId?: string | undefined;
      paraLlevar?: boolean | undefined;
      idempotencyKey?: string | undefined;
      staffId?: string | undefined;
    }) => {
      const {
        clientId: explicitClientId,
        userId,
        subscriptionId: explicitSubId,
        paraLlevar = false,
        idempotencyKey = newId("idem"),
        staffId = "st1",
      } = params;

      // 1. Verificar idempotencia
      const alreadyRedeemed = state.redemptions.find(
        (r) => r.idempotencyKey === idempotencyKey && !r.revierteA,
      );
      if (alreadyRedeemed) {
        return {
          status: "ALREADY_REDEEMED" as const,
          redemption: alreadyRedeemed,
          message: "Este código ya fue validado hace instantes.",
        };
      }

      // 2. Determinar cliente
      let client = state.clients.find(
        (c) => c.id === explicitClientId || (userId && c.userId === userId),
      );
      if (!client && userId) {
        client = clientForUser(userId);
      }
      if (!client) {
        return {
          status: "CLIENT_NOT_FOUND" as const,
          message: "Comensal no encontrado en este restaurante.",
        };
      }

      // 3. Obtener suscripciones activas ordenadas por vencimiento más próximo (FIFO)
      const activeSubs = explicitSubId
        ? evaluatedSubscriptions.filter((s) => s.id === explicitSubId && s.estado === "ACTIVA")
        : activeSubsForClient(client.id);

      if (activeSubs.length === 0) {
        // Verificar si tiene vencidas o agotadas
        const allClientSubs = evaluatedSubscriptions.filter((s) => s.clientId === client.id);
        const hasExpired = allClientSubs.some((s) => s.estado === "VENCIDA");
        return {
          status: (hasExpired ? "EXPIRED" : "NO_BALANCE") as "EXPIRED" | "NO_BALANCE",
          client,
          message: hasExpired
            ? "El plan de este comensal ya venció."
            : "Comensal sin almuerzos disponibles.",
        };
      }

      const chosenSub = activeSubs[0]!;
      const nextRemaining = chosenSub.almuerzosRestantes - 1;
      const isLastLunch = nextRemaining === 0;

      const redemptionId = newId("red");
      const newRedemption: Redemption = {
        id: redemptionId,
        subscriptionId: chosenSub.id,
        restaurantId: RESTAURANT_ID,
        staffId,
        creadoEn: simulatedTodayISO,
        paraLlevar,
        idempotencyKey,
      };

      const updatedSubs = state.subscriptions.map((s) =>
        s.id === chosenSub.id
          ? {
              ...s,
              almuerzosRestantes: nextRemaining,
              estado: nextRemaining <= 0 ? "AGOTADA" : s.estado,
            }
          : s,
      );

      // P13: Actualizar sellos si la tarjeta de sellos está activa
      const targetRestId = chosenSub.templateId ? (state.planTemplates.find((t) => t.id === chosenSub.templateId)?.restaurantId || RESTAURANT_ID) : RESTAURANT_ID;
      const stampCfg = state.stampConfigs[targetRestId];
      let updatedStampRecords = state.stampRecords;
      if (stampCfg && stampCfg.activa) {
        const stampKey = `${client.id}_${targetRestId}`;
        const currentStamp = updatedStampRecords[stampKey] || {
          clientId: client.id,
          restaurantId: targetRestId,
          sellos: 0,
          premiosDisponibles: 0,
          historiaCanjes: [],
        };
        const nextSellos = currentStamp.sellos + 1;
        const reachedReward = nextSellos >= stampCfg.meta;
        updatedStampRecords = {
          ...updatedStampRecords,
          [stampKey]: {
            ...currentStamp,
            sellos: reachedReward ? nextSellos - stampCfg.meta : nextSellos,
            premiosDisponibles: reachedReward
              ? currentStamp.premiosDisponibles + 1
              : currentStamp.premiosDisponibles,
            historiaCanjes: [
              { fecha: simulatedTodayISO, motivo: "Almuerzo validado con plan" },
              ...currentStamp.historiaCanjes,
            ],
          },
        };
      }

      setState((s) => ({
        ...s,
        subscriptions: updatedSubs,
        redemptions: [newRedemption, ...s.redemptions],
        stampRecords: updatedStampRecords,
      }));

      // Comprobar si vence pronto (en <= 3 días)
      const daysLeft =
        (new Date(chosenSub.venceEn).getTime() - simulatedToday.getTime()) / (1000 * 60 * 60 * 24);
      const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;

      return {
        status: "SUCCESS" as const,
        redemption: newRedemption,
        client,
        subscription: chosenSub,
        lunchesLeft: nextRemaining,
        isLastLunch,
        isExpiringSoon,
      };
    },
    [state.redemptions, state.clients, state.subscriptions, state.planTemplates, state.stampConfigs, state.stampRecords, clientForUser, activeSubsForClient, evaluatedSubscriptions, simulatedToday, simulatedTodayISO],
  );

  // Deshacer validación de almuerzo (búfer 10s)
  const undoRedemption = useCallback(
    (redemptionId: string, staffId = "st1") => {
      const red = state.redemptions.find((r) => r.id === redemptionId);
      if (!red || red.revierteA) return false;

      const revId = newId("red-rev");
      const reversal: Redemption = {
        id: revId,
        subscriptionId: red.subscriptionId,
        restaurantId: red.restaurantId,
        staffId,
        creadoEn: simulatedTodayISO,
        paraLlevar: red.paraLlevar,
        idempotencyKey: `rev-${red.idempotencyKey}`,
        revierteA: red.id,
      };

      // Restituir el almuerzo a la suscripción
      const updatedSubs = state.subscriptions.map((s) =>
        s.id === red.subscriptionId
          ? {
              ...s,
              almuerzosRestantes: s.almuerzosRestantes + 1,
              estado: s.estado === "AGOTADA" ? "ACTIVA" : s.estado,
            }
          : s,
      );

      // Revertir sello si corresponde
      let updatedStampRecords = state.stampRecords;
      const sub = state.subscriptions.find((s) => s.id === red.subscriptionId);
      if (sub) {
        const stampKey = `${sub.clientId}_${red.restaurantId}`;
        const currentStamp = updatedStampRecords[stampKey];
        if (currentStamp && currentStamp.sellos > 0) {
          updatedStampRecords = {
            ...updatedStampRecords,
            [stampKey]: {
              ...currentStamp,
              sellos: currentStamp.sellos - 1,
            },
          };
        }
      }

      setState((s) => ({
        ...s,
        redemptions: [reversal, ...s.redemptions],
        subscriptions: updatedSubs,
        stampRecords: updatedStampRecords,
      }));

      return true;
    },
    [state.redemptions, state.subscriptions, state.stampRecords, simulatedTodayISO],
  );

  // P6: POS / Venta rápida de caja
  const posSale = useCallback(
    (params: {
      items: SaleItem[];
      totalCents: number;
      paraLlevar: boolean;
      mesa?: string | undefined;
      metodo: PaymentMethod;
      staffId?: string | undefined;
      /** Tarjeta "por plato": cliente al que se le suman sellos y cuántos platos lleva. */
      stamps?: { clientId: string; cant: number } | undefined;
    }) => {
      const { items, totalCents, paraLlevar, mesa, metodo, staffId = "st1" } = params;
      const saleId = newId("sale");
      const nextTicket = state.sales.length + 148;

      const stampCfg = state.stampConfigs[RESTAURANT_ID];
      const stamps =
        stampCfg?.activa && stampCfg.cuenta === "plato" && params.stamps && params.stamps.cant > 0
          ? params.stamps
          : undefined;

      const newSale: Sale = {
        id: saleId,
        restaurantId: RESTAURANT_ID,
        ticket: nextTicket,
        items,
        totalCents,
        paraLlevar,
        mesa,
        creadoEn: simulatedTodayISO,
        sellos: stamps,
      };

      // Sumar sellos: al llegar a la meta se gana un premio y la tarjeta vuelve a empezar
      let updatedStampRecords = state.stampRecords;
      if (stamps && stampCfg) {
        const key = `${stamps.clientId}_${RESTAURANT_ID}`;
        const current = updatedStampRecords[key] || {
          clientId: stamps.clientId,
          restaurantId: RESTAURANT_ID,
          sellos: 0,
          premiosDisponibles: 0,
          historiaCanjes: [],
        };
        const total = current.sellos + stamps.cant;
        updatedStampRecords = {
          ...updatedStampRecords,
          [key]: {
            ...current,
            sellos: total % stampCfg.meta,
            premiosDisponibles: current.premiosDisponibles + Math.floor(total / stampCfg.meta),
          },
        };
      }

      const newPayment: Payment = {
        id: newId("pay"),
        montoCents: totalCents,
        metodo,
        saleId,
        cobradoPor: staffId,
        creadoEn: simulatedTodayISO,
      };

      // Reducir porciones de platos si aplica
      const todayMenu = state.menuDays[simulatedTodayKey];
      let updatedMenuDays = state.menuDays;
      if (todayMenu) {
        const itemQtyMap = new Map<string, number>();
        items.forEach((it) =>
          itemQtyMap.set(it.platoId, (itemQtyMap.get(it.platoId) ?? 0) + it.cant),
        );
        const updatedSections = { ...todayMenu.secciones };
        (Object.keys(updatedSections) as MenuSectionId[]).forEach((sec) => {
          updatedSections[sec] = updatedSections[sec].map((d) => {
            const soldQty = itemQtyMap.get(d.id);
            if (soldQty && d.porciones !== undefined) {
              const remaining = Math.max(0, d.porciones - soldQty);
              return { ...d, porciones: remaining, agotado: remaining === 0 };
            }
            return d;
          });
        });
        updatedMenuDays = {
          ...state.menuDays,
          [simulatedTodayKey]: { ...todayMenu, secciones: updatedSections },
        };
      }

      setState((s) => ({
        ...s,
        sales: [newSale, ...s.sales],
        payments: [newPayment, ...s.payments],
        menuDays: updatedMenuDays,
        stampRecords: updatedStampRecords,
      }));

      return { sale: newSale, payment: newPayment };
    },
    [
      state.sales,
      state.menuDays,
      state.stampConfigs,
      state.stampRecords,
      simulatedTodayKey,
      simulatedTodayISO,
    ],
  );

  // Deshacer venta POS (10 s)
  const undoSale = useCallback(
    (saleId: string, staffId = "st1") => {
      const sale = state.sales.find((s) => s.id === saleId);
      if (!sale || sale.revierteA) return false;

      const revSaleId = newId("sale-rev");
      const reversalSale: Sale = {
        id: revSaleId,
        restaurantId: sale.restaurantId,
        ticket: sale.ticket,
        items: sale.items.map((it) => ({ ...it, cant: -it.cant })),
        totalCents: -sale.totalCents,
        paraLlevar: sale.paraLlevar,
        mesa: sale.mesa,
        creadoEn: simulatedTodayISO,
        revierteA: sale.id,
      };

      const reversalPayment: Payment = {
        id: newId("pay-rev"),
        montoCents: -sale.totalCents,
        metodo: "EFECTIVO",
        saleId: revSaleId,
        cobradoPor: staffId,
        creadoEn: simulatedTodayISO,
        revierteA: sale.id,
      };

      // Si la venta sumó sellos, se quitan (sin bajar de 0 ni tocar premios ya ganados)
      let updatedStampRecords = state.stampRecords;
      if (sale.sellos) {
        const key = `${sale.sellos.clientId}_${sale.restaurantId}`;
        const current = updatedStampRecords[key];
        if (current) {
          updatedStampRecords = {
            ...updatedStampRecords,
            [key]: { ...current, sellos: Math.max(0, current.sellos - sale.sellos.cant) },
          };
        }
      }

      setState((s) => ({
        ...s,
        sales: [reversalSale, ...s.sales],
        payments: [reversalPayment, ...s.payments],
        stampRecords: updatedStampRecords,
      }));

      return true;
    },
    [state.sales, state.stampRecords, simulatedTodayISO],
  );

  // P7: Menú del día
  const publishMenu = useCallback(
    (menuDay: Omit<MenuDay, "fecha"> & { fecha?: string | undefined }) => {
      const fecha = menuDay.fecha || simulatedTodayKey;
      setState((s) => ({
        ...s,
        menuDays: {
          ...s.menuDays,
          [fecha]: { ...menuDay, fecha, publicadoEn: simulatedTodayISO },
        },
      }));
    },
    [simulatedTodayKey, simulatedTodayISO],
  );

  const toggleSoldOut = useCallback(
    (dishId: string) => {
      const todayMenu = state.menuDays[simulatedTodayKey] || initialMenuToday;
      const updatedSections = { ...todayMenu.secciones };
      (Object.keys(updatedSections) as MenuSectionId[]).forEach((sec) => {
        updatedSections[sec] = updatedSections[sec].map((dish) =>
          dish.id === dishId ? { ...dish, agotado: !dish.agotado } : dish,
        );
      });

      setState((s) => ({
        ...s,
        menuDays: {
          ...s.menuDays,
          [simulatedTodayKey]: { ...todayMenu, secciones: updatedSections },
        },
      }));
    },
    [state.menuDays, simulatedTodayKey],
  );

  const copyPreviousMenu = useCallback(
    (daysBack = 1) => {
      const targetDate = addDays(simulatedToday, -daysBack);
      const targetKey = toDateKey(targetDate);
      const prevMenu = state.menuDays[targetKey] || state.menuDays[dateKeyToday] || initialMenuToday;

      const newMenu: MenuDay = {
        fecha: simulatedTodayKey,
        publicadoEn: simulatedTodayISO,
        secciones: JSON.parse(JSON.stringify(prevMenu.secciones)),
      };
      // Quitar agotados al copiar
      (Object.keys(newMenu.secciones) as MenuSectionId[]).forEach((sec) => {
        newMenu.secciones[sec] = newMenu.secciones[sec].map((d) => ({
          ...d,
          agotado: false,
        }));
      });

      publishMenu(newMenu);
      return newMenu;
    },
    [simulatedToday, state.menuDays, simulatedTodayKey, simulatedTodayISO, publishMenu],
  );

  // P4 Comensal: Solicitar plan desde la app
  const requestPlan = useCallback(
    (templateId: string, userId = DINER_USER_ID) => {
      const template = state.planTemplates.find((t) => t.id === templateId);
      const targetRestId = template?.restaurantId || RESTAURANT_ID;

      let client = state.clients.find((c) => c.userId === userId && c.restaurantId === targetRestId);
      let newClients = [...state.clients];
      if (!client) {
        const u = APP_USERS.find((user) => user.id === userId);
        client = {
          id: newId("c"),
          restaurantId: targetRestId,
          userId,
          nombre: u?.name || "Carlos Mejía",
          telefono: u?.phone || "0991234567",
          correo: u?.email || "carlos.mejia@email.com",
        };
        newClients = [client, ...newClients];
      }

      const reqId = newId("req");
      const newReq: PlanRequest = {
        id: reqId,
        clientId: client.id,
        templateId,
        estado: "PENDIENTE",
        creadaEn: simulatedTodayISO,
      };

      setState((s) => ({
        ...s,
        clients: newClients,
        planRequests: [newReq, ...s.planRequests],
      }));

      return newReq;
    },
    [state.clients, state.planTemplates, simulatedTodayISO],
  );

  const getActiveSubsForUserAndRestaurant = useCallback(
    (userId: string, restaurantId: string) => {
      const userClients = state.clients.filter((c) => c.userId === userId);
      const clientIds = new Set(userClients.map((c) => c.id));
      return evaluatedSubscriptions.filter((s) => {
        if (!clientIds.has(s.clientId)) return false;
        if (s.estado !== "ACTIVA" || s.almuerzosRestantes <= 0) return false;
        const tpl = state.planTemplates.find((t) => t.id === s.templateId);
        return tpl?.restaurantId === restaurantId;
      });
    },
    [state.clients, evaluatedSubscriptions, state.planTemplates],
  );

  const confirmPlanRequest = useCallback(
    (requestId: string, metodo: PaymentMethod = "EFECTIVO", staffId = "st1") => {
      const req = state.planRequests.find((r) => r.id === requestId);
      if (!req || req.estado !== "PENDIENTE") return null;

      const template = state.planTemplates.find((t) => t.id === req.templateId);
      const client = state.clients.find((c) => c.id === req.clientId);
      if (!template || !client) return null;

      const result = sellPlan({
        target: { kind: "client", client },
        template,
        metodo,
        staffId,
      });

      setState((s) => ({
        ...s,
        planRequests: s.planRequests.map((r) =>
          r.id === requestId ? { ...r, estado: "COBRADA" } : r,
        ),
      }));

      return result;
    },
    [state.planRequests, state.planTemplates, state.clients, sellPlan],
  );

  // P8: Extender vencimiento de plan
  const extendSubscription = useCallback(
    (subscriptionId: string, days = 5) => {
      setState((s) => ({
        ...s,
        subscriptions: s.subscriptions.map((sub) => {
          if (sub.id !== subscriptionId) return sub;
          const currentVence = new Date(sub.venceEn);
          const nextVence = addDays(currentVence, days);
          return {
            ...sub,
            venceEn: nextVence.toISOString(),
            estado: sub.almuerzosRestantes > 0 ? "ACTIVA" : sub.estado,
          };
        }),
      }));
    },
    [],
  );

  // P9: Reclamos y correcciones
  const fileClaim = useCallback(
    (first: { redemptionId: string; mensaje: string } | string, second?: string) => {
      const redemptionId = typeof first === "string" ? first : first.redemptionId;
      const mensaje = typeof first === "string" ? (second || "") : first.mensaje;
      const claim: Claim = {
        id: newId("claim"),
        redemptionId,
        mensaje: mensaje.trim() || "No reconozco este consumo",
        estado: "PENDIENTE",
        creadoEn: simulatedTodayISO,
      };
      setState((s) => ({ ...s, claims: [claim, ...s.claims] }));
      return claim;
    },
    [simulatedTodayISO],
  );

  const refundRedemption = useCallback(
    (claimId: string, staffId = "st1", respuesta = "Almuerzo restituido por reclamo") => {
      const claim = state.claims.find((c) => c.id === claimId);
      if (!claim || claim.estado !== "PENDIENTE") return false;

      undoRedemption(claim.redemptionId, staffId);

      setState((s) => ({
        ...s,
        claims: s.claims.map((c) =>
          c.id === claimId
            ? { ...c, estado: "DEVUELTO", respuesta, resueltoEn: simulatedTodayISO }
            : c,
        ),
      }));

      return true;
    },
    [state.claims, undoRedemption, simulatedTodayISO],
  );

  const dismissClaim = useCallback(
    (claimId: string, respuesta = "Consumo confirmado en caja") => {
      setState((s) => ({
        ...s,
        claims: s.claims.map((c) =>
          c.id === claimId
            ? { ...c, estado: "RECHAZADO", respuesta, resueltoEn: simulatedTodayISO }
            : c,
        ),
      }));
      return true;
    },
    [simulatedTodayISO],
  );

  // P10: Cierre de caja
  const closeCash = useCallback(
    (contadoCents: number, staffId = "st1") => {
      const todayPayments = state.payments.filter((p) => {
        if (p.revierteA) return false;
        return toDateKey(new Date(p.creadoEn)) === simulatedTodayKey;
      });

      const efectivoCents = todayPayments
        .filter((p) => p.metodo === "EFECTIVO")
        .reduce((sum, p) => sum + p.montoCents, 0);

      const transferenciasCents = todayPayments
        .filter((p) => p.metodo === "TRANSFERENCIA" || p.metodo === "DEUNA")
        .reduce((sum, p) => sum + p.montoCents, 0);

      const planesCents = todayPayments
        .filter((p) => p.subscriptionId)
        .reduce((sum, p) => sum + p.montoCents, 0);

      const posCents = todayPayments
        .filter((p) => p.saleId)
        .reduce((sum, p) => sum + p.montoCents, 0);

      const almuerzosLlevar = state.redemptions.filter((r) => {
        if (r.revierteA) return false;
        return r.paraLlevar && toDateKey(new Date(r.creadoEn)) === simulatedTodayKey;
      }).length;

      const esperadoCents = efectivoCents; // El efectivo que debe estar en gaveta
      const diferenciaCents = contadoCents - esperadoCents;

      const closure: CashClosure = {
        id: newId("close"),
        fecha: simulatedTodayKey,
        esperadoCents,
        contadoCents,
        diferenciaCents,
        cerradoEn: simulatedTodayISO,
        cerradoPor: staffId,
        desglose: {
          efectivoCents,
          transferenciasCents,
          planesCents,
          posCents,
          almuerzosServidos: servedToday,
          almuerzosLlevar,
        },
      };

      setState((s) => ({
        ...s,
        cashClosures: [closure, ...s.cashClosures],
      }));

      return closure;
    },
    [state.payments, state.redemptions, simulatedTodayKey, simulatedTodayISO, servedToday],
  );

  const setDinerZone = useCallback((zone: string) => {
    setState((s) => ({ ...s, dinerZone: zone }));
  }, []);

  // --------------------------------------------------------------------------
  // P11: SEMÁFORO DE OCUPACIÓN Y HORA PICO
  // --------------------------------------------------------------------------
  const getRestaurantOccupancy = useCallback(
    (restaurantId: string): OccupancyInfo | null => {
      const restaurant = state.restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) return null;

      // Regla P11: "Si el restaurante no registró ventas sin app hoy, el semáforo no se muestra."
      const salesToday = state.sales.filter(
        (s) =>
          s.restaurantId === restaurantId &&
          !s.revierteA &&
          toDateKey(new Date(s.creadoEn)) === simulatedTodayKey,
      );
      if (salesToday.length === 0) {
        return null;
      }

      // Interruptor manual de dueño [Local lleno] (dura 20 min)
      if (restaurant.manualBusyUntil) {
        const busyUntilDate = new Date(restaurant.manualBusyUntil);
        if (busyUntilDate > simulatedToday) {
          const minutesLeft = Math.max(
            1,
            Math.ceil((busyUntilDate.getTime() - simulatedToday.getTime()) / 60000),
          );
          return {
            status: "LLENO",
            label: "Lleno",
            detail: "Lleno ahora. Pídelo para llevar",
            colorClass: "text-danger",
            bgClass: "bg-danger/10 border-danger/30",
            badgeClass: "bg-danger text-danger-foreground",
            ratio: 0.95,
            isManual: true,
            manualMinutesLeft: minutesLeft,
          };
        }
      }

      // Semáforo calculado: (ventas + canjes "para comer aquí" de los últimos 25 min) ÷ puestos
      const windowStart = new Date(simulatedToday.getTime() - 25 * 60 * 1000);
      const recentRedemptions = state.redemptions.filter(
        (r) =>
          r.restaurantId === restaurantId &&
          !r.revierteA &&
          !r.paraLlevar &&
          new Date(r.creadoEn) >= windowStart &&
          new Date(r.creadoEn) <= simulatedToday,
      ).length;

      const recentSales = state.sales.filter(
        (s) =>
          s.restaurantId === restaurantId &&
          !s.revierteA &&
          !s.paraLlevar &&
          new Date(s.creadoEn) >= windowStart &&
          new Date(s.creadoEn) <= simulatedToday,
      ).length;

      const occupants = recentRedemptions + recentSales;
      const puestos = Math.max(1, restaurant.puestos);
      const ratio = occupants / puestos;

      if (ratio < 0.6) {
        return {
          status: "FLUIDO",
          label: "Fluido",
          detail: "Llegas y te sientas",
          colorClass: "text-success",
          bgClass: "bg-success/10 border-success/30",
          badgeClass: "bg-success text-success-foreground",
          ratio,
          isManual: false,
        };
      }
      if (ratio <= 0.85) {
        return {
          status: "MOVIDO",
          label: "Movido",
          detail: "Hora pico: quizá compartas mesa",
          colorClass: "text-primary",
          bgClass: "bg-primary/10 border-primary/30",
          badgeClass: "bg-primary text-primary-foreground",
          ratio,
          isManual: false,
        };
      }
      return {
        status: "LLENO",
        label: "Lleno",
        detail: "Lleno ahora. Pídelo para llevar",
        colorClass: "text-danger",
        bgClass: "bg-danger/10 border-danger/30",
        badgeClass: "bg-danger text-danger-foreground",
        ratio,
        isManual: false,
      };
    },
    [state.restaurants, state.sales, state.redemptions, simulatedToday, simulatedTodayKey],
  );

  const setManualBusy = useCallback(
    (restaurantId: string, minutes = 20) => {
      const until = new Date(simulatedToday.getTime() + minutes * 60 * 1000).toISOString();
      setState((s) => ({
        ...s,
        restaurants: s.restaurants.map((r) =>
          r.id === restaurantId ? { ...r, manualBusyUntil: until } : r,
        ),
      }));
    },
    [simulatedToday],
  );

  const clearManualBusy = useCallback((restaurantId: string) => {
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) =>
        r.id === restaurantId ? { ...r, manualBusyUntil: undefined } : r,
      ),
    }));
  }, []);

  const simulatePeakHour = useCallback(
    (restaurantId: string) => {
      const generatedSales: Sale[] = Array.from({ length: 18 }).map((_, idx) => ({
        id: newId(`sale-peak-${idx}`),
        restaurantId,
        ticket: state.sales.length + 150 + idx,
        items: [
          {
            platoId: "p_almuerzo",
            nombre: "Almuerzo Completo",
            cant: 1,
            precioCents: 300,
            isLunch: true,
          },
        ],
        totalCents: 300,
        paraLlevar: false,
        mesa: `Mesa ${idx + 1}`,
        creadoEn: new Date(simulatedToday.getTime() - (idx + 1) * 45 * 1000).toISOString(),
      }));
      setState((s) => ({
        ...s,
        sales: [...generatedSales, ...s.sales],
      }));
    },
    [state.sales.length, simulatedToday],
  );

  // --------------------------------------------------------------------------
  // P12: PREÓRDENES INDIVIDUALES Y PARA LLEVAR
  // --------------------------------------------------------------------------
  const evaluatedOrders = useMemo(() => {
    return state.orders.map((o): Order => {
      if (o.estado === "EN_CAMINO" && new Date(o.venceEn) < simulatedToday) {
        return { ...o, estado: "EXPIRADA" };
      }
      return o;
    });
  }, [state.orders, simulatedToday]);

  const canDinerCreateOrder = useCallback(
    (userId: string) => {
      const sevenDaysAgo = new Date(simulatedToday.getTime() - 7 * 86400 * 1000);
      const expiredCount = evaluatedOrders.filter(
        (o) =>
          o.comensalId === userId &&
          o.estado === "EXPIRADA" &&
          new Date(o.creadaEn) >= sevenDaysAgo,
      ).length;

      if (expiredCount >= 3) {
        const activeCount = evaluatedOrders.filter(
          (o) => o.comensalId === userId && o.estado === "EN_CAMINO",
        ).length;
        if (activeCount >= 1) {
          return {
            allowed: false,
            reason:
              "Como tuviste 3 pedidos que expiraron esta semana, por respeto al turno de la cocina solo puedes tener 1 pedido activo en camino.",
          };
        }
      }
      return { allowed: true };
    },
    [evaluatedOrders, simulatedToday],
  );

  const createPreOrder = useCallback(
    (params: {
      userId: string;
      restaurantId: string;
      items: OrderItem[];
      tipo: OrderType;
    }) => {
      const check = canDinerCreateOrder(params.userId);
      if (!check.allowed) {
        return { ok: false, error: check.reason };
      }

      // Reserva de oferta: el precio sale del store (no del cliente) y se cuidan los cupos
      let offerCents = 0;
      const items: OrderItem[] = [];
      for (const it of params.items) {
        if (it.seccion !== "oferta") {
          items.push(it);
          continue;
        }
        const offer = state.flashOffers.find((f) => f.id === it.platoId);
        if (!offer || !offer.activa || new Date(offer.expiraEn) < simulatedToday) {
          return { ok: false, error: "Esa oferta ya no está disponible." };
        }
        if (!isPromoWindowOpen(offer, simulatedToday)) {
          return {
            ok: false,
            error: `Esta promo aplica ${promoDaysLabel(offer.diasSemana ?? [])} de ${offer.horarioPromo ?? ""}.`,
          };
        }
        const reserved = evaluatedOrders.filter(
          (o) =>
            o.estado === "EN_CAMINO" &&
            o.items.some((x) => x.seccion === "oferta" && x.platoId === offer.id),
        ).length;
        if (offer.stockRestante - reserved <= 0) {
          return { ok: false, error: "Ya no quedan cupos de esta oferta." };
        }
        offerCents += offer.precioCents;
        items.push({ ...it, precioCents: offer.precioCents });
      }

      const user = APP_USERS.find((u) => u.id === params.userId) || {
        id: params.userId,
        name: "Comensal Bocadoo",
      };
      const rest = state.restaurants.find((r) => r.id === params.restaurantId);
      const recargo = params.tipo === "LLEVAR" ? (rest?.recargoParaLlevarCents ?? 25) : 0;
      // Desayunos se cobran por plato (centavos enteros); el almuerzo usa el precio suelto del local.
      const breakfastCents = params.items
        .filter((i) => i.seccion === "desayuno")
        .reduce((sum, i) => sum + (i.precioCents ?? 0), 0);
      const hasLunch =
        params.items.length === 0 ||
        params.items.some((i) => i.seccion !== "desayuno" && i.seccion !== "oferta");
      const baseTotal =
        (hasLunch ? (rest?.precioSueltoCents ?? 300) : 0) + breakfastCents + offerCents;
      const totalCents = baseTotal + recargo;

      const orderId = newId("ord");
      const order: Order = {
        id: orderId,
        comensalId: params.userId,
        comensalNombre: user.name,
        restaurantId: params.restaurantId,
        items,
        tipo: params.tipo,
        totalCents,
        recargoLlevarCents: recargo,
        estado: "EN_CAMINO",
        creadaEn: simulatedTodayISO,
        venceEn: new Date(simulatedToday.getTime() + 30 * 60 * 1000).toISOString(),
        qrPayload: `BCD-ORD-${orderId}`,
      };

      setState((s) => ({ ...s, orders: [order, ...s.orders] }));
      return { ok: true, order };
    },
    [
      canDinerCreateOrder,
      evaluatedOrders,
      state.flashOffers,
      state.restaurants,
      simulatedToday,
      simulatedTodayISO,
    ],
  );

  const cancelPreOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, estado: "CANCELADA" } : o)),
    }));
    return true;
  }, []);

  const scanOrder = useCallback(
    (orderId: string, params: { metodo?: PaymentMethod; staffId?: string } = {}) => {
      const { metodo = "EFECTIVO", staffId = "st1" } = params;
      const order = evaluatedOrders.find((o) => o.id === orderId);
      if (!order) return { ok: false, message: "Orden no encontrada." };
      if (order.estado === "EXPIRADA")
        return { ok: false, message: "Esta orden ya expiró (más de 30 min sin canjear)." };
      if (order.estado !== "EN_CAMINO")
        return { ok: false, message: `La orden ya fue ${order.estado.toLowerCase()}.` };

      // Preorden de una oferta: se cobra el precio de la oferta, no se toca el plan del comensal.
      // Se respeta la reserva aunque la oferta ya haya vencido; solo se rechaza si el dueño la canceló.
      const offerLine = order.items.find((it) => it.seccion === "oferta");
      if (offerLine) {
        const offer = state.flashOffers.find((f) => f.id === offerLine.platoId);
        if (!offer || !offer.activa)
          return { ok: false, message: "La oferta de esta preorden ya no está disponible." };
        if (offer.stockRestante <= 0)
          return { ok: false, message: "Se agotaron los cupos de esta oferta." };

        const rate = state.commissionRate ?? COMMISSION_RATE;
        const {
          sale: offerSale,
          payment: offerPayment,
          commission,
        } = buildOfferRedemption({
          offer,
          ticket: state.sales.length + 148,
          nowISO: simulatedTodayISO,
          metodo,
          staffId,
          rate,
        });
        const nextStock = offer.stockRestante - 1;
        const redeemedOrder: Order = {
          ...order,
          estado: "CANJEADA",
          canjeadaEn: simulatedTodayISO,
          paymentIdUsed: offerPayment.id,
        };
        setState((s) => ({
          ...s,
          sales: [offerSale, ...s.sales],
          payments: [offerPayment, ...s.payments],
          commissionLedger: [commission, ...s.commissionLedger],
          flashOffers: s.flashOffers.map((f) =>
            f.id === offer.id ? { ...f, stockRestante: nextStock, activa: nextStock > 0 } : f,
          ),
          orders: s.orders.map((o) => (o.id === orderId ? redeemedOrder : o)),
        }));
        return {
          ok: true as const,
          order: redeemedOrder,
          redemption: undefined,
          payment: offerPayment,
          message: `Cobrado ${money(offerPayment.montoCents)} de la oferta con ${metodo.toLowerCase()}.`,
        };
      }

      // Buscar comensal y planes activos
      const client =
        state.clients.find(
          (c) => c.userId === order.comensalId && c.restaurantId === order.restaurantId,
        ) || state.clients.find((c) => c.userId === order.comensalId);

      const activeSubs = client ? activeSubsForClient(client.id) : [];

      let subscriptionIdUsed: string | undefined;
      let paymentIdUsed: string | undefined;
      let redemptionResult: Redemption | undefined;
      let paymentResult: Payment | undefined;

      if (activeSubs.length > 0 && client) {
        // Descontar del plan activo
        const res = redeemLunch({
          clientId: client.id,
          paraLlevar: order.tipo === "LLEVAR",
          staffId,
        });
        if (res.status === "SUCCESS" && res.redemption) {
          subscriptionIdUsed = res.subscription?.id;
          redemptionResult = res.redemption;
        }
      } else {
        // Cobrar venta suelta en caja
        const payId = newId("pay");
        paymentResult = {
          id: payId,
          montoCents: order.totalCents,
          metodo,
          cobradoPor: staffId,
          creadoEn: simulatedTodayISO,
        };
        paymentIdUsed = payId;

        const saleId = newId("sale");
        const newSale: Sale = {
          id: saleId,
          restaurantId: order.restaurantId,
          ticket: state.sales.length + 148,
          items: order.items.map((it) => ({
            platoId: it.platoId,
            nombre: it.nombre,
            cant: 1,
            precioCents: order.totalCents,
            isLunch: true,
          })),
          totalCents: order.totalCents,
          paraLlevar: order.tipo === "LLEVAR",
          creadoEn: simulatedTodayISO,
        };

        // Si el cliente existe y la tarjeta de sellos está activa, sumar 1 sello
        const stampCfg = state.stampConfigs[order.restaurantId];
        let updatedStampRecords = state.stampRecords;
        if (stampCfg && stampCfg.activa && client) {
          const stampKey = `${client.id}_${order.restaurantId}`;
          const currentStamp = updatedStampRecords[stampKey] || {
            clientId: client.id,
            restaurantId: order.restaurantId,
            sellos: 0,
            premiosDisponibles: 0,
            historiaCanjes: [],
          };
          const nextSellos = currentStamp.sellos + 1;
          const reachedReward = nextSellos >= stampCfg.meta;
          updatedStampRecords = {
            ...updatedStampRecords,
            [stampKey]: {
              ...currentStamp,
              sellos: reachedReward ? nextSellos - stampCfg.meta : nextSellos,
              premiosDisponibles: reachedReward
                ? currentStamp.premiosDisponibles + 1
                : currentStamp.premiosDisponibles,
              historiaCanjes: [
                { fecha: simulatedTodayISO, motivo: "Orden validada por QR" },
                ...currentStamp.historiaCanjes,
              ],
            },
          };
        }

        setState((s) => ({
          ...s,
          payments: [paymentResult!, ...s.payments],
          sales: [newSale, ...s.sales],
          stampRecords: updatedStampRecords,
        }));
      }

      const updatedOrder: Order = {
        ...order,
        estado: "CANJEADA",
        canjeadaEn: simulatedTodayISO,
        subscriptionIdUsed,
        paymentIdUsed,
      };

      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
      }));

      return {
        ok: true,
        order: updatedOrder,
        redemption: redemptionResult,
        payment: paymentResult,
        message: subscriptionIdUsed
          ? "¡Listo! Descontado de su plan activo."
          : `Cobrado ${money(order.totalCents)} con ${metodo.toLowerCase()}.`,
      };
    },
    [evaluatedOrders, state.clients, state.flashOffers, state.commissionRate, state.sales.length, state.stampConfigs, state.stampRecords, activeSubsForClient, redeemLunch, simulatedTodayISO],
  );

  const serveOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, estado: "SERVIDA" } : o)),
    }));
    return true;
  }, []);

  // Deshacer "entregado": la orden vuelve a CANJEADA (validada, pendiente de entregar)
  const undoServeOrder = useCallback((orderId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === orderId && o.estado === "SERVIDA" ? { ...o, estado: "CANJEADA" } : o,
      ),
    }));
    return true;
  }, []);

  // Deshacer la validación de una orden pagada con plan: revierte el canje (y su sello) y
  // devuelve la orden a EN_CAMINO. Las órdenes cobradas sueltas no se pueden deshacer aquí.
  const undoScanOrder = useCallback(
    (orderId: string, staffId = "st1") => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order || order.estado !== "CANJEADA" || !order.subscriptionIdUsed) return false;
      const red = state.redemptions.find(
        (r) =>
          !r.revierteA &&
          r.subscriptionId === order.subscriptionIdUsed &&
          r.creadoEn === order.canjeadaEn &&
          !state.redemptions.some((x) => x.revierteA === r.id),
      );
      if (!red) return false;
      if (!undoRedemption(red.id, staffId)) return false;
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) => {
          if (o.id !== orderId) return o;
          const next: Order = { ...o, estado: "EN_CAMINO" };
          delete next.canjeadaEn;
          delete next.subscriptionIdUsed;
          return next;
        }),
      }));
      return true;
    },
    [state.orders, state.redemptions, undoRedemption],
  );

  // --------------------------------------------------------------------------
  // P13: TARJETA DE SELLOS
  // --------------------------------------------------------------------------
  const configureStampCard = useCallback(
    (restaurantId: string, config: Partial<StampCardConfig>) => {
      setState((s) => {
        const meta = config.meta ?? s.stampConfigs[restaurantId]?.meta ?? 10;

        // Si el dueño baja la meta, quien ya tenga esos sellos gana su premio en ese momento
        // y la tarjeta sigue con los sellos que sobran.
        const stampRecords = Object.fromEntries(
          Object.entries(s.stampRecords).map(([key, r]) =>
            r.restaurantId === restaurantId && r.sellos >= meta
              ? [
                  key,
                  {
                    ...r,
                    sellos: r.sellos % meta,
                    premiosDisponibles: r.premiosDisponibles + Math.floor(r.sellos / meta),
                  },
                ]
              : [key, r],
          ),
        );

        return {
          ...s,
          stampRecords,
          stampConfigs: {
            ...s.stampConfigs,
            [restaurantId]: {
              restaurantId,
              activa: config.activa ?? s.stampConfigs[restaurantId]?.activa ?? true,
              meta,
              premio: config.premio ?? s.stampConfigs[restaurantId]?.premio ?? "Almuerzo gratis",
              nombre: config.nombre ?? s.stampConfigs[restaurantId]?.nombre,
              cuenta: config.cuenta ?? s.stampConfigs[restaurantId]?.cuenta,
            },
          },
        };
      });
    },
    [],
  );

  const getClientStampRecord = useCallback(
    (clientId: string, restaurantId: string): StampRecord => {
      const key = `${clientId}_${restaurantId}`;
      return (
        state.stampRecords[key] || {
          clientId,
          restaurantId,
          sellos: 0,
          premiosDisponibles: 0,
          historiaCanjes: [],
        }
      );
    },
    [state.stampRecords],
  );

  const claimStampReward = useCallback(
    (clientId: string, restaurantId: string) => {
      const key = `${clientId}_${restaurantId}`;
      const record = state.stampRecords[key];
      if (!record || record.premiosDisponibles <= 0) {
        return { ok: false, message: "No tienes premios disponibles para canjear todavía." };
      }

      const cfg = state.stampConfigs[restaurantId];
      const premioDesc = cfg?.premio || "Almuerzo gratis";

      // P13: Canjear el premio crea una venta de $0 con motivo "Premio"
      const saleId = newId("sale");
      const nextTicket = state.sales.length + 148;
      const newSale: Sale = {
        id: saleId,
        restaurantId,
        ticket: nextTicket,
        items: [
          {
            platoId: "p_premio",
            nombre: `Premio: ${premioDesc}`,
            cant: 1,
            precioCents: 0,
            isLunch: true,
          },
        ],
        totalCents: 0,
        paraLlevar: false,
        mesa: "Premio",
        creadoEn: simulatedTodayISO,
      };

      const updatedRecord: StampRecord = {
        ...record,
        premiosDisponibles: record.premiosDisponibles - 1,
        historiaCanjes: [
          { fecha: simulatedTodayISO, motivo: `Premio canjeado: ${premioDesc}` },
          ...record.historiaCanjes,
        ],
      };

      setState((s) => ({
        ...s,
        sales: [newSale, ...s.sales],
        stampRecords: {
          ...s.stampRecords,
          [key]: updatedRecord,
        },
      }));

      return {
        ok: true,
        sale: newSale,
        message: `¡Premio entregado! Se registró venta de $0 para el cuadre de caja.`,
      };
    },
    [state.stampRecords, state.stampConfigs, state.sales.length, simulatedTodayISO],
  );

  // --------------------------------------------------------------------------
  // P14: FEEDBACK DE COMENSALES
  // --------------------------------------------------------------------------
  const pendingFeedbackRedemptions = useCallback(
    (clientId: string) => {
      return state.redemptions.filter((r) => {
        if (r.revierteA) return false;
        const sub = state.subscriptions.find((s) => s.id === r.subscriptionId);
        if (sub?.clientId !== clientId) return false;
        const redTime = new Date(r.creadoEn).getTime();
        const answered = state.feedbackList.some((f) => f.redemptionId === r.id);
        const dismissed = (state.dismissedFeedbackIds || []).includes(r.id);
        return shouldShowFeedback(
          {
            redemptionId: r.id,
            restaurantId: r.restaurantId || RESTAURANT_ID,
            validatedAt: redTime,
            answeredAt: answered ? redTime : null,
            dismissedAt: dismissed ? redTime : null,
          },
          simulatedToday.getTime(),
          FEEDBACK_DELAY_MIN,
        );
      });
    },
    [state.redemptions, state.subscriptions, state.feedbackList, state.dismissedFeedbackIds, simulatedToday],
  );

  const dismissFeedback = useCallback((redemptionId: string) => {
    setState((s) => ({
      ...s,
      dismissedFeedbackIds: [...(s.dismissedFeedbackIds || []), redemptionId],
    }));
  }, []);

  const submitFeedback = useCallback(
    (params: {
      redemptionId: string;
      restaurantId: string;
      clientId: string;
      tags: string[];
      comentarioPrivado?: string | undefined;
    }) => {
      const client = state.clients.find((c) => c.id === params.clientId);
      const feedback: FeedbackItem = {
        id: newId("fb"),
        redemptionId: params.redemptionId,
        restaurantId: params.restaurantId,
        clientId: params.clientId,
        clientName: client?.nombre || "Comensal Bocadoo",
        tags: params.tags,
        comentarioPrivado: params.comentarioPrivado,
        creadoEn: simulatedTodayISO,
      };

      setState((s) => ({ ...s, feedbackList: [feedback, ...s.feedbackList] }));
      return feedback;
    },
    [state.clients, simulatedTodayISO],
  );

  const scanAndFastForward25Min = useCallback(() => {
    const sub = state.subscriptions.find((s) => s.clientId === "c1" && s.almuerzosRestantes > 0);
    const subId = sub ? sub.id : "sub-1";
    const newRed: Redemption = {
      id: newId("red"),
      subscriptionId: subId,
      restaurantId: RESTAURANT_ID,
      staffId: "st1",
      creadoEn: simulatedTodayISO,
      paraLlevar: false,
      idempotencyKey: `scan-25-${Date.now()}`,
    };
    setState((s) => ({
      ...s,
      redemptions: [newRed, ...s.redemptions],
      simulatedMinutesOffset: s.simulatedMinutesOffset + 25,
    }));
  }, [state.subscriptions, simulatedTodayISO]);

  const replyFeedback = useCallback(
    (feedbackId: string, respuesta: string) => {
      setState((s) => ({
        ...s,
        feedbackList: s.feedbackList.map((f) =>
          f.id === feedbackId
            ? { ...f, respuestaRestaurante: respuesta, respondidoEn: simulatedTodayISO }
            : f,
        ),
      }));
      return true;
    },
    [simulatedTodayISO],
  );

  const getRestaurantFeedbackTags = useCallback(
    (restaurantId: string): Record<string, number> => {
      const baseCounts: Record<string, number> = {
        "Buena sazón": 128,
        "Buena porción": 94,
        "Atención rápida": 76,
      };
      state.feedbackList
        .filter((f) => f.restaurantId === restaurantId)
        .forEach((f) => {
          f.tags.forEach((tag) => {
            baseCounts[tag] = (baseCounts[tag] || 0) + 1;
          });
        });
      return baseCounts;
    },
    [state.feedbackList],
  );

  // --------------------------------------------------------------------------
  // P15: OFERTAS FLASH & REGISTRO DE COMISIONES (7%)
  // --------------------------------------------------------------------------
  const evaluatedFlashOffers = useMemo(() => {
    return state.flashOffers.map((f): FlashOffer => {
      if (f.activa && new Date(f.expiraEn) < simulatedToday) {
        return { ...f, activa: false };
      }
      return f;
    });
  }, [state.flashOffers, simulatedToday]);

  const launchFlashOffer = useCallback(
    (params: {
      restaurantId: string;
      titulo: string;
      descripcion: string;
      precioCents: number;
      precioOriginalCents: number;
      stockTotal: number;
      minutosDuracion: number;
      modalidad?: FlashOfferMode | undefined;
      diasSemana?: string[] | undefined;
      horarioPromo?: string | undefined;
      porcentajeDescuento?: number | undefined;
    }) => {
      const offerId = newId("flash");
      const expiraEn = new Date(
        simulatedToday.getTime() + params.minutosDuracion * 60000,
      ).toISOString();

      const offer: FlashOffer = {
        id: offerId,
        restaurantId: params.restaurantId,
        titulo: params.titulo,
        descripcion: params.descripcion,
        precioCents: params.precioCents,
        precioOriginalCents: params.precioOriginalCents,
        stockTotal: params.stockTotal,
        stockRestante: params.stockTotal,
        expiraEn,
        activa: true,
        creadaEn: simulatedTodayISO,
        ...(params.modalidad ? { modalidad: params.modalidad } : {}),
        ...(params.diasSemana ? { diasSemana: params.diasSemana } : {}),
        ...(params.horarioPromo ? { horarioPromo: params.horarioPromo } : {}),
        ...(params.porcentajeDescuento !== undefined
          ? { porcentajeDescuento: params.porcentajeDescuento }
          : {}),
      };

      setState((s) => ({ ...s, flashOffers: [offer, ...s.flashOffers] }));
      return offer;
    },
    [simulatedToday, simulatedTodayISO],
  );

  // El dueño cancela su oferta flash: deja de verse en "Ofertas hoy" del comensal
  const cancelFlashOffer = useCallback((offerId: string) => {
    setState((s) => ({
      ...s,
      flashOffers: s.flashOffers.map((f) => (f.id === offerId ? { ...f, activa: false } : f)),
    }));
    return true;
  }, []);

  // Deshacer la cancelación (búfer de 10 s)
  const restoreFlashOffer = useCallback((offerId: string) => {
    setState((s) => ({
      ...s,
      flashOffers: s.flashOffers.map((f) => (f.id === offerId ? { ...f, activa: true } : f)),
    }));
    return true;
  }, []);

  const redeemFlashOffer = useCallback(
    (offerId: string, params: { metodo: PaymentMethod; staffId?: string } = { metodo: "EFECTIVO" }) => {
      const { metodo = "EFECTIVO", staffId = "st1" } = params;
      const offer = evaluatedFlashOffers.find((f) => f.id === offerId);
      if (!offer) return { ok: false, message: "Oferta flash no encontrada." };
      if (!offer.activa) return { ok: false, message: "Esta oferta flash ya finalizó o expiró." };
      if (offer.stockRestante <= 0)
        return { ok: false, message: "Se agotó el stock disponible de esta oferta." };
      if (!isPromoWindowOpen(offer, simulatedToday))
        return {
          ok: false,
          message: `Esta promo aplica ${promoDaysLabel(offer.diasSemana ?? [])} de ${offer.horarioPromo ?? ""}.`,
        };

      const currentRate = state.commissionRate ?? COMMISSION_RATE;
      const {
        sale: newSale,
        payment: newPay,
        commission: commEntry,
        comisionCents,
      } = buildOfferRedemption({
        offer,
        ticket: state.sales.length + 148,
        nowISO: simulatedTodayISO,
        metodo,
        staffId,
        rate: currentRate,
      });

      const nextStock = offer.stockRestante - 1;
      const updatedOffers = state.flashOffers.map((f) =>
        f.id === offer.id ? { ...f, stockRestante: nextStock, activa: nextStock > 0 } : f,
      );

      setState((s) => ({
        ...s,
        sales: [newSale, ...s.sales],
        payments: [newPay, ...s.payments],
        commissionLedger: [commEntry, ...s.commissionLedger],
        flashOffers: updatedOffers,
      }));

      return {
        ok: true,
        sale: newSale,
        commission: commEntry,
        message: `¡Oferta canjeada! Venta: ${money(offer.precioCents)} | Comisión (${Math.round(currentRate * 100)}%): ${money(comisionCents)}`,
      };
    },
    [evaluatedFlashOffers, state.sales.length, state.flashOffers, simulatedToday, simulatedTodayISO],
  );

  const getRestaurantCommissions = useCallback(
    (restaurantId: string) => {
      const entries = state.commissionLedger.filter((c) => c.restaurantId === restaurantId);
      const totalVendidoCents = entries.reduce((sum, e) => sum + e.montoVentaCents, 0);
      const totalComisionesCents = entries.reduce((sum, e) => sum + e.comisionCents, 0);
      return {
        totalVendidoCents,
        totalComisionesCents,
        totalCanjes: entries.length,
        entries,
      };
    },
    [state.commissionLedger],
  );

  // --------------------------------------------------------------------------
  // ALIAS DE RETROCOMPATIBILIDAD (PARA QUE LAS VISTAS EXISTENTES SIGAN OPERANDO)
  // --------------------------------------------------------------------------
  const legacyPlans: Plan[] = useMemo(() => {
    return state.planTemplates.map((t) => ({
      id: t.id,
      type: t.tipo,
      name: t.nombre,
      lunches: t.almuerzos,
      price: t.precioCents / 100, // En dólares para vistas previas si lo requieren
      days: t.vigenciaDias,
      clients: evaluatedSubscriptions.filter((s) => s.templateId === t.id && s.estado === "ACTIVA")
        .length,
      active: t.activo,
    }));
  }, [state.planTemplates, evaluatedSubscriptions]);

  const legacyClients = useMemo(() => {
    return state.clients.map((c) => {
      const subs = activeSubsForClient(c.id);
      const lunchesLeft = subs.reduce((sum, s) => sum + s.almuerzosRestantes, 0);
      const sub = subs[0];
      return {
        id: c.id,
        name: c.nombre,
        email: c.correo,
        phone: c.telefono,
        userId: c.userId,
        planId: sub?.templateId,
        lunchesLeft,
      };
    });
  }, [state.clients, activeSubsForClient]);

  const addContact = useCallback(
    (data: { name: string; email: string; phone: string }) => {
      const c: Client = {
        id: newId("c"),
        restaurantId: RESTAURANT_ID,
        nombre: data.name.trim(),
        telefono: normalizePhone(data.phone),
        correo: normalizeEmail(data.email),
      };
      setState((s) => ({ ...s, clients: [c, ...s.clients] }));
      return c;
    },
    [],
  );

  const linkUser = useCallback(
    (user: AppUser) => {
      if (state.clients.some((c) => c.userId === user.id)) return false;
      const c: Client = {
        id: newId("c"),
        restaurantId: RESTAURANT_ID,
        userId: user.id,
        nombre: user.name,
        telefono: user.phone,
        correo: user.email,
      };
      setState((s) => ({ ...s, clients: [c, ...s.clients] }));
      return true;
    },
    [state.clients],
  );

  const createSharedTable = useCallback(
    (params: {
      restaurantId: string;
      restaurantNombre: string;
      anfitrionNombre?: string;
      anfitrionUserId?: string;
      hora: string;
      sopa?: string;
      fuerte?: string;
      paraLlevar?: boolean;
    }) => {
      const mesaId = "m" + Date.now().toString().slice(-4);
      const hostName = params.anfitrionNombre || "Carlos Mejía";
      const hostId = params.anfitrionUserId || DINER_USER_ID;
      const newTable: SharedTable = {
        id: mesaId,
        restaurantId: params.restaurantId,
        restaurantNombre: params.restaurantNombre,
        anfitrionNombre: hostName,
        anfitrionUserId: hostId,
        hora: params.hora,
        creadaEn: simulatedTodayISO,
        miembros: [
          {
            id: newId("mem"),
            nombre: hostName,
            esAnfitrion: true,
            sopa: params.sopa,
            fuerte: params.fuerte,
            paraLlevar: params.paraLlevar || false,
            unidoEn: simulatedTodayISO,
          },
        ],
        estado: "ABIERTA",
      };

      setState((s) => ({
        ...s,
        sharedTables: [newTable, ...(s.sharedTables || [])],
      }));

      return newTable;
    },
    [simulatedTodayISO],
  );

  const joinSharedTable = useCallback(
    (params: {
      mesaId: string;
      nombre: string;
      sopa?: string;
      fuerte?: string;
      paraLlevar?: boolean;
    }) => {
      const newMember: SharedTableMember = {
        id: newId("mem"),
        nombre: params.nombre || "Amigo",
        esAnfitrion: false,
        sopa: params.sopa,
        fuerte: params.fuerte,
        paraLlevar: params.paraLlevar || false,
        unidoEn: simulatedTodayISO,
      };

      setState((s) => {
        const existing = (s.sharedTables || []).find((t) => t.id === params.mesaId);
        if (!existing) {
          const fallbackTable: SharedTable = {
            id: params.mesaId,
            restaurantId: RESTAURANT_ID,
            restaurantNombre: "La Cuchara de San Blas",
            anfitrionNombre: "Carlos Mejía",
            anfitrionUserId: "u1",
            hora: "13:00",
            creadaEn: simulatedTodayISO,
            miembros: [
              {
                id: newId("mem-host"),
                nombre: "Carlos Mejía",
                esAnfitrion: true,
                sopa: "Locro de papa con queso y aguacate",
                fuerte: "Seco de pollo tierno con maduro frito",
                paraLlevar: false,
                unidoEn: simulatedTodayISO,
              },
              newMember,
            ],
            estado: "ABIERTA",
          };
          return {
            ...s,
            sharedTables: [fallbackTable, ...(s.sharedTables || [])],
          };
        }

        return {
          ...s,
          sharedTables: s.sharedTables.map((t) =>
            t.id === params.mesaId
              ? {
                  ...t,
                  miembros: [...t.miembros.filter((m) => m.nombre !== params.nombre), newMember],
                }
              : t,
          ),
        };
      });

      return newMember;
    },
    [simulatedTodayISO],
  );

  const notifyKitchenForTable = useCallback((mesaId: string) => {
    setState((s) => ({
      ...s,
      sharedTables: (s.sharedTables || []).map((t) =>
        t.id === mesaId ? { ...t, estado: "EN_CAMINO" } : t,
      ),
    }));
  }, []);

  const setSharedTableMode = useCallback((mesaId: string, modo: SharedTableMode) => {
    setState((s) => ({
      ...s,
      sharedTables: (s.sharedTables || []).map((t) => (t.id === mesaId ? { ...t, modo } : t)),
    }));
  }, []);

  // Resuelve quién paga qué en una mesa (QR maestro). No modifica el estado.
  const previewSharedTable = useCallback(
    (mesaId: string): SharedTablePreview => {
      const table = (state.sharedTables || []).find((t) => t.id === mesaId);
      if (!table) return { ok: false, message: "Mesa no encontrada." };
      if (table.estado === "FINALIZADA") return { ok: false, message: "Esta mesa ya fue validada." };

      const modo = table.modo ?? "CADA_UNO";
      const clientOf = (m: SharedTableMember) => {
        if (m.esAnfitrion) {
          return state.clients.find((c) => c.userId === table.anfitrionUserId && c.restaurantId === table.restaurantId);
        }
        return state.clients.find(
          (c) =>
            c.restaurantId === table.restaurantId &&
            c.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase(),
        );
      };

      const lines: SharedTableLine[] = [];
      const sellosPor = new Map<string, number>();
      const addSello = (nombre: string) => sellosPor.set(nombre, (sellosPor.get(nombre) ?? 0) + 1);

      if (modo === "INVITO_YO") {
        const host = table.miembros.find((m) => m.esAnfitrion);
        const hostClient = host ? clientOf(host) : undefined;
        const balance = hostClient
          ? activeSubsForClient(hostClient.id).reduce((sum, s) => sum + s.almuerzosRestantes, 0)
          : 0;
        if (!host || !hostClient || balance < table.miembros.length) {
          return {
            ok: false,
            message: `El plan del anfitrión no alcanza para ${table.miembros.length} almuerzos (tiene ${balance}).`,
          };
        }
        for (const m of table.miembros) {
          lines.push({
            memberId: m.id,
            nombre: m.nombre,
            plato: m.fuerte || "Almuerzo",
            via: "PLAN_ANFITRION",
            montoCents: 0,
          });
          addSello(host.nombre);
        }
      } else {
        for (const m of table.miembros) {
          const client = clientOf(m);
          const hasPlan = !!client && activeSubsForClient(client.id).length > 0;
          lines.push({
            memberId: m.id,
            nombre: m.nombre,
            plato: m.fuerte || "Almuerzo",
            via: hasPlan ? "PLAN" : "SUELTO",
            montoCents: hasPlan ? 0 : SHARED_TABLE_LUNCH_CENTS + (m.paraLlevar ? 25 : 0),
          });
          if (client) addSello(m.nombre);
        }
      }

      return {
        ok: true,
        lines,
        totalSueltoCents: lines.reduce((sum, l) => sum + l.montoCents, 0),
        sellos: [...sellosPor].map(([nombre, cant]) => ({ nombre, cant })),
      };
    },
    [state.sharedTables, state.clients, activeSubsForClient],
  );

  // 1 toque en caja: descuenta planes, cobra sueltos y reparte sellos a toda la mesa.
  const validateSharedTable = useCallback(
    (mesaId: string, params: { metodo?: PaymentMethod; staffId?: string } = {}) => {
      const { metodo = "EFECTIVO", staffId = "st1" } = params;
      const table = (state.sharedTables || []).find((t) => t.id === mesaId);
      const preview = previewSharedTable(mesaId);
      if (!table || !preview.ok) {
        return { ok: false as const, message: preview.ok ? "Mesa no encontrada." : preview.message };
      }

      const modo = table.modo ?? "CADA_UNO";
      const clientOf = (m: SharedTableMember) =>
        m.esAnfitrion
          ? state.clients.find((c) => c.userId === table.anfitrionUserId && c.restaurantId === table.restaurantId)
          : state.clients.find(
              (c) =>
                c.restaurantId === table.restaurantId &&
                c.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase(),
            );

      const subs = state.subscriptions.map((s) => ({ ...s }));
      const newRedemptions: Redemption[] = [];
      let stamps = state.stampRecords;
      const stampCfg = state.stampConfigs[table.restaurantId];

      const takeFromPlan = (clientId: string): boolean => {
        const sub = subs
          .filter((s) => s.clientId === clientId && s.estado === "ACTIVA" && s.almuerzosRestantes > 0)
          .sort((a, b) => new Date(a.venceEn).getTime() - new Date(b.venceEn).getTime())[0];
        if (!sub) return false;
        sub.almuerzosRestantes -= 1;
        if (sub.almuerzosRestantes <= 0) sub.estado = "AGOTADA";
        newRedemptions.push({
          id: newId("red"),
          subscriptionId: sub.id,
          restaurantId: table.restaurantId,
          staffId,
          creadoEn: simulatedTodayISO,
          paraLlevar: false,
          idempotencyKey: `mesa-${mesaId}-${newRedemptions.length}`,
        });
        return true;
      };

      const giveStamp = (clientId: string) => {
        if (!stampCfg || !stampCfg.activa) return;
        const key = `${clientId}_${table.restaurantId}`;
        const cur = stamps[key] || {
          clientId,
          restaurantId: table.restaurantId,
          sellos: 0,
          premiosDisponibles: 0,
          historiaCanjes: [],
        };
        const next = cur.sellos + 1;
        const reached = next >= stampCfg.meta;
        stamps = {
          ...stamps,
          [key]: {
            ...cur,
            sellos: reached ? next - stampCfg.meta : next,
            premiosDisponibles: reached ? cur.premiosDisponibles + 1 : cur.premiosDisponibles,
            historiaCanjes: [{ fecha: simulatedTodayISO, motivo: `Mesa compartida #${mesaId}` }, ...cur.historiaCanjes],
          },
        };
      };

      const hostMember = table.miembros.find((m) => m.esAnfitrion);
      const hostClient = hostMember ? clientOf(hostMember) : undefined;
      const sueltos = preview.lines.filter((l) => l.via === "SUELTO");

      for (const line of preview.lines) {
        if (line.via === "PLAN_ANFITRION" && hostClient) {
          takeFromPlan(hostClient.id);
          giveStamp(hostClient.id);
        } else if (line.via === "PLAN") {
          const member = table.miembros.find((m) => m.id === line.memberId);
          const client = member ? clientOf(member) : undefined;
          if (client) {
            takeFromPlan(client.id);
            giveStamp(client.id);
          }
        } else {
          const member = table.miembros.find((m) => m.id === line.memberId);
          const client = member ? clientOf(member) : undefined;
          if (client) giveStamp(client.id);
        }
      }

      const newPayments: Payment[] = [];
      let newSale: Sale | undefined;
      if (sueltos.length > 0) {
        const saleId = newId("sale");
        newSale = {
          id: saleId,
          restaurantId: table.restaurantId,
          ticket: state.sales.length + 148,
          items: sueltos.map((l) => ({
            platoId: l.memberId,
            nombre: l.plato,
            cant: 1,
            precioCents: l.montoCents,
            isLunch: true,
          })),
          totalCents: preview.totalSueltoCents,
          paraLlevar: false,
          mesa: `Mesa ${mesaId.toUpperCase()}`,
          creadoEn: simulatedTodayISO,
        };
        newPayments.push({
          id: newId("pay"),
          montoCents: preview.totalSueltoCents,
          metodo,
          saleId,
          cobradoPor: staffId,
          creadoEn: simulatedTodayISO,
        });
      }

      setState((s) => ({
        ...s,
        subscriptions: subs,
        redemptions: [...newRedemptions, ...s.redemptions],
        stampRecords: stamps,
        sales: newSale ? [newSale, ...s.sales] : s.sales,
        payments: [...newPayments, ...s.payments],
        sharedTables: (s.sharedTables || []).map((t) =>
          t.id === mesaId ? { ...t, estado: "FINALIZADA", validadaEn: simulatedTodayISO } : t,
        ),
      }));

      return {
        ok: true as const,
        modo,
        lines: preview.lines,
        totalSueltoCents: preview.totalSueltoCents,
        sellos: preview.sellos,
        message:
          modo === "INVITO_YO"
            ? `Mesa validada: ${preview.lines.length} almuerzos del plan del anfitrión.`
            : `Mesa validada: ${preview.lines.length} comensales.`,
      };
    },
    [state.sharedTables, state.clients, state.subscriptions, state.stampRecords, state.stampConfigs, state.sales.length, previewSharedTable, simulatedTodayISO],
  );

  // chargePlan retrocompatible que traduce al nuevo sellPlan
  const chargePlan = useCallback(
    (target: ChargeTarget, plan: { id: string }) => {
      const template = state.planTemplates.find((t) => t.id === plan.id);
      if (!template) return;
      return sellPlan({
        target,
        template,
        metodo: "EFECTIVO",
      });
    },
    [state.planTemplates, sellPlan],
  );

  // discountLunch retrocompatible
  const discountLunch = useCallback(
    (clientId: string) => {
      return redeemLunch({ clientId });
    },
    [redeemLunch],
  );

  return {
    ...state,
    // Modelos principales
    restaurant: activeRestaurant,
    evaluatedSubscriptions,
    // Fechas
    simulatedToday,
    simulatedTodayKey,
    simulatedTodayISO,
    advanceDemoDays,
    advanceSimulatedMinutes,
    resetDemoData,
    // Permisos y roles
    activeRole: state.activeRole,
    setStaffRole,
    soundEnabled: state.soundEnabled,
    setSoundEnabled,
    // Selectores reactivos
    salesThisMonthCents,
    sales: salesThisMonthCents / 100, // En dólares flotante para headers
    servedToday,
    activeClients,
    owedLunchesReport,
    expiringSoonSubscriptions,
    transactions,
    dinerTransactions,
    // Búsqueda
    findAppUser,
    findContact,
    clientForUser,
    activeSubsForClient,
    getActiveSubsForUserAndRestaurant,
    // Acciones completas
    updateRestaurant,
    migrateCard,
    addPlan,
    updatePlan,
    togglePlan,
    sellPlan,
    undoPayment,
    redeemLunch,
    undoRedemption,
    posSale,
    undoSale,
    publishMenu,
    toggleSoldOut,
    copyPreviousMenu,
    requestPlan,
    confirmPlanRequest,
    extendSubscription,
    fileClaim,
    refundRedemption,
    dismissClaim,
    closeCash,
    setDinerZone,
    // P11 Semáforo
    getRestaurantOccupancy,
    setManualBusy,
    clearManualBusy,
    simulatePeakHour,
    // P12 Preórdenes
    orders: evaluatedOrders,
    canDinerCreateOrder,
    createPreOrder,
    cancelPreOrder,
    scanOrder,
    serveOrder,
    undoServeOrder,
    undoScanOrder,
    // P13 Sellos
    configureStampCard,
    getClientStampRecord,
    claimStampReward,
    // P14 Feedback
    pendingFeedbackRedemptions,
    submitFeedback,
    dismissFeedback,
    replyFeedback,
    getRestaurantFeedbackTags,
    scanAndFastForward25Min,
    // P15 Ofertas Flash & Comisiones
    flashOffers: evaluatedFlashOffers,
    launchFlashOffer,
    cancelFlashOffer,
    restoreFlashOffer,
    redeemFlashOffer,
    getRestaurantCommissions,
    commissionRate: state.commissionRate ?? COMMISSION_RATE,
    setCommissionRate: (rate: number) => setState((s) => ({ ...s, commissionRate: rate })),
    COMMISSION_RATE: state.commissionRate ?? COMMISSION_RATE,
    scannerDemoScenario: state.scannerDemoScenario ?? "NORMAL",
    setScannerDemoScenario: (scenario: string) =>
      setState((s) => ({ ...s, scannerDemoScenario: scenario })),
    dinerHasPlanOverride: state.dinerHasPlanOverride,
    setDinerHasPlanOverride: (val: boolean | null) =>
      setState((s) => ({ ...s, dinerHasPlanOverride: val })),
    // Compatibilidad
    plans: legacyPlans,
    rawClients: state.clients,
    clients: legacyClients,
    sharedTables: state.sharedTables || [],
    createSharedTable,
    joinSharedTable,
    notifyKitchenForTable,
    setSharedTableMode,
    previewSharedTable,
    validateSharedTable,
    addContact,
    linkUser,
    chargePlan,
    discountLunch,
    ticket: state.sales.length + 148,
  };
}

export type Store = ReturnType<typeof useBocadooState>;

const BocadooContext = createContext<Store | null>(null);

export function BocadooProvider({ children }: { children: ReactNode }) {
  const store = useBocadooState();
  return <BocadooContext.Provider value={store}>{children}</BocadooContext.Provider>;
}

export function useBocadoo() {
  const store = useContext(BocadooContext);
  if (!store) throw new Error("useBocadoo debe usarse dentro de BocadooProvider");
  return store;
}
