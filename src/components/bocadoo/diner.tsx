import { useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clock,
  CreditCard,
  Eye,
  Flame,
  Gift,
  HelpCircle,
  LocateFixed,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  QrCode,
  RotateCcw,
  Search,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  ThumbsUp,
  Timer,
  UserRound,
  Utensils,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  APP_USERS,
  DINER_USER_ID,
  DINER_ZONES,
  getSimulatedDistanceKm,
  money,
  useBocadoo,
  type Claim,
  type FeedbackItem,
  type FlashOffer,
  type Order,
  type OrderItem,
  type OrderType,
  type PlanTemplate,
  type Restaurant,
} from "./store";
import {
  Avatar,
  BottomSheet,
  Logo,
  ModalHeader,
  NavBar,
  Overlay,
  PrimaryButton,
  SectionTitle,
  SettingsRow,
  Transaction,
} from "./ui";

export { LoginScreen } from "./auth";

// ----------------------------------------------------------------------------
// P5 — CÓDIGO QR DINÁMICO DEL COMENSAL (SIMULACIÓN TOTP CADA 30 SEGUNDOS)
// ----------------------------------------------------------------------------
function QrModal({
  lunchesLeft,
  planName = "Plan mensual",
  onClose,
}: {
  lunchesLeft: number;
  planName?: string;
  onClose: () => void;
}) {
  const user = APP_USERS.find((u) => u.id === DINER_USER_ID)!;

  const [secondsLeft, setSecondsLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  const [timeStep, setTimeStep] = useState(Math.floor(Date.now() / 30000));

  useEffect(() => {
    const interval = setInterval(() => {
      const nowSec = Math.floor(Date.now() / 1000);
      const rem = 30 - (nowSec % 30);
      setSecondsLeft(rem);
      setTimeStep(Math.floor(Date.now() / 30000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const simulatedHash = useMemo(() => {
    const seed = (timeStep * 31 + user.id.charCodeAt(0)) % 10000;
    return String(seed).padStart(4, "0");
  }, [timeStep, user.id]);

  const qrPayload = `BCD1.${user.id}.${timeStep}.${simulatedHash}`;
  const pct = (secondsLeft / 30) * 100;

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <ModalHeader
          icon={QrCode}
          eyebrow="MI CÓDIGO DINÁMICO"
          title="La Cuchara de San Blas"
          onClose={onClose}
        />

        <div className="mt-4 grid place-items-center rounded-[28px] bg-accent/70 p-5 border border-primary/20">
          <div className="relative rounded-2xl bg-white p-4 text-black shadow-card">
            <QRCodeSVG
              value={qrPayload}
              size={190}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#1A072E"
            />
            <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border-4 border-white bg-primary text-primary-foreground shadow-xs">
              <Utensils size={18} strokeWidth={2.8} />
            </div>
          </div>

          <p className="mt-3 text-base font-black text-foreground">@{user.username}</p>
          <p className="mt-0.5 text-xs font-bold text-primary">
            {planName} · {lunchesLeft} almuerzos disponibles
          </p>

          <div className="mt-4 w-full max-w-[220px]">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
              <span>Se renueva en</span>
              <span className="font-mono text-primary font-black">{secondsLeft}s</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed px-2">
          Presenta esta pantalla en caja. Se actualiza automáticamente para garantizar que tu saldo
          esté siempre seguro.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex h-13 w-full items-center justify-center rounded-2xl bg-secondary text-sm font-black text-foreground active:scale-[0.98] transition-transform"
        >
          Cerrar
        </button>
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P9 — MODAL DE RECLAMO DE ALMUERZO POR EL COMENSAL
// ----------------------------------------------------------------------------
function ClaimModal({
  redemptionId,
  onClose,
}: {
  redemptionId: string;
  onClose: () => void;
}) {
  const { fileClaim } = useBocadoo();
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    fileClaim(redemptionId, reason.trim());
    setSubmitted(true);
    toast.success("Reclamo enviado al restaurante", {
      description: "El dueño revisará el cobro y te responderá a la brevedad.",
    });
    setTimeout(() => onClose(), 1200);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <ModalHeader
          icon={CircleAlert}
          eyebrow="ATENCIÓN AL CLIENTE"
          title="Reclamar consumo"
          onClose={onClose}
        />

        {submitted ? (
          <div className="py-8 text-center animate-in fade-in">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/20 text-success">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="mt-3 text-base font-black">¡Reclamo enviado!</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              El restaurante verificará en caja y te responderá aquí.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              ¿No reconoces este almuerzo o te descontaron por error? Cuéntale al dueño lo sucedido
              para que revise la cámara o gaveta y te devuelva el saldo.
            </p>

            <div className="mt-3">
              <label htmlFor="claim-reason" className="text-xs font-black text-foreground">
                Motivo del reclamo
              </label>
              <textarea
                id="claim-reason"
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Estuve en clase a esa hora y no almorcé / Me cobraron 2 veces..."
                className="mt-1.5 w-full rounded-2xl border border-border bg-input p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-secondary text-xs font-black text-foreground active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-danger text-xs font-black text-white shadow-soft active:scale-95"
              >
                Enviar reclamo
              </button>
            </div>
          </form>
        )}
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P12 — MODAL DE PREORDEN EN CAMINO CON CUENTA REGRESIVA DE 30 MIN
// ----------------------------------------------------------------------------
function PreOrderModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const { cancelPreOrder, simulatedToday, restaurants } = useBocadoo();
  const rest = restaurants.find((r) => r.id === order.restaurantId);

  // Cuenta regresiva calculada respecto al reloj simulado
  const [secondsLeft, setSecondsLeft] = useState(1800);

  useEffect(() => {
    const updateCountdown = () => {
      const expiry = new Date(order.venceEn).getTime();
      const current = simulatedToday.getTime();
      const diffSecs = Math.max(0, Math.floor((expiry - current) / 1000));
      setSecondsLeft(diffSecs);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [order.venceEn, simulatedToday]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, "0")}`;
  const pct = Math.min(100, Math.max(0, (secondsLeft / 1800) * 100));

  const handleCancel = () => {
    if (confirm("¿Seguro que deseas cancelar esta orden en camino?")) {
      cancelPreOrder(order.id);
      toast.info("Orden cancelada");
      onClose();
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <ModalHeader
          icon={ShoppingBag}
          eyebrow="PREORDEN EN CAMINO"
          title={rest?.nombre || "Restaurante Bocadoo"}
          onClose={onClose}
        />

        <div className="mt-4 rounded-2xl bg-accent/60 p-4 border border-primary/20">
          {/* Cuenta regresiva de 30 min */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-black text-xs">
              <Clock size={16} />
              <span>Cuenta regresiva</span>
            </div>
            <span className="font-mono text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
              {timeFormatted}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                secondsLeft < 300 ? "bg-danger" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* QR de comanda */}
          <div className="mt-4 grid place-items-center">
            <div className="relative rounded-2xl bg-white p-3.5 shadow-card">
              <QRCodeSVG
                value={order.qrPayload}
                size={170}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#1A072E"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] font-black tracking-wider text-muted-foreground">
              {order.qrPayload}
            </p>
          </div>

          {/* Resumen de la comanda */}
          <div className="mt-3.5 space-y-1 rounded-xl bg-background p-3 text-xs border border-border">
            <div className="flex justify-between font-black text-foreground">
              <span>Tipo de pedido:</span>
              <span className="text-primary uppercase">
                {order.tipo === "LLEVAR" ? "🥡 Para llevar (+ $0,25)" : "🍽️ Para comer aquí"}
              </span>
            </div>
            <p className="font-bold text-muted-foreground pt-1 border-t border-border mt-1">
              Platos elegidos:
            </p>
            {order.items.map((it, idx) => (
              <p key={idx} className="text-foreground font-semibold">
                • {it.nombre}
              </p>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-border mt-2 font-black">
              <span>Total a resolver:</span>
              <span className="text-sm text-primary">{money(order.totalCents)} o 1 Almuerzo</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground leading-relaxed">
          No se cocina antes del escaneo. Muestra este código al llegar a caja para validar tu plato
          caliente.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-12 rounded-xl border border-danger/30 text-xs font-black text-danger hover:bg-danger/10 active:scale-95 transition-all"
          >
            Cancelar orden
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-xs active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P15 — MODAL DE OFERTA FLASH (CÓDIGO QR PARA CANJE EN CAJA)
// ----------------------------------------------------------------------------
function FlashOfferModal({
  offer,
  onClose,
}: {
  offer: FlashOffer;
  onClose: () => void;
}) {
  const { restaurants } = useBocadoo();
  const rest = restaurants.find((r) => r.id === offer.restaurantId);
  const qrPayload = `BCD-FLASH-${offer.id}-${DINER_USER_ID}`;

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <ModalHeader
          icon={Zap}
          eyebrow="OFERTA FLASH BOCADOO"
          title={offer.titulo}
          onClose={onClose}
        />

        <div className="mt-4 grid place-items-center rounded-2xl bg-amber-500/10 p-4 border border-amber-500/30">
          <span className="rounded-full bg-amber-500 text-slate-900 px-3 py-0.5 text-xs font-black uppercase">
            ⚡ Cupo asegurado
          </span>
          <div className="mt-3 relative rounded-2xl bg-white p-3.5 shadow-card">
            <QRCodeSVG value={qrPayload} size={170} level="H" bgColor="#FFFFFF" fgColor="#1A072E" />
          </div>
          <p className="mt-2 font-mono text-[11px] font-black text-muted-foreground">
            {qrPayload}
          </p>
          <p className="mt-2 text-base font-black text-primary">
            Pagas solo {money(offer.precioCents)}{" "}
            <span className="text-xs line-through text-muted-foreground font-normal">
              {money(offer.precioOriginalCents)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Válido en: <strong className="text-foreground">{rest?.nombre}</strong>
          </p>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground leading-relaxed">
          Presenta este código en la caja del restaurante antes de que termine el tiempo de la
          oferta.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-xs active:scale-95"
        >
          Guardar y cerrar
        </button>
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P13 — MODAL DE PREMIO DE TARJETA DE SELLOS
// ----------------------------------------------------------------------------
function StampRewardModal({
  clientId,
  restaurantId,
  premio,
  onClose,
}: {
  clientId: string;
  restaurantId: string;
  premio: string;
  onClose: () => void;
}) {
  const { restaurants } = useBocadoo();
  const rest = restaurants.find((r) => r.id === restaurantId);
  const qrPayload = `BCD-REWARD-${clientId}-${restaurantId}`;

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[360px] max-w-[calc(100%-32px)] rounded-[32px] bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <ModalHeader
          icon={Gift}
          eyebrow="PREMIO DE FIDELIDAD"
          title={premio}
          onClose={onClose}
        />

        <div className="mt-4 grid place-items-center rounded-2xl bg-lavender/30 p-4 border border-primary/20">
          <div className="relative rounded-2xl bg-white p-3.5 shadow-card">
            <QRCodeSVG value={qrPayload} size={170} level="H" bgColor="#FFFFFF" fgColor="#1A072E" />
            <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-amber-400 text-slate-900 shadow-xs">
              <Gift size={20} strokeWidth={2.8} />
            </div>
          </div>
          <p className="mt-3 text-sm font-black text-foreground">¡Felicidades por tu fidelidad!</p>
          <p className="text-xs text-muted-foreground text-center mt-0.5">
            En {rest?.nombre || "este local"} tu premio se registra como venta de $0.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground active:scale-95"
        >
          Listo
        </button>
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P11 / P12 — FICHA DETALLADA DEL RESTAURANTE (MODAL / SHEET COMPLETO)
// ----------------------------------------------------------------------------
function RestaurantDetailModal({
  restaurant,
  onClose,
  onOrderCreated,
}: {
  restaurant: Restaurant;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}) {
  const {
    menuDays,
    simulatedTodayKey,
    planTemplates,
    requestPlan,
    getRestaurantOccupancy,
    getClientStampRecord,
    stampConfigs,
    getRestaurantFeedbackTags,
    canDinerCreateOrder,
    createPreOrder,
    clientForUser,
    activeSubsForClient,
  } = useBocadoo();

  const client = clientForUser(DINER_USER_ID);
  const activeSubs = client ? activeSubsForClient(client.id) : [];
  const hasPlanInThisRest = activeSubs.some((s) => {
    const template = planTemplates.find((t) => t.id === s.templateId);
    return template?.restaurantId === restaurant.id;
  });

  const occupancy = getRestaurantOccupancy(restaurant.id);
  const stampCfg = stampConfigs[restaurant.id];
  const stampRecord = client ? getClientStampRecord(client.id, restaurant.id) : null;
  const feedbackTags = getRestaurantFeedbackTags(restaurant.id);

  // Menú del día
  const currentMenu = menuDays[simulatedTodayKey];
  const soups = currentMenu?.secciones?.sopa || [];
  const mains = currentMenu?.secciones?.fuerte || [];
  const drinks = currentMenu?.secciones?.jugo || [];

  // Preorden form
  const [selectedSoup, setSelectedSoup] = useState<string>(
    soups.find((s) => !s.agotado)?.nombre || "Sopa del día",
  );
  const [selectedMain, setSelectedMain] = useState<string>(
    mains.find((m) => !m.agotado)?.nombre || "Segundo del día",
  );

  // Si el semáforo es LLENO, la regla IHC P12 pide default a LLEVAR
  const isFull = occupancy?.status === "LLENO";
  const [orderType, setOrderType] = useState<OrderType>(isFull ? "LLEVAR" : "AQUI");

  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  // Verificación de comensal con 3 expiradas
  const orderCheck = canDinerCreateOrder(DINER_USER_ID);

  const handleCreateOrder = () => {
    if (!orderCheck.allowed) {
      toast.error(orderCheck.reason || "No puedes crear más pedidos por ahora.");
      return;
    }

    const items: OrderItem[] = [
      { platoId: "sopa_sel", nombre: `🥣 Sopa: ${selectedSoup}`, seccion: "sopa" },
      { platoId: "fuerte_sel", nombre: `🍗 Segundo: ${selectedMain}`, seccion: "fuerte" },
    ];

    const res = createPreOrder({
      userId: DINER_USER_ID,
      restaurantId: restaurant.id,
      items,
      tipo: orderType,
    });

    if (res.ok && res.order) {
      toast.success("¡Pedido en camino!", {
        description: "Tienes 30 minutos para llegar a caja y escanear.",
      });
      onOrderCreated(res.order);
    } else {
      toast.error(res.error || "No se pudo crear el pedido.");
    }
  };

  const plans = planTemplates.filter(
    (p) => p.restaurantId === restaurant.id && p.activo && p.visibleEnMarketplace,
  );

  return (
    <Overlay onClose={onClose}>
      <div className="no-scrollbar m-auto max-h-[90vh] w-[380px] max-w-[calc(100%-24px)] overflow-y-auto rounded-[32px] bg-background p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Volver"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-foreground">{restaurant.nombre}</h3>
              <p className="text-xs text-muted-foreground">{restaurant.zona}</p>
            </div>
          </div>
          <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {money(restaurant.precioSueltoCents)}
          </span>
        </div>

        {/* Semáforo de ocupación P11 */}
        {occupancy && (
          <div
            className={`mt-3.5 flex items-center justify-between rounded-2xl p-3 border ${occupancy.bgClass}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`h-3 w-3 rounded-full animate-pulse ${occupancy.badgeClass}`} />
              <div>
                <p className={`text-xs font-black ${occupancy.colorClass}`}>
                  {occupancy.label}: {occupancy.detail}
                </p>
                {occupancy.isManual && (
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Activado por el dueño · Vuelve a automático en {occupancy.manualMinutesLeft} min
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* P14: Etiquetas de feedback positivas (conteos reales, sin falso 4,8) */}
        <div className="mt-3.5 rounded-2xl bg-accent/40 p-3 border border-border">
          <p className="text-[11px] font-black uppercase text-muted-foreground tracking-wide">
            Opiniones de la comunidad
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(feedbackTags).map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg bg-background px-2.5 py-1 text-xs font-black text-foreground shadow-xs border border-border"
              >
                <ThumbsUp size={12} className="text-primary" />
                <span>
                  {count} destacan {tag.toLowerCase()}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* P13: Tarjeta de sellos del comensal en este restaurante */}
        {stampCfg && stampCfg.activa && (
          <div className="mt-3.5 rounded-2xl bg-lavender/30 p-3.5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-primary" />
                <span className="text-xs font-black text-foreground">Tarjeta de sellos</span>
              </div>
              <span className="text-xs font-black text-primary">
                Premio: {stampCfg.premio}
              </span>
            </div>

            {/* Círculos de sellos (meta de 10) */}
            <div className="mt-2.5 grid grid-cols-5 gap-2">
              {Array.from({ length: stampCfg.meta }).map((_, idx) => {
                const filled = (stampRecord?.sellos ?? 0) > idx;
                return (
                  <div
                    key={idx}
                    className={`grid h-10 w-10 place-items-center rounded-xl font-black text-xs transition-all ${
                      filled
                        ? "bg-primary text-primary-foreground shadow-xs scale-105"
                        : "bg-background text-muted-foreground border border-border"
                    }`}
                  >
                    {filled ? <Check size={16} strokeWidth={3} /> : idx + 1}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>
                {stampRecord?.sellos ?? 0} de {stampCfg.meta} sellos completados
              </span>
              {(stampRecord?.premiosDisponibles ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setRewardModalOpen(true)}
                  className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-900 shadow-xs active:scale-95"
                >
                  🎉 Canjear premio ({stampRecord?.premiosDisponibles})
                </button>
              )}
            </div>
          </div>
        )}

        {/* P11: Menú del día con platos agotados */}
        <div className="mt-4">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-wide">
            Menú de hoy en vivo
          </p>
          <div className="mt-2 space-y-1.5 rounded-2xl bg-muted p-3 text-xs">
            {soups.map((s) => (
              <div key={s.id} className="flex justify-between items-center">
                <span className={s.agotado ? "line-through text-muted-foreground font-semibold" : "font-bold text-foreground"}>
                  🥣 {s.nombre}
                </span>
                {s.agotado && (
                  <span className="text-[10px] font-black uppercase text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                    Agotado
                  </span>
                )}
              </div>
            ))}
            {mains.map((m) => (
              <div key={m.id} className="flex justify-between items-center">
                <span className={m.agotado ? "line-through text-muted-foreground font-semibold" : "font-bold text-foreground"}>
                  🍗 {m.nombre}
                </span>
                {m.agotado && (
                  <span className="text-[10px] font-black uppercase text-danger bg-danger/10 px-1.5 py-0.5 rounded">
                    Agotado
                  </span>
                )}
              </div>
            ))}
            {drinks.map((j) => (
              <p key={j.id} className="font-bold text-foreground">
                🥤 {j.nombre}
              </p>
            ))}
          </div>
        </div>

        {/* P12: Generador de preorden individual o para llevar */}
        <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-card p-3.5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground uppercase">
              Haz tu pedido con anticipación
            </span>
            <span className="text-[11px] font-bold text-muted-foreground">30 min de validez</span>
          </div>

          {/* Selector de sopa */}
          <div className="mt-2.5">
            <label className="text-[11px] font-bold text-muted-foreground">Elige tu sopa:</label>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {soups
                .filter((s) => !s.agotado)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSoup(s.nombre)}
                    className={`h-11 truncate rounded-xl px-2 text-xs font-black transition-all ${
                      selectedSoup === s.nombre
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {s.nombre}
                  </button>
                ))}
            </div>
          </div>

          {/* Selector de segundo */}
          <div className="mt-2.5">
            <label className="text-[11px] font-bold text-muted-foreground">Elige tu segundo:</label>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {mains
                .filter((m) => !m.agotado)
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMain(m.nombre)}
                    className={`h-11 truncate rounded-xl px-2 text-xs font-black transition-all ${
                      selectedMain === m.nombre
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {m.nombre}
                  </button>
                ))}
            </div>
          </div>

          {/* Selector Para comer aquí / Para llevar */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setOrderType("AQUI")}
              className={`h-11 rounded-xl text-xs font-black transition-all ${
                orderType === "AQUI"
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              🍽️ Para comer aquí
            </button>
            <button
              type="button"
              onClick={() => setOrderType("LLEVAR")}
              className={`h-11 rounded-xl text-xs font-black transition-all ${
                orderType === "LLEVAR"
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              🥡 Para llevar (+ $0,25)
            </button>
          </div>

          {/* Advertencia si el local está lleno */}
          {isFull && (
            <p className="mt-2 text-[11px] font-bold text-danger">
              ⚠️ Local lleno ahora. Te sugerimos pedir para llevar para no esperar mesa.
            </p>
          )}

          {/* Regla de comensal con 3 expiradas */}
          {!orderCheck.allowed && (
            <div className="mt-2 rounded-xl bg-warning/15 p-2.5 border border-warning/30 text-[11px] font-bold text-foreground">
              {orderCheck.reason}
            </div>
          )}

          <button
            type="button"
            disabled={!orderCheck.allowed}
            onClick={handleCreateOrder}
            className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-brand active:scale-95 disabled:opacity-50"
          >
            <ShoppingBag size={16} />
            <span>
              {orderType === "LLEVAR"
                ? `Pedir para llevar · ${money(restaurant.precioSueltoCents + restaurant.recargoParaLlevarCents)}`
                : `Pedir para comer aquí · ${money(restaurant.precioSueltoCents)}`}
            </span>
          </button>
        </div>

        {/* Planes con ahorro y botón Quiero este plan */}
        {plans.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-wide">
              Planes con descuento
            </p>
            <div className="mt-2 space-y-2">
              {plans.map((p) => {
                const unitPrice = p.precioCents / p.almuerzos;
                const savings = restaurant.precioSueltoCents * p.almuerzos - p.precioCents;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                  >
                    <div>
                      <p className="text-xs font-black text-foreground">{p.nombre}</p>
                      <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                        {p.almuerzos} almuerzos · {money(unitPrice)} c/u
                      </p>
                      {savings > 0 && (
                        <p className="text-[11px] font-black text-success">
                          ¡Ahorras {money(savings)}!
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-primary">{money(p.precioCents)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          requestPlan(p.id, DINER_USER_ID);
                          toast.success(`Solicitaste ${p.nombre}`, {
                            description: "Paga en la caja del restaurante cuando vayas.",
                          });
                        }}
                        className="mt-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground shadow-xs active:scale-95"
                      >
                        Quiero este plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {rewardModalOpen && (
        <StampRewardModal
          clientId={client?.id || "c1"}
          restaurantId={restaurant.id}
          premio={stampCfg?.premio || "Almuerzo gratis"}
          onClose={() => setRewardModalOpen(false)}
        />
      )}
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P11 — MARKETPLACE COMPLETO CON FILTROS REALES Y SEMÁFORO DE OCUPACIÓN
// ----------------------------------------------------------------------------
export function MarketplaceScreen({
  initialLocationOpen = false,
}: {
  initialLocationOpen?: boolean | undefined;
}) {
  const {
    restaurants,
    dinerZone,
    setDinerZone,
    menuDays,
    simulatedTodayKey,
    planTemplates,
    getRestaurantOccupancy,
    flashOffers,
  } = useBocadoo();

  const [locationOpen, setLocationOpen] = useState(initialLocationOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [nearMeFilter, setNearMeFilter] = useState(false);
  const [openNowFilter, setOpenNowFilter] = useState(false);
  const [cheapFilter, setCheapFilter] = useState(false);
  const [withPlansFilter, setWithPlansFilter] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activePreOrder, setActivePreOrder] = useState<Order | null>(null);
  const [claimedFlashOffer, setClaimedFlashOffer] = useState<FlashOffer | null>(null);

  // Oferta flash activa para el comensal
  const activeFlashOffer = flashOffers.find((f) => f.activa && f.stockRestante > 0);

  // Filtrado y ordenamiento interactivo
  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants];

    // Filtro por texto (restaurante, plato o zona)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const nameMatch = r.nombre.toLowerCase().includes(q);
        const zoneMatch = r.zona.toLowerCase().includes(q);
        const menu = menuDays[simulatedTodayKey];
        const dishes = [
          ...(menu?.secciones?.sopa || []),
          ...(menu?.secciones?.fuerte || []),
          ...(menu?.secciones?.jugo || []),
        ];
        const dishMatch = dishes.some((d) => d.nombre.toLowerCase().includes(q));
        return nameMatch || zoneMatch || dishMatch;
      });
    }

    // Filtro Abierto ahora
    if (openNowFilter) {
      list = list.filter((r) => r.abierto);
    }

    // Filtro Precio <= $3,00
    if (cheapFilter) {
      list = list.filter((r) => r.precioSueltoCents <= 300);
    }

    // Filtro Con planes
    if (withPlansFilter) {
      list = list.filter((r) =>
        planTemplates.some((p) => p.restaurantId === r.id && p.activo && p.visibleEnMarketplace),
      );
    }

    // Ordenamiento por distancia Cerca de mí
    if (nearMeFilter) {
      list.sort((a, b) => {
        const distA = getSimulatedDistanceKm(dinerZone, a.lat, a.lng);
        const distB = getSimulatedDistanceKm(dinerZone, b.lat, b.lng);
        return distA - distB;
      });
    }

    return list;
  }, [
    restaurants,
    searchQuery,
    openNowFilter,
    cheapFilter,
    withPlansFilter,
    nearMeFilter,
    dinerZone,
    menuDays,
    simulatedTodayKey,
    planTemplates,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {/* Cabecera con selector de zona */}
        <div className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground uppercase">
              {dinerZone ? `CERCA DE ${dinerZone.toUpperCase()}` : "QUITO · CERCA DE TI"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Restaurantes</h2>
          </div>
          <button
            type="button"
            aria-label="Elegir ubicación de referencia"
            onClick={() => setLocationOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-black text-primary active:scale-95"
          >
            <MapPin size={16} />
            <span className="truncate max-w-[120px]">{dinerZone || "Frente a PUCE"}</span>
          </button>
        </div>

        {/* P15: Tarjeta de Oferta Flash destacada */}
        {activeFlashOffer && (
          <div className="mt-4 rounded-3xl bg-linear-to-r from-amber-500/20 via-primary/20 to-amber-500/10 p-4 border border-amber-500/30 shadow-card animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-black text-slate-900 uppercase">
                <Zap size={12} />
                <span>Oferta Flash Bocadoo</span>
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                Quedan {activeFlashOffer.stockRestante} de {activeFlashOffer.stockTotal}
              </span>
            </div>

            <h3 className="mt-2 text-sm font-black text-foreground">{activeFlashOffer.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {activeFlashOffer.descripcion}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-primary">
                  {money(activeFlashOffer.precioCents)}
                </span>
                <span className="text-xs line-through text-muted-foreground font-semibold">
                  {money(activeFlashOffer.precioOriginalCents)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setClaimedFlashOffer(activeFlashOffer)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-900 shadow-soft active:scale-95"
              >
                <span>¡La quiero!</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Input de Búsqueda real */}
        <div className="relative mt-4">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar restaurante, plato (ej. seco, quinua) o zona..."
            className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-9 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Chips de Filtros interactivos con aria-pressed */}
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            role="button"
            aria-pressed={nearMeFilter}
            onClick={() => setNearMeFilter(!nearMeFilter)}
            className={`min-h-[44px] shrink-0 rounded-xl px-3.5 text-xs font-black transition-all ${
              nearMeFilter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-foreground border border-border hover:bg-accent"
            }`}
          >
            📍 Cerca de mí
          </button>
          <button
            type="button"
            role="button"
            aria-pressed={openNowFilter}
            onClick={() => setOpenNowFilter(!openNowFilter)}
            className={`min-h-[44px] shrink-0 rounded-xl px-3.5 text-xs font-black transition-all ${
              openNowFilter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-foreground border border-border hover:bg-accent"
            }`}
          >
            🟢 Abierto ahora
          </button>
          <button
            type="button"
            role="button"
            aria-pressed={cheapFilter}
            onClick={() => setCheapFilter(!cheapFilter)}
            className={`min-h-[44px] shrink-0 rounded-xl px-3.5 text-xs font-black transition-all ${
              cheapFilter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-foreground border border-border hover:bg-accent"
            }`}
          >
            💲 Precio ≤ $3,00
          </button>
          <button
            type="button"
            role="button"
            aria-pressed={withPlansFilter}
            onClick={() => setWithPlansFilter(!withPlansFilter)}
            className={`min-h-[44px] shrink-0 rounded-xl px-3.5 text-xs font-black transition-all ${
              withPlansFilter
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-foreground border border-border hover:bg-accent"
            }`}
          >
            💳 Con planes
          </button>
        </div>

        {/* Lista de tarjetas de restaurantes */}
        <div className="mt-4 space-y-3.5">
          {filteredRestaurants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No se encontraron restaurantes que coincidan con tus filtros.
            </div>
          ) : (
            filteredRestaurants.map((r) => {
              const distanceKm = getSimulatedDistanceKm(dinerZone, r.lat, r.lng);
              const occupancy = getRestaurantOccupancy(r.id);
              const menu = menuDays[simulatedTodayKey];
              const plans = planTemplates.filter(
                (p) => p.restaurantId === r.id && p.activo && p.visibleEnMarketplace,
              );

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRestaurant(r)}
                  className="cursor-pointer rounded-[24px] border border-border bg-card p-4 shadow-soft transition-all hover:border-primary/40 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground truncate">
                          {r.nombre}
                        </span>
                        <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                          · {distanceKm} km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.zona}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary">
                        {money(r.precioSueltoCents)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">suelto</p>
                    </div>
                  </div>

                  {/* Semáforo P11: Siempre color + ícono + frase. Si no hay ventas sin app hoy, no se muestra */}
                  {occupancy && (
                    <div className="mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black border ${occupancy.bgClass} ${occupancy.colorClass}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${occupancy.badgeClass}`} />
                        <span>
                          {occupancy.label} · {occupancy.detail}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Resumen del menú de hoy */}
                  <div className="mt-2.5 rounded-xl bg-muted/70 p-2.5 text-xs text-foreground font-medium">
                    <p className="truncate">
                      🥣 {menu?.secciones?.sopa?.[0]?.nombre || "Sopa de quinua tradicional"} · 🍗{" "}
                      {menu?.secciones?.fuerte?.[0]?.nombre || "Seco de pollo con maduro"}
                    </p>
                  </div>

                  {/* Badges de planes y acción */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-bold text-muted-foreground">
                      {plans.length > 0
                        ? `${plans.length} planes de almuerzo`
                        : "Solo consumo suelto"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-primary">
                      <span>Ver ficha y pedir</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <NavBar active="Restaurantes" />

      {/* Selector de zona simulada */}
      {locationOpen && (
        <BottomSheet onClose={() => setLocationOpen(false)} title="Elige tu zona en Quito">
          <p className="text-xs text-muted-foreground">
            Calculamos la distancia simulada a los restaurantes según tu oficina o universidad.
          </p>
          <div className="mt-3 space-y-2">
            {DINER_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => {
                  setDinerZone(zone);
                  setLocationOpen(false);
                  toast.success(`Ubicación cambiada a ${zone}`);
                }}
                className={`flex h-12 w-full items-center justify-between rounded-xl px-3.5 text-xs font-black transition-all ${
                  dinerZone === zone
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card text-foreground border border-border hover:bg-accent"
                }`}
              >
                <span>{zone}</span>
                {dinerZone === zone && <Check size={16} />}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* Ficha detallada del restaurante */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onOrderCreated={(order) => {
            setSelectedRestaurant(null);
            setActivePreOrder(order);
          }}
        />
      )}

      {/* Modal de Preorden en camino */}
      {activePreOrder && (
        <PreOrderModal order={activePreOrder} onClose={() => setActivePreOrder(null)} />
      )}

      {/* Modal de Oferta Flash QR */}
      {claimedFlashOffer && (
        <FlashOfferModal
          offer={claimedFlashOffer}
          onClose={() => setClaimedFlashOffer(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// P5 + P12 + P14 — PANTALLA PRINCIPAL DEL COMENSAL
// ----------------------------------------------------------------------------
export function DinerHomeScreen({
  initialHasPlan = true,
  initialQrOpen = false,
}: {
  initialHasPlan?: boolean | undefined;
  initialQrOpen?: boolean | undefined;
}) {
  const navigate = useNavigate();
  const {
    clientForUser,
    dinerTransactions,
    planTemplates,
    requestPlan,
    orders,
    cancelPreOrder,
    pendingFeedbackRedemptions,
    submitFeedback,
    feedbackList,
    advanceSimulatedMinutes,
    simulatePeakHour,
    restaurants,
  } = useBocadoo();

  const [qrOpen, setQrOpen] = useState(initialQrOpen);
  const [hasPlanOverride, setHasPlanOverride] = useState<boolean | null>(null);
  const [claimingRedemptionId, setClaimingRedemptionId] = useState<string | null>(null);
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);

  // Estado de feedback P14
  const [feedbackSelectedTags, setFeedbackSelectedTags] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const client = clientForUser(DINER_USER_ID);
  const activeSubs = client?.activeSubscriptions || [];
  const primarySub = activeSubs[0];

  const lunchesLeft = client?.lunchesLeft ?? 14;
  const totalLunches = primarySub?.almuerzosTotales || 20;
  const planName = client?.planName || "Plan mensual ejecutivo";

  const hasPlan =
    hasPlanOverride !== null
      ? hasPlanOverride
      : (client?.lunchesLeft ?? 0) > 0 || initialHasPlan;

  const used = Math.max(totalLunches - lunchesLeft, 0);
  const usedPct = Math.min(Math.round((used / totalLunches) * 100), 100);

  const venceText = useMemo(() => {
    if (!primarySub) return "Vence a fin de mes";
    const d = new Date(primarySub.venceEn);
    return `Vence el ${d.getDate()}/${d.getMonth() + 1}`;
  }, [primarySub]);

  const isExpiringSoon = lunchesLeft <= 3 && lunchesLeft > 0;

  const handleRenew = () => {
    const template = planTemplates.find((t) => t.tipo === "Mensual") || planTemplates[0];
    requestPlan(template.id, DINER_USER_ID);
    toast.success("Solicitud enviada a caja", {
      description: "Paga en efectivo o transferencia en tu próxima visita.",
    });
  };

  // P12: Preorden activa
  const activeOrder = orders.find(
    (o) => o.comensalId === DINER_USER_ID && o.estado === "EN_CAMINO",
  );

  // P14: Redención pendiente de feedback (tras 20 min simulados)
  const pendingRedemptions = client ? pendingFeedbackRedemptions(client.id) : [];
  const currentPendingRedemption = pendingRedemptions[0];

  // Feedback ya respondido por el dueño
  const repliedFeedback = feedbackList.find(
    (f) => (f.clientId === client?.id || f.clientId === "c1") && f.respuestaRestaurante,
  );

  const handleFeedbackSubmit = () => {
    if (feedbackSelectedTags.length === 0) {
      toast.error("Selecciona al menos una etiqueta");
      return;
    }
    submitFeedback({
      redemptionId: currentPendingRedemption?.id || "demo-red",
      restaurantId: currentPendingRedemption?.restaurantId || "r1",
      clientId: client?.id || "c1",
      tags: feedbackSelectedTags,
      comentarioPrivado: feedbackNote.trim() || undefined,
    });
    setFeedbackSuccess(true);
    toast.success("¡Gracias por tu opinión!", {
      description: "Tu respuesta ayuda al restaurante a mejorar cada día.",
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {/* Encabezado */}
        <header className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              COMENSAL · QUITO
            </p>
            <h2 className="mt-1 truncate text-2xl font-black text-foreground">¡Hola, Carlos!</h2>
          </div>
          <Avatar initials="CM" />
        </header>

        {/* Barra demo de simulación rápida */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/60 p-2 border border-border text-[11px] font-bold">
          <span className="text-muted-foreground font-semibold">Demo:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                advanceSimulatedMinutes(20);
                toast.info("Avanzaste 20 min", {
                  description: "Se activa feedback y avanza la cuenta regresiva.",
                });
              }}
              className="rounded-lg bg-card px-2.5 py-1 text-foreground border border-border hover:bg-muted active:scale-95"
            >
              +20 min demo
            </button>
            <button
              type="button"
              onClick={() => {
                simulatePeakHour("r1");
                toast.warning("Hora pico simulada", {
                  description: "Semáforo en La Cuchara pasó a Lleno.",
                });
              }}
              className="rounded-lg bg-card px-2.5 py-1 text-foreground border border-border hover:bg-muted active:scale-95"
            >
              Simular hora pico
            </button>
          </div>
        </div>

        {/* P12: Cinta de Orden activa en camino */}
        {activeOrder && (
          <div className="mt-4 rounded-2xl bg-linear-to-r from-primary/15 via-lavender/30 to-primary/10 p-4 border border-primary/30 shadow-card animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-black uppercase">
                <ShoppingBag size={12} />
                <span>Pedido en camino</span>
              </span>
              <span className="font-mono text-xs font-black text-primary">30 min validez</span>
            </div>
            <p className="mt-2 text-xs font-black text-foreground">
              {activeOrder.tipo === "LLEVAR" ? "🥡 Para llevar" : "🍽️ Para comer aquí"} ·{" "}
              {activeOrder.items[0]?.nombre}
            </p>
            <button
              type="button"
              onClick={() => setActiveOrderModal(activeOrder)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-xs active:scale-95"
            >
              <QrCode size={16} />
              <span>Ver mi QR de comanda</span>
            </button>
          </div>
        )}

        {/* P14: Tarjeta "¿Qué tal el almuerzo?" tras 20 min del canje */}
        {(currentPendingRedemption || feedbackSuccess) && (
          <div className="mt-4 rounded-2xl bg-card p-4 border border-border shadow-soft animate-in fade-in">
            {feedbackSuccess ? (
              <div className="text-center py-2">
                <p className="text-xs font-black text-success">¡Opinión enviada con éxito!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  El restaurante la recibirá en su buzón privado.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <h3 className="text-xs font-black text-foreground">
                    ¿Qué tal estuvo el almuerzo de hoy?
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tu opinión sincera apoya a los restaurantes de barrio.
                </p>

                {/* 1-touch tags */}
                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  {[
                    "Buena sazón",
                    "Buena porción",
                    "Atención rápida",
                    "Algo no estuvo bien",
                  ].map((tag) => {
                    const isSelected = feedbackSelectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFeedbackSelectedTags(feedbackSelectedTags.filter((t) => t !== tag));
                          } else {
                            setFeedbackSelectedTags([...feedbackSelectedTags, tag]);
                          }
                        }}
                        className={`h-10 truncate rounded-xl px-2 text-xs font-black transition-all ${
                          isSelected
                            ? tag === "Algo no estuvo bien"
                              ? "bg-danger text-white"
                              : "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted text-foreground border border-border hover:bg-accent"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Si marcó 'Algo no estuvo bien', mostrar mensaje privado */}
                {feedbackSelectedTags.includes("Algo no estuvo bien") && (
                  <div className="mt-2.5">
                    <textarea
                      rows={2}
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      placeholder="Cuéntale al dueño en privado qué ocurrió..."
                      className="w-full rounded-xl border border-border bg-input p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleFeedbackSubmit}
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-xs font-black text-background shadow-xs active:scale-95"
                >
                  Enviar opinión
                </button>
              </div>
            )}
          </div>
        )}

        {/* P14: Respuesta del dueño en el buzón */}
        {repliedFeedback && (
          <div className="mt-3 rounded-2xl bg-accent/60 p-3.5 border border-primary/20">
            <p className="text-[11px] font-black uppercase text-primary">
              Respuesta de La Cuchara:
            </p>
            <p className="text-xs text-foreground font-semibold mt-1">
              "{repliedFeedback.respuestaRestaurante}"
            </p>
          </div>
        )}

        {/* Aviso de renovación anticipada P8 */}
        {hasPlan && isExpiringSoon && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-warning bg-warning/15 p-3.5 animate-in slide-in-from-top-2">
            <div>
              <p className="text-xs font-black text-foreground">
                ¡Te quedan solo {lunchesLeft} {lunchesLeft === 1 ? "almuerzo" : "almuerzos"}!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Renueva ahora para no quedarte sin saldo mañana.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRenew}
              className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground shadow-xs active:scale-95"
            >
              Renovar plan
            </button>
          </div>
        )}

        {/* Tarjeta de fidelidad digital */}
        <div className="mt-5 flex items-center justify-between">
          <SectionTitle>Mi tarjeta digital</SectionTitle>
          <button
            type="button"
            onClick={() => setHasPlanOverride(!hasPlan)}
            className="text-xs font-bold text-primary hover:underline"
            title="Alternar entre comensal con tarjeta y nuevo sin saldo"
          >
            {hasPlan ? "Ver como nuevo" : "Ver con plan activo"}
          </button>
        </div>

        {hasPlan ? (
          <div className="relative mt-2 pb-4">
            <div className="absolute inset-x-3 bottom-0 top-7 rounded-[26px] bg-lavender opacity-60" />

            <div className="relative rounded-[26px] bg-card-dark p-5 text-card-dark-foreground shadow-card border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
                    <Utensils size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      La Cuchara de San Blas
                    </p>
                    <p className="text-xs font-extrabold text-card-dark-muted">{planName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lavender">
                  <Wifi size={16} className="rotate-90 text-lavender/60" />
                  <Sparkles size={20} className="text-lavender" />
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-white tracking-tight">
                    {lunchesLeft} <span className="text-base font-bold text-white/80">almuerzos</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-card-dark-muted">{venceText}</p>
                </div>
                <p className="text-base font-black text-lavender tracking-tight">
                  ≈ {money(lunchesLeft * 275)}
                </p>
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${100 - usedPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-bold text-card-dark-muted">
                <span>{used} consumidos de {totalLunches}</span>
                <span>{100 - usedPct}% disponible</span>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-widest text-card-dark-muted/70 uppercase">
                <span>•••• 9412</span>
                <span>CARLOS MEJÍA</span>
              </div>

              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-card-dark shadow-sm hover:bg-white/95 active:scale-[0.99] transition-all"
              >
                <QrCode size={20} className="text-card-dark" />
                <span>Mostrar QR para almorzar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative mt-3 rounded-[24px] border-2 border-dashed border-border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender/60 text-primary">
              <Utensils size={26} />
            </div>
            <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-black text-primary uppercase">
              Nuevo comensal · Sin plan activo
            </span>
            <h3 className="mt-2 text-base font-black text-foreground">
              Aún no tienes almuerzos prepagados
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed px-2">
              Explora los menús de hoy en Quito y adquiere tu primer plan para tener tu tarjeta
              digital lista para escanear.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/app/comensal/restaurantes" })}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-black text-primary-foreground shadow-brand active:scale-[0.98]"
            >
              <Store size={16} />
              <span>Explorar restaurantes en Quito</span>
            </button>
          </div>
        )}

        {/* Historial de transacciones */}
        <div className="mt-5">
          <SectionTitle>Mi actividad reciente</SectionTitle>
        </div>
        <div className="mt-2 divide-y divide-border">
          {dinerTransactions.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No tienes consumos recientes registrados.
            </p>
          ) : (
            dinerTransactions.slice(0, 6).map((t) => (
              <div key={t.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground shrink-0">
                      <Utensils size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-foreground">{t.name}</p>
                      <p className="truncate text-xs text-muted-foreground mt-0.5">{t.detail}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-foreground">{t.value}</span>
                  </div>
                </div>

                {/* Botón P9: Reclamar consumo no reconocido */}
                {t.icon === "utensils" && !t.positive && (
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setClaimingRedemptionId(t.id)}
                      className="text-[11px] font-bold text-muted-foreground hover:text-danger hover:underline"
                    >
                      ¿No fuiste tú? Reclamar almuerzo
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <NavBar active="Home" />

      {qrOpen && (
        <QrModal
          lunchesLeft={lunchesLeft}
          planName={planName}
          onClose={() => setQrOpen(false)}
        />
      )}
      {claimingRedemptionId && (
        <ClaimModal
          redemptionId={claimingRedemptionId}
          onClose={() => setClaimingRedemptionId(null)}
        />
      )}
      {activeOrderModal && (
        <PreOrderModal order={activeOrderModal} onClose={() => setActiveOrderModal(null)} />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// AJUSTES DEL COMENSAL
// ----------------------------------------------------------------------------
export function DinerSettingsScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <h2 className="mt-4 text-2xl font-black">Ajustes</h2>
        <div className="mt-4 flex flex-col items-center rounded-2xl bg-accent/70 p-4">
          <Avatar initials="CM" large />
          <h3 className="mt-3 text-base font-black">Carlos Mejía</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">carlos.mejia@email.com</p>
        </div>
        <p className="mb-1 mt-5 text-xs font-black uppercase text-muted-foreground">MI CUENTA</p>
        <SettingsRow icon={UserRound} label="Editar nombre" />
        <SettingsRow icon={Mail} label="Cambiar correo" />
        <SettingsRow icon={LockKeyhole} label="Seguridad y PIN" />
        <p className="mb-1 mt-4 text-xs font-black uppercase text-muted-foreground">SOPORTE</p>
        <SettingsRow icon={CircleHelp} label="Preguntas frecuentes" />
        <SettingsRow icon={LogOut} label="Cerrar sesión" danger to="/app" />
      </div>
      <NavBar active="Ajustes" />
    </div>
  );
}
