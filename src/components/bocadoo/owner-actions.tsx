import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Banknote,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Flashlight,
  HelpCircle,
  Info,
  LockKeyhole,
  Minus,
  Phone,
  Plus,
  QrCode,
  Receipt,
  RotateCcw,
  ScanLine,
  Search,
  Sparkles,
  ShoppingBag,
  Trash2,
  Upload,
  UserCheck,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import lunchImage from "@/assets/bocadoo-lunch.jpg";
import soupImage from "@/assets/bocadoo-soup.jpg";
import veggieImage from "@/assets/bocadoo-veggie.jpg";

import {
  APP_USERS,
  initialsOf,
  money,
  normalizePhone,
  parseMoneyToCents,
  RESTAURANT_ID,
  useBocadoo,
  type AppUser,
  type ChargeTarget,
  type Client,
  type MenuDish,
  type PaymentMethod,
  type PlanTemplate,
  type SaleItem,
} from "./store";
import {
  Avatar,
  FieldLabel,
  PaymentMethods,
  PrimaryButton,
  ScanCorner,
  ScreenHeader,
  StatusBadge,
  Toggle,
} from "./ui";

// ----------------------------------------------------------------------------
// FEEDBACK AUDITIVO Y HÁPTICO (P5 IHC)
// ----------------------------------------------------------------------------
function playSoundFeedback(type: "success" | "warning" | "error", enabled = true) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Chime ascendente
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "warning") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // Ignorado si audio bloqueado por navegador
  }

  try {
    if (navigator.vibrate) {
      if (type === "success") navigator.vibrate(60);
      else if (type === "warning") navigator.vibrate([40, 40, 40]);
      else navigator.vibrate([100, 50, 100]);
    }
  } catch {
    // Ignorado
  }
}

// ----------------------------------------------------------------------------
// COMPONENTES COMUNES DE CAJA
// ----------------------------------------------------------------------------
function CajaTabs({ active }: { active: "scan" | "pos" }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1 text-xs font-black">
      <Link
        to="/app/dueno/descontar"
        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-center transition-all ${
          active === "scan"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ScanLine size={16} /> Escanear / Descontar
      </Link>
      <Link
        to="/app/dueno/registrar-consumo"
        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-center transition-all ${
          active === "pos"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Receipt size={16} /> Venta sin app (POS)
      </Link>
    </div>
  );
}

// Búfer flotante de Deshacer (10 segundos)
function UndoBanner({
  secondsLeft,
  message,
  onUndo,
}: {
  secondsLeft: number;
  message: string;
  onUndo: () => void;
}) {
  const pct = Math.max(0, (secondsLeft / 10) * 100);

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 rounded-2xl bg-foreground p-3.5 text-background shadow-phone animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-background truncate">{message}</p>
          <p className="text-[11px] text-background/70">Deshacer disponible ({secondsLeft}s)</p>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-1.5 rounded-xl bg-danger px-3.5 py-2 text-xs font-black text-danger-foreground shadow-xs active:scale-95"
        >
          <RotateCcw size={14} /> Deshacer
        </button>
      </div>
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-background/20">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Directorio unificado de comensales
type Person = {
  key: string;
  name: string;
  sub: string;
  status: "Registrado" | "Sin plan" | "Plan activo";
  target: ChargeTarget;
  lunchesLeft: number;
  phone: string;
};

function usePeopleDirectory(): Person[] {
  const { clients } = useBocadoo();
  return useMemo(() => {
    const clientByUser = new Map(clients.filter((c) => c.userId).map((c) => [c.userId!, c]));
    const fromUsers: Person[] = APP_USERS.map((u) => {
      const client = clientByUser.get(u.id);
      return {
        key: `u-${u.id}`,
        name: u.name,
        sub: `@${u.username}`,
        phone: u.phone,
        status: client && client.lunchesLeft > 0 ? "Plan activo" : "Registrado",
        target: client ? { kind: "client", client } : { kind: "user", user: u },
        lunchesLeft: client?.lunchesLeft ?? 0,
      };
    });
    const fromContacts: Person[] = clients
      .filter((c) => !c.userId)
      .map((c) => ({
        key: `c-${c.id}`,
        name: c.nombre,
        sub: c.telefono,
        phone: c.telefono,
        status: c.lunchesLeft > 0 ? "Plan activo" : "Sin plan",
        target: { kind: "client", client: c },
        lunchesLeft: c.lunchesLeft,
      }));
    return [...fromUsers, ...fromContacts];
  }, [clients]);
}

// ============================================================================
// P5 — ESCANEAR QR / DESCONTAR EN 1 TOQUE (PANTALLA COMPLETA 4 COLORES)
// ============================================================================
type ScanResult =
  | { type: "VERDE"; name: string; lunchesLeft: number; redemptionId: string }
  | { type: "AMBAR"; name: string; lunchesLeft: number; reason: string; redemptionId: string }
  | { type: "ROJO"; title: string; detail: string; action: "vender" | "suelto" }
  | { type: "GRIS"; title: string; detail: string }
  | null;

export function ScanDiscountScreen() {
  const {
    clients,
    redeemLunch,
    undoRedemption,
    soundEnabled,
    clientForUser,
    simulatedToday,
    planTemplates,
  } = useBocadoo();

  const directory = usePeopleDirectory();
  const [tab, setTab] = useState<"scan" | "search">("scan");
  const [query, setQuery] = useState("");
  const [demoScenario, setDemoScenario] = useState("NORMAL");
  const [result, setResult] = useState<ScanResult>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoRedemptionId, setUndoRedemptionId] = useState<string | null>(null);

  // Temporizador de 10s para deshacer
  useEffect(() => {
    if (undoSeconds <= 0) {
      setUndoRedemptionId(null);
      return;
    }
    const timer = setInterval(() => {
      setUndoSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [undoSeconds]);

  // Autocerrar pantalla verde tras 3.5 segundos si el cajero no toca nada
  useEffect(() => {
    if (result?.type === "VERDE") {
      const autoClose = setTimeout(() => {
        setResult(null);
      }, 3500);
      return () => clearTimeout(autoClose);
    }
  }, [result]);

  const executeDiscount = (clientId?: string, userId?: string, scenario = demoScenario) => {
    // 1. Escenarios de simulación de error para demostración con dueños
    if (scenario === "WRONG_RESTAURANT") {
      playSoundFeedback("error", soundEnabled);
      setResult({
        type: "ROJO",
        title: "Plan de otro restaurante",
        detail: "Este plan pertenece a 'El Patio' en La Floresta. No es válido en La Cuchara de San Blas.",
        action: "vender",
      });
      return;
    }

    if (scenario === "EXPIRED_QR") {
      playSoundFeedback("error", soundEnabled);
      setResult({
        type: "ROJO",
        title: "Código QR vencido",
        detail: "La captura de pantalla expiró (>30 s). Pide al comensal que abra su app Bocadoo.",
        action: "suelto",
      });
      return;
    }

    if (scenario === "ALREADY_REDEEMED") {
      playSoundFeedback("warning", soundEnabled);
      setResult({
        type: "GRIS",
        title: "Almuerzo ya validado",
        detail: "Carlos Mejía ya validó su almuerzo hace 40 segundos. Tranquilo, no se cobró doble.",
      });
      return;
    }

    if (scenario === "NO_BALANCE") {
      playSoundFeedback("error", soundEnabled);
      setResult({
        type: "ROJO",
        title: "Sin almuerzos disponibles",
        detail: "A Carlos se le acabaron los almuerzos de su plan mensual.",
        action: "vender",
      });
      return;
    }

    if (scenario === "PLAN_EXPIRED") {
      playSoundFeedback("error", soundEnabled);
      setResult({
        type: "ROJO",
        title: "Plan vencido el 15 de Octubre",
        detail: "La vigencia de 35 días caducó. Ofrécele renovar su plan hoy.",
        action: "vender",
      });
      return;
    }

    // 2. Ejecución real a través de FIFO en el store
    const targetUserId = userId || "u1";
    const res = redeemLunch({
      userId: targetUserId,
      clientId,
      idempotencyKey: `scan-${Date.now()}`,
    });

    if (res.status === "SUCCESS") {
      const rId = res.redemption.id;
      setUndoRedemptionId(rId);
      setUndoSeconds(10);

      if (res.isLastLunch || scenario === "LAST_LUNCH") {
        playSoundFeedback("warning", soundEnabled);
        setResult({
          type: "AMBAR",
          name: res.client.nombre,
          lunchesLeft: 0,
          reason: `¡Es el último almuerzo de ${res.client.nombre}! Ofrécele renovar ahora.`,
          redemptionId: rId,
        });
      } else if (res.isExpiringSoon || scenario === "EXPIRING_SOON") {
        playSoundFeedback("warning", soundEnabled);
        setResult({
          type: "AMBAR",
          name: res.client.nombre,
          lunchesLeft: res.lunchesLeft,
          reason: `Su plan vence en menos de 3 días. Recuérdale renovar antes de que caduque.`,
          redemptionId: rId,
        });
      } else {
        playSoundFeedback("success", soundEnabled);
        setResult({
          type: "VERDE",
          name: res.client.nombre,
          lunchesLeft: res.lunchesLeft,
          redemptionId: rId,
        });
      }
    } else {
      playSoundFeedback("error", soundEnabled);
      setResult({
        type: "ROJO",
        title: res.message,
        detail: "El comensal no tiene almuerzos vigentes en este restaurante.",
        action: "vender",
      });
    }
  };

  const handleUndo = () => {
    if (!undoRedemptionId) return;
    undoRedemption(undoRedemptionId);
    setUndoSeconds(0);
    setResult(null);
    toast.success("Descuento deshecho: se devolvió 1 almuerzo al cliente.");
  };

  const searchResults = query.trim()
    ? directory.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query) ||
          p.sub.toLowerCase().includes(query.toLowerCase()),
      )
    : directory;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <ScreenHeader eyebrow="CAJA / SERVICIO" title="Descontar almuerzo" back="/app/dueno" />

        <div className="mt-3">
          <CajaTabs active="scan" />
        </div>

        {/* Pestañas internas: Cámara vs Buscar */}
        <div className="mt-3 grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("scan")}
            className={`rounded-lg py-2.5 text-center transition-all ${
              tab === "scan" ? "bg-card font-black text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Cámara QR simulada
          </button>
          <button
            type="button"
            onClick={() => setTab("search")}
            className={`rounded-lg py-2.5 text-center transition-all ${
              tab === "search" ? "bg-card font-black text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Buscar por nombre / cel
          </button>
        </div>

        {tab === "scan" ? (
          <div className="mt-4">
            {/* Visor de cámara simulada */}
            <div className="relative overflow-hidden rounded-[28px] bg-card-dark p-4 text-card-dark-foreground shadow-card">
              <div className="relative grid h-[210px] place-items-center overflow-hidden rounded-2xl bg-phone">
                <QrCode size={110} strokeWidth={1.2} className="text-card-dark-muted/30" />
                <ScanCorner className="left-5 top-5 rounded-tl-xl border-l-4 border-t-4 border-primary" />
                <ScanCorner className="right-5 top-5 rounded-tr-xl border-r-4 border-t-4 border-primary" />
                <ScanCorner className="bottom-5 left-5 rounded-bl-xl border-b-4 border-l-4 border-primary" />
                <ScanCorner className="bottom-5 right-5 rounded-br-xl border-b-4 border-r-4 border-primary" />
                <div className="absolute inset-x-8 top-[48%] h-0.5 rounded-full bg-primary shadow-brand animate-pulse" />
                <div className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/20 text-white">
                  <Flashlight size={16} />
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-card-dark-muted">
                Apunta al código QR dinámico del comensal
              </p>

              {/* Botón de 1 toque: Simular escaneo */}
              <button
                type="button"
                onClick={() => executeDiscount()}
                className="mt-4 flex h-16 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-brand hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <ScanLine size={22} />
                <span>Escanear y descontar en 1 toque</span>
              </button>
            </div>

            {/* Selector de escenarios demo para mostrar al dueño los 8 resultados */}
            <div className="mt-4 rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-primary">
                  PROBAR CASOS DEL PILOTO
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">Demo</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs font-bold">
                {[
                  { id: "NORMAL", label: "✓ Validado normal" },
                  { id: "LAST_LUNCH", label: "! Último almuerzo" },
                  { id: "EXPIRING_SOON", label: "! Vence pronto" },
                  { id: "NO_BALANCE", label: "× Sin saldo" },
                  { id: "PLAN_EXPIRED", label: "× Plan vencido" },
                  { id: "WRONG_RESTAURANT", label: "× Otro restaurante" },
                  { id: "EXPIRED_QR", label: "× QR expirado" },
                  { id: "ALREADY_REDEEMED", label: "— Ya validado" },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setDemoScenario(s.id);
                      executeDiscount(undefined, undefined, s.id);
                    }}
                    className={`rounded-xl p-2 text-left border text-xs font-bold transition-all ${
                      demoScenario === s.id
                        ? "border-primary bg-accent text-primary font-black"
                        : "border-border bg-muted/60 text-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Pestaña de Búsqueda de Respaldo */
          <div className="mt-4 space-y-3">
            <div className="flex h-12 items-center gap-3 rounded-2xl bg-card px-4 shadow-soft ring-primary focus-within:ring-2">
              <Search size={18} className="text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca por nombre o últimos 4 dígitos"
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground"
                autoFocus
              />
            </div>

            <div className="divide-y divide-border rounded-2xl bg-card p-1 shadow-soft">
              {searchResults.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">
                  No encontramos comensales con ese nombre o teléfono.
                </p>
              ) : (
                searchResults.map((p) => (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => {
                      const client = p.target.kind === "client" ? p.target.client : undefined;
                      const user = p.target.kind === "user" ? p.target.user : undefined;
                      executeDiscount(client?.id, user?.id);
                    }}
                    className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 p-3 text-left hover:bg-muted/50 rounded-xl active:scale-[0.98] transition-all"
                  >
                    <Avatar initials={initialsOf(p.name)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">
                        {p.sub} · {p.lunchesLeft} alm.
                      </p>
                    </div>
                    <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                      Descontar 1
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANTALLAS DE RESULTADO A PANTALLA COMPLETA (VERDE, ÁMBAR, ROJO, GRIS) */}
        {result && (
          <Overlay onClose={() => setResult(null)}>
            <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              {result.type === "VERDE" && (
                <div className="rounded-[28px] bg-success p-6 text-center text-success-foreground shadow-brand">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-white">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-wider text-white/80">
                    ALMUERZO VALIDADO
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">{result.name}</h3>
                  <p className="mt-2 text-4xl font-black text-white">
                    Le quedan {result.lunchesLeft}
                  </p>
                  <p className="mt-1 text-xs text-white/80">almuerzos disponibles en su plan</p>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-foreground shadow-xs active:scale-95"
                    >
                      <RotateCcw size={16} /> Deshacer descuento ({undoSeconds}s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="h-10 text-xs font-bold text-white/90 hover:underline"
                    >
                      Siguiente comensal
                    </button>
                  </div>
                </div>
              )}

              {result.type === "AMBAR" && (
                <div className="rounded-[28px] bg-warning p-6 text-center text-warning-foreground shadow-brand">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-black/10 text-black">
                    <AlertTriangle size={48} strokeWidth={2.5} />
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-wider text-black/70">
                    AVISO DE RENOVACIÓN
                  </p>
                  <h3 className="mt-1 text-xl font-black text-black">{result.name}</h3>
                  <p className="mt-2 text-sm font-extrabold text-black/90 leading-snug">
                    {result.reason}
                  </p>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to="/app/dueno/cobrar"
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-black text-white shadow-xs active:scale-95"
                    >
                      <CreditCard size={18} /> Venderle otro plan ahora
                    </Link>
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-white/60 text-xs font-black text-black active:scale-95"
                    >
                      <RotateCcw size={14} /> Deshacer ({undoSeconds}s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="h-9 text-xs font-bold text-black/80 hover:underline"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {result.type === "ROJO" && (
                <div className="rounded-[28px] bg-danger p-6 text-center text-danger-foreground shadow-brand">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-white">
                    <XCircle size={48} strokeWidth={2.5} />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white">{result.title}</h3>
                  <p className="mt-2 text-xs text-white/90 leading-relaxed">{result.detail}</p>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to="/app/dueno/cobrar"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-foreground shadow-xs active:scale-95"
                    >
                      <CreditCard size={16} /> Vender plan nuevo
                    </Link>
                    <Link
                      to="/app/dueno/registrar-consumo"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white/20 text-xs font-black text-white hover:bg-white/30 active:scale-95"
                    >
                      <Receipt size={16} /> Cobrar almuerzo suelto ($3,00)
                    </Link>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="h-10 text-xs font-bold text-white/80 hover:underline"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {result.type === "GRIS" && (
                <div className="rounded-[28px] bg-card p-6 text-center text-foreground border border-border shadow-card">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Info size={36} />
                  </div>
                  <h3 className="mt-4 text-lg font-black">{result.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {result.detail}
                  </p>
                  <PrimaryButton onClick={() => setResult(null)}>Entendido</PrimaryButton>
                </div>
              )}
            </div>
          </Overlay>
        )}

        {/* Búfer flotante de Deshacer */}
        {undoSeconds > 0 && !result && (
          <UndoBanner
            secondsLeft={undoSeconds}
            message="Almuerzo descontado en caja"
            onUndo={handleUndo}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// P6 — CAJA UNIFICADA / VENTA SIN APP (POS)
// ============================================================================
type CartItem = {
  platoId: string;
  nombre: string;
  cant: number;
  precioCents: number;
  isLunch: boolean;
};

export function PosScreen() {
  const { menuDays, simulatedTodayKey, posSale, undoSale, restaurant, soundEnabled } = useBocadoo();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [paraLlevar, setParaLlevar] = useState(false);
  const [mesa, setMesa] = useState("");
  const [undoSaleId, setUndoSaleId] = useState<string | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);

  // Temporizador para deshacer venta
  useEffect(() => {
    if (undoSeconds <= 0) {
      setUndoSaleId(null);
      return;
    }
    const timer = setInterval(() => setUndoSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [undoSeconds]);

  // Catálogo dinámico desde el menú del día
  const currentMenu = menuDays[simulatedTodayKey];

  const posItems = useMemo(() => {
    const list: Array<{
      id: string;
      nombre: string;
      precioCents: number;
      isLunch: boolean;
      agotado: boolean;
      porciones?: number;
    }> = [
      {
        id: "pos-almuerzo-completo",
        nombre: "Almuerzo del día completo",
        precioCents: restaurant.precioSueltoCents || 300,
        isLunch: true,
        agotado: false,
      },
    ];

    if (currentMenu) {
      currentMenu.secciones.fuerte.forEach((d) => {
        list.push({
          id: d.id,
          nombre: d.nombre,
          precioCents: d.precioCents || restaurant.precioSueltoCents || 300,
          isLunch: true,
          agotado: d.agotado,
          porciones: d.porciones,
        });
      });
      currentMenu.secciones.adicional.forEach((d) => {
        list.push({
          id: d.id,
          nombre: d.nombre,
          precioCents: d.precioCents || 75,
          isLunch: false,
          agotado: d.agotado,
        });
      });
    }

    return list;
  }, [currentMenu, restaurant]);

  const addItem = (item: (typeof posItems)[number]) => {
    if (item.agotado) {
      toast.error(`${item.nombre} está agotado hoy.`);
      return;
    }
    setCart((prev) => {
      const existing = prev[item.id];
      const nextCant = (existing?.cant ?? 0) + 1;
      return {
        ...prev,
        [item.id]: {
          platoId: item.id,
          nombre: item.nombre,
          cant: nextCant,
          precioCents: item.precioCents,
          isLunch: item.isLunch,
        },
      };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.cant <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...existing, cant: existing.cant - 1 } };
    });
  };

  const cartList = Object.values(cart);
  const itemsTotalCents = cartList.reduce((sum, it) => sum + it.cant * it.precioCents, 0);
  const lunchCount = cartList.reduce((sum, it) => sum + (it.isLunch ? it.cant : 0), 0);
  const recargoCents = paraLlevar ? lunchCount * (restaurant.recargoParaLlevarCents || 25) : 0;
  const finalTotalCents = itemsTotalCents + recargoCents;

  const handleCharge = (metodo: PaymentMethod) => {
    if (cartList.length === 0) return;

    const res = posSale({
      items: cartList,
      totalCents: finalTotalCents,
      paraLlevar,
      mesa: mesa.trim() || undefined,
      metodo,
    });

    playSoundFeedback("success", soundEnabled);
    setUndoSaleId(res.sale.id);
    setUndoSeconds(10);
    setCart({});
    toast.success(`Venta cobrada: Ticket #${String(res.sale.ticket).padStart(4, "0")}`, {
      description: `${money(finalTotalCents)} · ${metodo === "EFECTIVO" ? "Efectivo" : "Transferencia"}`,
    });
  };

  const handleUndoSale = () => {
    if (!undoSaleId) return;
    undoSale(undoSaleId);
    setUndoSeconds(0);
    toast.success("Venta deshecha: dinero anulado en caja.");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <ScreenHeader eyebrow="CAJA / SERVICIO" title="Venta rápida (POS)" back="/app/dueno" />

        <div className="mt-3">
          <CajaTabs active="pos" />
        </div>

        {/* Switch Para llevar con recargo empaque */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-card p-3.5 shadow-soft border border-border">
          <div>
            <p className="text-sm font-black text-foreground">¿Para llevar?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              +{money(restaurant.recargoParaLlevarCents || 25)} por tarrina en almuerzos
            </p>
          </div>
          <Toggle on={paraLlevar} onToggle={() => setParaLlevar(!paraLlevar)} label="Para llevar" />
        </div>

        {/* Catálogo de productos desde el Menú del Día */}
        <p className="mb-2 mt-4 text-xs font-black uppercase text-muted-foreground">
          PLATOS DEL MENÚ DE HOY
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {posItems.map((item) => {
            const inCart = cart[item.id]?.cant || 0;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => addItem(item)}
                disabled={item.agotado}
                className={`relative flex min-h-[96px] flex-col justify-between rounded-2xl p-3.5 text-left transition-all border ${
                  item.agotado
                    ? "border-muted bg-muted/50 opacity-60 cursor-not-allowed"
                    : inCart > 0
                      ? "border-primary bg-accent/70 shadow-sm"
                      : "border-border bg-card shadow-soft hover:bg-muted/50 active:scale-[0.98]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <p
                      className={`text-xs font-black leading-snug line-clamp-2 ${
                        item.agotado ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.nombre}
                    </p>
                    {inCart > 0 && (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground shadow-xs">
                        {inCart}
                      </span>
                    )}
                  </div>
                  {item.porciones !== undefined && !item.agotado && (
                    <p className="mt-1 text-[11px] font-bold text-muted-foreground">
                      Quedan {item.porciones} porc.
                    </p>
                  )}
                  {item.agotado && (
                    <span className="mt-1 inline-block rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-black text-danger">
                      Agotado
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-black text-primary">{money(item.precioCents)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carrito inferior y botones de cobro en 1 toque */}
      <div className="mt-auto rounded-t-[32px] bg-card-dark px-5 pb-6 pt-4 text-card-dark-foreground shadow-phone">
        {cartList.length === 0 ? (
          <p className="py-4 text-center text-xs text-card-dark-muted">
            Toca los platos para agregarlos a la comanda rápida.
          </p>
        ) : (
          <div className="max-h-[120px] space-y-2 overflow-y-auto no-scrollbar text-xs">
            {cartList.map((item) => (
              <div
                key={item.platoId}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto_auto] items-center gap-2"
              >
                <span className="font-black text-lavender">{item.cant}×</span>
                <span className="truncate font-semibold">{item.nombre}</span>
                <span className="font-bold">{money(item.cant * item.precioCents)}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${item.nombre}`}
                  onClick={() => removeItem(item.platoId)}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-background/15 text-white active:scale-95"
                >
                  <Minus size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-background/20 pt-3">
          <div>
            <p className="text-xs text-card-dark-muted font-bold">
              Total {lunchCount > 0 ? `· ${lunchCount} almuerzos` : ""}
              {recargoCents > 0 ? ` (+$0,25 llevar)` : ""}
            </p>
            <p className="text-3xl font-black text-white">{money(finalTotalCents)}</p>
          </div>
        </div>

        {/* Botones de Cobro de 64 px de alto */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={cartList.length === 0}
            onClick={() => handleCharge("EFECTIVO")}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-brand disabled:opacity-40 active:scale-95 transition-all"
          >
            <Banknote size={20} /> Cobrar Efectivo
          </button>
          <button
            type="button"
            disabled={cartList.length === 0}
            onClick={() => handleCharge("TRANSFERENCIA")}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-background text-sm font-black text-foreground shadow-soft disabled:opacity-40 active:scale-95 transition-all"
          >
            <CreditCard size={20} /> Transferencia
          </button>
        </div>
      </div>

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          message="Venta registrada en caja"
          onUndo={handleUndoSale}
        />
      )}
    </div>
  );
}

// ============================================================================
// P4 — VENTA Y ACTIVACIÓN DE PLAN EN CAJA (1 TOQUE CON DESHACER 10 S)
// ============================================================================
export function ChargeScreen({ initialClientId }: { initialClientId?: string | undefined }) {
  const { planTemplates, sellPlan, undoPayment, clients } = useBocadoo();
  const navigate = useNavigate();
  const directory = usePeopleDirectory();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Person | null>(() => {
    if (!initialClientId) return null;
    const client = clients.find((c) => c.id === initialClientId);
    return client
      ? directory.find((p) => p.target.kind === "client" && p.target.client.id === client.id) ??
          null
      : null;
  });

  const [templateId, setTemplateId] = useState(
    planTemplates.find((t) => t.tipo === "Mensual")?.id || planTemplates[0]?.id || "",
  );
  const [fotoComprobante, setFotoComprobante] = useState<string | undefined>();
  const [undoPayId, setUndoPayId] = useState<string | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);

  useEffect(() => {
    if (undoSeconds <= 0) {
      setUndoPayId(null);
      return;
    }
    const timer = setInterval(() => setUndoSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [undoSeconds]);

  const chosenTemplate = planTemplates.find((t) => t.id === templateId) || planTemplates[0];

  const handleConfirmCharge = (metodo: PaymentMethod) => {
    if (!selected || !chosenTemplate) return;

    const res = sellPlan({
      target: selected.target,
      template: chosenTemplate,
      metodo,
      fotoComprobante,
    });

    setUndoPayId(res.payment.id);
    setUndoSeconds(10);
    toast.success(`Plan activado: ${selected.name}`, {
      description: `${chosenTemplate.nombre} · ${money(chosenTemplate.precioCents)}`,
    });
  };

  const handleUndo = () => {
    if (!undoPayId) return;
    undoPayment(undoPayId);
    setUndoSeconds(0);
    toast.success("Cobro de plan deshecho: dinero anulado en caja.");
  };

  if (!selected) {
    const results = query.trim()
      ? directory.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.phone.includes(query) ||
            p.sub.toLowerCase().includes(query.toLowerCase()),
        )
      : directory;

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <ScreenHeader eyebrow="COBRAR PLAN" title="Buscar comensal" back="/app/dueno" />
          <div className="mt-4 flex h-12 items-center gap-3 rounded-2xl bg-card px-4 shadow-soft ring-primary focus-within:ring-2">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre, usuario o celular"
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="mt-4 space-y-2">
            {results.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() => setSelected(p)}
                className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-soft hover:bg-muted/50 active:scale-[0.98] transition-all"
              >
                <Avatar initials={initialsOf(p.name)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{p.sub}</p>
                </div>
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <ScreenHeader eyebrow="COBRAR PLAN" title="Confirmar cobro" back="/app/dueno/cobrar" />

        {/* Cliente seleccionado */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted p-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar initials={initialsOf(selected.name)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{selected.name}</p>
              <p className="truncate text-xs text-muted-foreground mt-0.5">{selected.sub}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs font-bold text-primary hover:underline"
          >
            Cambiar
          </button>
        </div>

        {/* 3 tarjetas grandes de planes */}
        <p className="mb-2 mt-5 text-xs font-black uppercase text-muted-foreground">
          ELIGE EL PLAN A COBRAR
        </p>
        <div className="space-y-2.5">
          {planTemplates.map((t) => {
            const on = t.id === templateId;
            const unitPrice = (t.precioCents / t.almuerzos / 100).toFixed(2).replace(".", ",");
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left border-2 transition-all ${
                  on
                    ? "border-primary bg-accent/70 shadow-sm"
                    : "border-border bg-card shadow-soft hover:bg-muted/40"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-black text-primary uppercase">
                      {t.tipo}
                    </span>
                    <p className="text-sm font-black">{t.nombre}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground font-semibold">
                    {t.almuerzos} almuerzos · ${unitPrice} c/u · Vigencia {t.vigenciaDias} días
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-primary">{money(t.precioCents)}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Foto opcional del comprobante de transferencia */}
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-3.5 text-center">
          <p className="text-xs font-bold text-muted-foreground">
            {fotoComprobante ? `✓ ${fotoComprobante}` : "Foto del comprobante (opcional)"}
          </p>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-xs font-black text-foreground hover:bg-muted/80 active:scale-95">
            <Upload size={14} /> Subir captura Banco Pichincha / Deuna
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFotoComprobante(file.name);
              }}
            />
          </label>
        </div>

        {/* Botones de cobro directo en 1 toque */}
        <div className="mt-6 space-y-2.5">
          <p className="text-xs font-black uppercase text-muted-foreground text-center">
            TOCA EL MÉTODO PARA ACTIVAR EL PLAN
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleConfirmCharge("EFECTIVO")}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-brand active:scale-95 transition-all"
            >
              <Banknote size={20} /> Cobré Efectivo {money(chosenTemplate?.precioCents || 0)}
            </button>
            <button
              type="button"
              onClick={() => handleConfirmCharge("TRANSFERENCIA")}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-black text-background shadow-soft active:scale-95 transition-all"
            >
              <CreditCard size={20} /> Cobré Transferencia
            </button>
          </div>
        </div>
      </div>

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          message={`Plan activado para ${selected.name}`}
          onUndo={handleUndo}
        />
      )}
    </div>
  );
}

// ============================================================================
// P3 — CREAR O EDITAR PLANES
// ============================================================================
const PLAN_PRESETS: Record<
  string,
  { name: string; lunches: number; days: number; priceCents: number }
> = {
  Semanal: { name: "Plan semanal", lunches: 5, days: 7, priceCents: 1500 },
  Quincenal: { name: "Plan quincenal", lunches: 10, days: 18, priceCents: 2800 },
  Mensual: { name: "Plan mensual ejecutivo", lunches: 20, days: 35, priceCents: 5500 },
  Libre: { name: "Plan personalizado", lunches: 12, days: 21, priceCents: 3200 },
};

export function NewPlanScreen({ initialType = "Mensual" }: { initialType?: string }) {
  const { addPlan, activeRole } = useBocadoo();
  const navigate = useNavigate();

  if (activeRole === "CASHIER") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-muted text-muted-foreground">
          <LockKeyhole size={28} />
        </div>
        <h2 className="mt-4 text-xl font-black text-foreground">Acceso restringido a Caja</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El rol CAJA no puede crear ni editar planes. Solicita acceso a María (Dueña).
        </p>
        <Link
          to="/app/dueno"
          className="mt-6 flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-brand"
        >
          Volver a Caja
        </Link>
      </div>
    );
  }

  const preset = PLAN_PRESETS[initialType] || PLAN_PRESETS.Mensual;
  const [tipo, setTipo] = useState<any>(initialType);
  const [nombre, setNombre] = useState(preset.name);
  const [almuerzos, setAlmuerzos] = useState(preset.lunches);
  const [dias, setDias] = useState(preset.days);
  const [precioCents, setPrecioCents] = useState(preset.priceCents);
  const [cupos, setCupos] = useState(40);
  const [visible, setVisible] = useState(true);

  const selectPreset = (t: string) => {
    const p = PLAN_PRESETS[t];
    if (!p) return;
    setTipo(t);
    setNombre(p.name);
    setAlmuerzos(p.lunches);
    setDias(p.days);
    setPrecioCents(p.priceCents);
  };

  const publish = () => {
    if (!nombre.trim() || almuerzos <= 0 || precioCents <= 0) {
      toast.error("Completa el nombre, almuerzos y precio.");
      return;
    }

    addPlan({
      tipo,
      nombre: nombre.trim(),
      almuerzos,
      precioCents,
      vigenciaDias: dias,
      cupos,
      visibleEnMarketplace: visible,
      activo: true,
    });

    toast.success("Plan publicado", { description: `${nombre.trim()} ya está disponible en caja.` });
    navigate({ to: "/app/dueno/planes" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <ScreenHeader eyebrow="CATÁLOGO DE PLANES" title="Nuevo plan" back="/app/dueno/planes" />

        {/* Tarjeta de vista previa en tiempo real */}
        <div className="mt-4 rounded-2xl bg-card-dark p-4 text-card-dark-foreground shadow-card">
          <p className="text-xs font-black uppercase tracking-wider text-lavender">VISTA PREVIA</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-base font-black text-white">{nombre || "Nombre del plan"}</p>
              <p className="text-xs text-card-dark-muted mt-0.5">
                {almuerzos} almuerzos · {dias} días de vigencia
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{money(precioCents)}</p>
              <p className="text-xs text-lavender">
                ${(precioCents / Math.max(1, almuerzos) / 100).toFixed(2).replace(".", ",")} c/u
              </p>
            </div>
          </div>
        </div>

        {/* Selector de presets */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl bg-muted p-1 text-xs font-bold">
          {["Semanal", "Quincenal", "Mensual", "Libre"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => selectPreset(t)}
              className={`rounded-xl py-2.5 text-center transition-all ${
                tipo === t
                  ? "bg-primary font-black text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground">
              Nombre del plan
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 flex h-12 w-full items-center rounded-xl bg-muted px-4 text-sm font-bold outline-none ring-primary focus:ring-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs font-bold text-muted-foreground">Almuerzos</p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAlmuerzos((v) => Math.max(1, v - 1))}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-background text-lg font-black shadow-xs active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span className="text-xl font-black">{almuerzos}</span>
                <button
                  type="button"
                  onClick={() => setAlmuerzos((v) => v + 1)}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground text-lg font-black shadow-xs active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs font-bold text-muted-foreground">Vigencia (días)</p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDias((v) => Math.max(1, v - 1))}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-background text-lg font-black shadow-xs active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span className="text-xl font-black">{dias}</span>
                <button
                  type="button"
                  onClick={() => setDias((v) => v + 1)}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground text-lg font-black shadow-xs active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-muted-foreground">
              Precio total del plan
            </label>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrecioCents((v) => Math.max(100, v - 100))}
                className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-lg font-black active:scale-95"
              >
                <Minus size={18} />
              </button>
              <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-card border border-border text-2xl font-black text-primary">
                {money(precioCents)}
              </div>
              <button
                type="button"
                onClick={() => setPrecioCents((v) => v + 100)}
                className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground text-lg font-black active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-black text-foreground">Visible en marketplace</p>
              <p className="text-xs text-muted-foreground">Los comensales pueden pedirlo en la app</p>
            </div>
            <Toggle on={visible} onToggle={() => setVisible(!visible)} label="Visible" />
          </div>

          <div className="rounded-2xl bg-muted p-3.5 text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground">Comisión Bocadoo: 0% en tu caja</p>
            <p className="mt-0.5">
              Lo que vendes en tu mostrador es 100% tuyo. Solo cobramos un porcentaje si el cliente
              llega por el marketplace de Bocadoo.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={publish}>
            <Check size={18} /> Guardar y publicar plan
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
