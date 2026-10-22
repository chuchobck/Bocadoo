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

// ============================================================================
// BOCADOO V2 STORE — ESTADO INTERACTIVO SINCRONIZADO EN LOCALSTORAGE
// ============================================================================

export const STORAGE_KEY = "bocadoo-demo-v2";
const BROADCAST_CHANNEL_NAME = "bocadoo-sync-v2";

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
};

export type Staff = {
  id: string;
  userId: string;
  restaurantId: string;
  rol: StaffRole;
  nombre: string;
  telefono?: string;
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
  userId?: string; // Sin userId = contacto sin app migrado o anotado a mano
  nombre: string;
  telefono: string;
  correo: string;
};

export type PlanType = "Semanal" | "Quincenal" | "Mensual" | "Libre";

export type PlanTemplate = {
  id: string;
  restaurantId: string;
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
  anotacion?: string; // Ej: "Cartulina #14"
};

export type Redemption = {
  id: string;
  subscriptionId: string;
  restaurantId: string;
  staffId: string;
  creadoEn: string; // ISO
  paraLlevar: boolean;
  idempotencyKey: string;
  revierteA?: string; // ID de redención que anula
};

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA";

export type Payment = {
  id: string;
  montoCents: number;
  metodo: PaymentMethod;
  subscriptionId?: string;
  saleId?: string;
  cobradoPor: string;
  creadoEn: string; // ISO
  revierteA?: string; // ID de pago que anula
  fotoComprobante?: string;
};

export type SaleItem = {
  platoId: string;
  nombre: string;
  cant: number;
  precioCents: number;
  isLunch?: boolean;
};

export type Sale = {
  id: string;
  restaurantId: string;
  ticket: number;
  items: SaleItem[];
  totalCents: number;
  paraLlevar: boolean;
  mesa?: string;
  creadoEn: string; // ISO
  revierteA?: string;
};

export type MenuDish = {
  id: string;
  nombre: string;
  descripcion: string;
  precioCents?: number;
  agotado: boolean;
  porciones?: number;
  foto?: string;
};

export type MenuSectionId = "jugo" | "sopa" | "fuerte" | "postre" | "adicional";

export type MenuDay = {
  fecha: string; // YYYY-MM-DD
  secciones: Record<MenuSectionId, MenuDish[]>;
  publicadoEn?: string; // ISO
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
  respuesta?: string;
  resueltoEn?: string;
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
  activeRole: StaffRole; // "OWNER" o "CASHIER" para el ayudante
  restaurants: Restaurant[];
  staff: Staff[];
  clients: Client[];
  planTemplates: PlanTemplate[];
  subscriptions: Subscription[];
  redemptions: Redemption[];
  payments: Payment[];
  sales: Sale[];
  menuDays: Record<string, MenuDay>; // YYYY-MM-DD -> MenuDay
  planRequests: PlanRequest[];
  claims: Claim[];
  cashClosures: CashClosure[];
  dinerZone: string | null;
  soundEnabled: boolean;
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

const initialRestaurant: Restaurant = {
  id: RESTAURANT_ID,
  nombre: "La Cuchara de San Blas",
  zona: "Frente a la PUCE",
  puestos: 28,
  anotarMesa: false,
  precioSueltoCents: 300, // $3,00 suelto
  recargoParaLlevarCents: 25, // $0,25 tarrina
};

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
    precioCents: 5500, // $55,00 ($2,75 c/u, coherente con landing, ahorra $5 frente a $3)
    vigenciaDias: 35,
    cupos: 40,
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
];

const initialSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    clientId: "c1", // Carlos
    templateId: "p-mensual",
    origen: "VENTA",
    almuerzosTotales: 20,
    almuerzosRestantes: 14,
    compradaEn: addDays(baseDate, -6).toISOString(),
    venceEn: addDays(baseDate, 29).toISOString(),
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
];

const initialRedemptions: Redemption[] = [
  {
    id: "red-1",
    subscriptionId: "sub-1",
    restaurantId: RESTAURANT_ID,
    staffId: "st1",
    creadoEn: new Date(baseDate.setHours(13, 12, 0, 0)).toISOString(),
    paraLlevar: false,
    idempotencyKey: `init-red-1`,
  },
  {
    id: "red-2",
    subscriptionId: "sub-3",
    restaurantId: RESTAURANT_ID,
    staffId: "st1",
    creadoEn: new Date(baseDate.setHours(12, 45, 0, 0)).toISOString(),
    paraLlevar: true,
    idempotencyKey: `init-red-2`,
  },
];

const initialMenuToday: MenuDay = {
  fecha: dateKeyToday,
  publicadoEn: new Date(baseDate.setHours(9, 30, 0, 0)).toISOString(),
  secciones: {
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

export const initialState: State = {
  simulatedDaysOffset: 0,
  activeRole: "OWNER",
  restaurants: [initialRestaurant],
  staff: initialStaff,
  clients: initialClients,
  planTemplates: initialPlanTemplates,
  subscriptions: initialSubscriptions,
  redemptions: initialRedemptions,
  payments: initialPayments,
  sales: [],
  menuDays: {
    [dateKeyToday]: initialMenuToday,
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
  dinerZone: "Frente a la PUCE",
  soundEnabled: true,
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
          clients: parsed.clients?.length ? parsed.clients : prev.clients,
          menuDays: parsed.menuDays || prev.menuDays,
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
  const simulatedToday = useMemo(
    () => getSimulatedDate(state.simulatedDaysOffset),
    [state.simulatedDaysOffset],
  );
  const simulatedTodayKey = useMemo(() => toDateKey(simulatedToday), [simulatedToday]);
  const simulatedTodayISO = useMemo(() => simulatedToday.toISOString(), [simulatedToday]);

  const advanceDemoDays = useCallback((days: number) => {
    setState((s) => ({ ...s, simulatedDaysOffset: s.simulatedDaysOffset + days }));
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
    () => state.restaurants[0] || initialRestaurant,
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
          detail: `Compra de plan · ${p.metodo === "TRANSFERENCIA" ? "Transferencia" : "Efectivo"}`,
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
      staffId?: string;
      fotoComprobante?: string;
    }) => {
      const { target, template, metodo, staffId = "st1", fotoComprobante } = params;

      // 1. Identificar o crear cliente
      let client =
        target.kind === "client"
          ? state.clients.find((c) => c.id === target.client.id)
          : state.clients.find((c) => c.userId === target.user.id);

      let newClients = [...state.clients];
      if (!client) {
        const u = target.kind === "user" ? target.user : undefined;
        client = {
          id: newId("c"),
          restaurantId: RESTAURANT_ID,
          userId: u?.id,
          nombre: u ? u.name : target.client.nombre,
          telefono: u ? u.phone : target.client.telefono,
          correo: u ? u.email : target.client.correo,
        };
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
      clientId?: string;
      userId?: string;
      subscriptionId?: string;
      paraLlevar?: boolean;
      idempotencyKey?: string;
      staffId?: string;
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

      const chosenSub = activeSubs[0];
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

      setState((s) => ({
        ...s,
        subscriptions: updatedSubs,
        redemptions: [newRedemption, ...s.redemptions],
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
    [state.redemptions, state.clients, state.subscriptions, clientForUser, activeSubsForClient, evaluatedSubscriptions, simulatedToday, simulatedTodayISO],
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

      setState((s) => ({
        ...s,
        redemptions: [reversal, ...s.redemptions],
        subscriptions: updatedSubs,
      }));

      return true;
    },
    [state.redemptions, state.subscriptions, simulatedTodayISO],
  );

  // P6: POS / Venta rápida de caja
  const posSale = useCallback(
    (params: {
      items: SaleItem[];
      totalCents: number;
      paraLlevar: boolean;
      mesa?: string;
      metodo: PaymentMethod;
      staffId?: string;
    }) => {
      const { items, totalCents, paraLlevar, mesa, metodo, staffId = "st1" } = params;
      const saleId = newId("sale");
      const nextTicket = state.sales.length + 148;

      const newSale: Sale = {
        id: saleId,
        restaurantId: RESTAURANT_ID,
        ticket: nextTicket,
        items,
        totalCents,
        paraLlevar,
        mesa,
        creadoEn: simulatedTodayISO,
      };

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
        const itemQtyMap = new Map(items.map((it) => [it.platoId, it.cant]));
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
      }));

      return { sale: newSale, payment: newPayment };
    },
    [state.sales, state.menuDays, simulatedTodayKey, simulatedTodayISO],
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

      setState((s) => ({
        ...s,
        sales: [reversalSale, ...s.sales],
        payments: [reversalPayment, ...s.payments],
      }));

      return true;
    },
    [state.sales, simulatedTodayISO],
  );

  // P7: Menú del día
  const publishMenu = useCallback(
    (menuDay: MenuDay) => {
      setState((s) => ({
        ...s,
        menuDays: {
          ...s.menuDays,
          [menuDay.fecha]: { ...menuDay, publicadoEn: simulatedTodayISO },
        },
      }));
    },
    [simulatedTodayISO],
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
      let client = state.clients.find((c) => c.userId === userId);
      let newClients = [...state.clients];
      if (!client) {
        const u = APP_USERS.find((user) => user.id === userId);
        client = {
          id: newId("c"),
          restaurantId: RESTAURANT_ID,
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
    [state.clients, simulatedTodayISO],
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
    (params: { redemptionId: string; mensaje: string }) => {
      const claim: Claim = {
        id: newId("claim"),
        redemptionId: params.redemptionId,
        mensaje: params.mensaje.trim() || "No reconozco este consumo",
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
        .filter((p) => p.metodo === "TRANSFERENCIA")
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
    closeCash,
    setDinerZone,
    // Compatibilidad
    plans: legacyPlans,
    clients: legacyClients,
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
