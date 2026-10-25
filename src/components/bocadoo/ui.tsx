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
  Clock,
  CreditCard,
  Home,
  Landmark,
  Menu as MenuIcon,
  Minus,
  Monitor,
  Plus,
  QrCode,
  Settings,
  ShoppingBag,
  Smartphone,
  Store,
  UserRound,
  Utensils,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { usePlatform } from "@/platform/usePlatform";
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

const StatusBar = ({ app = false }: { app?: boolean }) => {
  const { isAndroid } = usePlatform();

  if (isAndroid) {
    return (
      <div
        className={`flex h-10 shrink-0 items-center justify-between px-5 pt-1 text-[12px] font-bold text-foreground ${
          app ? "max-[500px]:hidden embedded:flex!" : ""
        }`}
      >
        <span className="font-semibold tracking-tight text-[13px]">12:00</span>
        <div className="flex items-center gap-2">
          {/* Material Wi-Fi icon */}
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3c3.78 0 7.23 1.48 9.8 3.9L12 18.67 2.2 10.9C4.77 8.48 8.22 7 12 7z" />
          </svg>
          {/* Material Cell signal triangle */}
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z" />
          </svg>
          {/* Material Vertical Battery */}
          <div className="flex items-center gap-0.5">
            <div className="h-3.5 w-2 rounded-[2px] border border-current p-[1px] flex flex-col justify-end">
              <div className="w-full h-2 bg-current rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS Status Bar
  return (
    <div
      className={`flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[12px] font-bold text-foreground ${
        app ? "max-[500px]:hidden embedded:flex!" : ""
      }`}
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
};

/**
 * Marco de celular responsive adaptado por plataforma:
 * - iOS: 390×844 con Dynamic Island y barra de inicio inferior.
 * - Android: 412×915 sin Dynamic Island ni home indicator, reloj Material a la izquierda.
 */
export const DeviceFrame = ({
  title,
  children,
  app = false,
  responsive = false,
}: {
  title?: string;
  children: ReactNode;
  app?: boolean;
  responsive?: boolean;
}) => {
  const { isAndroid } = usePlatform();

  // Modo adaptable para pantallas grandes (sin marco de plástico ni notch falso)
  if (app && responsive) {
    return (
      <div className="relative w-full max-w-xl min-h-dvh md:my-4 md:min-h-[92vh] flex flex-col bg-background rounded-none md:rounded-3xl md:border md:border-border/80 shadow-2xl overflow-hidden transition-all duration-200">
        <div className="flex h-full flex-col overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  const shellWidth = isAndroid ? "w-[412px]" : "w-[390px]";
  const shellHeight = isAndroid
    ? "h-[min(915px,calc(100dvh_-_2rem))]"
    : "h-[min(844px,calc(100dvh_-_2rem))]";
  const shellFixedGallery = isAndroid ? "h-[915px]" : "h-[844px]";
  const borderRadius = isAndroid ? "rounded-[38px]" : "rounded-[47px]";
  const innerRadius = isAndroid ? "rounded-[32px]" : "rounded-[39px]";

  const shell = (
    <div
      className={
        app
          ? `relative ${shellHeight} ${shellWidth} overflow-hidden ${borderRadius} border-[7px] border-phone bg-background shadow-phone max-[500px]:h-dvh max-[500px]:w-full max-[500px]:rounded-none max-[500px]:border-0 max-[500px]:shadow-none embedded:h-dvh embedded:w-full embedded:rounded-none embedded:border-0 embedded:shadow-none transition-all duration-200`
          : `phone-shell relative ${shellFixedGallery} ${shellWidth} overflow-hidden ${borderRadius} border-[7px] border-phone bg-background shadow-phone transition-all duration-200`
      }
    >
      {/* Dynamic Island / Notch solo en iOS */}
      {!isAndroid ? (
        <div
          className={`absolute left-1/2 top-2 z-30 h-[25px] w-[92px] -translate-x-1/2 rounded-full bg-phone ${
            app ? "max-[500px]:hidden embedded:hidden" : ""
          }`}
        />
      ) : null}

      <div
        className={`flex h-full flex-col overflow-hidden ${innerRadius} ${
          app ? "max-[500px]:rounded-none embedded:rounded-none" : ""
        }`}
      >
        <StatusBar app={app} />
        {children}
      </div>

      {/* Home indicator solo en iOS */}
      {!isAndroid && (
        <div
          className={`pointer-events-none absolute bottom-2 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground/80 ${
            app ? "max-[500px]:hidden embedded:hidden" : ""
          }`}
        />
      )}
    </div>
  );
  if (app) return shell;
  return (
    <figure className={`${shellWidth} shrink-0`}>
      {shell}
      {title && (
        <figcaption className="mt-5 text-center text-sm font-bold text-showcase-muted">
          {title}
        </figcaption>
      )}
    </figure>
  );
};

/** Página del prototipo navegable con soporte adaptable y marco móvil */
export const AppShell = ({ children }: { children: ReactNode }) => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isDueno = currentPath.includes("/dueno");

  const [viewMode, setViewMode] = useState<"phone" | "fluid">(() => {
    if (typeof window === "undefined") return "fluid";
    const stored = localStorage.getItem("bocadoo-view-mode");
    return stored === "phone" || stored === "fluid" ? stored : "fluid";
  });

  const toggleViewMode = (mode: "phone" | "fluid") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("bocadoo-view-mode", mode);
    }
  };

  return (
    <main className="min-h-dvh bg-showcase font-sans flex flex-col items-center justify-start max-[500px]:p-0 embedded:p-0">
      {/* Barra superior de control en pantallas medianas y de escritorio */}
      <header className="hidden min-[501px]:flex w-full items-center justify-between px-6 py-2.5 bg-background/85 backdrop-blur-md border-b border-border/80 sticky top-0 z-40 shadow-xs embedded:hidden!">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Logo compact />
          </Link>

          {/* Selector rápido de rol Comensal / Dueño */}
          <div className="flex items-center rounded-xl bg-muted p-0.5 border border-border/60 text-xs font-bold">
            <Link
              to="/app/comensal"
              className={`rounded-lg px-3 py-1 transition-all ${
                !isDueno
                  ? "bg-background text-primary shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              👤 Comensal
            </Link>
            <Link
              to="/app/dueno"
              className={`rounded-lg px-3 py-1 transition-all ${
                isDueno
                  ? "bg-background text-primary shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏪 Dueño
            </Link>
          </div>
        </div>

        {/* Atajos de Dueño si está en /app/dueno */}
        {isDueno && (
          <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-muted-foreground">
            <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/60 mr-1">
              Atajos:
            </span>
            <Link
              to="/app/dueno"
              className="rounded-lg px-2.5 py-1 hover:bg-muted text-foreground transition-colors"
            >
              Caja
            </Link>
            <Link
              to="/app/dueno/menu"
              className="rounded-lg px-2.5 py-1 hover:bg-muted text-foreground transition-colors"
            >
              Menú de hoy
            </Link>
            <Link
              to="/app/dueno/oferta"
              className="rounded-lg px-2.5 py-1 hover:bg-muted text-foreground transition-colors flex items-center gap-1 text-primary font-extrabold"
            >
              <Zap size={13} />
              Ofertas flash
            </Link>
            <Link
              to="/app/dueno/planes"
              className="rounded-lg px-2.5 py-1 hover:bg-muted text-foreground transition-colors"
            >
              Planes
            </Link>
          </div>
        )}

        {/* Selector de modo: Celular vs Adaptable */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-muted p-0.5 border border-border/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => toggleViewMode("fluid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
                viewMode === "fluid"
                  ? "bg-background text-primary shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Adaptar contenido al tamaño de pantalla"
            >
              <Monitor size={14} />
              <span>Adaptable</span>
            </button>
            <button
              type="button"
              onClick={() => toggleViewMode("phone")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all ${
                viewMode === "phone"
                  ? "bg-background text-primary shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Simulador con marco de teléfono móvil"
            >
              <Smartphone size={14} />
              <span>Celular</span>
            </button>
          </div>

          <Link
            to="/app/galeria"
            className="rounded-full bg-showcase-pill px-3 py-1 text-xs font-bold text-showcase-muted hover:text-foreground hover:bg-muted transition-colors hidden xl:inline-block"
          >
            Ver galería
          </Link>
        </div>
      </header>

      {/* Contenedor principal con el dispositivo seleccionado */}
      <div className="w-full flex-1 flex items-center justify-center p-0 min-[501px]:p-4 max-[500px]:p-0">
        <DeviceFrame app responsive={viewMode === "fluid"}>
          {children}
        </DeviceFrame>
      </div>
    </main>
  );
};

/**
 * Capa emergente con fondo difuminado. Se posiciona sobre el marco del celular,
 * por eso debe renderizarse fuera de contenedores con `position` o scroll.
 */
export const Overlay = ({ children, onClose }: { children: ReactNode; onClose?: () => void }) => {
  const isPushedRef = useRef(false);
  const modalIdRef = useRef<string>("");
  const depthRef = useRef<number>(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (typeof window === "undefined" || !onCloseRef.current) return;

    if (!modalIdRef.current) {
      modalIdRef.current = "modal-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    }

    const currentModalId = modalIdRef.current;
    const currentState = window.history.state || {};

    if (currentState.bocadooModalId === currentModalId) {
      isPushedRef.current = true;
      depthRef.current = currentState.bocadooModalDepth || 1;
    } else {
      const nextDepth = (currentState.bocadooModalDepth || 0) + 1;
      depthRef.current = nextDepth;
      window.history.pushState(
        {
          ...currentState,
          bocadooModalId: currentModalId,
          bocadooModalDepth: nextDepth,
        },
        ""
      );
      isPushedRef.current = true;
    }

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || {};
      const newDepth = state.bocadooModalDepth || 0;
      if (newDepth < depthRef.current) {
        isPushedRef.current = false;
        onCloseRef.current?.();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // NUNCA llamar a history.back() en cleanup para no chocar con cambios de ruta
    };
  }, []);

  const handleUserClose = () => {
    if (isPushedRef.current && typeof window !== "undefined") {
      isPushedRef.current = false;
      if (window.history.state?.bocadooModalId === modalIdRef.current) {
        window.history.back();
      }
    }
    onCloseRef.current?.();
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col overflow-hidden rounded-[39px] bg-foreground/35 p-0 backdrop-blur-[6px] animate-in fade-in duration-200 max-[500px]:rounded-none embedded:rounded-none"
      onClick={handleUserClose}
    >
      <div className="contents" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export function useGoBack(fallback: AppPath) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return () => (canGoBack ? router.history.back() : navigate({ to: fallback }));
}

const NAV_ITEMS: Record<"diner" | "owner" | "cashier", Array<[string, IconType, AppPath]>> = {
  diner: [
    ["Pase", QrCode, "/app/comensal"],
    ["Comer", Store, "/app/comensal/restaurantes"],
    ["Yo", UserRound, "/app/comensal/ajustes"],
  ],
  owner: [
    ["Caja", QrCode, "/app/dueno"],
    ["Menú", Utensils, "/app/dueno/menu"],
    ["Planes", WalletCards, "/app/dueno/planes"],
    ["Ajustes", Settings, "/app/dueno/ajustes"],
  ],
  cashier: [
    ["Caja", QrCode, "/app/dueno"],
    ["Pedidos", Clock, "/app/dueno/pedidos"],
    ["Turno", Settings, "/app/dueno/ajustes"],
  ],
};

export const NavBar = ({
  active,
  owner = false,
  cashier = false,
}: {
  active: string;
  owner?: boolean;
  cashier?: boolean;
}) => {
  const items = cashier ? NAV_ITEMS.cashier : NAV_ITEMS[owner ? "owner" : "diner"];
  return (
    <nav
      className="mt-auto grid min-h-[76px] shrink-0 border-t border-border bg-background/95 px-2 pb-6 pt-2 backdrop-blur-md z-20 shadow-[0_-4px_16px_rgba(74,14,120,0.04)]"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      aria-label={cashier ? "Navegación del cajero" : owner ? "Navegación del dueño" : "Navegación del comensal"}
    >
      {items.map(([label, Icon, to]) => {
        const selected =
          active.toLowerCase() === label.toLowerCase() ||
          (label === "Caja" && active.toLowerCase() === "home") ||
          (label === "Turno" && active.toLowerCase() === "ajustes") ||
          (label === "Ajustes" && active.toLowerCase() === "turno");
        return (
          <Link
            key={label}
            to={to}
            search={cashier ? ({ role: "cajero" } as any) : undefined}
            replace
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-all active:scale-95 ${
              selected
                ? "text-primary font-black"
                : "text-muted-foreground hover:text-foreground font-semibold"
            }`}
          >
            <div
              className={`grid place-items-center rounded-xl px-2.5 py-1 transition-all ${
                selected ? "bg-accent text-primary" : ""
              }`}
            >
              <Icon size={20} strokeWidth={selected ? 2.8 : 2} />
            </div>
            <span className="text-[13px] font-bold leading-none tracking-tight">{label}</span>
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
}) => {
  const { isAndroid } = usePlatform();

  if (isAndroid) {
    // Material 3 Switch
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`flex h-7 w-12 shrink-0 items-center rounded-full border-2 p-0.5 transition-colors ${
          on
            ? "border-primary bg-primary justify-end"
            : "border-muted-foreground/40 bg-muted justify-start"
        }`}
      >
        <i
          className={`h-5 w-5 rounded-full shadow-xs transition-all ${
            on ? "bg-white scale-100" : "bg-muted-foreground/70 scale-90"
          }`}
        />
      </button>
    );
  }

  // iOS Switch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
        on ? "justify-end bg-primary" : "justify-start bg-muted-foreground/30"
      }`}
    >
      <i className="h-4 w-4 rounded-full bg-background shadow-soft" />
    </button>
  );
};

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

export const BottomSheet = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) => {
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (typeof window === "undefined" || !onCloseRef.current) return;

    if (!window.history.state?.bocadooSheet) {
      const stateId = "bocadoo-sheet-" + Date.now();
      window.history.pushState({ ...window.history.state, bocadooSheet: stateId }, "");
      isPushedRef.current = true;
    } else {
      isPushedRef.current = true;
    }

    const handlePopState = () => {
      isPushedRef.current = false;
      onCloseRef.current?.();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // NUNCA llamar a history.back() en cleanup para no chocar con navegación del router
    };
  }, []);

  const handleUserClose = () => {
    if (isPushedRef.current && typeof window !== "undefined") {
      isPushedRef.current = false;
      if (window.history.state?.bocadooSheet) {
        window.history.back();
      }
    }
    onCloseRef.current?.();
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col justify-end bg-foreground/35 backdrop-blur-[4px] animate-in fade-in duration-150"
      onClick={handleUserClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar mt-auto max-h-[calc(100%-48px)] overflow-y-auto rounded-t-[30px] bg-background px-5 pb-8 pt-3 shadow-card animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {children}
      </div>
    </div>
  );
};

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
