import {
  BarChart3,
  Battery,
  QrCode,
  Settings,
  Store,
  UserRound,
  Utensils,
  WalletCards,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { BocadooQr } from "@/components/bocadoo/BocadooQr";
import { cn } from "@/lib/utils";

import type { Role } from "./roles";

/**
 * Marco del celular. La pantalla se dibuja a 390×844 (igual que la app real)
 * y se escala con CSS para que quepan los dos celulares lado a lado.
 */
export function PhoneFrame({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div className="flj-phone rounded-[44px] bg-phone p-2 shadow-lg" data-active={active}>
      <div className="flj-viewport relative overflow-hidden rounded-[36px] bg-surface">
        <div className="flj-screen">{children}</div>
      </div>
    </div>
  );
}

function StatusBar({ offline }: { offline: boolean }) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between bg-surface px-7 text-[13px] font-bold text-foreground">
      <span>12:41</span>
      <span className="flex items-center gap-1.5">
        {offline ? (
          <WifiOff className="h-4 w-4 text-danger" aria-hidden />
        ) : (
          <Wifi className="h-4 w-4" aria-hidden />
        )}
        <Battery className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}

/** Mismas pestañas y orden que `NavBar` de la app. */
const TABS: Record<Role, Array<[string, LucideIcon]>> = {
  comensal: [
    ["Pase", QrCode],
    ["Restaurantes", Store],
    ["Planes", WalletCards],
    ["Yo", UserRound],
  ],
  dueno: [
    ["Caja", QrCode],
    ["Menú", Utensils],
    ["Planes", WalletCards],
    ["Métricas", BarChart3],
    ["Ajustes", Settings],
  ],
};

function NavBar({ role, active }: { role: Role; active: string }) {
  const items = TABS[role];
  return (
    <div
      className="grid min-h-[76px] shrink-0 border-t border-border bg-surface-nav px-2 pb-6 pt-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(([label, Icon]) => {
        const selected = label === active;
        return (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1",
              selected ? "font-black text-on-primary-container" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid place-items-center rounded-xl px-2.5 py-1",
                selected && "bg-primary-container",
              )}
            >
              <Icon size={20} strokeWidth={selected ? 2.8 : 2} aria-hidden />
            </span>
            <span className="text-[13px] font-bold leading-none tracking-tight">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Pantalla base: barra de estado + contenido + pestañas del rol. */
export function Screen({
  role,
  tab,
  offline = false,
  children,
}: {
  role: Role;
  tab: string;
  offline?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flj-in flex h-full flex-col bg-surface text-foreground">
      <StatusBar offline={offline} />
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      <NavBar role={role} active={tab} />
    </div>
  );
}

/** Aro animado "toca aquí". Va dentro de un contenedor `relative`. */
export const Tap = () => <span aria-hidden className="flj-tap" />;

/** Encabezado de pantalla interna: flecha atrás, antetítulo morado y título. */
export function Header({
  title,
  eyebrow,
  right,
  back = true,
}: {
  title: string;
  eyebrow?: string;
  right?: ReactNode;
  back?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      {back && (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-foreground">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[13px] font-black uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <p className="truncate text-[24px] font-black leading-tight">{title}</p>
      </div>
      {right}
    </div>
  );
}

const CHIP_TONES = {
  ok: "bg-success-container text-success",
  warn: "bg-danger-container text-on-danger-container",
  brand: "bg-primary text-primary-foreground",
  soft: "bg-primary-container text-primary",
  muted: "bg-secondary-container text-muted-foreground",
} as const;

export function Chip({
  tone = "soft",
  icon: Icon,
  children,
  className,
}: {
  tone?: keyof typeof CHIP_TONES;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-extrabold leading-none",
        CHIP_TONES[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  icon: Icon,
  tap = false,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "soft" | "outline" | "success" | "disabled";
  icon?: LucideIcon;
  tap?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 text-[16px] font-black",
        variant === "primary" && "bg-primary text-primary-foreground shadow-brand",
        variant === "soft" && "bg-primary-container text-primary",
        variant === "outline" && "border border-border bg-background text-foreground",
        variant === "success" && "bg-success text-success-foreground",
        variant === "disabled" && "bg-secondary-container text-muted-foreground",
        className,
      )}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
      {children}
      {tap && <Tap />}
    </div>
  );
}

/** Aviso inferior como los `toast` de la app (con Deshacer opcional). */
export function Toast({
  children,
  icon: Icon,
  action,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  action?: string;
}) {
  return (
    <div className="flj-in absolute inset-x-4 bottom-4 z-30 flex items-center gap-3 rounded-[24px] border border-border bg-surface px-4 py-3 shadow-lg">
      {Icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success-container text-success">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1 text-[15px] font-extrabold leading-snug">{children}</span>
      {action && (
        <span className="shrink-0 rounded-full bg-primary-container px-3 py-1.5 text-[13px] font-extrabold text-primary">
          {action}
        </span>
      )}
    </div>
  );
}

/** Hoja inferior sobre la pantalla atenuada, como `BottomSheet` de la app. */
export function Sheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-scrim/40">
      <div className="flj-sheet rounded-t-[32px] bg-surface px-5 pb-5 pt-3 shadow-lg">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[22px] font-black">{title}</p>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary-container">
            <X className="h-4 w-4" aria-hidden />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-[13px] font-black uppercase tracking-wider text-muted-foreground">
        {children}
      </p>
      {right}
    </div>
  );
}

/** QR sobre fondo blanco: morado de marca sobre blanco, también en modo oscuro. */
export function QrBox({ value, size = 150 }: { value: string; size?: number }) {
  return (
    <div className="rounded-[24px] border border-border bg-qr-bg p-4">
      <BocadooQr value={value} size={size} level="M" />
    </div>
  );
}
