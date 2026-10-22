import {
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
  type NavigateOptions,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  ChevronRight,
  CreditCard,
  Home,
  Landmark,
  Menu as MenuIcon,
  Minus,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  UserRound,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { TxnIcon } from "./store";

export type IconType = LucideIcon;
export type AppPath = NonNullable<NavigateOptions["to"]>;

export const Logo = ({ compact = false }: { compact?: boolean }) => (
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
        <div className="mt-1 text-xs font-semibold text-muted-foreground">
          tu almuerzo, más fácil
        </div>
      )}
    </div>
  </div>
);

const StatusBar = ({ app = false }: { app?: boolean }) => (
  <div
    className={`flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[12px] font-bold text-foreground ${app ? "max-[500px]:hidden embedded:flex!" : ""}`}
  >
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

/**
 * Marco de celular. En la galería (`app` = false) mantiene el tamaño fijo de las maquetas;
 * en el prototipo navegable se ajusta al alto de la ventana y en un celular real ocupa toda la pantalla.
 */
export const DeviceFrame = ({
  title,
  children,
  app = false,
}: {
  title?: string;
  children: ReactNode;
  app?: boolean;
}) => {
  const shell = (
    <div
      className={
        app
          ? "relative h-[min(844px,calc(100dvh_-_2rem))] w-[390px] overflow-hidden rounded-[47px] border-[7px] border-phone bg-background shadow-phone max-[500px]:h-dvh max-[500px]:w-full max-[500px]:rounded-none max-[500px]:border-0 max-[500px]:shadow-none embedded:h-dvh embedded:w-full embedded:rounded-none embedded:border-0 embedded:shadow-none"
          : "phone-shell relative h-[844px] overflow-hidden rounded-[47px] border-[7px] border-phone bg-background shadow-phone"
      }
    >
      <div
        className={`absolute left-1/2 top-2 z-30 h-[25px] w-[92px] -translate-x-1/2 rounded-full bg-phone ${app ? "max-[500px]:hidden embedded:hidden" : ""}`}
      />
      <div
        className={`flex h-full flex-col overflow-hidden rounded-[39px] ${app ? "max-[500px]:rounded-none embedded:rounded-none" : ""}`}
      >
        <StatusBar app={app} />
        {children}
      </div>
      <div
        className={`pointer-events-none absolute bottom-2 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground/80 ${app ? "max-[500px]:hidden embedded:hidden" : ""}`}
      />
    </div>
  );
  if (app) return shell;
  return (
    <figure className="w-[390px] shrink-0">
      {shell}
      {title && (
        <figcaption className="mt-5 text-center text-sm font-bold text-showcase-muted">
          {title}
        </figcaption>
      )}
    </figure>
  );
};

/** Página del prototipo navegable: un solo celular centrado. */
export const AppShell = ({ children }: { children: ReactNode }) => (
  <main className="grid min-h-dvh place-items-center bg-showcase p-4 font-sans max-[500px]:p-0 embedded:p-0">
    <Link
      to="/app/galeria"
      className="fixed left-8 top-8 hidden items-center gap-4 xl:flex embedded:hidden!"
    >
      <Logo compact />
      <span className="rounded-full bg-showcase-pill px-3 py-1.5 text-xs font-bold text-showcase-muted">
        Ver todas las pantallas
      </span>
    </Link>
    <DeviceFrame app>{children}</DeviceFrame>
  </main>
);

/**
 * Capa emergente con fondo difuminado. Se posiciona sobre el marco del celular,
 * por eso debe renderizarse fuera de contenedores con `position` o scroll.
 */
export const Overlay = ({ children, onClose }: { children: ReactNode; onClose?: () => void }) => (
  <div
    className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[39px] bg-foreground/35 p-0 backdrop-blur-[6px] animate-in fade-in duration-200 max-[500px]:rounded-none embedded:rounded-none"
    onClick={onClose}
  >
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export function useGoBack(fallback: AppPath) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return () => (canGoBack ? router.history.back() : navigate({ to: fallback }));
}

const NAV_ITEMS: Record<"diner" | "owner", Array<[string, IconType, AppPath]>> = {
  diner: [
    ["Home", Home, "/app/comensal"],
    ["Restaurantes", Store, "/app/comensal/restaurantes"],
    ["Ajustes", Settings, "/app/comensal/ajustes"],
  ],
  owner: [
    ["Home", Home, "/app/dueno"],
    ["Planes", WalletCards, "/app/dueno/planes"],
    ["Menú", MenuIcon, "/app/dueno/menu"],
    ["Ajustes", Settings, "/app/dueno/ajustes"],
  ],
};

export const NavBar = ({ active, owner = false }: { active: string; owner?: boolean }) => {
  const items = NAV_ITEMS[owner ? "owner" : "diner"];
  return (
    <nav
      className="mt-auto grid h-[73px] shrink-0 border-t border-border bg-background/95 px-3 pb-3 pt-2 backdrop-blur-sm"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(([label, Icon, to]) => {
        const selected = active === label;
        return (
          <Link
            key={label}
            to={to}
            replace
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl ${selected ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className={selected ? "rounded-xl bg-accent px-4 py-1" : "px-4 py-1"}>
              <Icon size={19} strokeWidth={selected ? 2.7 : 2} />
            </div>
            <span className="text-xs font-bold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export const Avatar = ({ initials, large = false }: { initials: string; large?: boolean }) => (
  <div
    className={`${large ? "h-20 w-20 text-xl" : "h-11 w-11 text-xs"} grid shrink-0 place-items-center rounded-full border-2 border-background bg-lavender font-black text-primary shadow-soft`}
  >
    {initials}
  </div>
);

export const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
    <h3 className="min-w-0 text-[15px] font-extrabold text-foreground">{children}</h3>
    {action}
  </div>
);

export const TXN_ICONS: Record<TxnIcon, IconType> = {
  user: UserRound,
  bag: ShoppingBag,
  utensils: Utensils,
};

export const Transaction = ({
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
      <div className="truncate text-xs font-extrabold text-foreground">{name}</div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</div>
    </div>
    <div className={`text-xs font-extrabold ${positive ? "text-success" : "text-foreground"}`}>
      {value}
    </div>
  </div>
);

export const SettingsRow = ({
  icon: Icon,
  label,
  danger = false,
  to,
}: {
  icon: IconType;
  label: string;
  danger?: boolean;
  to?: AppPath;
}) => {
  const className = `grid w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2.5 text-left ${danger ? "text-danger" : "text-foreground"}`;
  const content = (
    <>
      <div
        className={`grid h-9 w-9 place-items-center rounded-xl ${danger ? "bg-danger-soft" : "bg-accent text-primary"}`}
      >
        <Icon size={16} />
      </div>
      <span className="text-xs font-bold">{label}</span>
      {!danger && <ChevronRight size={16} className="text-muted-foreground" />}
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export const QuickAction = ({
  icon: Icon,
  label,
  to,
}: {
  icon: IconType;
  label: string;
  to: AppPath;
}) => (
  <Link
    to={to}
    className="flex min-w-0 min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl bg-card px-2 py-3 shadow-soft transition-transform active:scale-95"
  >
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
      <Icon size={19} />
    </div>
    <span className="text-center text-xs font-extrabold leading-tight">{label}</span>
  </Link>
);

export const Toggle = ({
  on = true,
  onToggle,
  label,
}: {
  on?: boolean;
  onToggle?: () => void;
  label?: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onToggle}
    className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${on ? "justify-end bg-primary" : "justify-start bg-muted-foreground/30"}`}
  >
    <i className="h-4 w-4 rounded-full bg-background shadow-soft" />
  </button>
);

export const FieldLabel = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 mt-4 text-xs font-black uppercase text-muted-foreground">{children}</p>
);

export const ModalHeader = ({
  icon: Icon,
  eyebrow,
  title,
  dark = false,
  onClose,
}: {
  icon: IconType;
  eyebrow: string;
  title: string;
  dark?: boolean;
  onClose?: () => void;
}) => (
  <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
    <div
      className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}
    >
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-black uppercase tracking-wider ${dark ? "text-lavender" : "text-primary"}`}>
        {eyebrow}
      </p>
      <h3 className="mt-0.5 truncate text-lg font-black leading-tight">{title}</h3>
    </div>
    <button
      type="button"
      aria-label="Cerrar"
      onClick={onClose}
      className={`grid h-11 w-11 place-items-center rounded-full active:scale-95 ${dark ? "bg-background/15" : "bg-muted"}`}
    >
      <X size={18} />
    </button>
  </div>
);

export const BottomSheet = ({ children }: { children: ReactNode }) => (
  <div className="no-scrollbar mt-auto max-h-[calc(100%-48px)] overflow-y-auto rounded-t-[30px] bg-background px-5 pb-8 pt-3 shadow-card animate-in slide-in-from-bottom-10 duration-300">
    <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
    {children}
  </div>
);

export const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-brand transition-opacity active:opacity-90 disabled:opacity-40 disabled:shadow-none"
  >
    {children}
  </button>
);

export const SecondaryButton = ({
  children,
  onClick,
  dark = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  dark?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-extrabold ${dark ? "text-card-dark-muted" : "bg-muted text-foreground"}`}
  >
    {children}
  </button>
);

export const PAYMENT_METHODS: Array<[string, IconType]> = [
  ["Efectivo", Banknote],
  ["Transferencia", Landmark],
  ["Tarjeta", CreditCard],
];

export const PaymentMethods = ({
  selected,
  onSelect,
  dark = false,
}: {
  selected: string;
  onSelect?: (method: string) => void;
  dark?: boolean;
}) => (
  <div className="grid grid-cols-3 gap-2">
    {PAYMENT_METHODS.map(([label, Icon]) => {
      const on = label === selected;
      const idle = dark
        ? "border-background/15 text-card-dark-muted"
        : "border-border text-muted-foreground";
      return (
        <button
          type="button"
          key={label}
          onClick={() => onSelect?.(label)}
          className={`flex min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 active:scale-95 ${on ? "border-primary bg-primary text-primary-foreground" : idle}`}
        >
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </button>
      );
    })}
  </div>
);

export const ScanCorner = ({ className }: { className: string }) => (
  <span className={`absolute h-9 w-9 border-primary ${className}`} />
);

export const ScreenHeader = ({
  eyebrow,
  title,
  action,
  back,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  back: AppPath;
}) => {
  const goBack = useGoBack(back);
  return (
    <div className="mt-3 grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
      <button
        type="button"
        aria-label="Volver"
        onClick={goBack}
        className="grid h-11 w-11 place-items-center rounded-full bg-muted active:scale-95"
      >
        <ArrowLeft size={19} />
      </button>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-muted-foreground">{eyebrow}</p>
        <h2 className="truncate text-xl font-black leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
};

export const PosItem = ({
  image,
  name,
  price,
  qty = 0,
  onAdd,
}: {
  image: string;
  name: string;
  price: string;
  qty?: number;
  onAdd?: () => void;
}) => (
  <button
    type="button"
    onClick={onAdd}
    className={`relative overflow-hidden rounded-2xl bg-card text-left shadow-soft transition-transform active:scale-[0.97] ${qty ? "ring-2 ring-primary" : ""}`}
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
        <p className="truncate text-xs font-extrabold">{name}</p>
        <p className="mt-0.5 text-xs font-black text-primary">{price}</p>
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
        <Plus size={16} />
      </div>
    </div>
  </button>
);

export const Stepper = ({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec?: () => void;
  onInc?: () => void;
}) => (
  <div className="rounded-2xl bg-muted p-3">
    <p className="text-xs font-bold text-muted-foreground uppercase">{label}</p>
    <div className="mt-2 flex items-center justify-between">
      <button
        type="button"
        aria-label={`Menos ${label}`}
        onClick={onDec}
        className="grid h-11 w-11 place-items-center rounded-xl bg-background shadow-xs active:scale-95"
      >
        <Minus size={16} />
      </button>
      <span className="text-base font-black">{value}</span>
      <button
        type="button"
        aria-label={`Más ${label}`}
        onClick={onInc}
        className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-brand active:scale-95"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

/** Etiqueta de estado de un cliente: Registrado, Sin plan o Plan activo. */
export const StatusBadge = ({ status }: { status: "Registrado" | "Sin plan" | "Plan activo" }) => {
  const styles = {
    Registrado: "bg-accent text-primary",
    "Sin plan": "bg-muted text-muted-foreground",
    "Plan activo": "bg-success/15 text-success",
  }[status];
  return (
    <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-black ${styles}`}>
      {status.toUpperCase()}
    </span>
  );
};
