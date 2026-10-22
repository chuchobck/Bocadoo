import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clock3,
  CreditCard,
  Eye,
  HelpCircle,
  History,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  Minus,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserRound,
  Utensils,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import lunchImage from "@/assets/bocadoo-lunch.jpg";
import soupImage from "@/assets/bocadoo-soup.jpg";
import veggieImage from "@/assets/bocadoo-veggie.jpg";

import { MENU_SECTIONS, useSavedMenu } from "./menu-service";
import {
  APP_USERS,
  DAILY_GOAL,
  initialsOf,
  money,
  moneyShort,
  normalizeEmail,
  normalizePhone,
  parseMoneyToCents,
  RESTAURANT_ID,
  useBocadoo,
  type Plan,
  type PlanTemplate,
} from "./store";
import {
  Avatar,
  BottomSheet,
  FieldLabel,
  ModalHeader,
  NavBar,
  Overlay,
  PrimaryButton,
  QuickAction,
  SecondaryButton,
  SectionTitle,
  SettingsRow,
  StatusBadge,
  Toggle,
  Transaction,
  TXN_ICONS,
} from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TextField = ({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: typeof Mail;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) => (
  <div className="space-y-1">
    <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">{label}</p>
    <label
      className={`flex h-12 items-center gap-3 rounded-xl bg-muted px-4 text-sm font-bold text-foreground ring-primary focus-within:ring-2 ${
        error ? "ring-2 ring-danger" : ""
      }`}
    >
      <Icon size={18} className="shrink-0 text-primary" />
      {children}
    </label>
    {error && <p className="text-xs font-bold text-danger">{error}</p>}
  </div>
);

// ============================================================================
// P2 — MIGRACIÓN RÁPIDA DE CARTULINAS FÍSICAS (EL FLUJO MÁS IMPORTANTE)
// ============================================================================
function MigrateCardModal({ onClose }: { onClose: () => void }) {
  const { planTemplates, migrateCard, simulatedTodayKey } = useBocadoo();
  const [count, setCount] = useState(0);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [templateId, setTemplateId] = useState(
    planTemplates.find((t) => t.tipo === "Mensual")?.id || planTemplates[0]?.id || "",
  );
  const [almuerzos, setAlmuerzos] = useState(14);
  const [venceDias, setVenceDias] = useState(30);
  const [lastSaved, setLastSaved] = useState<{
    nombre: string;
    telefono: string;
    almuerzos: number;
  } | null>(null);

  const handleSaveAnother = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nombre.trim().length < 2) {
      toast.error("Escribe el nombre del cliente.");
      return;
    }
    const cleanPhone = normalizePhone(telefono);
    if (cleanPhone.length < 9) {
      toast.error("Ingresa un celular de 10 dígitos (ej. 0991234567).");
      return;
    }

    migrateCard({
      nombre: nombre.trim(),
      telefono: cleanPhone,
      templateId,
      almuerzosRestantes: almuerzos,
      venceEnDias: venceDias,
      anotacion: `Cartulina física migrada (${almuerzos} almuerzos)`,
    });

    setLastSaved({
      nombre: nombre.trim(),
      telefono: cleanPhone,
      almuerzos,
    });
    setCount((c) => c + 1);
    toast.success(`Cartulina digitalizada: ${nombre.trim()} · ${almuerzos} almuerzos`);

    // Limpiar para la siguiente cartulina
    setNombre("");
    setTelefono("");
  };

  const handleFinish = () => {
    if (count > 0) {
      toast.success(`¡Excelente! Digitalizaste ${count} ${count === 1 ? "cartulina" : "cartulinas"}.`);
    }
    onClose();
  };

  const cleanNum = lastSaved ? lastSaved.telefono.replace(/^0/, "") : "";
  const whatsappLink = lastSaved
    ? `https://wa.me/593${cleanNum}?text=${encodeURIComponent(
        `¡Hola ${lastSaved.nombre}! 👋 La Cuchara de San Blas te pasó tu plan a Bocadoo: te quedan ${lastSaved.almuerzos} almuerzos disponibles. Ya no necesitas cartón; solo muestra tu celular al llegar.`,
      )}`
    : "";

  return (
    <Overlay onClose={handleFinish}>
      <BottomSheet>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-brand">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-primary">
                MIGRACIÓN RÁPIDA
              </p>
              <h2 className="text-lg font-black text-foreground">Pasar cartulina a Bocadoo</h2>
            </div>
          </div>
          <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-black text-primary">
            {count === 0 ? "Modo lote" : `Llevas ${count}`}
          </span>
        </div>

        {lastSaved && (
          <div className="mt-3.5 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-accent/60 p-3.5 animate-in fade-in">
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-foreground">
                ✓ {lastSaved.nombre} guardado ({lastSaved.almuerzos} almuerzos)
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No cobra dinero nuevo · No infla tus ventas
              </p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-success px-3.5 py-2 text-xs font-black text-success-foreground shadow-xs active:scale-95"
            >
              <Phone size={14} /> Avisar WhatsApp
            </a>
          </div>
        )}

        <form onSubmit={handleSaveAnother} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Nombre del cliente en la cartulina
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Mateo Cevallos"
              className="mt-1.5 flex h-12 w-full items-center rounded-xl bg-muted px-4 text-sm font-bold outline-none ring-primary focus:ring-2"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Celular / WhatsApp (10 dígitos)
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="099 123 4567"
              className="mt-1.5 flex h-12 w-full items-center rounded-xl bg-muted px-4 text-sm font-bold outline-none ring-primary focus:ring-2"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Plan original de la cartulina
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {planTemplates.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => {
                    setTemplateId(t.id);
                    setAlmuerzos(t.almuerzos);
                  }}
                  className={`rounded-xl border-2 p-2.5 text-center transition-all ${
                    t.id === templateId
                      ? "border-primary bg-accent font-black text-primary"
                      : "border-border bg-card font-bold text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <p className="text-xs uppercase">{t.tipo}</p>
                  <p className="mt-0.5 text-sm font-black">{t.almuerzos} alm.</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              ¿Cuántos almuerzos le quedan hoy?
            </label>
            <div className="mt-2 flex items-center justify-between rounded-2xl bg-muted p-2">
              <button
                type="button"
                aria-label="Menos almuerzos"
                onClick={() => setAlmuerzos((v) => Math.max(1, v - 1))}
                className="grid h-16 w-16 place-items-center rounded-xl bg-background text-2xl font-black text-foreground shadow-soft active:scale-95"
              >
                <Minus size={24} />
              </button>
              <div className="text-center">
                <span className="text-4xl font-black text-primary">{almuerzos}</span>
                <p className="text-xs font-bold text-muted-foreground">almuerzos restantes</p>
              </div>
              <button
                type="button"
                aria-label="Más almuerzos"
                onClick={() => setAlmuerzos((v) => v + 1)}
                className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-2xl font-black text-primary-foreground shadow-brand active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              ¿Hasta cuándo tiene vigencia?
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { label: "15 días", days: 15 },
                { label: "Fin de mes (30d)", days: 30 },
                { label: "45 días", days: 45 },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.days}
                  onClick={() => setVenceDias(opt.days)}
                  className={`rounded-xl border py-3 text-center transition-all ${
                    venceDias === opt.days
                      ? "border-primary bg-primary font-black text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-brand hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Check size={20} /> Guardar y pasar otra cartulina (+1)
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-muted text-sm font-bold text-foreground hover:bg-muted/80 active:scale-[0.98]"
            >
              {count > 0 ? `Terminar (digitalicé ${count} cartulinas)` : "Cerrar"}
            </button>
          </div>
        </form>
      </BottomSheet>
    </Overlay>
  );
}

// ============================================================================
// P10 — CIERRE DE CAJA DIARIO (ARQUEO Y CUADRE)
// ============================================================================
function CashClosureModal({ onClose }: { onClose: () => void }) {
  const { closeCash, simulatedTodayKey, salesThisMonthCents, servedToday } = useBocadoo();
  const [contadoDollars, setContadoDollars] = useState("");
  const [closedData, setClosedData] = useState<any>(null);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseMoneyToCents(contadoDollars || "0");
    const result = closeCash(cents);
    setClosedData(result);
    toast.success("Caja cerrada del día", {
      description: `Diferencia: ${money(result.diferenciaCents)}`,
    });
  };

  return (
    <Overlay onClose={onClose}>
      <BottomSheet>
        <ModalHeader
          icon={CreditCard}
          eyebrow="ARQUEO DIARIO"
          title="Cierre de caja de hoy"
          onClose={onClose}
        />

        {closedData ? (
          <div className="mt-4 space-y-4 animate-in fade-in">
            <div
              className={`rounded-2xl p-4 text-center ${
                closedData.diferenciaCents === 0
                  ? "bg-success/15 border border-success/30 text-success"
                  : closedData.diferenciaCents < 0
                    ? "bg-danger/15 border border-danger/30 text-danger"
                    : "bg-primary/15 border border-primary/30 text-primary"
              }`}
            >
              <p className="text-xs font-black uppercase">
                {closedData.diferenciaCents === 0
                  ? "✓ Caja cuadrada exacta"
                  : closedData.diferenciaCents < 0
                    ? "× Falta dinero en gaveta"
                    : "★ Sobra dinero en gaveta"}
              </p>
              <p className="mt-1 text-3xl font-black">{money(closedData.diferenciaCents)}</p>
              <p className="mt-1 text-xs font-semibold">
                Contado: {money(closedData.contadoCents)} · Esperado en efectivo:{" "}
                {money(closedData.esperadoCents)}
              </p>
            </div>

            <div className="space-y-2 rounded-2xl bg-muted p-4 text-xs font-bold">
              <div className="flex justify-between text-muted-foreground">
                <span>Efectivo cobrado hoy</span>
                <span className="text-foreground">{money(closedData.desglose.efectivoCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Transferencias (Banco Pichincha / Deuna)</span>
                <span className="text-foreground">
                  {money(closedData.desglose.transferenciasCents)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Planes cobrados hoy</span>
                <span className="text-foreground">{money(closedData.desglose.planesCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Venta suelta en POS</span>
                <span className="text-foreground">{money(closedData.desglose.posCents)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-black">
                <span>Almuerzos servidos hoy</span>
                <span>{closedData.desglose.almuerzosServidos} almuerzos</span>
              </div>
            </div>

            <PrimaryButton onClick={onClose}>Listo, cierre completado</PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Cuenta el dinero en efectivo que tienes en tu gaveta física e ingrésalo para comparar
              contra lo cobrado en Bocadoo.
            </p>

            <div>
              <label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                ¿Cuánto efectivo contaste en tu gaveta? ($ USD)
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={contadoDollars}
                  onChange={(e) => setContadoDollars(e.target.value)}
                  placeholder="55.00"
                  className="h-16 w-full rounded-2xl bg-muted pl-10 pr-4 text-3xl font-black text-foreground outline-none ring-primary focus:ring-2"
                  autoFocus
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3.5 text-xs text-muted-foreground space-y-1">
              <p className="font-black text-foreground">Aviso de cierre de turno:</p>
              <p>
                Los almuerzos prepagados de clientes no suman efectivo hoy porque el dinero ingresó
                cuando compraron su plan.
              </p>
            </div>

            <PrimaryButton type="submit">
              <Check size={18} /> Cuadrar y cerrar caja
            </PrimaryButton>
          </form>
        )}
      </BottomSheet>
    </Overlay>
  );
}

// ============================================================================
// AGREGAR CLIENTE MANUAL
// ============================================================================
function AddClientModal({ onClose }: { onClose: () => void }) {
  const { findAppUser, findContact, clientForUser, addContact, linkUser } = useBocadoo();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const appUser = findAppUser(form.email, form.phone);
  const contact = appUser ? undefined : findContact(form.email, form.phone);
  const alreadyClient = appUser ? clientForUser(appUser.id) : undefined;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (submitted) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (form.name.trim().length < 3) next.name = "Escribe el nombre completo del cliente.";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Ingresa un correo válido.";
    if (!/^0\d{9}$/.test(normalizePhone(form.phone)))
      next.phone = "Usa un celular de 10 dígitos, por ejemplo 0991234567.";
    setErrors(next);
    setSubmitted(true);
    return Object.keys(next).length === 0;
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (appUser || contact) return;
    if (!validate()) return;
    addContact(form);
    toast.success("Cliente guardado", {
      description: `${form.name.trim()} quedó en tu lista como Contacto sin plan.`,
    });
    onClose();
  };

  const link = () => {
    if (!appUser) return;
    if (linkUser(appUser))
      toast.success("Cliente vinculado", {
        description: `${appUser.name} ya aparece en tu lista de clientes.`,
      });
    else toast.info(`${appUser.name} ya es cliente de tu restaurante.`);
    onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <BottomSheet>
        <form onSubmit={save} noValidate>
          <ModalHeader
            icon={UserPlus}
            eyebrow="AGREGAR CLIENTE"
            title="Nuevo contacto"
            onClose={onClose}
          />
          <div className="space-y-3.5 mt-2">
            <TextField icon={UserRound} label="NOMBRE COMPLETO" error={errors.name}>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="Ej. Diego Salazar"
                autoComplete="name"
                className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </TextField>
            <TextField icon={Mail} label="CORREO ELECTRÓNICO" error={errors.email}>
              <input
                value={form.email}
                onChange={set("email")}
                type="email"
                inputMode="email"
                placeholder="cliente@email.com"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </TextField>
            <TextField icon={Phone} label="TELÉFONO (WHATSAPP)" error={errors.phone}>
              <input
                value={form.phone}
                onChange={set("phone")}
                type="tel"
                inputMode="tel"
                placeholder="099 123 4567"
                autoComplete="tel"
                className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </TextField>
            <p className="text-xs text-muted-foreground">
              Lo usaremos para avisarle por WhatsApp sobre su plan y el menú del día.
            </p>
          </div>

          {appUser ? (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-accent/60 p-3.5 animate-in fade-in">
              <p className="flex items-center gap-1.5 text-xs font-black text-primary">
                <CircleAlert size={16} /> Este cliente ya está en la app
              </p>
              <div className="mt-2.5 grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-background p-2.5">
                <Avatar initials={initialsOf(appUser.name)} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold">{appUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{appUser.username} · {appUser.email}
                  </p>
                </div>
                <StatusBadge status="Registrado" />
              </div>
            </div>
          ) : contact ? (
            <div className="mt-4 rounded-2xl bg-danger-soft p-3.5 animate-in fade-in">
              <p className="flex items-center gap-1.5 text-xs font-black text-danger">
                <CircleAlert size={16} /> Ya tienes este contacto
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {contact.nombre} ya está guardado con ese correo o teléfono.
              </p>
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            {appUser ? (
              <>
                <PrimaryButton onClick={alreadyClient ? onClose : link}>
                  {alreadyClient ? (
                    <>
                      <Check size={16} /> Entendido
                    </>
                  ) : (
                    <>
                      <Link2 size={16} /> Vincular a mis clientes
                    </>
                  )}
                </PrimaryButton>
                <SecondaryButton onClick={() => setForm({ name: "", email: "", phone: "" })}>
                  Registrar otra persona
                </SecondaryButton>
              </>
            ) : (
              <PrimaryButton type="submit" disabled={Boolean(contact)}>
                <UserPlus size={16} /> Guardar cliente
              </PrimaryButton>
            )}
          </div>
        </form>
      </BottomSheet>
    </Overlay>
  );
}

// ============================================================================
// OWNER HOME SCREEN — PANEL PRINCIPAL DEL DUEÑO & CAJERO
// ============================================================================
export function OwnerHomeScreen({
  initialAddClientOpen = false,
}: {
  initialAddClientOpen?: boolean | undefined;
}) {
  const {
    activeRole,
    setStaffRole,
    simulatedDaysOffset,
    advanceDemoDays,
    activeClients,
    salesThisMonthCents,
    servedToday,
    transactions,
    clients,
    owedLunchesReport,
    planRequests,
    confirmPlanRequest,
    claims,
    refundRedemption,
    dismissClaim,
    expiringSoonSubscriptions,
    extendSubscription,
    planTemplates,
  } = useBocadoo();

  const [addOpen, setAddOpen] = useState(initialAddClientOpen);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [closeCashOpen, setCloseCashOpen] = useState(false);

  const pendingRequests = planRequests.filter((r) => r.estado === "PENDIENTE");
  const pendingClaims = claims.filter((c) => c.estado === "PENDIENTE");
  const contacts = clients.filter((c) => !c.planId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {/* Barra superior de control demo (Rol y Adelantar fecha) */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-accent/90 p-2 text-xs font-bold text-primary border border-primary/20">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Rol:</span>
            <button
              type="button"
              onClick={() => setStaffRole(activeRole === "OWNER" ? "CASHIER" : "OWNER")}
              className="rounded-lg bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground shadow-xs active:scale-95"
            >
              {activeRole === "OWNER" ? "DUEÑA (María)" : "CAJA (Juanito)"}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground">Días:</span>
            <button
              type="button"
              onClick={() => advanceDemoDays(1)}
              className="rounded-lg bg-background px-2 py-1 font-bold shadow-xs hover:bg-muted active:scale-95"
              title="Avanzar 1 día"
            >
              +1d
            </button>
            <button
              type="button"
              onClick={() => advanceDemoDays(7)}
              className="rounded-lg bg-background px-2 py-1 font-bold shadow-xs hover:bg-muted active:scale-95"
              title="Avanzar 7 días"
            >
              +7d
            </button>
            {simulatedDaysOffset > 0 && (
              <button
                type="button"
                onClick={() => advanceDemoDays(-simulatedDaysOffset)}
                className="rounded-lg bg-danger/10 px-1.5 py-1 text-danger font-black"
                title="Volver al día actual"
              >
                Hoy
              </button>
            )}
          </div>
        </div>

        {/* Encabezado del restaurante */}
        <header className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-foreground text-background shadow-soft">
              <Utensils size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold uppercase text-muted-foreground">
                LA CUCHARA DE SAN BLAS
              </p>
              <h2 className="truncate text-2xl font-black text-foreground">
                {activeRole === "OWNER" ? "¡Hola, María!" : "Caja de cobro"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cierre de caja"
            onClick={() => setCloseCashOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary active:scale-95"
            title="Arqueo y Cierre de Caja"
          >
            <CreditCard size={18} />
          </button>
        </header>

        {/* Notificación de Solicitudes desde la app del comensal (P4) */}
        {pendingRequests.length > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-primary bg-accent p-3.5 shadow-brand animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary shrink-0" />
              <p className="text-xs font-black text-foreground">
                ¡Solicitud de comensal en caja! ({pendingRequests.length})
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Carlos Mejía pidió <span className="font-bold text-foreground">Plan Mensual $55</span>{" "}
              desde su app. Confirma su cobro al recibir el dinero:
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  confirmPlanRequest(pendingRequests[0].id, "EFECTIVO");
                  toast.success("Plan activado en efectivo para Carlos Mejía");
                }}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-black text-primary-foreground shadow-xs active:scale-95"
              >
                Cobré en efectivo
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmPlanRequest(pendingRequests[0].id, "TRANSFERENCIA");
                  toast.success("Plan activado por transferencia");
                }}
                className="flex-1 rounded-xl bg-card border border-border py-2.5 text-xs font-black text-foreground active:scale-95"
              >
                Cobré transferencia
              </button>
            </div>
          </div>
        )}

        {/* Notificación de Reclamos pendientes (P9) */}
        {pendingClaims.length > 0 && (
          <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-danger">
                <AlertTriangle size={16} /> Reclamo de comensal
              </span>
              <span className="text-[11px] font-bold text-muted-foreground">Hoy</span>
            </div>
            <p className="mt-1 text-xs font-extrabold text-foreground">
              "{pendingClaims[0].mensaje}"
            </p>
            <div className="mt-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  dismissClaim(pendingClaims[0].id);
                  toast.info("Reclamo cerrado: consumo verificado");
                }}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
              >
                Está bien
              </button>
              <button
                type="button"
                onClick={() => {
                  refundRedemption(pendingClaims[0].id);
                  toast.success("Almuerzo restituido al cliente (+1 almuerzo)");
                }}
                className="rounded-xl bg-danger px-3 py-1.5 text-xs font-black text-danger-foreground active:scale-95"
              >
                Devolver almuerzo
              </button>
            </div>
          </div>
        )}

        {/* Tarjeta Hero: Pasar cartulina a Bocadoo (P2 - Destacado absoluto) */}
        <button
          type="button"
          onClick={() => setMigrateOpen(true)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border-2 border-primary/40 bg-accent/70 p-4 text-left shadow-soft hover:bg-accent active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-brand">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-base font-black text-foreground">Pasar cartulina a Bocadoo</p>
              <p className="text-xs font-semibold text-muted-foreground">
                Digitaliza cartones de clientes en 30 segundos
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-primary shrink-0" />
        </button>

        {/* Tarjeta de Resumen Mensual (Oculta ventas en rol CAJA) */}
        <div className="relative mt-4 overflow-hidden rounded-[24px] bg-primary p-5 text-primary-foreground shadow-brand">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-lavender/30" />
          <p className="relative text-xs font-extrabold uppercase tracking-wider text-primary-soft">
            RESUMEN DE COBROS Y SERVICIO
          </p>
          <p className="relative mt-3 text-3xl font-black leading-none">
            {activeClients} <span className="text-lg font-bold">clientes activos</span>
          </p>
          <div className="relative mt-4 flex items-center justify-between">
            <div>
              {activeRole === "OWNER" ? (
                <>
                  <p className="text-2xl font-black">{money(salesThisMonthCents)}</p>
                  <p className="text-xs font-semibold text-primary-soft">vendidos este mes</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-primary-soft">Cajero: Juanito</p>
                  <p className="text-xs text-primary-soft">Caja lista para cobrar</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-background px-3.5 py-2.5 text-xs font-black text-foreground shadow-soft active:scale-95"
            >
              <Plus size={16} /> Agregar cliente
            </button>
          </div>
        </div>

        {/* Accesos rápidos de Caja */}
        <div className="mt-5">
          <SectionTitle>Accesos rápidos de caja</SectionTitle>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <QuickAction icon={CreditCard} label="Cobrar plan" to="/app/dueno/cobrar" />
          <QuickAction icon={ScanLine} label="Escanear / Descontar" to="/app/dueno/descontar" />
          <QuickAction
            icon={Utensils}
            label="Venta sin app (POS)"
            to="/app/dueno/registrar-consumo"
          />
        </div>

        {/* Tarjeta: Almuerzos que debes (Pasivo diferido P10) */}
        {activeRole === "OWNER" && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wide">
                <HelpCircle size={15} /> Almuerzos que debes a comensales
              </span>
              <span className="text-xs font-black text-foreground">
                ~{money(owedLunchesReport.approxValueCents)}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-foreground">
              {owedLunchesReport.totalLunches}{" "}
              <span className="text-sm font-extrabold text-muted-foreground">
                almuerzos pendientes
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Es la comida que tus {activeClients} clientes ya pagaron y vendrán a consumir durante
              este mes.
            </p>
          </div>
        )}

        {/* Lista: Por renovar esta semana (P8) */}
        {expiringSoonSubscriptions.length > 0 && (
          <div className="mt-5">
            <SectionTitle
              action={
                <span className="text-xs font-bold text-primary">
                  {expiringSoonSubscriptions.length}
                </span>
              }
            >
              Por renovar esta semana
            </SectionTitle>
            <div className="mt-2 space-y-2.5">
              {expiringSoonSubscriptions.map((sub) => {
                const client = clients.find((c) => c.id === sub.clientId);
                const template = planTemplates.find((t) => t.id === sub.templateId);
                const phone = client?.phone || "0991234567";
                const message = `Hola ${client?.name || "amigo/a"}, te quedan ${sub.almuerzosRestantes} almuerzos de tu ${template?.nombre || "plan"} en La Cuchara de San Blas. ¿Deseas renovar para no quedarte sin almuerzo?`;
                const waUrl = `https://wa.me/593${phone.replace(/^0/, "")}?text=${encodeURIComponent(message)}`;

                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5"
                  >
                    <div>
                      <p className="text-xs font-black text-foreground">
                        {client?.name || "Cliente Bocadoo"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Le quedan{" "}
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">
                          {sub.almuerzosRestantes} almuerzos
                        </span>{" "}
                        · Vence {sub.venceEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          extendSubscription(sub.id, 5);
                          toast.success(`Plan de ${client?.name || "cliente"} extendido 5 días`);
                        }}
                        className="rounded-xl bg-card border border-border px-2.5 py-1.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
                        title="Extender 5 días de vigencia"
                      >
                        +5 días
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-xl bg-success px-2.5 py-1.5 text-xs font-black text-success-foreground shadow-xs active:scale-95"
                        title="Recordar por WhatsApp"
                      >
                        <Phone size={13} /> Avisar
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reporte semanal simple (P10 - solo OWNER) */}
        {activeRole === "OWNER" && (
          <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wide text-foreground flex items-center gap-1.5">
                <TrendingUp size={16} className="text-primary" /> Reporte semanal de operaciones
              </h3>
              <span className="text-[11px] font-bold text-muted-foreground">Últimos 7 días</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-muted-foreground">Platos más vendidos:</p>
                <p className="mt-0.5 font-extrabold text-foreground">
                  1. Seco de pollo (48 servidos) · 2. Guatita (36) · 3. Locro de papa (29)
                </p>
              </div>
              <div>
                <p className="font-bold text-muted-foreground">Días con más movimiento:</p>
                <p className="mt-0.5 font-extrabold text-foreground">
                  Miércoles y Jueves (pico de 42 almuerzos / día)
                </p>
              </div>
              <div>
                <p className="font-bold text-muted-foreground">Clientes que no vienen hace 7 días:</p>
                <div className="mt-1 flex items-center justify-between rounded-xl bg-muted p-2.5">
                  <span className="font-medium">Valeria Gómez · Le quedan 14 almuerzos</span>
                  <a
                    href="https://wa.me/593988776655?text=Hola%20Valeria,%20te%20extrañamos%20en%20La%20Cuchara!%20Aún%20tienes%2014%20almuerzos%20disponibles."
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-success/20 px-2.5 py-1 text-xs font-black text-success hover:bg-success/30 active:scale-95"
                  >
                    <Phone size={12} /> Saludar
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contactos sin plan */}
        {contacts.length > 0 && (
          <>
            <div className="mt-6">
              <SectionTitle
                action={<span className="text-xs font-bold text-muted-foreground">{contacts.length}</span>}
              >
                Contactos sin plan
              </SectionTitle>
            </div>
            <div className="mt-1 divide-y divide-border">
              {contacts.map((c) => (
                <Link
                  key={c.id}
                  to="/app/dueno/cobrar"
                  search={{ cliente: c.id }}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-3 active:bg-muted/50 rounded-xl px-1"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-xs font-black text-muted-foreground">
                    {initialsOf(c.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-black">{c.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.phone}
                    </div>
                  </div>
                  <span className="flex items-center gap-1">
                    <StatusBadge status="Sin plan" />
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Historial de transacciones de caja */}
        <div className="mt-6">
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => setCloseCashOpen(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Cerrar caja hoy
              </button>
            }
          >
            Actividad reciente
          </SectionTitle>
        </div>
        <div className="mt-2 divide-y divide-border">
          {transactions.slice(0, 5).map((t) => (
            <Transaction
              key={t.id}
              icon={TXN_ICONS[t.icon]}
              name={t.name}
              detail={t.detail}
              value={t.value}
              positive={t.positive}
            />
          ))}
        </div>

        {/* Meta del día */}
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">HOY</p>
              <p className="mt-1 text-base font-black">{servedToday} almuerzos servidos</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-primary">
                {Math.round((servedToday / DAILY_GOAL) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">de la meta diaria (50)</p>
            </div>
          </div>
        </div>
      </div>

      <NavBar active="Home" owner />
      {addOpen && <AddClientModal onClose={() => setAddOpen(false)} />}
      {migrateOpen && <MigrateCardModal onClose={() => setMigrateOpen(false)} />}
      {closeCashOpen && <CashClosureModal onClose={() => setCloseCashOpen(false)} />}
    </div>
  );
}

// ============================================================================
// OWNER PLANS SCREEN (P3)
// ============================================================================
const PlanCard = ({
  template,
  onToggle,
}: {
  template: PlanTemplate;
  onToggle: () => void;
}) => {
  const priceDollars = template.precioCents / 100;
  const unitPrice = (template.precioCents / template.almuerzos / 100).toFixed(2).replace(".", ",");
  const savingsVs3Dollars = (template.almuerzos * 300 - template.precioCents) / 100;

  return (
    <div
      className={`rounded-2xl bg-card p-4 shadow-soft transition-opacity border ${
        template.activo ? "border-border" : "border-muted-foreground/30 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase ${
              template.activo ? "bg-accent text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {template.activo ? "ACTIVO" : "PAUSADO"} · {template.tipo}
          </span>
          <p className="mt-2 text-lg font-black text-foreground">{template.nombre}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {template.almuerzos} almuerzos · ${unitPrice} c/u
          </p>
        </div>
        <Toggle on={template.activo} onToggle={onToggle} label={`Activar ${template.nombre}`} />
      </div>

      <div className="mt-3 grid grid-cols-3 border-t border-border pt-3 text-xs">
        <div>
          <p className="text-muted-foreground">Precio</p>
          <p className="mt-1 text-sm font-black text-foreground">{money(template.precioCents)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Vigencia</p>
          <p className="mt-1 text-sm font-black text-foreground">{template.vigenciaDias} días</p>
        </div>
        <div>
          <p className="text-muted-foreground">Cupos</p>
          <p
            className={`mt-1 text-sm font-black ${
              template.cupos <= 0 ? "text-danger" : "text-foreground"
            }`}
          >
            {template.cupos > 0 ? template.cupos : "Sin cupos"}
          </p>
        </div>
      </div>

      {savingsVs3Dollars > 0 && (
        <div className="mt-3 rounded-xl bg-accent/60 px-3 py-1.5 text-xs font-black text-primary">
          Tu cliente ahorra ${savingsVs3Dollars.toFixed(2).replace(".", ",")} al mes
        </div>
      )}
    </div>
  );
};

export function OwnerPlansScreen() {
  const { planTemplates, togglePlan, activeRole } = useBocadoo();

  if (activeRole === "CASHIER") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-muted text-muted-foreground">
            <LockKeyhole size={28} />
          </div>
          <h2 className="mt-4 text-xl font-black text-foreground">Acceso restringido a Caja</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            El rol CAJA solo puede cobrar y validar almuerzos. Para crear, editar o pausar planes,
            solicita acceso a María (Dueña).
          </p>
          <Link
            to="/app/dueno"
            className="mt-6 flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-brand"
          >
            Volver a Caja
          </Link>
        </div>
        <NavBar active="Planes" owner />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">LA CUCHARA DE SAN BLAS</p>
            <h2 className="mt-1 text-2xl font-black">Mis planes</h2>
          </div>
          <Link
            to="/app/dueno/planes/nuevo"
            aria-label="Agregar plan"
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-brand active:scale-95"
          >
            <Plus size={20} />
          </Link>
        </div>

        {/* Declaración comercial transparente */}
        <div className="mt-4 rounded-2xl bg-muted p-3.5 text-xs text-muted-foreground leading-relaxed border border-border">
          <p className="font-bold text-foreground">Tarifas claras de Bocadoo:</p>
          <p className="mt-0.5">
            Lo que vendes en tu caja no paga comisión (0%). Solo pagas cuando un cliente nuevo canjea
            una oferta desde el marketplace de Bocadoo.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {planTemplates.map((t) => (
            <PlanCard key={t.id} template={t} onToggle={() => togglePlan(t.id)} />
          ))}
        </div>
      </div>
      <NavBar active="Planes" owner />
    </div>
  );
}

// ============================================================================
// OWNER MENU SCREEN (P7)
// ============================================================================
const DishItem = ({
  title,
  name,
  description,
  price,
  soldOut = false,
  onToggleSoldOut,
}: {
  title: string;
  name: string;
  description?: string;
  price?: number;
  soldOut?: boolean;
  onToggleSoldOut?: () => void;
}) => (
  <div
    className={`rounded-2xl bg-card p-3.5 shadow-soft border transition-all ${
      soldOut ? "border-danger/30 opacity-70 bg-danger/5" : "border-border"
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-black uppercase text-primary">{title}</span>
      {onToggleSoldOut && (
        <button
          type="button"
          onClick={onToggleSoldOut}
          className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors ${
            soldOut ? "bg-danger text-danger-foreground" : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          {soldOut ? "Agotado" : "Disponible"}
        </button>
      )}
    </div>
    <p className={`mt-1.5 text-sm font-black ${soldOut ? "line-through text-muted-foreground" : "text-foreground"}`}>
      {name}
    </p>
    {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    {price !== undefined && (
      <p className="mt-1 text-xs font-black text-primary">{money(price)}</p>
    )}
  </div>
);

export function OwnerMenuScreen() {
  const { menuDays, simulatedTodayKey, publishMenu, toggleSoldOut, copyPreviousMenu } = useBocadoo();
  const currentMenu = menuDays[simulatedTodayKey];

  const handlePublish = () => {
    if (!currentMenu) {
      copyPreviousMenu(1);
    }
    toast.success("Menú del día publicado", {
      description: "Visible al instante para tus comensales.",
    });
  };

  const handleWhatsAppMenu = () => {
    if (!currentMenu) return;
    const sopas = currentMenu.secciones.sopa.map((d) => d.nombre).join(", ");
    const fuertes = currentMenu.secciones.fuerte.map((d) => d.nombre).join(", ");
    const jugos = currentMenu.secciones.jugo.map((d) => d.nombre).join(", ");
    const text = `🍽️ *Menú de hoy en La Cuchara de San Blas*\n\n🥣 *Sopa:* ${sopas || "Locro de papa"}\n🍗 *Segundo:* ${fuertes || "Seco de pollo"}\n🥤 *Bebida:* ${jugos || "Jugo natural"}\n\n¡Te esperamos con tu plan activo de Bocadoo!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">MENÚ DEL DÍA</p>
            <h2 className="mt-1 text-2xl font-black">Platos de hoy</h2>
            <p className="text-xs text-muted-foreground">
              {currentMenu?.publicadoEn
                ? `Publicado ${new Date(currentMenu.publicadoEn).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`
                : "Borrador de hoy"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Repetir menú de ayer"
              onClick={() => {
                copyPreviousMenu(1);
                toast.success("Menú de ayer copiado para hoy");
              }}
              className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary active:scale-95"
              title="Repetir menú de ayer"
            >
              <RefreshCw size={18} />
            </button>
            <Link
              to="/app/dueno/agregar-menu"
              aria-label="Agregar platos"
              className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-brand active:scale-95"
            >
              <Plus size={20} strokeWidth={2.6} />
            </Link>
          </div>
        </div>

        {/* Botones de acción rápida: Repetir de ayer + Enviar WhatsApp */}
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => copyPreviousMenu(1)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
          >
            <RefreshCw size={14} /> Repetir ayer
          </button>
          <button
            type="button"
            onClick={handleWhatsAppMenu}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-success/15 border border-success/30 py-2.5 text-xs font-black text-success hover:bg-success/20 active:scale-95"
          >
            <Phone size={14} /> Enviar a clientes
          </button>
        </div>

        {/* Lista de platos con interruptor Se Acabó */}
        <div className="mt-5 space-y-3">
          {currentMenu ? (
            <>
              {currentMenu.secciones.sopa.map((d) => (
                <DishItem
                  key={d.id}
                  title="Sopa"
                  name={d.nombre}
                  description={d.descripcion}
                  soldOut={d.agotado}
                  onToggleSoldOut={() => toggleSoldOut(d.id)}
                />
              ))}
              {currentMenu.secciones.fuerte.map((d) => (
                <DishItem
                  key={d.id}
                  title="Plato fuerte"
                  name={d.nombre}
                  description={d.descripcion}
                  price={d.precioCents}
                  soldOut={d.agotado}
                  onToggleSoldOut={() => toggleSoldOut(d.id)}
                />
              ))}
              {currentMenu.secciones.jugo.map((d) => (
                <DishItem
                  key={d.id}
                  title="Bebida"
                  name={d.nombre}
                  description={d.descripcion}
                  soldOut={d.agotado}
                  onToggleSoldOut={() => toggleSoldOut(d.id)}
                />
              ))}
              {currentMenu.secciones.postre.map((d) => (
                <DishItem
                  key={d.id}
                  title="Postre"
                  name={d.nombre}
                  description={d.descripcion}
                  soldOut={d.agotado}
                  onToggleSoldOut={() => toggleSoldOut(d.id)}
                />
              ))}
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm font-black">Aún no cargas el menú de hoy</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Toca "Repetir ayer" para cargarlo en 1 segundo o agrega platos nuevos.
              </p>
              <button
                type="button"
                onClick={() => copyPreviousMenu(1)}
                className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground shadow-brand"
              >
                Cargar menú de ayer
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePublish}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-black text-background shadow-soft hover:opacity-95 active:scale-[0.98]"
        >
          <Eye size={18} /> Publicar menú para comensales
        </button>
      </div>
      <NavBar active="Menú" owner />
    </div>
  );
}

// ============================================================================
// OWNER SETTINGS SCREEN (P1 + AYUDANTE DE CAJA + AJUSTES)
// ============================================================================
export function OwnerSettingsScreen() {
  const { activeRole, setStaffRole, soundEnabled, setSoundEnabled, resetDemoData } = useBocadoo();
  const [inviteOpen, setInviteOpen] = useState(false);

  const inviteLink = "https://bocadoo.ec/app/unirse?rol=caja&rest=r1";
  const inviteText = `Únete como ayudante de caja en La Cuchara de San Blas con Bocadoo:\n${inviteLink}`;

  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteText);
    toast.success("Enlace copiado", { description: "Pégalo en WhatsApp para tu ayudante." });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <h2 className="mt-4 text-2xl font-black">Ajustes del restaurante</h2>

        {/* Perfil del local */}
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-foreground p-4 text-background">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Utensils size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase text-lavender">RESTAURANTE</p>
            <h3 className="mt-0.5 text-base font-black leading-tight">La Cuchara de San Blas</h3>
            <p className="mt-0.5 text-xs text-card-dark-muted">Frente a la PUCE · Quito</p>
          </div>
        </div>

        {/* Control de roles y ayudante de caja (P1) */}
        <p className="mb-1 mt-5 text-xs font-black uppercase text-muted-foreground">
          EQUIPO Y CAJEROS
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-foreground">Invitar ayudante con rol CAJA</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Podrá cobrar y descontar, pero no verá reportes ni ventas
              </p>
            </div>
            <button
              type="button"
              onClick={copyInvite}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-primary-foreground shadow-xs active:scale-95"
            >
              <Link2 size={14} /> Invitar
            </button>
          </div>

          <div className="border-t border-border pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Modo de prueba en este teléfono:</p>
              <p className="text-xs text-muted-foreground">Cambiar entre Dueña y Ayudante</p>
            </div>
            <button
              type="button"
              onClick={() => setStaffRole(activeRole === "OWNER" ? "CASHIER" : "OWNER")}
              className="rounded-xl border-2 border-primary bg-accent px-3 py-1.5 text-xs font-black text-primary"
            >
              {activeRole === "OWNER" ? "Dueña" : "Cajero"}
            </button>
          </div>
        </div>

        {/* Preferencias de IHC & Sonido (P5) */}
        <p className="mb-1 mt-5 text-xs font-black uppercase text-muted-foreground">
          PREFERENCIAS EN CAJA
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Sonidos de confirmación</p>
              <p className="text-xs text-muted-foreground">Pitido de éxito o error al escanear QR</p>
            </div>
          </div>
          <Toggle
            on={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
            label="Sonido en caja"
          />
        </div>

        {/* Soporte y Reset Demo */}
        <p className="mb-1 mt-5 text-xs font-black uppercase text-muted-foreground">MODO DEMO</p>
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            toast.success("Datos de demo restablecidos");
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-muted text-xs font-black text-foreground hover:bg-muted/80 active:scale-95"
        >
          <RefreshCw size={15} /> Restablecer datos de prueba del piloto
        </button>

        <div className="mt-4">
          <SettingsRow icon={LogOut} label="Cerrar sesión" danger to="/app" />
        </div>
      </div>
      <NavBar active="Ajustes" owner />
    </div>
  );
}
