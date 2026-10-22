import { useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  Clock,
  CreditCard,
  Eye,
  HelpCircle,
  LocateFixed,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
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
  UserRound,
  Utensils,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import lunchImage from "@/assets/bocadoo-lunch.jpg";
import veggieImage from "@/assets/bocadoo-veggie.jpg";

import {
  APP_USERS,
  DINER_USER_ID,
  DINER_ZONES,
  money,
  useBocadoo,
  type Claim,
  type PlanTemplate,
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

  // Rotación simulated TOTP cada 30 segundos
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

  // Payload: BCD1.<idComensal>.<paso>.<firma_simulada>
  // En producción, la firma es un HMAC-SHA256 con llave privada del backend.
  // Aquí usamos un hash derivado del id y el paso temporal de 30s para simular la rotación y evitar capturas de pantalla.
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

        {/* Tarjeta de alto contraste y brillo para escaneo en caja */}
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

          {/* Barra de progreso de rotación anti-capturas */}
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

        <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed">
          Muestra este código al cajero. Se renueva cada 30 segundos para tu seguridad.
        </p>

        <PrimaryButton onClick={onClose}>
          <Check size={18} /> Listo
        </PrimaryButton>
      </div>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// P9 — RECLAMO DE ALMUERZO NO RECONOCIDO
// ----------------------------------------------------------------------------
function ClaimModal({
  redemptionId,
  onClose,
}: {
  redemptionId: string;
  onClose: () => void;
}) {
  const { fileClaim } = useBocadoo();
  const [mensaje, setMensaje] = useState("No consumí este almuerzo en el restaurante");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fileClaim({ redemptionId, mensaje });
    toast.success("Reclamo enviado a La Cuchara", {
      description: "El restaurante revisará y te devolverá el almuerzo.",
    });
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <BottomSheet>
        <ModalHeader
          icon={AlertTriangle}
          eyebrow="CORRECCIÓN"
          title="No reconozco este almuerzo"
          onClose={onClose}
        />
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Si hubo un error en caja o no comiste a esa hora, envíanos este reporte. La dueña
            recibirá la alerta y podrá restituir tu almuerzo de inmediato.
          </p>
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Motivo o detalle
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-2xl bg-muted p-3.5 text-sm font-bold text-foreground outline-none ring-primary focus:ring-2 resize-none"
            />
          </div>
          <PrimaryButton type="submit">
            <Send size={16} /> Enviar reclamo a la dueña
          </PrimaryButton>
        </form>
      </BottomSheet>
    </Overlay>
  );
}

// ----------------------------------------------------------------------------
// COMENSAL HOME SCREEN (P4 + P5 + P8)
// ----------------------------------------------------------------------------
export function DinerHomeScreen({
  initialQrOpen = false,
  initialHasPlan = true,
}: {
  initialQrOpen?: boolean | undefined;
  initialHasPlan?: boolean | undefined;
}) {
  const navigate = useNavigate();
  const {
    clientForUser,
    dinerTransactions,
    requestPlan,
    planTemplates,
    simulatedToday,
  } = useBocadoo();

  const [qrOpen, setQrOpen] = useState(initialQrOpen);
  const [hasPlanOverride, setHasPlanOverride] = useState<boolean | null>(null);
  const [claimingRedemptionId, setClaimingRedemptionId] = useState<string | null>(null);

  const client = clientForUser(DINER_USER_ID);
  const activeSubs = client?.activeSubscriptions || [];
  const primarySub = activeSubs[0];

  const lunchesLeft = client?.lunchesLeft ?? 14;
  const totalLunches = primarySub?.almuerzosTotales || 20;
  const planName = client?.planName || "Plan mensual ejecutivo";

  const hasPlan = hasPlanOverride !== null ? hasPlanOverride : (client?.lunchesLeft ?? 0) > 0 || initialHasPlan;

  const used = Math.max(totalLunches - lunchesLeft, 0);
  const usedPct = Math.min(Math.round((used / totalLunches) * 100), 100);

  // Formateo de vencimiento
  const venceText = useMemo(() => {
    if (!primarySub) return "Vence a fin de mes";
    const d = new Date(primarySub.venceEn);
    return `Vence el ${d.getDate()}/${d.getMonth() + 1}`;
  }, [primarySub]);

  // Alerta de renovación P8 (3 almuerzos o 3 días)
  const isExpiringSoon = lunchesLeft <= 3 && lunchesLeft > 0;

  const handleRenew = () => {
    const template = planTemplates.find((t) => t.tipo === "Mensual") || planTemplates[0];
    requestPlan(template.id, DINER_USER_ID);
    toast.success("Solicitud enviada a caja", {
      description: "Paga en efectivo o transferencia en tu próxima visita.",
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
          /* Tarjeta de Crédito Real Bocadoo */
          <div className="relative mt-2 pb-4">
            <div className="absolute inset-x-3 bottom-0 top-7 rounded-[26px] bg-lavender opacity-60" />

            <div className="relative rounded-[26px] bg-card-dark p-5 text-card-dark-foreground shadow-card border border-white/10">
              {/* Encabezado de la tarjeta: Restaurante + Plan + Contactless */}
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

              {/* Saldo de almuerzos con animación y contravalor */}
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

              {/* Barra de progreso de consumo */}
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

              {/* Pie de tarjeta física */}
              <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-widest text-card-dark-muted/70 uppercase">
                <span>•••• 9412</span>
                <span>CARLOS MEJÍA</span>
              </div>

              {/* Botón blanco para mostrar QR de 1 toque */}
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
          /* Estado sin plan */
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

        {/* Historial de transacciones real (P9 con reclamo de almuerzo) */}
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
    </div>
  );
}

// ----------------------------------------------------------------------------
// MARKETPLACE CON MENÚ DEL DÍA EN TIEMPO REAL (P4 + P7 + P11)
// ----------------------------------------------------------------------------
export function MarketplaceScreen({
  initialLocationOpen = false,
}: {
  initialLocationOpen?: boolean | undefined;
}) {
  const {
    dinerZone,
    setDinerZone,
    menuDays,
    simulatedTodayKey,
    planTemplates,
    requestPlan,
    planRequests,
  } = useBocadoo();

  const [locationOpen, setLocationOpen] = useState(initialLocationOpen);
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const currentMenu = menuDays[simulatedTodayKey];
  const activePlans = planTemplates.filter((t) => t.activo && t.visibleEnMarketplace);

  const handleRequestPlan = (template: PlanTemplate) => {
    requestPlan(template.id);
    setRequestedId(template.id);
    toast.success(`Solicitud enviada para ${template.nombre}`, {
      description: `Paga ${money(template.precioCents)} en la caja de La Cuchara.`,
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {dinerZone ? `CERCA DE ${dinerZone.toUpperCase()}` : "DESCUBRE CERCA DE TI"}
            </p>
            <h2 className="mt-1 text-2xl font-black">Restaurantes</h2>
          </div>
          <button
            type="button"
            aria-label="Elegir ubicación"
            onClick={() => setLocationOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-primary active:scale-95"
          >
            <MapPin size={20} />
          </button>
        </div>

        {/* Ficha en vivo de La Cuchara de San Blas con el menú publicado de hoy (P7) */}
        <div className="mt-4 rounded-[26px] border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <span className="rounded-lg bg-success/15 px-2.5 py-1 text-[11px] font-black text-success uppercase">
                ● Abierto ahora · Almuerzos en vivo
              </span>
              <h3 className="mt-2 text-base font-black text-foreground">La Cuchara de San Blas</h3>
              <p className="text-xs text-muted-foreground">Frente a la PUCE · Quito</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Utensils size={22} />
            </div>
          </div>

          {/* Platos del menú publicado de hoy */}
          <div className="mt-3.5 space-y-2 rounded-2xl bg-muted p-3.5 text-xs">
            <p className="font-black text-foreground uppercase tracking-wide">
              Menú de hoy:
            </p>
            {currentMenu ? (
              <div className="space-y-1.5 font-bold">
                {currentMenu.secciones.sopa.map((d) => (
                  <p key={d.id} className={d.agotado ? "line-through text-muted-foreground" : "text-foreground"}>
                    🥣 {d.nombre} {d.agotado ? "(Agotado)" : ""}
                  </p>
                ))}
                {currentMenu.secciones.fuerte.map((d) => (
                  <p key={d.id} className={d.agotado ? "line-through text-muted-foreground" : "text-foreground"}>
                    🍗 {d.nombre} {d.agotado ? "(Agotado)" : ""}
                  </p>
                ))}
                {currentMenu.secciones.jugo.map((d) => (
                  <p key={d.id} className={d.agotado ? "line-through text-muted-foreground" : "text-foreground"}>
                    🥤 {d.nombre}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">El restaurante publicará el menú de hoy a las 11:30.</p>
            )}
          </div>

          {/* Planes disponibles para solicitar compra desde la app (P4) */}
          <p className="mb-2 mt-4 text-xs font-black uppercase text-muted-foreground">
            PLANES DE ALMUERZO DISPONIBLES
          </p>
          <div className="space-y-2">
            {activePlans.map((template) => {
              const unitPrice = (template.precioCents / template.almuerzos / 100).toFixed(2).replace(".", ",");
              const isReq = requestedId === template.id;

              return (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
                >
                  <div>
                    <p className="text-xs font-black text-foreground">{template.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.almuerzos} almuerzos · ${unitPrice} c/u · Vigencia {template.vigenciaDias} días
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-primary">{money(template.precioCents)}</p>
                    <button
                      type="button"
                      disabled={isReq}
                      onClick={() => handleRequestPlan(template)}
                      className={`mt-1 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                        isReq
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground shadow-xs active:scale-95"
                      }`}
                    >
                      {isReq ? "✓ Solicitado" : "Quiero este plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <NavBar active="Restaurantes" />
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
