import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  AtSign,
  Banknote,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock3,
  CreditCard,
  Eye,
  Flashlight,
  Home,
  Landmark,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Pencil,
  PhoneCall,
  Plus,
  QrCode,
  Receipt,
  ScanLine,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  UserPlus,
  UserRound,
  UsersRound,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import lunchImage from "@/assets/bocadoo-lunch.jpg";
import soupImage from "@/assets/bocadoo-soup.jpg";
import veggieImage from "@/assets/bocadoo-veggie.jpg";

export const Route = createFileRoute("/app/galeria")({
  head: () => ({
    meta: [
      { title: "Bocadoo — Maquetas de la app móvil" },
      {
        name: "description",
        content: "Trece pantallas móviles de Bocadoo para comensales y restaurantes de Quito.",
      },
      { property: "og:title", content: "Bocadoo — Maquetas de la app móvil" },
      {
        property: "og:description",
        content: "Explora el diseño de Bocadoo para planes de almuerzo prepagados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BocadooShowcase,
});

type IconType = LucideIcon;

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <div
      className={`${compact ? "h-9 w-9" : "h-12 w-12"} grid shrink-0 place-items-center rounded-[14px] bg-primary text-primary-foreground shadow-brand`}
    >
      <Utensils size={compact ? 18 : 23} strokeWidth={2.8} />
    </div>
    <div>
      <div
        className={`${compact ? "text-lg" : "text-2xl"} font-black leading-none text-foreground`}
      >
        bocadoo
      </div>
      {!compact && (
        <div className="mt-1 text-[10px] font-semibold text-muted-foreground">
          tu almuerzo, más fácil
        </div>
      )}
    </div>
  </div>
);

const StatusBar = () => (
  <div className="flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[12px] font-bold text-foreground">
    <span>9:41</span>
    <div className="flex items-center gap-1.5">
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        <i className="h-1 w-[2px] rounded-full bg-foreground" />
        <i className="h-1.5 w-[2px] rounded-full bg-foreground" />
        <i className="h-2 w-[2px] rounded-full bg-foreground" />
        <i className="h-2.5 w-[2px] rounded-full bg-foreground" />
      </span>
      <span className="h-2 w-3 rounded-t-full border-2 border-foreground border-b-0" />
      <span className="h-2.5 w-5 rounded-[4px] border border-foreground p-[1px]">
        <i className="block h-full w-3 rounded-[2px] bg-foreground" />
      </span>
    </div>
  </div>
);

const Phone = ({
  title,
  children,
  overlay,
}: {
  title: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) => (
  <figure className="w-[390px] shrink-0">
    <div className="phone-shell relative h-[844px] overflow-hidden rounded-[47px] border-[7px] border-phone bg-background shadow-phone">
      <div className="absolute left-1/2 top-2 z-30 h-[25px] w-[92px] -translate-x-1/2 rounded-full bg-phone" />
      <div className="flex h-full flex-col overflow-hidden rounded-[39px]">
        <StatusBar />
        {children}
      </div>
      {overlay && (
        <div className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[39px] bg-foreground/35 backdrop-blur-[6px]">
          {overlay}
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground/80" />
    </div>
    <figcaption className="mt-5 text-center text-sm font-bold text-showcase-muted">
      {title}
    </figcaption>
  </figure>
);

const NavBar = ({ active, owner = false }: { active: string; owner?: boolean }) => {
  const items: Array<[string, IconType]> = owner
    ? [
        ["Home", Home],
        ["Planes", WalletCards],
        ["Menú", MenuIcon],
        ["Ajustes", Settings],
      ]
    : [
        ["Home", Home],
        ["Restaurantes", Store],
        ["Ajustes", Settings],
      ];
  return (
    <div
      className="mt-auto grid h-[73px] shrink-0 border-t border-border bg-background/95 px-3 pb-3 pt-2 backdrop-blur-sm"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(([label, Icon]) => {
        const selected = active === label;
        return (
          <div
            key={label}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl ${selected ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className={selected ? "rounded-xl bg-accent px-4 py-1" : "px-4 py-1"}>
              <Icon size={19} strokeWidth={selected ? 2.7 : 2} />
            </div>
            <span className="text-[9px] font-bold">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Avatar = ({ initials, large = false }: { initials: string; large?: boolean }) => (
  <div
    className={`${large ? "h-20 w-20 text-xl" : "h-11 w-11 text-xs"} grid shrink-0 place-items-center rounded-full border-2 border-background bg-lavender font-black text-primary shadow-soft`}
  >
    {initials}
  </div>
);

const SectionTitle = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
    <h3 className="min-w-0 text-[15px] font-extrabold text-foreground">{children}</h3>
    {action}
  </div>
);

const LoginScreen = () => (
  <Phone title="Login · Tarjeta Física">
    <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-8">
      <div className="absolute -right-16 -top-24 h-52 w-52 rounded-full bg-lavender" />
      <div className="absolute -left-24 top-24 h-44 w-44 rounded-full border-[28px] border-accent/70" />
      <div className="relative mt-8 flex justify-center">
        <Logo />
      </div>
      <div className="relative mt-5 text-center">
        <h1 className="text-[26px] font-black leading-tight text-foreground">
          Tu almuerzo,
          <br />
          <span className="text-primary">sin cartulinas.</span>
        </h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Planes simples. Valida tu almuerzo con QR en Quito.
        </p>
      </div>

      {/* Pestañas salientes tipo carpeta física / Real Card Tabs */}
      <div className="relative mt-5 -mb-px flex items-end px-3 gap-1 z-10">
        <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-t-2xl bg-card border-t-2 border-t-primary border-l border-r border-border/80 text-primary shadow-[0_-5px_12px_rgba(0,0,0,0.06)] relative z-20 pb-2.5">
          <UserRound size={13} className="text-primary" />
          <span>Comensal</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-bold rounded-t-xl bg-muted/80 text-muted-foreground border border-b-0 border-border/50">
          <Store size={13} />
          <span>Dueño</span>
        </div>
      </div>

      {/* Tarjeta inteligente Bocadoo Pass */}
      <div className="relative rounded-b-[28px] rounded-tr-[28px] rounded-tl-[4px] bg-gradient-to-b from-card via-card to-card/95 p-4 shadow-[0_22px_45px_-12px_rgba(75,15,80,0.18),0_6px_20px_-4px_rgba(0,0,0,0.07)] border border-border/80 ring-1 ring-white/90 ring-inset">
        {/* Chip EMV dorado + Ondas NFC Contactless */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-8 rounded bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-xs border border-amber-500/50 flex items-center justify-center shrink-0">
              <div className="h-full w-full rounded-[2px] border border-amber-700/30 grid grid-cols-2 grid-rows-2 gap-[1px]">
                <div className="border-r border-b border-amber-700/40" />
                <div className="border-b border-amber-700/40" />
                <div className="border-r border-amber-700/40" />
                <div />
              </div>
            </div>
            <div className="flex items-center text-muted-foreground/70">
              <Wifi size={14} className="rotate-90" />
            </div>
          </div>
          <span className="rounded-md bg-accent/60 px-2 py-0.5 text-[9px] font-black tracking-wider text-primary uppercase">
            Pase Comensal
          </span>
        </div>

        <label className="mt-3.5 block text-[10px] font-bold text-muted-foreground">
          CORREO ELECTRÓNICO
        </label>
        <div className="mt-1 flex h-11 items-center gap-2.5 rounded-xl bg-muted/90 px-3 text-xs text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] border border-border/40">
          <Mail size={16} className="text-primary" /> carlos@email.com
        </div>

        <label className="mt-3 block text-[10px] font-bold text-muted-foreground">CONTRASEÑA</label>
        <div className="mt-1 flex h-11 items-center gap-2.5 rounded-xl bg-muted/90 px-3 text-xs text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] border border-border/40">
          <LockKeyhole size={16} className="text-primary" />
          <span className="tracking-[4px]">••••••••</span>
          <Eye size={15} className="ml-auto text-muted-foreground" />
        </div>

        <div className="mt-2 text-right text-[10px] font-bold text-primary">
          ¿Olvidaste tu contraseña?
        </div>
        <div className="mt-3.5 flex h-11 items-center justify-center rounded-xl bg-foreground text-xs font-bold text-background shadow-soft">
          Iniciar sesión
        </div>
        <div className="my-3 flex items-center gap-3 text-[9px] text-muted-foreground">
          <i className="h-px flex-1 bg-border" />ó
          <i className="h-px flex-1 bg-border" />
        </div>
        <div className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground">
          <span className="text-base font-black text-google">G</span>Continuar con Google
        </div>
        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[8px] font-mono font-bold text-muted-foreground/60">
          <span>BCD-PASS •••• 9412</span>
          <span>QUITO · 2026</span>
        </div>
      </div>
      <div className="mt-auto text-center text-xs text-muted-foreground">
        ¿Primera vez? <span className="font-extrabold text-primary">Crear cuenta</span>
      </div>
    </div>
  </Phone>
);

const RegisterDinerMockup = () => (
  <Phone title="Registro · Comensal">
    <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground">
          <ArrowLeft size={14} /> Volver
        </span>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
          Paso 1 de 2 · Comensal
        </span>
      </div>
      <div className="mt-4">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-lavender/50 px-2.5 py-1 text-[11px] font-bold text-primary">
          <Utensils size={13} /> Tu cuenta para almorzar con QR
        </div>
        <h2 className="mt-2 text-xl font-black text-foreground">Crea tu cuenta de comensal</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Dile adiós a las cartulinas. Compra planes de almuerzo y valida con QR.
        </p>
      </div>
      <div className="mt-3 space-y-2.5">
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Nombre Completo
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <UserRound size={15} className="text-primary" /> Carlos Mejía
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Correo Electrónico
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Mail size={15} className="text-primary" /> carlos.mejia@email.com
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Teléfono Móvil (Ecuador)
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <PhoneCall size={15} className="text-primary" /> 099 123 4567
          </div>
        </div>
        {/* Sector preferido */}
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Sector preferido de almuerzo en Quito
          </label>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-md bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
              📍 La Floresta
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
              La Mariscal
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
              PUCE
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
              Centro Histórico
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-bold text-muted-foreground uppercase">Contraseña</label>
            <span className="text-[9px] font-bold text-emerald-600">Segura</span>
          </div>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <LockKeyhole size={15} className="text-primary" />
            <span className="tracking-[3px]">••••••••••</span>
            <Eye size={14} className="ml-auto text-muted-foreground" />
          </div>
          <div className="mt-1 flex gap-1 h-1">
            <div className="flex-1 rounded-full bg-emerald-500" />
            <div className="flex-1 rounded-full bg-emerald-500" />
            <div className="flex-1 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
          <Check size={14} className="text-primary" /> Acepto los Términos de Bocadoo Ecuador
        </div>
        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand">
          <span>Crear cuenta y elegir restaurante</span>
          <Store size={14} />
        </div>
      </div>
    </div>
  </Phone>
);

const RegisterOwnerMockup = () => (
  <Phone title="Registro · Restaurante">
    <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground">
          <ArrowLeft size={14} /> Volver
        </span>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
          Paso 1 de 2 · Restaurante
        </span>
      </div>
      <div className="mt-4">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-2.5 py-1 text-[11px] font-bold text-primary">
          <Store size={13} /> Registro de negocio afiliado
        </div>
        <h2 className="mt-2 text-xl font-black text-foreground">Registra tu Restaurante</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Cobra por adelantado, fideliza comensales y valida con QR.
        </p>
      </div>
      <div className="mt-3 space-y-2.5">
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Nombre del Restaurante
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Store size={15} className="text-primary" /> La Cuchara de San Blas
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Dueño o Administrador
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <UserRound size={15} className="text-primary" /> María Toapanta
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              RUC / Cédula
            </label>
            <div className="mt-1 flex h-10 items-center rounded-xl bg-muted px-3 text-[11px]">
              1792345678001
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              WhatsApp Local
            </label>
            <div className="mt-1 flex h-10 items-center rounded-xl bg-muted px-3 text-[11px]">
              098 765 4321
            </div>
          </div>
        </div>
        {/* Google Maps Restaurant Locator Widget */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Ubicación en Quito (Google Maps)
            </label>
            <span className="text-[9px] font-extrabold text-primary flex items-center gap-1">
              <MapPin size={10} /> Centro Histórico
            </span>
          </div>
          <div className="relative h-22 w-full overflow-hidden rounded-xl border border-border bg-[#f1f3f0]">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <rect width="100%" height="100%" fill="#f1f3f0" />
              <rect x="25%" y="15%" width="25%" height="20%" rx="6" fill="#d1ebd1" />
              <rect x="36%" y="58%" width="20%" height="15%" rx="6" fill="#d1ebd1" />
              <path d="M 42% 0 L 42% 100%" stroke="#ffffff" strokeWidth="5" />
              <path d="M 42% 0 L 42% 100%" stroke="#f7c852" strokeWidth="2" />
              <path d="M 54% 0 L 54% 100%" stroke="#ffffff" strokeWidth="4" />
            </svg>
            <div className="absolute left-[38%] top-[65%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="rounded bg-card px-1.5 py-0.5 text-[8px] font-black text-foreground shadow border border-border">
                📍 San Blas
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Store size={10} />
              </div>
            </div>
            <div className="absolute bottom-1 left-1.5 z-10 text-[8px] font-bold text-foreground/80">
              Google Maps · Quito
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Precio Promedio Almuerzo
          </label>
          <div className="mt-1 flex h-9 items-center rounded-xl bg-muted px-3 text-[11px] font-black text-primary">
            $3.50
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-muted-foreground uppercase">
            Contraseña Administrador
          </label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <LockKeyhole size={15} className="text-primary" />
            <span className="tracking-[3px]">••••••••••</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
          <Check size={14} className="text-primary" /> Acepto el acuerdo comercial Bocadoo
        </div>
        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand">
          <span>Dar de alta y ver Onboarding</span>
          <Sparkles size={14} />
        </div>
      </div>
    </div>
  </Phone>
);

const OnboardingDinerMockup = () => (
  <Phone title="Onboarding · Comensal (Paso 0)">
    <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-brand">
        <Sparkles size={28} />
      </div>
      <span className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-primary">
        ¡Bienvenido a Bocadoo!
      </span>
      <h2 className="mt-1 text-xl font-black text-foreground">¡Hola, Carlos! 🎉</h2>
      <p className="mt-1 text-[11px] text-muted-foreground px-1">
        Tu cuenta comensal en <b>La Floresta</b> está configurada.
      </p>
      <div className="mt-4 space-y-2 text-left">
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            1
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Elige tu restaurante preferido</h4>
            <p className="text-[10px] text-muted-foreground">
              Explora locales y compra planes de 5, 10 o 20 almuerzos.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            2
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Tu código QR personal listo</h4>
            <p className="text-[10px] text-muted-foreground">
              Muestra tu QR al pagar. El cajero lo valida en 2 segundos.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            3
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Control de tus almuerzos</h4>
            <p className="text-[10px] text-muted-foreground">
              Revisa tus almuerzos restantes en tiempo real sin papel.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-lavender/60 p-2 text-[11px] font-bold text-primary">
        <QrCode size={14} /> ¡Tu código QR personal ya está listo!
      </div>
      <div className="mt-auto pt-4">
        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand">
          <span>Explorar restaurantes en Quito</span>
          <Store size={14} />
        </div>
      </div>
    </div>
  </Phone>
);

const OnboardingOwnerMockup = () => (
  <Phone title="Onboarding · Restaurante (Paso 0)">
    <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-brand">
        <Store size={28} />
      </div>
      <span className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-primary">
        Restaurante Activo en Bocadoo
      </span>
      <h2 className="mt-1 text-xl font-black text-foreground">¡Bienvenida, María! 🍽️</h2>
      <p className="mt-1 text-[11px] text-muted-foreground px-1">
        <b>La Cuchara de San Blas</b> ya puede validar almuerzos con QR en Quito.
      </p>
      <div className="mt-4 space-y-2 text-left">
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            1
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Escaneo QR ultrarrápido</h4>
            <p className="text-[10px] text-muted-foreground">
              Escanea el QR de tus clientes para descontar almuerzos al instante.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            2
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Cobro anticipado garantizado</h4>
            <p className="text-[10px] text-muted-foreground">
              Vende planes semanales o mensuales en efectivo o transferencia.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-card p-3 shadow-soft border border-border/70">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary font-black text-xs">
            3
          </div>
          <div>
            <h4 className="text-[11px] font-black text-foreground">Métricas y cero pérdidas</h4>
            <p className="text-[10px] text-muted-foreground">
              Reportes diarios de almuerzos servidos y saldo de cada cliente.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-accent/60 p-2 text-[11px] font-bold text-primary">
        <Check size={14} /> Terminal lista para tus primeros comensales
      </div>
      <div className="mt-auto pt-4">
        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand">
          <span>Abrir mi panel de restaurante</span>
          <Store size={14} />
        </div>
      </div>
    </div>
  </Phone>
);

const Transaction = ({
  icon: Icon,
  name,
  detail,
  value,
  positive = false,
}: {
  icon: IconType;
  name: string;
  detail: string;
  value: string;
  positive?: boolean;
}) => (
  <div className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary">
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <div className="truncate text-[11px] font-extrabold text-foreground">{name}</div>
      <div className="mt-0.5 truncate text-[9px] text-muted-foreground">{detail}</div>
    </div>
    <div className={`text-[10px] font-extrabold ${positive ? "text-success" : "text-foreground"}`}>
      {value}
    </div>
  </div>
);

const DinerHome = () => (
  <Phone title="Comensal · Home">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <header className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground">
              MIÉRCOLES, 30 DE SEPTIEMBRE
            </p>
            <h2 className="mt-1 truncate text-[23px] font-black">¡Hola, Carlos!</h2>
          </div>
          <Avatar initials="CM" />
        </header>
        <div className="mt-6">
          <SectionTitle>Mis planes</SectionTitle>
        </div>
        <div className="relative mt-3 pb-5">
          {/* Tarjeta lavanda offset que sobresale sutilmente debajo */}
          <div className="absolute inset-x-3 bottom-0 top-7 rounded-[23px] bg-lavender opacity-70" />

          {/* Tarjeta principal negra/dark obsidian, minimalista y con proporciones de tarjeta real */}
          <div className="relative rounded-[23px] bg-card-dark p-5 text-card-dark-foreground shadow-card border border-white/5 ring-1 ring-white/10">
            {/* Fila superior: Logo restaurante + Nombre/Plan + Contactless + Sparkles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
                  <Utensils size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-black text-white">
                    La Cuchara de San Blas
                  </p>
                  <p className="text-[9px] font-bold text-card-dark-muted">Plan mensual</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-lavender">
                <span title="Validación sin contacto QR">
                  <Wifi size={14} className="rotate-90 text-lavender/60" />
                </span>
                <Sparkles size={19} className="text-lavender" />
              </div>
            </div>

            {/* Saldo de almuerzos y contravalor */}
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[32px] font-black leading-none text-white tracking-tight">
                  14 <span className="text-[16px] font-bold text-white/85">almuerzos</span>
                </p>
                <p className="mt-1.5 text-[10px] font-semibold text-card-dark-muted">
                  Vence el 30/10
                </p>
              </div>
              <p className="text-base font-black text-lavender tracking-tight">
                ≈ $39,20
              </p>
            </div>

            {/* Barra de progreso de consumo */}
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: "70%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-card-dark-muted">
              <span>6 usados de 20</span>
              <span>70% disponible</span>
            </div>

            {/* Detalle relieve sutil de tarjeta de crédito real */}
            <div className="mt-3.5 pt-2 border-t border-white/10 flex items-center justify-between text-[8px] font-mono tracking-widest text-card-dark-muted/70 uppercase">
              <span>•••• 9412</span>
              <span>CARLOS MEJÍA</span>
            </div>

            {/* Botón blanco Mostrar QR */}
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-black text-card-dark shadow-sm">
              <QrCode size={17} className="text-card-dark" />
              <span>Mostrar QR</span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <SectionTitle
            action={<span className="text-[9px] font-bold text-primary">Ver todo</span>}
          >
            Historial de transacciones
          </SectionTitle>
        </div>
        <div className="mt-1 divide-y divide-border">
          <Transaction
            icon={Utensils}
            name="La Cuchara de San Blas"
            detail="Almuerzo consumido · Hoy, 13:12"
            value="− 1"
          />
          <Transaction
            icon={ShoppingBag}
            name="Rincón Manabita"
            detail="Compra plan quincenal · Ayer"
            value="$36,00"
          />
          <Transaction
            icon={Utensils}
            name="La Cuchara de San Blas"
            detail="Almuerzo consumido · Lun, 12:48"
            value="− 1"
          />
        </div>
      </div>
      <NavBar active="Home" />
    </div>
  </Phone>
);

const RestaurantCard = ({
  image,
  name,
  zone,
  price,
  plans,
}: {
  image: string;
  name: string;
  zone: string;
  price: string;
  plans: string;
}) => (
  <div className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 rounded-2xl bg-card p-2.5 shadow-soft">
    <img
      src={image}
      alt="Almuerzo del restaurante"
      loading="lazy"
      width={896}
      height={752}
      className="h-[82px] w-[86px] rounded-xl object-cover"
    />
    <div className="min-w-0 py-1">
      <div className="flex items-start justify-between gap-2">
        <h4 className="truncate text-xs font-extrabold">{name}</h4>
        <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold">
          <Star size={10} className="fill-primary text-primary" />
          4,8
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
        <MapPin size={10} />
        {zone}
      </p>
      <p className="mt-2 text-[10px] font-bold text-primary">{price} / almuerzo</p>
      <p className="mt-1 text-[8px] text-muted-foreground">{plans}</p>
    </div>
  </div>
);

const Marketplace = () => (
  <Phone title="Comensal · Restaurantes">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">DESCUBRE CERCA DE TI</p>
            <h2 className="mt-1 text-[23px] font-black">Restaurantes</h2>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary">
            <MapPin size={18} />
          </div>
        </div>
        <div className="mt-4 flex h-11 items-center gap-3 rounded-xl bg-card px-4 shadow-soft">
          <Search size={16} className="text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Busca por restaurante o zona</span>
          <SlidersHorizontal size={15} className="ml-auto text-primary" />
        </div>
        <div className="mt-5">
          <SectionTitle
            action={<span className="text-[9px] font-bold text-primary">Ver todas</span>}
          >
            Ofertas para ti
          </SectionTitle>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="relative h-[116px] overflow-hidden rounded-2xl">
            <img
              src={lunchImage}
              alt="Oferta de almuerzos"
              loading="lazy"
              width={896}
              height={752}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-image-overlay" />
            <div className="absolute inset-x-3 bottom-3 text-image-foreground">
              <p className="text-[9px] font-bold">La Cuchara</p>
              <p className="text-sm font-black">20 por $50</p>
            </div>
            <span className="absolute right-2 top-2 rounded-lg bg-primary px-2 py-1 text-[8px] font-black text-primary-foreground">
              −15%
            </span>
          </div>
          <div className="relative h-[116px] overflow-hidden rounded-2xl">
            <img
              src={veggieImage}
              alt="Oferta vegetariana"
              loading="lazy"
              width={896}
              height={752}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-image-overlay" />
            <div className="absolute inset-x-3 bottom-3 text-image-foreground">
              <p className="text-[9px] font-bold">Verde Limón</p>
              <p className="text-sm font-black">10 por $28</p>
            </div>
            <span className="absolute right-2 top-2 rounded-lg bg-lavender px-2 py-1 text-[8px] font-black text-foreground">
              VEGGIE
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          <span className="shrink-0 rounded-full bg-primary px-3 py-2 text-[9px] font-bold text-primary-foreground">
            Cerca de mí
          </span>
          <span className="shrink-0 rounded-full bg-muted px-3 py-2 text-[9px] font-bold">
            Precio
          </span>
          <span className="shrink-0 rounded-full bg-muted px-3 py-2 text-[9px] font-bold">
            Mejor calificados
          </span>
        </div>
        <div className="mt-4 rounded-2xl bg-accent p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-primary">OFERTA FLASH</p>
              <p className="mt-1 text-xs font-extrabold">Plan mensual · El Patio</p>
            </div>
            <div className="rounded-lg bg-foreground px-2.5 py-1.5 text-[10px] font-black text-background">
              02:14:36
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[9px] font-semibold text-muted-foreground">
              ¡Quedan 5 planes!
            </span>
            <span className="rounded-lg bg-primary px-3 py-2 text-[9px] font-extrabold text-primary-foreground">
              Comprar ahora
            </span>
          </div>
        </div>
        <div className="mt-5">
          <SectionTitle>Todos los restaurantes</SectionTitle>
        </div>
        <div className="mt-3 space-y-3">
          <RestaurantCard
            image={lunchImage}
            name="La Cuchara de San Blas"
            zone="Frente a la PUCE"
            price="$2,80"
            plans="Semanal · Quincenal · Mensual"
          />
          <RestaurantCard
            image={veggieImage}
            name="Verde Limón"
            zone="La Floresta"
            price="$3,25"
            plans="Semanal · Mensual"
          />
        </div>
      </div>
      <NavBar active="Restaurantes" />
    </div>
  </Phone>
);

const SettingsRow = ({
  icon: Icon,
  label,
  danger = false,
}: {
  icon: IconType;
  label: string;
  danger?: boolean;
}) => (
  <div
    className={`grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-1.5 ${danger ? "text-danger" : "text-foreground"}`}
  >
    <div
      className={`grid h-8 w-8 place-items-center rounded-[10px] ${danger ? "bg-danger-soft" : "bg-accent text-primary"}`}
    >
      <Icon size={14} />
    </div>
    <span className="text-[10px] font-bold">{label}</span>
    {!danger && <ChevronRight size={14} className="text-muted-foreground" />}
  </div>
);

const DinerSettings = () => (
  <Phone title="Comensal · Ajustes">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <h2 className="mt-4 text-[23px] font-black">Ajustes</h2>
        <div className="mt-4 flex flex-col items-center rounded-[24px] bg-accent/70 p-3">
          <div className="relative">
            <Avatar initials="CM" large />
            <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-accent bg-primary text-primary-foreground">
              <Pencil size={12} />
            </div>
          </div>
          <h3 className="mt-2 text-sm font-black">Carlos Mejía</h3>
          <p className="mt-1 text-[9px] text-muted-foreground">carlos.mejia@email.com</p>
        </div>
        <p className="mb-1 mt-4 text-[9px] font-black text-muted-foreground">MI CUENTA</p>
        <SettingsRow icon={UserRound} label="Editar nombre" />
        <SettingsRow icon={Mail} label="Cambiar correo" />
        <SettingsRow icon={LockKeyhole} label="Cambiar contraseña" />
        <SettingsRow icon={CreditCard} label="Métodos de pago" />
        <p className="mb-1 mt-3 text-[9px] font-black text-muted-foreground">
          PREFERENCIAS Y SOPORTE
        </p>
        <SettingsRow icon={Bell} label="Notificaciones" />
        <SettingsRow icon={CircleHelp} label="Ayuda y soporte" />
        <SettingsRow icon={LockKeyhole} label="Términos y privacidad" />
        <SettingsRow icon={LogOut} label="Cerrar sesión" danger />
      </div>
      <NavBar active="Ajustes" />
    </div>
  </Phone>
);

const QuickAction = ({ icon: Icon, label }: { icon: IconType; label: string }) => (
  <div className="flex min-w-0 flex-col items-center gap-2 rounded-2xl bg-card px-2 py-3 shadow-soft">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary">
      <Icon size={18} />
    </div>
    <span className="text-center text-[9px] font-extrabold leading-tight">{label}</span>
  </div>
);

const OwnerHomeBody = () => (
  <div className="flex min-h-0 flex-1 flex-col">
    <div className="min-h-0 flex-1 overflow-hidden px-5">
      <header className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-foreground text-background">
            <Utensils size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-muted-foreground">
              LA CUCHARA DE SAN BLAS
            </p>
            <h2 className="truncate text-xl font-black">¡Hola, María!</h2>
          </div>
        </div>
        <Bell size={19} />
      </header>
      <div className="relative mt-6 overflow-hidden rounded-[24px] bg-primary p-5 text-primary-foreground shadow-brand">
        <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-lavender/30" />
        <p className="relative text-[9px] font-bold text-primary-soft">RESUMEN DE SEPTIEMBRE</p>
        <p className="relative mt-3 text-[32px] font-black leading-none">
          48 <span className="text-[17px]">clientes activos</span>
        </p>
        <div className="relative mt-3 flex items-center justify-between">
          <div>
            <p className="text-xl font-black">$1.320</p>
            <p className="text-[9px] text-primary-soft">vendidos este mes</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-background px-3 py-2.5 text-[9px] font-extrabold text-foreground">
            <Plus size={14} /> Agregar cliente
          </div>
        </div>
      </div>
      <div className="mt-5">
        <SectionTitle>Accesos rápidos</SectionTitle>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <QuickAction icon={CreditCard} label="Cobrar" />
        <QuickAction icon={ScanLine} label="Escanear QR / Descontar" />
        <QuickAction icon={Utensils} label="Registrar consumo" />
      </div>
      <div className="mt-6">
        <SectionTitle action={<span className="text-[9px] font-bold text-primary">Ver todo</span>}>
          Historial de transacciones
        </SectionTitle>
      </div>
      <div className="mt-2 divide-y divide-border">
        <Transaction
          icon={UserRound}
          name="Carlos Mejía"
          detail="Almuerzo consumido · 13:12"
          value="Validado"
          positive
        />
        <Transaction
          icon={ShoppingBag}
          name="Valentina Ortiz"
          detail="Plan mensual · 12:44"
          value="$52,00"
          positive
        />
        <Transaction
          icon={UserRound}
          name="Mateo Cevallos"
          detail="Plan semanal · 11:58"
          value="Pendiente"
        />
        <Transaction
          icon={Utensils}
          name="Sofía Almeida"
          detail="Almuerzo consumido · 11:35"
          value="Validado"
          positive
        />
      </div>
      <div className="mt-4 rounded-2xl bg-muted p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-muted-foreground">HOY</p>
            <p className="mt-1 text-sm font-black">37 almuerzos servidos</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary">74%</p>
            <p className="text-[8px] text-muted-foreground">de la meta diaria</p>
          </div>
        </div>
      </div>
    </div>
    <NavBar active="Home" owner />
  </div>
);

const OwnerHome = () => (
  <Phone title="Dueño · Home">
    <OwnerHomeBody />
  </Phone>
);

const Toggle = ({ on = true }: { on?: boolean }) => (
  <div
    className={`flex h-6 w-11 items-center rounded-full p-1 ${on ? "justify-end bg-primary" : "justify-start bg-muted-foreground/30"}`}
  >
    <i className="h-4 w-4 rounded-full bg-background shadow-soft" />
  </div>
);

const PlanCard = ({
  type,
  lunches,
  price,
  days,
  clients,
  on = true,
}: {
  type: string;
  lunches: number;
  price: string;
  days: number;
  clients: number;
  on?: boolean;
}) => (
  <div className="rounded-2xl bg-card p-4 shadow-soft">
    <div className="flex items-center justify-between">
      <div>
        <span className="rounded-lg bg-accent px-2 py-1 text-[8px] font-black text-primary">
          {type.toUpperCase()}
        </span>
        <p className="mt-2 text-lg font-black">{lunches} almuerzos</p>
      </div>
      <Toggle on={on} />
    </div>
    <div className="mt-3 grid grid-cols-3 border-t border-border pt-3">
      <div>
        <p className="text-[8px] text-muted-foreground">Precio</p>
        <p className="mt-1 text-xs font-extrabold">{price}</p>
      </div>
      <div>
        <p className="text-[8px] text-muted-foreground">Vigencia</p>
        <p className="mt-1 text-xs font-extrabold">{days} días</p>
      </div>
      <div>
        <p className="text-[8px] text-muted-foreground">Clientes</p>
        <p className="mt-1 text-xs font-extrabold">{clients}</p>
      </div>
    </div>
  </div>
);

const OwnerPlans = () => (
  <Phone title="Dueño · Planes">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">
              LA CUCHARA DE SAN BLAS
            </p>
            <h2 className="mt-1 text-[23px] font-black">Mis planes</h2>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Plus size={18} />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <PlanCard type="Semanal" lunches={5} price="$15,00" days={7} clients={12} />
          <PlanCard type="Quincenal" lunches={10} price="$28,00" days={18} clients={19} />
          <PlanCard type="Mensual" lunches={20} price="$52,00" days={35} clients={31} />
        </div>
        <div className="mt-5 rounded-[22px] border border-primary/20 bg-accent/60 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h3 className="text-sm font-black">Plan personalizado</h3>
          </div>
          <p className="mt-1 text-[9px] text-muted-foreground">
            Arma una opción especial para tus clientes.
          </p>
          <p className="mt-4 text-[8px] font-bold text-muted-foreground">DÍAS INCLUIDOS</p>
          <div className="mt-2 flex justify-between">
            {["L", "M", "M", "J", "V", "S"].map((d, i) => (
              <span
                key={`${d}-${i}`}
                className={`grid h-8 w-8 place-items-center rounded-lg text-[9px] font-black ${i < 5 ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
              >
                {d}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Almuerzos", "12"],
              ["Precio", "$32"],
              ["Expira", "21 días"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-background p-2.5">
                <p className="text-[7px] text-muted-foreground">{a}</p>
                <p className="mt-1 text-[10px] font-black">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-foreground py-3 text-center text-[10px] font-bold text-background">
            Crear plan
          </div>
        </div>
      </div>
      <NavBar active="Planes" owner />
    </div>
  </Phone>
);

const Dish = ({
  title,
  name,
  image,
  soldOut = false,
}: {
  title: string;
  name: string;
  image: string;
  soldOut?: boolean;
}) => (
  <div className={`overflow-hidden rounded-2xl bg-card shadow-soft ${soldOut ? "opacity-60" : ""}`}>
    <img
      src={image}
      alt={name}
      loading="lazy"
      width={896}
      height={752}
      className="h-[90px] w-full object-cover"
    />
    <div className="p-3">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black text-primary">{title.toUpperCase()}</span>
        {soldOut && (
          <span className="rounded-md bg-danger-soft px-1.5 py-1 text-[7px] font-black text-danger">
            AGOTADO
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] font-extrabold">{name}</p>
      <div className="mt-2 flex items-center gap-1 text-[8px] text-muted-foreground">
        <Check size={11} /> Disponible hoy
      </div>
    </div>
  </div>
);

const OwnerMenu = () => (
  <Phone title="Dueño · Menú del día">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">MENÚ DEL DÍA</p>
            <h2 className="mt-1 text-[22px] font-black">Miércoles 30</h2>
            <p className="text-[10px] text-muted-foreground">Septiembre · 2026</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
            <CalendarDays size={20} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Dish title="Sopa" name="Locro de papa" image={soupImage} />
          <Dish title="Segundo" name="Pollo a la plancha" image={lunchImage} />
          <Dish title="Opción veggie" name="Bowl de quinoa" image={veggieImage} />
          <Dish title="Postre" name="Higos con queso" image={soupImage} soldOut />
        </div>
        <div className="mt-4 rounded-2xl bg-muted p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold text-muted-foreground">BEBIDA DE HOY</p>
              <p className="mt-1 text-[11px] font-extrabold">Jugo de naranjilla</p>
            </div>
            <Toggle />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-sm font-black">Menú de la semana</h3>
          <span className="text-[9px] font-bold text-primary">Editar</span>
        </div>
        <div className="mt-3 flex gap-2">
          {[
            ["LUN", "Seco de pollo"],
            ["MAR", "Fritada"],
            ["MIÉ", "Pollo grill"],
          ].map(([day, meal], i) => (
            <div
              key={day}
              className={`w-[104px] shrink-0 rounded-xl p-3 ${i === 2 ? "bg-primary text-primary-foreground" : "bg-card shadow-soft"}`}
            >
              <p
                className={`text-[8px] font-black ${i === 2 ? "text-primary-soft" : "text-muted-foreground"}`}
              >
                {day}
              </p>
              <p className="mt-2 text-[9px] font-extrabold leading-tight">{meal}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-extrabold text-background">
          <Eye size={16} /> Publicar menú
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Gratis para publicar. Bocadoo cobra un porcentaje solo cuando se canjea la oferta.
        </p>
      </div>
      <NavBar active="Menú" owner />
    </div>
  </Phone>
);

const OwnerSettings = () => (
  <Phone title="Dueño · Ajustes">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <h2 className="mt-4 text-[23px] font-black">Ajustes</h2>
        <div className="mt-4 flex items-center gap-4 rounded-[24px] bg-foreground p-4 text-background">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Utensils size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold text-lavender">MI RESTAURANTE</p>
            <h3 className="mt-1 text-sm font-black leading-tight">La Cuchara de San Blas</h3>
            <p className="mt-1 text-[8px] text-card-dark-muted">
              Editar perfil <Pencil size={8} className="inline" />
            </p>
          </div>
        </div>
        <p className="mb-1 mt-4 text-[9px] font-black text-muted-foreground">NEGOCIO</p>
        <SettingsRow icon={Store} label="Datos del restaurante" />
        <SettingsRow icon={Clock3} label="Dirección y horarios" />
        <SettingsRow icon={Pencil} label="Editar nombre" />
        <SettingsRow icon={CreditCard} label="Métodos de cobro" />
        <p className="mb-1 mt-3 text-[9px] font-black text-muted-foreground">CUENTA Y SOPORTE</p>
        <SettingsRow icon={Mail} label="Cambiar correo" />
        <SettingsRow icon={LockKeyhole} label="Cambiar contraseña" />
        <SettingsRow icon={Bell} label="Notificaciones" />
        <SettingsRow icon={CircleHelp} label="Ayuda y soporte" />
        <SettingsRow icon={LogOut} label="Cerrar sesión" danger />
      </div>
      <NavBar active="Ajustes" owner />
    </div>
  </Phone>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 mt-4 text-[9px] font-black text-muted-foreground">{children}</p>
);

const ModalHeader = ({
  icon: Icon,
  eyebrow,
  title,
  dark = false,
}: {
  icon: IconType;
  eyebrow: string;
  title: string;
  dark?: boolean;
}) => (
  <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
    <div
      className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}
    >
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <p className={`text-[9px] font-black ${dark ? "text-lavender" : "text-primary"}`}>
        {eyebrow}
      </p>
      <h3 className="mt-0.5 truncate text-lg font-black leading-tight">{title}</h3>
    </div>
    <div
      className={`grid h-8 w-8 place-items-center rounded-full ${dark ? "bg-background/15" : "bg-muted"}`}
    >
      <X size={15} />
    </div>
  </div>
);

const BottomSheet = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-auto rounded-t-[30px] bg-background px-5 pb-8 pt-3 shadow-card">
    <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
    {children}
  </div>
);

const PrimaryButton = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-brand">
    {children}
  </div>
);

const PaymentMethods = ({ selected, dark = false }: { selected: string; dark?: boolean }) => (
  <div className="grid grid-cols-3 gap-2">
    {(
      [
        ["Efectivo", Banknote],
        ["Transferencia", Landmark],
        ["Tarjeta", CreditCard],
      ] as Array<[string, IconType]>
    ).map(([label, Icon]) => {
      const on = label === selected;
      const idle = dark
        ? "border-background/15 text-card-dark-muted"
        : "border-border text-muted-foreground";
      return (
        <div
          key={label}
          className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 ${on ? "border-primary bg-primary text-primary-foreground" : idle}`}
        >
          <Icon size={16} />
          <span className="text-[9px] font-bold">{label}</span>
        </div>
      );
    })}
  </div>
);

const ChargeModal = () => (
  <Phone
    title="Dueño · Cobrar"
    overlay={
      <BottomSheet>
        <ModalHeader icon={CreditCard} eyebrow="COBRAR PLAN" title="Nuevo cobro" />
        <FieldLabel>CLIENTE</FieldLabel>
        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-muted p-2.5">
          <Avatar initials="VO" />
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold">Valentina Ortiz</p>
            <p className="truncate text-[9px] text-muted-foreground">valentina.ortiz@email.com</p>
          </div>
          <ChevronRight size={15} className="text-muted-foreground" />
        </div>
        <FieldLabel>PLAN A COBRAR</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["Semanal", "5", "$15"],
              ["Quincenal", "10", "$28"],
              ["Mensual", "20", "$52"],
            ] as const
          ).map(([type, lunches, price]) => {
            const on = type === "Mensual";
            return (
              <div
                key={type}
                className={`relative rounded-xl border p-2.5 ${on ? "border-primary bg-accent" : "border-border"}`}
              >
                {on && (
                  <div className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
                <p className="text-[8px] font-black text-primary">{type.toUpperCase()}</p>
                <p className="mt-1.5 text-[11px] font-extrabold">{lunches} almuerzos</p>
                <p className="mt-0.5 text-sm font-black">{price}</p>
              </div>
            );
          })}
        </div>
        <FieldLabel>MÉTODO DE PAGO</FieldLabel>
        <PaymentMethods selected="Efectivo" />
        <div className="mt-4 space-y-1.5 rounded-2xl bg-muted p-3.5 text-[10px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Plan mensual · 20 almuerzos</span>
            <span>$52,00</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Precio por almuerzo</span>
            <span>$2,60</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-sm font-black">
            <span>Total</span>
            <span>$52,00</span>
          </div>
        </div>
        <PrimaryButton>
          <Check size={16} /> Confirmar cobro · $52,00
        </PrimaryButton>
      </BottomSheet>
    }
  >
    <OwnerHomeBody />
  </Phone>
);

const ScanCorner = ({ className }: { className: string }) => (
  <span className={`absolute h-9 w-9 border-primary ${className}`} />
);

const ScanModal = () => (
  <Phone
    title="Dueño · Escanear QR / Descontar"
    overlay={
      <div className="m-auto w-[336px] rounded-[28px] bg-card-dark p-5 text-card-dark-foreground shadow-card">
        <ModalHeader
          icon={ScanLine}
          eyebrow="ESCANEAR QR / DESCONTAR"
          title="Descontar almuerzo"
          dark
        />
        <div className="relative mt-5 grid h-[190px] place-items-center overflow-hidden rounded-2xl bg-phone">
          <QrCode size={100} strokeWidth={1.2} className="text-card-dark-muted/40" />
          <ScanCorner className="left-5 top-5 rounded-tl-xl border-l-4 border-t-4" />
          <ScanCorner className="right-5 top-5 rounded-tr-xl border-r-4 border-t-4" />
          <ScanCorner className="bottom-5 left-5 rounded-bl-xl border-b-4 border-l-4" />
          <ScanCorner className="bottom-5 right-5 rounded-br-xl border-b-4 border-r-4" />
          <div className="absolute inset-x-8 top-[48%] h-0.5 rounded-full bg-primary shadow-brand" />
          <div className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-background/15">
            <Flashlight size={14} />
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-card-dark-muted">
          Apunta la cámara al código QR del comensal
        </p>
        <div className="my-3 flex items-center gap-3 text-[9px] font-bold text-card-dark-muted">
          <i className="h-px flex-1 bg-background/15" />o busca por nombre de usuario
          <i className="h-px flex-1 bg-background/15" />
        </div>
        <div className="flex h-11 items-center gap-3 rounded-xl border border-primary bg-background/10 px-4 text-xs">
          <AtSign size={15} className="text-lavender" />
          <span className="font-semibold">carlos.mejia</span>
          <Search size={15} className="ml-auto text-card-dark-muted" />
        </div>
        <div className="mt-3 rounded-2xl bg-background p-3 text-foreground">
          <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3">
            <Avatar initials="CM" />
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold">Carlos Mejía</p>
              <p className="truncate text-[9px] text-muted-foreground">@carlos.mejia</p>
              <p className="truncate text-[9px] font-bold text-primary">
                Plan mensual · 14 almuerzos
              </p>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-black text-success">
              <CircleCheck size={13} /> Válido
            </span>
          </div>
        </div>
        <PrimaryButton>
          <Utensils size={15} /> Descontar 1 almuerzo
        </PrimaryButton>
      </div>
    }
  >
    <OwnerHomeBody />
  </Phone>
);

const AddClientModal = () => (
  <Phone
    title="Dueño · Agregar cliente"
    overlay={
      <BottomSheet>
        <ModalHeader icon={UserPlus} eyebrow="AGREGAR CLIENTE" title="Registrar en un plan" />
        <FieldLabel>CORREO O NOMBRE DE USUARIO</FieldLabel>
        <div className="flex h-12 items-center gap-3 rounded-xl border-2 border-primary bg-background px-4 text-xs">
          <AtSign size={16} className="text-primary" />
          <span className="font-semibold">valentina.ortiz</span>
          <Search size={15} className="ml-auto text-muted-foreground" />
        </div>
        <div className="mt-3 grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-accent/60 p-2.5">
          <Avatar initials="VO" />
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold">Valentina Ortiz</p>
            <p className="truncate text-[9px] text-muted-foreground">valentina.ortiz@email.com</p>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-background px-2 py-1 text-[8px] font-black text-success">
            <CircleCheck size={11} /> Encontrado
          </span>
        </div>
        <FieldLabel>ASIGNAR A UN PLAN</FieldLabel>
        <div className="space-y-2">
          {(
            [
              ["Semanal", "5 almuerzos · 7 días", "$15,00"],
              ["Quincenal", "10 almuerzos · 18 días", "$28,00"],
              ["Mensual", "20 almuerzos · 35 días", "$52,00"],
            ] as const
          ).map(([type, detail, price]) => {
            const on = type === "Mensual";
            return (
              <div
                key={type}
                className={`grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5 ${on ? "border-primary bg-accent/50" : "border-border"}`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? "border-primary" : "border-muted-foreground/40"}`}
                >
                  {on && <i className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold">Plan {type.toLowerCase()}</p>
                  <p className="text-[9px] text-muted-foreground">{detail}</p>
                </div>
                <span className="text-xs font-black">{price}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted p-2.5">
            <p className="text-[8px] text-muted-foreground">Inicio</p>
            <p className="mt-1 text-[11px] font-extrabold">Hoy, 30/09</p>
          </div>
          <div className="rounded-xl bg-muted p-2.5">
            <p className="text-[8px] text-muted-foreground">Vence</p>
            <p className="mt-1 text-[11px] font-extrabold">04/11/2026</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
          <div>
            <p className="text-[10px] font-extrabold">Cobrar ahora</p>
            <p className="text-[8px] text-muted-foreground">
              Registra el pago de $52,00 en efectivo
            </p>
          </div>
          <Toggle />
        </div>
        <PrimaryButton>
          <UserPlus size={15} /> Registrar cliente
        </PrimaryButton>
      </BottomSheet>
    }
  >
    <OwnerHomeBody />
  </Phone>
);

const ScreenHeader = ({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="mt-3 grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
    <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
      <ArrowLeft size={18} />
    </div>
    <div className="min-w-0">
      <p className="truncate text-[9px] font-bold text-muted-foreground">{eyebrow}</p>
      <h2 className="truncate text-xl font-black leading-tight">{title}</h2>
    </div>
    {action}
  </div>
);

const PosItem = ({
  image,
  name,
  price,
  qty = 0,
}: {
  image: string;
  name: string;
  price: string;
  qty?: number;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-card shadow-soft ${qty ? "ring-2 ring-primary" : ""}`}
  >
    <img
      src={image}
      alt={name}
      loading="lazy"
      width={896}
      height={752}
      className="h-[62px] w-full object-cover"
    />
    {qty > 0 && (
      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
        {qty}
      </span>
    )}
    <div className="flex items-center justify-between gap-2 p-2.5">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-extrabold">{name}</p>
        <p className="mt-0.5 text-[10px] font-black text-primary">{price}</p>
      </div>
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-primary">
        <Plus size={14} />
      </div>
    </div>
  </div>
);

const PosScreen = () => (
  <Phone title="Dueño · Registrar consumo (POS)">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5">
        <ScreenHeader
          eyebrow="CAJA ABIERTA · 13:20"
          title="Registrar consumo"
          action={
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary">
              <Receipt size={18} />
            </div>
          }
        />
        <div className="mt-4 grid grid-cols-2 rounded-xl bg-muted p-1 text-[10px] font-bold">
          <div className="rounded-[10px] bg-foreground py-2 text-center text-background">
            Venta directa
          </div>
          <div className="py-2 text-center text-muted-foreground">Consumo con plan</div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-primary px-3 py-1.5 text-[9px] font-bold text-primary-foreground">
            Almuerzos
          </span>
          <span className="rounded-full bg-muted px-3 py-1.5 text-[9px] font-bold">Extras</span>
          <span className="rounded-full bg-muted px-3 py-1.5 text-[9px] font-bold">Bebidas</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <PosItem image={lunchImage} name="Almuerzo del día" price="$3,00" qty={2} />
          <PosItem image={veggieImage} name="Almuerzo veggie" price="$3,25" qty={1} />
          <PosItem image={soupImage} name="Solo sopa" price="$1,25" />
          <PosItem image={lunchImage} name="Solo segundo" price="$2,50" />
        </div>
        <p className="mb-2 mt-4 text-[9px] font-black text-muted-foreground">EXTRAS RÁPIDOS</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            ["Jugo de naranjilla", "$0,75"],
            ["Postre del día", "$1,00"],
          ].map(([name, price]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5"
            >
              <div>
                <p className="text-[10px] font-extrabold">{name}</p>
                <p className="text-[9px] font-black text-primary">{price}</p>
              </div>
              <Plus size={14} className="text-primary" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto rounded-t-[26px] bg-card-dark px-5 pb-6 pt-4 text-card-dark-foreground">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black text-lavender">TICKET #0148</p>
          <p className="text-[9px] text-card-dark-muted">Mesa 4</p>
        </div>
        <div className="mt-2 space-y-1.5 text-[10px]">
          {[
            ["2×", "Almuerzo del día", "$6,00"],
            ["1×", "Almuerzo veggie", "$3,25"],
          ].map(([qty, name, total]) => (
            <div
              key={name}
              className="grid grid-cols-[22px_minmax(0,1fr)_auto_auto] items-center gap-2"
            >
              <span className="font-black text-lavender">{qty}</span>
              <span className="truncate">{name}</span>
              <span className="font-bold">{total}</span>
              <Minus size={12} className="text-card-dark-muted" />
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-end justify-between border-t border-background/15 pt-2.5">
          <span className="text-[10px] text-card-dark-muted">Total · 3 almuerzos</span>
          <span className="text-xl font-black">$9,25</span>
        </div>
        <div className="mt-3">
          <PaymentMethods selected="Efectivo" dark />
        </div>
        <PrimaryButton>
          <Banknote size={16} /> Cobrar $9,25
        </PrimaryButton>
      </div>
    </div>
  </Phone>
);

const Stepper = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-muted p-2.5">
    <p className="text-[8px] text-muted-foreground">{label}</p>
    <div className="mt-1.5 flex items-center justify-between">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-background">
        <Minus size={12} />
      </span>
      <span className="text-sm font-black">{value}</span>
      <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
        <Plus size={12} />
      </span>
    </div>
  </div>
);

const NewPlanScreen = () => (
  <Phone title="Dueño · Configurar plan">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-5">
        <ScreenHeader
          eyebrow="LA CUCHARA DE SAN BLAS"
          title="Nuevo plan"
          action={<span className="text-[11px] font-extrabold text-primary">Borrador</span>}
        />
        <div className="relative mt-4 overflow-hidden rounded-[20px] bg-card-dark p-4 text-card-dark-foreground shadow-card">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary/40" />
          <p className="relative text-[8px] font-black text-lavender">
            VISTA PREVIA PARA COMENSALES
          </p>
          <div className="relative mt-2 flex items-end justify-between">
            <div>
              <p className="text-sm font-black">Plan mensual ejecutivo</p>
              <p className="mt-0.5 text-[9px] text-card-dark-muted">
                20 almuerzos · vigencia 35 días
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black">$52,00</p>
              <p className="text-[8px] text-lavender">$2,60 c/u</p>
            </div>
          </div>
        </div>
        <FieldLabel>NOMBRE DEL PLAN</FieldLabel>
        <div className="flex h-10 items-center rounded-xl bg-muted px-3.5 text-[11px] font-semibold">
          Plan mensual ejecutivo
          <Pencil size={13} className="ml-auto text-muted-foreground" />
        </div>
        <FieldLabel>TIPO DE PLAN</FieldLabel>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1 text-[9px] font-bold">
          {["Semanal", "Quincenal", "Mensual", "Libre"].map((t) => (
            <div
              key={t}
              className={`rounded-[9px] py-2 text-center ${t === "Mensual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stepper label="Almuerzos" value="20" />
          <Stepper label="Vigencia (días)" value="35" />
          <div className="rounded-xl bg-muted p-2.5">
            <p className="text-[8px] text-muted-foreground">Precio del plan</p>
            <p className="mt-1.5 text-sm font-black">$52,00</p>
          </div>
          <div className="rounded-xl bg-muted p-2.5">
            <p className="text-[8px] text-muted-foreground">Cupos disponibles</p>
            <p className="mt-1.5 text-sm font-black">40 clientes</p>
          </div>
        </div>
        <FieldLabel>DÍAS DE CONSUMO</FieldLabel>
        <div className="flex justify-between">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <span
              key={`${d}-${i}`}
              className={`grid h-8 w-8 place-items-center rounded-lg text-[9px] font-black ${i < 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {d}
            </span>
          ))}
        </div>
        <FieldLabel>EL ALMUERZO INCLUYE</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[
            ["Sopa", true],
            ["Segundo", true],
            ["Jugo", true],
            ["Postre", false],
          ].map(([item, on]) => (
            <span
              key={String(item)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[9px] font-bold ${on ? "bg-accent text-primary" : "border border-border text-muted-foreground"}`}
            >
              {on ? <Check size={11} strokeWidth={3} /> : <Plus size={11} />}
              {item}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-b border-border py-2">
          <div>
            <p className="text-[10px] font-extrabold">Visible en el marketplace</p>
            <p className="text-[8px] text-muted-foreground">
              Los comensales pueden comprarlo en la app
            </p>
          </div>
          <Toggle />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[10px] font-extrabold">Renovación automática</p>
            <p className="text-[8px] text-muted-foreground">
              Avisar al cliente 3 días antes de vencer
            </p>
          </div>
          <Toggle on={false} />
        </div>
      </div>
      <div className="shrink-0 px-5 pb-7">
        <PrimaryButton>
          <Check size={16} /> Guardar y publicar plan
        </PrimaryButton>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Gratis para publicar. Bocadoo cobra un porcentaje solo cuando se canjea la oferta.
        </p>
      </div>
    </div>
  </Phone>
);

function ScreenGroup({
  eyebrow,
  title,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-max">
      <div className="mb-8 flex items-end justify-between border-b border-showcase-border pb-5">
        <div>
          <p className="text-[11px] font-black uppercase text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-black text-showcase-foreground">{title}</h2>
        </div>
        <span className="rounded-full bg-showcase-pill px-3 py-1.5 text-xs font-bold text-showcase-muted">
          {count} {count === 1 ? "pantalla" : "pantallas"}
        </span>
      </div>
      <div className="flex gap-10">{children}</div>
    </section>
  );
}

function BocadooShowcase() {
  return (
    <main className="min-h-screen overflow-x-auto bg-showcase px-10 py-12 font-sans md:px-16 md:py-16">
      <header className="mb-16 flex min-w-max items-end justify-between gap-20">
        <div>
          <Logo />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-showcase-muted">
            Sistema visual de la app móvil para planes de almuerzo prepagados en Quito.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full bg-showcase-muted" />
          <span className="h-4 w-4 rounded-full bg-phone" />
          <span className="h-4 w-4 rounded-full bg-background" />
          <span className="h-4 w-4 rounded-full bg-primary" />
          <span className="h-4 w-4 rounded-full bg-lavender" />
        </div>
      </header>
      <div className="flex min-w-max items-start gap-24 pb-16">
        <ScreenGroup eyebrow="Acceso y Onboarding" title="Autenticación, Registro y Paso 0" count={5}>
          <LoginScreen />
          <RegisterDinerMockup />
          <RegisterOwnerMockup />
          <OnboardingDinerMockup />
          <OnboardingOwnerMockup />
        </ScreenGroup>
        <ScreenGroup eyebrow="Experiencia 01" title="Comensal" count={3}>
          <DinerHome />
          <Marketplace />
          <DinerSettings />
        </ScreenGroup>
        <ScreenGroup eyebrow="Experiencia 02" title="Dueño de restaurante" count={4}>
          <OwnerHome />
          <OwnerPlans />
          <OwnerMenu />
          <OwnerSettings />
        </ScreenGroup>
        <ScreenGroup eyebrow="Experiencia 02 · Flujos" title="Acciones del dueño" count={5}>
          <ChargeModal />
          <ScanModal />
          <AddClientModal />
          <PosScreen />
          <NewPlanScreen />
        </ScreenGroup>
      </div>
    </main>
  );
}
