import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Banknote,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Landmark,
  Minus,
  Plus,
  QrCode,
  Zap,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import lunchImage from "@/assets/bocadoo-lunch.jpg";
import veggieImage from "@/assets/bocadoo-veggie.jpg";
import { UndoBanner } from "@/design-system";
import {
  useBocadoo,
  RESTAURANT_ID,
  breakfastDishes,
  type MenuDish,
  type PaymentMethod,
  type SaleItem,
} from "@/components/bocadoo/store";
import { soundFeedback } from "@/platform/feedback";

/* ------------------------------------------------------------------ */
/* Reglas de precio del almuerzo (en centavos, evita errores de float) */
/* ------------------------------------------------------------------ */
const LUNCH_BASE_CENTS = 300; // sopa + segundo (+ jugo/postre del día) si el plato no trae precio
const SOLO_SEGUNDO_DISCOUNT_CENTS = 50; // solo segundo = precio del almuerzo - $0,50
const SOLO_SOPA_CENTS = 125;
const PLAN_LUNCH_VALUE_CENTS = 300; // lo que cubre el plan por almuerzo
const PLAN_BREAKFAST_VALUE_CENTS = 250; // lo que cubre el plan por desayuno
const NONE = "__none__"; // "Sin sopa" / "Sin segundo"
const TAKEAWAY = "Para llevar";
const MESAS = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Barra", TAKEAWAY];
const STORAGE_KEY = "bocadoo.pos.tickets.v1";

type Category = "almuerzos" | "desayunos" | "carta" | "extras" | "bebidas";
type PayChoice = "EFECTIVO" | "TRANSFERENCIA" | "DEUNA" | "TARJETA";

type LinePart = { platoId: string; nombre: string; priceCents: number };

type CartLine = {
  key: string;
  kind: "almuerzo" | "desayuno" | "carta" | "extra" | "bebida";
  name: string;
  detail?: string | undefined;
  unitCents: number;
  qty: number;
  /** Platos del menú que componen la línea (para descontar porciones y estadística). */
  parts?: LinePart[] | undefined;
  /** true cuando es almuerzo completo (sopa + segundo). */
  isCombo?: boolean | undefined;
};

type CatalogItem = {
  id: string;
  name: string;
  cents: number;
  description: string;
  image?: string;
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2).replace(".", ",")}`;

const parseMoneyToCents = (text: string): number | null => {
  const clean = text.trim().replace(",", ".");
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

/* --------------------- Catálogo fuera del menú del día --------------------- */
const CARTA: CatalogItem[] = [
  { id: "car-1", name: "Churrasco montado", cents: 550, description: "Lomo, huevo, papas y ensalada", image: lunchImage },
  { id: "car-2", name: "Seco de chivo", cents: 600, description: "Con arroz amarillo y maduro", image: lunchImage },
  { id: "car-3", name: "Trucha frita", cents: 650, description: "Con patacones y ensalada", image: lunchImage },
  { id: "car-4", name: "Lomo saltado", cents: 500, description: "Res salteada con cebolla y tomate", image: veggieImage },
  { id: "car-5", name: "Pechuga a la plancha", cents: 450, description: "Con menestra de lenteja", image: lunchImage },
];

const EXTRAS: CatalogItem[] = [
  { id: "ext-1", name: "Aguacate", cents: 75, description: "Porción" },
  { id: "ext-2", name: "Huevo frito", cents: 50, description: "Adicional" },
  { id: "ext-3", name: "Maduro con queso", cents: 75, description: "Porción" },
  { id: "ext-4", name: "Papas fritas", cents: 100, description: "Porción" },
  { id: "ext-5", name: "Arroz extra", cents: 50, description: "Porción" },
  { id: "ext-6", name: "Ensalada", cents: 75, description: "Porción" },
];

const BEBIDAS: CatalogItem[] = [
  { id: "beb-1", name: "Jugo de naranjilla", cents: 75, description: "Natural" },
  { id: "beb-2", name: "Limonada", cents: 100, description: "Con hierbabuena" },
  { id: "beb-3", name: "Gaseosa personal", cents: 100, description: "300 ml" },
  { id: "beb-4", name: "Agua", cents: 75, description: "500 ml" },
  { id: "beb-5", name: "Postre del día", cents: 100, description: "Flan o tres leches" },
  { id: "beb-6", name: "Café", cents: 100, description: "Pasado" },
];

export interface RegistrarConsumoScreenProps {
  onBack?: () => void;
  onScanPass?: () => void;
  onOpenMenu?: () => void;
}

export const RegistrarConsumoScreen: React.FC<RegistrarConsumoScreenProps> = ({
  onBack,
  onScanPass,
  onOpenMenu,
}) => {
  const {
    posSale,
    undoSale,
    ticket,
    menuDays,
    simulatedTodayKey,
    toggleSoldOut,
    soundEnabled,
    rawClients,
  } = useBocadoo();

  const [mode, setMode] = useState<"directa" | "plan">("directa");
  const [category, setCategory] = useState<Category>("almuerzos");
  const [mesa, setMesa] = useState<string>("Mesa 1");
  // Un ticket abierto por mesa: se "guarda solo" al cambiar de mesa.
  const [tickets, setTickets] = useState<Record<string, CartLine[]>>({});
  const [hydrated, setHydrated] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);

  const [payment, setPayment] = useState<PayChoice>("EFECTIVO");
  const [cashText, setCashText] = useState("");

  const [soupPick, setSoupPick] = useState<string | null>(null);
  const [mainPick, setMainPick] = useState<string | null>(null);
  const [soldOutMode, setSoldOutMode] = useState(false);

  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");
  const [lastSale, setLastSale] = useState<{ id: string; mesa: string; lines: CartLine[] } | null>(null);

  /* ------------------ Persistencia local de tickets abiertos ------------------ */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { tickets?: Record<string, CartLine[]>; mesa?: string };
        if (parsed.tickets) setTickets(parsed.tickets);
        if (parsed.mesa && MESAS.includes(parsed.mesa)) setMesa(parsed.mesa);
      }
    } catch {
      /* datos corruptos: se ignoran */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tickets, mesa }));
    } catch {
      /* almacenamiento lleno o bloqueado */
    }
  }, [tickets, mesa, hydrated]);

  /* ------------------ Cuenta regresiva del "Deshacer" (10 s) ------------------ */
  useEffect(() => {
    if (undoSeconds <= 0) return;
    const t = setTimeout(() => setUndoSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [undoSeconds]);

  /* --------------------------- Menú publicado de hoy --------------------------- */
  const todayMenu = menuDays[simulatedTodayKey];
  const soups: MenuDish[] = todayMenu?.secciones?.sopa ?? [];
  const mains: MenuDish[] = todayMenu?.secciones?.fuerte ?? [];
  const juices: MenuDish[] = todayMenu?.secciones?.jugo ?? [];
  const desserts: MenuDish[] = todayMenu?.secciones?.postre ?? [];
  const hasMenu = soups.length > 0 || mains.length > 0;
  const breakfasts: MenuDish[] = breakfastDishes(todayMenu);

  // Si hay una sola opción disponible, se preselecciona (menos toques).
  const availSoups = soups.filter((s) => !s.agotado);
  const availMains = mains.filter((m) => !m.agotado);
  const effSoup = soupPick ?? (availSoups.length === 1 ? (availSoups[0]?.id ?? null) : null);
  const effMain = mainPick ?? (availMains.length === 1 ? (availMains[0]?.id ?? null) : null);

  /* ------------------------------ Ticket de la mesa ------------------------------ */
  const cart: CartLine[] = tickets[mesa] ?? [];

  const updateCart = (fn: (lines: CartLine[]) => CartLine[]) => {
    setTickets((prev) => {
      const next = fn(prev[mesa] ?? []);
      const copy = { ...prev };
      if (next.length === 0) delete copy[mesa];
      else copy[mesa] = next;
      return copy;
    });
  };

  const addLine = (line: Omit<CartLine, "qty">) => {
    updateCart((lines) => {
      const existing = lines.find((l) => l.key === line.key);
      if (existing) {
        return lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...lines, { ...line, qty: 1 }];
    });
  };

  const changeQty = (key: string, delta: number) => {
    updateCart((lines) =>
      lines
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const addCatalogItem = (item: CatalogItem, kind: CartLine["kind"]) => {
    addLine({ key: item.id, kind, name: item.name, unitCents: item.cents });
  };

  /* ------------------------ Constructor de almuerzo (menú) ------------------------ */
  const commitLunch = (soupId: string, mainId: string) => {
    const soup = soupId === NONE ? null : soups.find((s) => s.id === soupId) ?? null;
    const main = mainId === NONE ? null : mains.find((m) => m.id === mainId) ?? null;
    if (!soup && !main) return;

    if (soup && main) {
      const unit = main.precioCents ?? LUNCH_BASE_CENTS;
      addLine({
        key: `alm|${soup.id}|${main.id}`,
        kind: "almuerzo",
        name: "Almuerzo",
        detail: `${soup.nombre} + ${main.nombre}`,
        unitCents: unit,
        isCombo: true,
        parts: [
          { platoId: soup.id, nombre: soup.nombre, priceCents: 0 },
          { platoId: main.id, nombre: main.nombre, priceCents: unit },
        ],
      });
    } else if (main) {
      const unit = Math.max(0, (main.precioCents ?? LUNCH_BASE_CENTS) - SOLO_SEGUNDO_DISCOUNT_CENTS);
      addLine({
        key: `alm|-|${main.id}`,
        kind: "almuerzo",
        name: "Solo segundo",
        detail: main.nombre,
        unitCents: unit,
        parts: [{ platoId: main.id, nombre: main.nombre, priceCents: unit }],
      });
    } else if (soup) {
      addLine({
        key: `alm|${soup.id}|-`,
        kind: "almuerzo",
        name: "Solo sopa",
        detail: soup.nombre,
        unitCents: SOLO_SOPA_CENTS,
        parts: [{ platoId: soup.id, nombre: soup.nombre, priceCents: SOLO_SOPA_CENTS }],
      });
    }
    setSoupPick(null);
    setMainPick(null);
  };

  const addBreakfast = (dish: MenuDish) => {
    const unit = dish.precioCents ?? PLAN_BREAKFAST_VALUE_CENTS;
    addLine({
      key: `des|${dish.id}`,
      kind: "desayuno",
      name: dish.nombre,
      unitCents: unit,
      parts: [{ platoId: dish.id, nombre: dish.nombre, priceCents: unit }],
    });
  };

  const pickSoup = (id: string) => {
    if (effMain) commitLunch(id, effMain);
    else setSoupPick(id);
  };

  const pickMain = (id: string) => {
    if (effSoup) commitLunch(effSoup, id);
    else setMainPick(id);
  };

  /* --------------------------------- Totales --------------------------------- */
  const subtotal = cart.reduce((acc, l) => acc + l.unitCents * l.qty, 0);
  const itemsCount = cart.reduce((acc, l) => acc + l.qty, 0);
  const comboLine = cart.find((l) => l.isCombo);
  const breakfastLine = cart.find((l) => l.kind === "desayuno");
  const planDiscount =
    mode === "plan"
      ? (comboLine ? Math.min(PLAN_LUNCH_VALUE_CENTS, comboLine.unitCents) : 0) +
        (breakfastLine ? Math.min(PLAN_BREAKFAST_VALUE_CENTS, breakfastLine.unitCents) : 0)
      : 0;
  const total = subtotal - planDiscount;

  const isCash = payment === "EFECTIVO";
  const cashParsed = parseMoneyToCents(cashText);
  const cashInvalid = isCash && cashText.trim() !== "" && cashParsed === null;
  const received = cashParsed ?? total; // campo vacío = pago exacto
  const change = isCash ? received - total : 0;
  const shortfall = isCash && cashParsed !== null && cashParsed < total;
  const canCharge = cart.length > 0 && !shortfall && !cashInvalid;

  const billSuggestions = [1, 5, 10, 20, 50, 100].filter((b) => b * 100 >= total).slice(0, 3);

  const currentTicketNumber = ticket;

  /* --------------------------------- Cobrar --------------------------------- */
  const handleCobrar = () => {
    if (!canCharge) return;

    const items: SaleItem[] = [];
    cart.forEach((line) => {
      if (line.parts && line.parts.length > 0) {
        line.parts.forEach((part) => {
          items.push({
            platoId: part.platoId,
            nombre: part.nombre,
            cant: line.qty,
            precioCents: part.priceCents,
            isLunch: Boolean(line.isCombo) && part.priceCents > 0,
          });
        });
      } else {
        items.push({
          platoId: line.key,
          nombre: line.name,
          cant: line.qty,
          precioCents: line.unitCents,
          isLunch: false,
        });
      }
    });
    if (planDiscount > 0) {
      items.push({
        platoId: "plan-discount",
        nombre: "Descuento plan Bocadoo",
        cant: 1,
        precioCents: -planDiscount,
        isLunch: false,
      });
    }

    const metodo: PaymentMethod =
      payment === "EFECTIVO" ? "EFECTIVO" : payment === "DEUNA" ? "DEUNA" : "TRANSFERENCIA";
    const isTakeaway = mesa === TAKEAWAY;

    const res = posSale({
      items,
      totalCents: total,
      paraLlevar: isTakeaway,
      mesa: isTakeaway ? undefined : mesa,
      metodo,
    });

    soundFeedback.playSuccess(soundEnabled);

    setLastSale({ id: res.sale.id, mesa, lines: cart });
    const payLabel =
      payment === "EFECTIVO"
        ? "Efectivo"
        : payment === "TRANSFERENCIA"
          ? "Transferencia"
          : payment === "DEUNA"
            ? "Deuna"
            : "Tarjeta";
    setUndoLabel(
      isCash && change > 0
        ? `Cobrado ${fmt(total)} · Vuelto ${fmt(change)}`
        : `Cobrado ${fmt(total)} · ${payLabel}`,
    );
    setUndoSeconds(10);

    updateCart(() => []);
    setCashText("");
    setTicketOpen(false);
  };

  const handleUndo = () => {
    if (!lastSale) return;
    undoSale(lastSale.id);
    setTickets((prev) => ({ ...prev, [lastSale.mesa]: lastSale.lines }));
    setMesa(lastSale.mesa);
    setUndoSeconds(0);
    setLastSale(null);
  };

  const categories: { id: Category; label: string }[] = [
    { id: "almuerzos", label: "Almuerzos" },
    { id: "desayunos", label: "Desayunos" },
    { id: "carta", label: "A la carta" },
    { id: "extras", label: "Extras" },
    { id: "bebidas", label: "Bebidas" },
  ];

  const qtyOf = (key: string) => cart.find((l) => l.key === key)?.qty ?? 0;

  /* ----------------------------- Piezas de interfaz ----------------------------- */
  const renderDishChip = (
    dish: MenuDish,
    selected: boolean,
    onPick: () => void,
    priceLabel?: string,
  ) => {
    const out = dish.agotado;
    const disabled = out && !soldOutMode;
    const lowStock = !out && dish.porciones !== undefined && dish.porciones <= 10;
    return (
      <button
        key={dish.id}
        type="button"
        disabled={disabled}
        onClick={() => (soldOutMode ? toggleSoldOut(dish.id) : onPick())}
        aria-pressed={selected}
        className={`rounded-2xl border px-3 py-2 text-left transition-all active:scale-95 ${
          soldOutMode
            ? out
              ? "border-dashed border-danger bg-danger-container"
              : "border-dashed border-danger/50 bg-surface"
            : selected
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : out
                ? "border-border bg-background opacity-60"
                : "border-border bg-surface hover:border-primary"
        }`}
      >
        <span
          className={`block text-[13px] font-extrabold leading-tight line-clamp-2 ${
            out ? "line-through" : ""
          } ${selected && !soldOutMode ? "text-primary-foreground" : "text-foreground"}`}
        >
          {dish.nombre}
        </span>
        <span
          className={`mt-0.5 block text-[11px] font-bold ${
            out
              ? "text-danger"
              : selected && !soldOutMode
                ? "text-primary-foreground/85"
                : lowStock
                  ? "text-danger"
                  : "text-primary"
          }`}
        >
          {out ? "Agotado" : lowStock ? `Quedan ${dish.porciones}` : (priceLabel ?? "Disponible")}
        </span>
      </button>
    );
  };

  const renderNoneChip = (label: string, selected: boolean, onPick: () => void) => (
    <button
      type="button"
      onClick={onPick}
      disabled={soldOutMode}
      aria-pressed={selected}
      className={`rounded-2xl border border-dashed px-3 py-2 text-left text-[13px] font-extrabold transition-all active:scale-95 disabled:opacity-40 ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary"
      }`}
    >
      {label}
    </button>
  );

  const renderCatalogTile = (item: CatalogItem, kind: CartLine["kind"], withImage: boolean) => {
    const qty = qtyOf(item.id);
    return (
      <div
        key={item.id}
        className="relative flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-xs"
      >
        {withImage && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-background">
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-primary-container text-primary">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
            )}
          </div>
        )}
        <div className="flex items-end justify-between gap-1 p-2.5">
          <div className="min-w-0">
            <h3 className="text-[13px] font-extrabold leading-tight text-foreground line-clamp-1">
              {item.name}
            </h3>
            <span className="block text-[11px] font-semibold text-muted-foreground line-clamp-1">
              {item.description}
            </span>
            <span className="text-[14px] font-black text-primary">{fmt(item.cents)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {qty > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => changeQty(item.id, -1)}
                  aria-label={`Quitar uno de ${item.name}`}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-primary-container bg-background text-foreground active:scale-95"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-4 text-center text-[13px] font-black text-foreground">{qty}</span>
              </>
            )}
            <button
              type="button"
              onClick={() => addCatalogItem(item, kind)}
              aria-label={`Agregar ${item.name}`}
              className="grid h-8 w-8 place-items-center rounded-xl bg-primary-container text-primary active:scale-95 transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const lunchHint = (() => {
    if (!effSoup && !effMain) return "Toca la sopa y el segundo: se agrega solo.";
    if (effSoup && !effMain) return "Ahora elige el segundo.";
    return "Ahora elige la sopa.";
  })();

  const includesText = [
    juices.filter((j) => !j.agotado).map((j) => j.nombre).join(" / "),
    desserts.filter((d) => !d.agotado).map((d) => d.nombre).join(" / "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      tabIndex={0}
      aria-label="POS Restaurante Bocadoo"
      className="flex h-full flex-col overflow-hidden bg-background text-foreground focus:outline-hidden"
    >
      {/* ------------------------------ Cabecera compacta ------------------------------ */}
      <header className="shrink-0 border-b border-border bg-surface px-4 pb-2 pt-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack || (() => window.history.back())}
              aria-label="Volver a la caja"
              className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground transition-all active:scale-95 hover:bg-secondary-container"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  CAJA ABIERTA
                </span>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              </div>
              <h1 className="text-[19px] font-black leading-none text-foreground">Registrar consumo</h1>
            </div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-container text-primary">
            <Receipt className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 rounded-2xl border border-border bg-background p-1 text-[13px] font-black">
          <button
            type="button"
            onClick={() => setMode("directa")}
            className={`rounded-xl py-1.5 transition-all ${
              mode === "directa" ? "bg-footer-bg text-image-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Venta directa
          </button>
          <button
            type="button"
            onClick={() => setMode("plan")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 transition-all ${
              mode === "plan" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Plan + Extras</span>
          </button>
        </div>

        {mode === "plan" && (
          <div className="mt-2 space-y-1 rounded-xl border border-success/60 bg-success-container p-2.5 text-xs text-success">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  Descuenta del plan: 1 almuerzo (-{fmt(PLAN_LUNCH_VALUE_CENTS)}) o 1 desayuno (-
                  {fmt(PLAN_BREAKFAST_VALUE_CENTS)})
                </span>
              </div>
              {onScanPass && (
                <button
                  type="button"
                  onClick={onScanPass}
                  className="font-black uppercase tracking-wider underline hover:opacity-80"
                >
                  Escanear QR
                </button>
              )}
            </div>
            <p className="text-xs font-medium text-success/90">
              💡 <strong>¿Cuándo se usa?</strong> Solo si un comensal con plan pidió extras, bebidas o platos a la carta y debe pagar la diferencia. Si solo viene por su almuerzo normal, <strong>escanea su QR directo en Caja en 1 toque</strong> sin necesidad de entrar a esta pantalla.
            </p>
          </div>
        )}

        {/* Mesas: cada una guarda su propio ticket abierto */}
        <div className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto py-0.5">
          {MESAS.map((m) => {
            const open = tickets[m];
            const openTotal = open ? open.reduce((a, l) => a + l.unitCents * l.qty, 0) : 0;
            const selected = mesa === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMesa(m)}
                aria-pressed={selected}
                className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold transition-all ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : open
                      ? "border border-primary bg-primary-container text-foreground"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {m === TAKEAWAY && <ShoppingBag className="h-3 w-3" />}
                <span>{m}</span>
                {open && !selected && <span className="font-black">· {fmt(openTotal)}</span>}
              </button>
            );
          })}
        </div>

        {/* Categorías (sin "Todos") */}
        <div className="mt-2 grid grid-cols-5 gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              aria-pressed={category === cat.id}
              className={`whitespace-nowrap rounded-full py-1.5 text-[11px] font-black transition-all ${
                category === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-background text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* ------------------------------ Zona de productos ------------------------------ */}
      <main className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {undoSeconds > 0 && (
          <UndoBanner inline secondsLeft={undoSeconds} onUndo={handleUndo} label={undoLabel} />
        )}

        {category === "almuerzos" && (
          <>
            {!hasMenu ? (
              <div className="rounded-[24px] border border-dashed border-border bg-surface p-5 text-center">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-2 text-[16px] font-black text-foreground">
                  Aún no hay menú publicado hoy
                </h2>
                <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                  Publícalo en 2 toques y aparece aquí al instante.
                </p>
                {onOpenMenu && (
                  <button
                    type="button"
                    onClick={onOpenMenu}
                    className="mt-3 rounded-full bg-primary px-5 py-2 text-[13px] font-black text-primary-foreground active:scale-95"
                  >
                    Publicar menú de hoy
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-primary">
                      MENÚ DE HOY
                    </span>
                    <p className="text-[12px] font-semibold text-muted-foreground">
                      {soldOutMode
                        ? "Toca el plato que se acabó. Se avisa al comensal al instante."
                        : lunchHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoldOutMode((v) => !v)}
                    aria-pressed={soldOutMode}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black transition-all active:scale-95 ${
                      soldOutMode
                        ? "bg-danger text-danger-foreground shadow-xs"
                        : "border border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {soldOutMode ? <Check className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    <span>{soldOutMode ? "Listo" : "Se acabó"}</span>
                  </button>
                </div>

                {soups.length > 0 && (
                  <section aria-label="Sopas del día">
                    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Sopa
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {soups.map((s) =>
                        renderDishChip(s, effSoup === s.id, () => pickSoup(s.id)),
                      )}
                      {renderNoneChip("Sin sopa", effSoup === NONE, () => pickSoup(NONE))}
                    </div>
                  </section>
                )}

                {mains.length > 0 && (
                  <section aria-label="Segundos del día">
                    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      Segundo
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {mains.map((m) =>
                        renderDishChip(
                          m,
                          effMain === m.id,
                          () => pickMain(m.id),
                          fmt(m.precioCents ?? LUNCH_BASE_CENTS),
                        ),
                      )}
                      {renderNoneChip("Sin segundo", effMain === NONE, () => pickMain(NONE))}
                    </div>
                  </section>
                )}

                {includesText && (
                  <p className="rounded-xl bg-primary-container px-3 py-2 text-[12px] font-semibold text-foreground">
                    <strong className="font-black">Incluye:</strong> {includesText}
                  </p>
                )}
              </>
            )}
          </>
        )}

        {category === "desayunos" && (
          <>
            {breakfasts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-surface p-5 text-center">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-2 text-[16px] font-black text-foreground">
                  Hoy no hay desayunos publicados
                </h2>
                <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                  Agrégalos en el menú del día y aparecen aquí al instante.
                </p>
                {onOpenMenu && (
                  <button
                    type="button"
                    onClick={onOpenMenu}
                    className="mt-3 rounded-full bg-primary px-5 py-2 text-[13px] font-black text-primary-foreground active:scale-95"
                  >
                    Publicar desayunos
                  </button>
                )}
              </div>
            ) : (
              <section aria-label="Desayunos del día" data-testid="pos-desayunos">
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-primary">
                      ☀️ DESAYUNOS DE HOY
                    </span>
                    <p className="text-[12px] font-semibold text-muted-foreground">
                      {soldOutMode
                        ? "Toca el desayuno que se acabó."
                        : "Toca un desayuno para agregarlo al ticket."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoldOutMode((v) => !v)}
                    aria-pressed={soldOutMode}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black transition-all active:scale-95 ${
                      soldOutMode
                        ? "bg-danger text-danger-foreground shadow-xs"
                        : "border border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {soldOutMode ? <Check className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    <span>{soldOutMode ? "Listo" : "Se acabó"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {breakfasts.map((b) =>
                    renderDishChip(
                      b,
                      qtyOf(`des|${b.id}`) > 0,
                      () => addBreakfast(b),
                      fmt(b.precioCents ?? PLAN_BREAKFAST_VALUE_CENTS),
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {category === "carta" && (
          <div className="grid grid-cols-2 gap-3">
            {CARTA.map((item) => renderCatalogTile(item, "carta", true))}
          </div>
        )}

        {category === "extras" && (
          <div className="grid grid-cols-2 gap-2.5">
            {EXTRAS.map((item) => renderCatalogTile(item, "extra", false))}
          </div>
        )}

        {category === "bebidas" && (
          <div className="grid grid-cols-2 gap-2.5">
            {BEBIDAS.map((item) => renderCatalogTile(item, "bebida", false))}
          </div>
        )}
      </main>

      {/* ------------------- Ticket plegable + cobro (siempre visible) ------------------- */}
      <footer className="shrink-0 rounded-t-[28px] bg-footer-bg px-4 pb-3 pt-2.5 text-image-foreground shadow-2xl">
        <button
          type="button"
          onClick={() => setTicketOpen((o) => !o)}
          aria-expanded={ticketOpen}
          aria-label="Mostrar u ocultar el detalle del ticket"
          className="flex w-full items-center justify-between gap-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-image-foreground/85">
              TICKET #{currentTicketNumber}
            </span>
            <span className="rounded-full bg-image-foreground/10 px-2 py-0.5 text-[11px] font-bold text-image-foreground/85">
              {mesa}
            </span>
            <span className="text-[11px] font-semibold text-image-foreground/60">
              {itemsCount} {itemsCount === 1 ? "ítem" : "ítems"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[22px] font-black leading-none">{fmt(total)}</span>
            {ticketOpen ? (
              <ChevronDown className="h-4 w-4 text-image-foreground/60" />
            ) : (
              <ChevronUp className="h-4 w-4 text-image-foreground/60" />
            )}
          </div>
        </button>

        {ticketOpen && (
          <div className="no-scrollbar mt-2 max-h-44 space-y-2 overflow-y-auto border-t border-image-foreground/10 pt-2">
            {cart.length === 0 ? (
              <p className="py-2 text-center text-[12px] font-medium text-image-foreground/50">
                Ticket vacío. Toca un plato para agregarlo.
              </p>
            ) : (
              cart.map((line) => (
                <div key={line.key} className="flex items-start justify-between gap-2 text-[13px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-image-foreground/85">{line.qty}×</span>
                      <span className="truncate font-bold">{line.name}</span>
                    </div>
                    {line.detail && (
                      <p className="truncate pl-6 text-[11px] text-image-foreground/50">{line.detail}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="font-extrabold">{fmt(line.unitCents * line.qty)}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(line.key, -1)}
                      aria-label={`Quitar uno de ${line.name}`}
                      className="grid h-6 w-6 place-items-center rounded-md bg-image-foreground/10 text-image-foreground/85 active:scale-95"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => changeQty(line.key, 1)}
                      aria-label={`Agregar otro ${line.name}`}
                      className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
            {planDiscount > 0 && (
              <div className="flex items-center justify-between text-[12px] font-bold text-image-foreground/85">
                <span>Descuento plan Bocadoo</span>
                <span>-{fmt(planDiscount)}</span>
              </div>
            )}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => updateCart(() => [])}
                className="text-[11px] font-semibold text-image-foreground/50 underline hover:text-danger"
              >
                Vaciar ticket
              </button>
            )}
          </div>
        )}

        {/* Método de pago */}
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {(
            [
              { id: "EFECTIVO", label: "Efectivo", icon: Banknote },
              { id: "TRANSFERENCIA", label: "Transfer.", icon: Landmark },
              { id: "DEUNA", label: "Deuna", icon: Zap },
              { id: "TARJETA", label: "Tarjeta", icon: CreditCard },
            ] as const
          ).map((m) => {
            const Icon = m.icon;
            const selected = payment === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setPayment(m.id);
                  if (m.id !== "EFECTIVO") setCashText("");
                }}
                aria-pressed={selected}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-black transition-all ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-image-foreground/30"
                    : "bg-image-foreground/10 text-image-foreground/80 hover:bg-image-foreground/15"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Efectivo: el cajero escribe cuánto le dan (cualquier monto) */}
        {isCash && cart.length > 0 && (
          <div className="mt-2 space-y-1.5 rounded-xl border border-image-foreground/10 bg-image-foreground/5 p-2">
            <div className="flex items-center gap-2">
              <label className="relative block flex-1">
                <span className="sr-only">Efectivo recibido</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-black text-image-foreground/60">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={cashText}
                  onChange={(e) => setCashText(e.target.value.replace(/[^0-9.,]/g, ""))}
                  placeholder="Recibido (ej. 15)"
                  aria-label="Efectivo recibido"
                  className={`w-full rounded-lg bg-image-foreground/10 py-1.5 pl-7 pr-2 text-[15px] font-black text-image-foreground placeholder:text-[12px] placeholder:font-semibold placeholder:text-image-foreground/40 focus:outline-hidden focus:ring-2 ${
                    shortfall || cashInvalid ? "ring-2 ring-danger" : "focus:ring-primary/40"
                  }`}
                />
              </label>
              {cashInvalid ? (
                <span className="rounded-full bg-danger/50 px-2.5 py-1 text-[12px] font-black text-image-foreground">
                  Monto inválido
                </span>
              ) : shortfall ? (
                <span className="rounded-full bg-danger/50 px-2.5 py-1 text-[12px] font-black text-image-foreground">
                  Faltan {fmt(total - (cashParsed ?? 0))}
                </span>
              ) : change > 0 ? (
                <span className="rounded-full bg-success/50 px-2.5 py-1 text-[12px] font-black text-image-foreground">
                  Vuelto {fmt(change)}
                </span>
              ) : (
                <span className="px-1 text-[12px] font-bold text-image-foreground/50">Exacto</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {billSuggestions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setCashText(String(b))}
                  className="rounded-md bg-image-foreground/10 px-2.5 py-1 text-[12px] font-black text-image-foreground active:scale-95 hover:bg-image-foreground/20"
                >
                  ${b}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCashText("")}
                className="rounded-md bg-image-foreground/10 px-2.5 py-1 text-[12px] font-black text-image-foreground active:scale-95 hover:bg-image-foreground/20"
              >
                Exacto
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleCobrar}
          disabled={!canCharge}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-black transition-all active:scale-[0.98] ${
            canCharge
              ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-image-foreground/20 hover:bg-primary-hover"
              : "cursor-not-allowed bg-image-foreground/15 text-image-foreground/40"
          }`}
        >
          <Banknote className="h-5 w-5" />
          <span>Cobrar {fmt(total)}</span>
        </button>
      </footer>
    </div>
  );
};
