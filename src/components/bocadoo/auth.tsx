import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  Compass,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  HelpCircle,
  Layers,
  LocateFixed,
  LockKeyhole,
  Mail,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  UserRound,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";

import { DINER_ZONES } from "./store";
import { Logo, Overlay } from "./ui";

export type AuthRole = "diner" | "owner";
export type AuthView =
  | "login"
  | "register-diner"
  | "register-owner"
  | "onboarding-diner"
  | "onboarding-owner";

// Demo accounts for instant 1-click evaluation (Heurística #7 de Nielsen)
const DEMO_ACCOUNTS = {
  diner: {
    name: "Carlos Mejía",
    email: "carlos.mejia@email.com",
    password: "Password123!",
    phone: "0991234567",
    zone: "La Floresta",
  },
  owner: {
    name: "María Toapanta",
    restaurant: "La Cuchara de San Blas",
    email: "maria@lacuchara.ec",
    password: "Password123!",
    phone: "0987654321",
    ruc: "1792345678001",
    zone: "Centro Histórico",
    lunchPrice: "3.50",
  },
};

export function LoginScreen({
  initialRole = "diner",
  initialView = "login",
}: {
  initialRole?: AuthRole | undefined;
  initialView?: AuthView | undefined;
}) {
  const navigate = useNavigate();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Registered user data for Onboarding Paso 0
  const [registeredDiner, setRegisteredDiner] = useState({
    name: "Carlos Mejía",
    email: "carlos@email.com",
    zone: "La Floresta",
  });
  const [registeredOwner, setRegisteredOwner] = useState({
    name: "María Toapanta",
    restaurant: "La Cuchara de San Blas",
    email: "maria@lacuchara.ec",
    zone: "Centro Histórico",
    lunchPrice: "3.50",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const autofillDemo = (r: AuthRole) => {
    setRole(r);
    setEmail(DEMO_ACCOUNTS[r].email);
    setPassword(DEMO_ACCOUNTS[r].password);
    setErrorMessage("");
    showToast(`Credenciales demo cargadas (${r === "diner" ? "Comensal" : "Dueño"})`);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    // Heurística #5 & #9: Prevención y manejo amigable de errores
    if (!email.trim()) {
      setErrorMessage("Ingresa tu correo electrónico para continuar.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Por favor ingresa un correo electrónico válido (ej: nombre@correo.ec)");
      return;
    }
    if (!password) {
      setErrorMessage("Por favor ingresa tu contraseña.");
      return;
    }

    // Heurística #1: Visibilidad del estado del sistema con microanimación
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate({ to: role === "diner" ? "/app/comensal" : "/app/dueno" });
    }, 700);
  };

  const handleGoogleSuccess = (selectedRole: AuthRole, userEmail: string) => {
    setGoogleModalOpen(false);
    setLoading(true);
    showToast(`Autenticado con Google como ${userEmail}`);
    setTimeout(() => {
      setLoading(false);
      navigate({ to: selectedRole === "diner" ? "/app/comensal" : "/app/dueno" });
    }, 600);
  };

  // Render dedicated Registration Views
  // Render dedicated Registration Views
  if (currentView === "register-diner") {
    return (
      <RegisterDinerScreen
        onBack={() => setCurrentView("login")}
        onGoogle={() => {
          setRole("diner");
          setGoogleModalOpen(true);
        }}
        onSuccess={(data) => {
          setRegisteredDiner(data);
          // Al crear cuenta de comensal, abre automáticamente el catálogo de restaurantes
          showToast(`¡Bienvenido ${data.name}! Elige tu restaurante para activar tu primer plan.`);
          navigate({ to: "/app/comensal/restaurantes" });
        }}
      />
    );
  }

  if (currentView === "register-owner") {
    return (
      <RegisterOwnerScreen
        onBack={() => setCurrentView("login")}
        onGoogle={() => {
          setRole("owner");
          setGoogleModalOpen(true);
        }}
        onSuccess={(data) => {
          setRegisteredOwner(data);
          setCurrentView("onboarding-owner");
        }}
      />
    );
  }

  // Render dedicated Onboarding (Paso 0) Views
  if (currentView === "onboarding-diner") {
    return (
      <OnboardingDinerScreen
        data={registeredDiner}
        onFinish={() => navigate({ to: "/app/comensal/restaurantes" })}
      />
    );
  }

  if (currentView === "onboarding-owner") {
    return (
      <OnboardingOwnerScreen
        data={registeredOwner}
        onFinish={() => navigate({ to: "/app/dueno" })}
      />
    );
  }

  // View 1: Main Login Screen with Physical Smart Dining Card Design
  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-6 pb-8 pt-2 no-scrollbar">
      {/* Decorative branding elements */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full bg-lavender/80 blur-sm" />
      <div className="pointer-events-none absolute -left-24 top-24 h-44 w-44 rounded-full border-[28px] border-accent/70" />

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 z-50 -translate-x-1/2 max-w-[320px] rounded-xl bg-card-dark px-4 py-2 text-xs font-bold text-card-dark-foreground shadow-brand animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header with Bocadoo Logo */}
      <div className="relative mt-4 flex justify-center">
        <Logo />
      </div>

      <div className="relative mt-3 text-center">
        <h1 className="text-[26px] font-black leading-tight text-foreground tracking-tight">
          Tu almuerzo,
          <br />
          <span className="text-primary">sin cartulinas.</span>
        </h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {role === "diner"
            ? "Planes simples. Valida tu almuerzo con QR en Quito."
            : "Gestiona comensales, planes prepagados y cobros QR."}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TARJETA FÍSICA / REAL CARD STRUCTURE (Basada en el boceto)
          Pestañas de carpeta / fichero salientes: [ Comensal ] [ Dueño ]
         ───────────────────────────────────────────────────────────── */}
      <div className="relative mt-5">
        {/* Pestañas salientes superiores (matching exact whiteboard sketch) */}
        <div className="flex items-end pl-2 pr-2 gap-1.5 -mb-px relative z-10">
          <button
            type="button"
            role="tab"
            aria-selected={role === "diner"}
            onClick={() => {
              setRole("diner");
              setErrorMessage("");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black transition-all ${
              role === "diner"
                ? "rounded-t-2xl bg-card border-t-2 border-t-primary border-l border-r border-border/80 text-primary shadow-[0_-5px_12px_rgba(0,0,0,0.06)] relative z-20 pb-2.5"
                : "rounded-t-xl bg-muted/80 text-muted-foreground hover:text-foreground border border-b-0 border-border/50 py-1.5 text-[11px] font-bold"
            }`}
          >
            <UserRound size={13} className={role === "diner" ? "text-primary" : "text-muted-foreground"} />
            <span>Comensal</span>
            {role === "diner" && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={role === "owner"}
            onClick={() => {
              setRole("owner");
              setErrorMessage("");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black transition-all ${
              role === "owner"
                ? "rounded-t-2xl bg-card border-t-2 border-t-primary border-l border-r border-border/80 text-primary shadow-[0_-5px_12px_rgba(0,0,0,0.06)] relative z-20 pb-2.5"
                : "rounded-t-xl bg-muted/80 text-muted-foreground hover:text-foreground border border-b-0 border-border/50 py-1.5 text-[11px] font-bold"
            }`}
          >
            <Store size={13} className={role === "owner" ? "text-primary" : "text-muted-foreground"} />
            <span>Dueño</span>
            {role === "owner" && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        </div>

        {/* Cuerpo de la tarjeta con textura, bisel de smart-card y sombra multicapa */}
        <div
          className={`relative bg-gradient-to-b from-card via-card to-card/95 p-4 sm:p-5 shadow-[0_22px_45px_-12px_rgba(75,15,80,0.18),0_6px_20px_-4px_rgba(0,0,0,0.07)] border border-border/80 ring-1 ring-white/90 ring-inset ${
            role === "diner" ? "rounded-b-[28px] rounded-tr-[28px] rounded-tl-[4px]" : "rounded-b-[28px] rounded-tl-[28px] rounded-tr-[4px]"
          }`}
        >
          {/* Cabecera de la tarjeta: Chip EMV dorado + Ondas NFC Contactless + Marca de agua */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2.5">
              {/* Chip metálico realista de tarjeta inteligente */}
              <div
                title="Chip seguro Bocadoo Pass"
                className="relative h-6 w-8 rounded bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-xs border border-amber-500/50 flex items-center justify-center shrink-0"
              >
                <div className="h-full w-full rounded-[2px] border border-amber-700/30 grid grid-cols-2 grid-rows-2 gap-[1px]">
                  <div className="border-r border-b border-amber-700/40" />
                  <div className="border-b border-amber-700/40" />
                  <div className="border-r border-amber-700/40" />
                  <div />
                </div>
              </div>

              {/* Ondas NFC Contactless */}
              <div className="flex items-center text-muted-foreground/70" title="Validación QR / Contactless">
                <Wifi size={14} className="rotate-90" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-accent/60 px-2 py-0.5 text-[9px] font-black tracking-wider text-primary uppercase">
                {role === "diner" ? "Pase Comensal" : "Terminal Restaurante"}
              </span>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-3.5">
            {/* Input: Correo con aspecto de ranura de tarjeta */}
            <label
              htmlFor="bocadoo-email"
              className="block text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
            >
              Correo Electrónico
            </label>
            <div className="mt-1 flex h-11 items-center gap-2.5 rounded-xl bg-muted/90 px-3 text-xs text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] border border-border/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-background transition-all">
              <Mail size={16} className="text-primary shrink-0" />
              <input
                id="bocadoo-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder={role === "diner" ? "carlos@email.com" : "maria@lacuchara.ec"}
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none font-medium"
                autoComplete="email"
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  aria-label="Limpiar correo"
                  className="text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Input: Contraseña */}
            <label
              htmlFor="bocadoo-password"
              className="mt-3 block text-[10px] font-bold text-muted-foreground tracking-wider uppercase"
            >
              Contraseña
            </label>
            <div className="mt-1 flex h-11 items-center gap-2.5 rounded-xl bg-muted/90 px-3 text-xs text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] border border-border/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-background transition-all">
              <LockKeyhole size={16} className="text-primary shrink-0" />
              <input
                id="bocadoo-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none font-medium tracking-[2px]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                className="text-muted-foreground hover:text-primary transition-colors p-1"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error alert with IHC friendly guidance */}
            {errorMessage && (
              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-destructive/10 p-2 text-[11px] font-semibold text-destructive animate-in fade-in duration-150">
                <CircleAlert size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forgot password link */}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-bold text-background shadow-soft transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Validando tarjeta...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>

          {/* Separator matching whiteboard "ó" */}
          <div className="my-3 flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <i className="h-px flex-1 bg-border" />
            <span>ó</span>
            <i className="h-px flex-1 bg-border" />
          </div>

          {/* Google Sign-in button */}
          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground shadow-soft transition-all hover:bg-muted active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Pie de tarjeta: número de serie del pase digital */}
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[9px] font-mono font-bold text-muted-foreground/60 tracking-wider">
            <span>BCD-PASS •••• 9412</span>
            <span>QUITO · 2026</span>
          </div>
        </div>
      </div>

      {/* Switch to Registration View */}
      <div className="mt-4 mb-2 text-center text-xs text-muted-foreground">
        ¿Primera vez en Bocadoo?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(role === "diner" ? "register-diner" : "register-owner")}
          className="font-extrabold text-primary hover:underline"
        >
          {role === "diner" ? "Crear cuenta de Comensal" : "Registrar mi Restaurante"}
        </button>
      </div>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        role={role}
        initialEmail={email}
      />

      <GoogleAccountPickerModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        role={role}
        onSelect={(userEmail) => handleGoogleSuccess(role, userEmail)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE: SELECTOR DE UBICACIÓN GOOGLE MAPS PARA QUITO
// ─────────────────────────────────────────────────────────────
type QuitoMapSpot = {
  id: string;
  name: string;
  desc: string;
  x: number; // Porcentaje relativo X en el mapa de Quito
  y: number; // Porcentaje relativo Y en el mapa de Quito
  restaurants: number;
  avgPrice: string;
};

const QUITO_SPOTS: QuitoMapSpot[] = [
  {
    id: "La Floresta",
    name: "La Floresta",
    desc: "Hub gastronómico · Isabel La Católica",
    x: 60,
    y: 46,
    restaurants: 18,
    avgPrice: "$3.50",
  },
  {
    id: "La Mariscal",
    name: "La Mariscal",
    desc: "Plaza Foch · Av. Colón",
    x: 40,
    y: 52,
    restaurants: 24,
    avgPrice: "$3.00",
  },
  {
    id: "Frente a la PUCE",
    name: "Frente a la PUCE",
    desc: "Zona universitaria · Av. 12 de Octubre",
    x: 52,
    y: 65,
    restaurants: 15,
    avgPrice: "$2.80",
  },
  {
    id: "Centro Histórico",
    name: "Centro Histórico",
    desc: "San Blas · Plaza del Teatro",
    x: 46,
    y: 84,
    restaurants: 21,
    avgPrice: "$2.75",
  },
  {
    id: "Cumbayá",
    name: "Cumbayá",
    desc: "Parque Central · Valle",
    x: 84,
    y: 38,
    restaurants: 12,
    avgPrice: "$4.50",
  },
];

function GoogleMapQuitoPicker({
  selectedZone,
  onSelectZone,
}: {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
}) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [searchQuery, setSearchQuery] = useState("");
  const [gpsActive, setGpsActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);

  const activeSpot =
    QUITO_SPOTS.find((s) => s.id === selectedZone || s.name === selectedZone) ?? QUITO_SPOTS[0]!;

  const handleGpsClick = () => {
    setGpsActive(true);
    onSelectZone("La Floresta");
    setTimeout(() => setGpsActive(false), 2000);
  };

  const filteredSpots = searchQuery.trim()
    ? QUITO_SPOTS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.desc.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : QUITO_SPOTS;

  return (
    <div className="space-y-2">
      {/* Barra de búsqueda estilo Google Places Autocomplete */}
      <div className="flex items-center gap-1.5">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-muted px-3 text-xs border border-border/60 shadow-xs focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-background">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dirección en Quito (ej. Av. 12 de Octubre...)"
            className="w-full bg-transparent text-[11px] font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleGpsClick}
          title="Fijar mi ubicación GPS actual en Quito"
          className={`flex h-10 items-center gap-1 rounded-xl px-2.5 text-[11px] font-bold transition-all border ${
            gpsActive
              ? "bg-primary text-primary-foreground border-primary shadow-soft"
              : "bg-muted text-foreground border-border/60 hover:bg-border"
          }`}
        >
          <LocateFixed size={14} className={gpsActive ? "animate-spin" : "text-primary"} />
          <span className="hidden min-[360px]:inline">Mi GPS</span>
        </button>
      </div>

      {/* Contenedor del Mapa interactivo de Google Maps */}
      <div
        className={`relative h-44 w-full overflow-hidden rounded-2xl border border-border shadow-inner transition-colors ${
          mapType === "satellite" ? "bg-[#1f2937]" : "bg-[#f1f3f0]"
        }`}
      >
        {/* Gráfico vectorial de calles, parques y topografía de Quito */}
        <svg className="absolute inset-0 h-full w-full opacity-90" preserveAspectRatio="none">
          {mapType === "roadmap" ? (
            <>
              {/* Bloques de barrios y fondo */}
              <rect width="100%" height="100%" fill="#f1f3f0" />
              {/* Parque La Carolina */}
              <rect x="25%" y="15%" width="22%" height="18%" rx="8" fill="#d1ebd1" />
              {/* Parque El Ejido & Arbolito */}
              <rect x="36%" y="58%" width="18%" height="12%" rx="6" fill="#d1ebd1" />
              {/* Parque Itchimbía */}
              <rect x="52%" y="72%" width="15%" height="14%" rx="6" fill="#d6edd6" />

              {/* Red vial principal de Quito */}
              {/* Av. 10 de Agosto (eje norte-sur) */}
              <path d="M 42% 0 L 42% 100%" stroke="#ffffff" strokeWidth="6" />
              <path d="M 42% 0 L 42% 100%" stroke="#f7c852" strokeWidth="2.5" />

              {/* Av. 6 de Diciembre */}
              <path d="M 54% 0 L 54% 100%" stroke="#ffffff" strokeWidth="5" />
              <path d="M 54% 0 L 54% 100%" stroke="#e3be44" strokeWidth="2" />

              {/* Av. Francisco de Orellana (transversal) */}
              <path d="M 10% 36% L 90% 36%" stroke="#ffffff" strokeWidth="5" />
              <path d="M 10% 36% L 90% 36%" stroke="#cbd5e1" strokeWidth="2" />

              {/* Av. Patria */}
              <path d="M 20% 68% L 75% 68%" stroke="#ffffff" strokeWidth="4" />
              <path d="M 20% 68% L 75% 68%" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Bajada a Cumbayá (Ruta Viva) */}
              <path d="M 58% 46% Q 72% 38% 90% 38%" stroke="#ffffff" strokeWidth="4.5" fill="none" />
              <path d="M 58% 46% Q 72% 38% 90% 38%" stroke="#94a3b8" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              {/* Modo Satélite */}
              <rect width="100%" height="100%" fill="#1e293b" />
              <rect x="25%" y="15%" width="22%" height="18%" rx="8" fill="#14532d" opacity="0.6" />
              <rect x="36%" y="58%" width="18%" height="12%" rx="6" fill="#14532d" opacity="0.6" />
              <path d="M 42% 0 L 42% 100%" stroke="#64748b" strokeWidth="3" />
              <path d="M 54% 0 L 54% 100%" stroke="#64748b" strokeWidth="3" />
              <path d="M 10% 36% L 90% 36%" stroke="#64748b" strokeWidth="2.5" />
              <path d="M 58% 46% Q 72% 38% 90% 38%" stroke="#475569" strokeWidth="2.5" fill="none" />
            </>
          )}
        </svg>

        {/* Controles de Google Maps: Modo Mapa / Satélite */}
        <div className="absolute top-2 right-2 z-10 flex rounded-lg bg-background/95 p-0.5 shadow-md border border-border/80 text-[10px] font-bold backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setMapType("roadmap")}
            className={`rounded-md px-2 py-0.5 transition-colors ${
              mapType === "roadmap"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mapa
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`rounded-md px-2 py-0.5 transition-colors ${
              mapType === "satellite"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Satélite
          </button>
        </div>

        {/* Pines interactivos en el mapa de Quito */}
        {filteredSpots.map((spot) => {
          const isSelected = spot.id === activeSpot.id;
          return (
            <div
              key={spot.id}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {/* Anillo de radar pulsante si está seleccionado */}
              {isSelected && (
                <span className="absolute -inset-2.5 rounded-full bg-primary/35 animate-ping pointer-events-none" />
              )}

              {/* Botón pin de Google Maps */}
              <button
                type="button"
                onClick={() => onSelectZone(spot.id)}
                className={`group relative flex items-center justify-center transition-transform active:scale-90 ${
                  isSelected ? "scale-110 z-30" : "hover:scale-105 opacity-80 hover:opacity-100"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md border-2 border-background transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground ring-2 ring-primary/40" : "bg-card text-foreground"
                  }`}
                >
                  <Utensils size={12} strokeWidth={2.8} />
                </div>
              </button>

              {/* InfoWindow de Google Maps sobre el pin activo */}
              {isSelected && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap rounded-xl bg-card px-2.5 py-1 text-[10px] font-extrabold text-foreground shadow-card border border-border animate-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{spot.name}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      · {spot.restaurants} locales
                    </span>
                  </div>
                  {/* Flechita apuntando al pin */}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-card border-r border-b border-border" />
                </div>
              )}
            </div>
          );
        })}

        {/* Controles de Zoom Google Maps */}
        <div className="absolute bottom-2 right-2 z-10 flex flex-col rounded-lg bg-background/95 shadow-md border border-border/80 backdrop-blur-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 4))}
            className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Acercar mapa"
          >
            <Plus size={12} />
          </button>
          <div className="h-px w-full bg-border" />
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 1))}
            className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Alejar mapa"
          >
            <Minus size={12} />
          </button>
        </div>

        {/* Marca de agua oficial de Google */}
        <div className="absolute bottom-1.5 left-2 z-10 flex items-center gap-1 text-[8px] font-semibold text-muted-foreground select-none">
          <span className="font-black text-foreground">Google</span>
          <span>©2026 Datos del mapa</span>
        </div>
      </div>

      {/* Tarjeta de ubicación confirmada e información del sector */}
      <div className="rounded-xl bg-accent/40 p-2.5 text-xs border border-border/70 flex items-start gap-2.5">
        <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-extrabold text-foreground truncate">{activeSpot.name}, Quito</span>
            <span className="text-[10px] font-extrabold text-primary shrink-0">
              {activeSpot.restaurants} restaurantes
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {activeSpot.desc} · Menú promedio: <b>{activeSpot.avgPrice}</b>
          </p>
        </div>
      </div>

      {/* Chips de selección rápida */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {DINER_ZONES.map((z) => {
          const isSelected = z === selectedZone;
          return (
            <button
              type="button"
              key={z}
              onClick={() => onSelectZone(z)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <MapPin size={10} className="inline mr-1" />
              {z}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANTALLAZO 2: REGISTRO DE COMENSAL (Con Google Maps e IHC)
// ─────────────────────────────────────────────────────────────
function RegisterDinerScreen({
  onBack,
  onSuccess,
  onGoogle,
}: {
  onBack: () => void;
  onSuccess: (data: { name: string; email: string; zone: string }) => void;
  onGoogle: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState<string>(DINER_ZONES[1] ?? "La Floresta");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Heurística #1: Indicador de fortaleza de contraseña
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Vacía", color: "bg-muted" };
    if (pass.length < 6) return { score: 1, label: "Débil", color: "bg-destructive" };
    if (pass.length < 9 || !/[0-9]/.test(pass))
      return { score: 2, label: "Media", color: "bg-amber-500" };
    return { score: 3, label: "Segura", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor ingresa tu nombre y apellido.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError("Ingresa un número celular ecuatoriano válido (ej: 0991234567).");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptTerms) {
      setError("Debes aceptar los términos de Bocadoo para continuar.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ name: name.trim(), email: email.trim(), zone });
    }, 700);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-3 no-scrollbar">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-border transition-colors"
        >
          <ArrowLeft size={14} /> Volver
        </button>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
          Paso 1 de 2 · Comensal
        </span>
      </div>

      <div className="mt-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-lavender/50 px-3 py-1 text-xs font-bold text-primary">
          <Utensils size={14} /> Tu cuenta para almorzar con QR
        </div>
        <h2 className="mt-2 text-2xl font-black text-foreground tracking-tight">
          Crea tu cuenta de comensal
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Dile adiós a las cartulinas. Compra planes de almuerzo y valida con QR en Quito.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        {/* Nombre */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Nombre Completo
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <UserRound size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mejía"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* Correo */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Correo Electrónico
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Mail size={16} className="text-primary shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@email.com"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* Celular */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Teléfono Móvil (Ecuador)
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Phone size={16} className="text-primary shrink-0" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="099 123 4567"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* Sector preferido de almuerzo en Quito (selección rápida y sin fricción) */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Sector preferido de almuerzo en Quito
          </label>
          <div className="mt-1 flex flex-wrap gap-1.5 pt-0.5">
            {DINER_ZONES.map((z) => {
              const isSelected = z === zone;
              return (
                <button
                  type="button"
                  key={z}
                  onClick={() => setZone(z)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  <MapPin size={10} className="inline mr-1" />
                  {z}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Contraseña
            </label>
            {password && (
              <span className="text-[9px] font-bold text-muted-foreground">
                Seguridad: <b className="text-foreground">{strength.label}</b>
              </span>
            )}
          </div>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <LockKeyhole size={16} className="text-primary shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña segura"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-primary p-1"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-1.5 flex gap-1 h-1">
              <div
                className={`flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-muted"}`}
              />
              <div
                className={`flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-muted"}`}
              />
              <div
                className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-muted"}`}
              />
            </div>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Confirmar Contraseña
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
            {confirmPassword && password === confirmPassword && (
              <Check size={15} className="text-emerald-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Términos y Condiciones */}
        <label className="flex items-start gap-2.5 pt-1 text-[11px] text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-border accent-primary"
          />
          <span>
            Acepto los{" "}
            <span className="font-bold text-foreground">Términos de Bocadoo Ecuador</span> y la
            política de protección de datos personales.
          </span>
        </label>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
            <CircleAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-brand transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Creando cuenta de comensal...</span>
            </>
          ) : (
            <>
              <span>Crear cuenta y elegir restaurante</span>
              <Store size={14} />
            </>
          )}
        </button>

        {/* Or Google */}
        <button
          type="button"
          onClick={onGoogle}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          <span>Registrarme con Google</span>
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANTALLAZO 3: REGISTRO DE DUEÑO DE RESTAURANTE (IHC & Mobile)
// ─────────────────────────────────────────────────────────────
function RegisterOwnerScreen({
  onBack,
  onSuccess,
  onGoogle,
}: {
  onBack: () => void;
  onSuccess: (data: {
    name: string;
    restaurant: string;
    email: string;
    zone: string;
    lunchPrice: string;
  }) => void;
  onGoogle: () => void;
}) {
  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ruc, setRuc] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [zone, setZone] = useState("Centro Histórico");
  const [lunchPrice, setLunchPrice] = useState("3.50");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptCommercial, setAcceptCommercial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!restaurantName.trim()) {
      setError("Ingresa el nombre de tu restaurante o comedor.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Ingresa el nombre del propietario o administrador.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo de contacto válido.");
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 9) {
      setError("Ingresa el WhatsApp del restaurante (ej: 0987654321).");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!acceptCommercial) {
      setError("Debes aceptar las condiciones de restaurante afiliado.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        name: ownerName.trim(),
        restaurant: restaurantName.trim(),
        email: email.trim(),
        zone,
        lunchPrice,
      });
    }, 700);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-3 no-scrollbar">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-border transition-colors"
        >
          <ArrowLeft size={14} /> Volver
        </button>
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
          Paso 1 de 2 · Restaurante
        </span>
      </div>

      <div className="mt-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-1 text-xs font-bold text-primary">
          <Store size={14} /> Registro de negocio afiliado
        </div>
        <h2 className="mt-2 text-2xl font-black text-foreground tracking-tight">
          Registra tu Restaurante
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cobra por adelantado, fideliza comensales y valida con QR sin papel ni enredos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {/* Nombre del Restaurante */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Nombre del Restaurante / Local
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Store size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ej. La Cuchara de San Blas"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* Nombre del Dueño */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Nombre del Dueño o Administrador
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <UserRound size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Ej. María Toapanta"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
          </div>
        </div>

        {/* RUC o Cédula */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            RUC o Cédula (Ecuador)
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <Building2 size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              placeholder="1792345678001"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
            />
          </div>
        </div>

        {/* Correo y WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase">
              Correo Comercial
            </label>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-2.5 text-xs">
              <Mail size={15} className="text-primary shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@local.ec"
                className="w-full bg-transparent text-[11px] text-foreground outline-none font-medium"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase">
              WhatsApp Local
            </label>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-2.5 text-xs">
              <Phone size={15} className="text-primary shrink-0" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="098 765 4321"
                className="w-full bg-transparent text-[11px] text-foreground outline-none font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Ubicación del Restaurante en Google Maps Quito */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase">
              Ubicación de tu Restaurante en Quito (Google Maps)
            </label>
            <span className="flex items-center gap-1 text-[9px] font-extrabold text-primary">
              <Compass size={11} /> Google Maps
            </span>
          </div>
          <GoogleMapQuitoPicker selectedZone={zone} onSelectZone={setZone} />
        </div>

        {/* Precio Promedio Almuerzo Ejecutivo */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Precio Promedio Almuerzo Ejecutivo ($)
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <DollarSign size={16} className="text-primary shrink-0" />
            <input
              type="text"
              value={lunchPrice}
              onChange={(e) => setLunchPrice(e.target.value)}
              placeholder="3.50"
              className="w-full bg-transparent text-xs font-bold text-foreground outline-none"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Contraseña de Administrador
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <LockKeyhole size={16} className="text-primary shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-primary p-1"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground uppercase">
            Confirmar Contraseña
          </label>
          <div className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
              required
            />
            {confirmPassword && password === confirmPassword && (
              <Check size={15} className="text-emerald-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Términos comerciales */}
        <label className="flex items-start gap-2.5 pt-1 text-[11px] text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acceptCommercial}
            onChange={(e) => setAcceptCommercial(e.target.checked)}
            className="mt-0.5 rounded border-border accent-primary"
          />
          <span>
            Acepto el acuerdo comercial para restaurantes aliados de{" "}
            <span className="font-bold text-foreground">Bocadoo Ecuador</span>.
          </span>
        </label>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
            <CircleAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-brand transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Registrando restaurante...</span>
            </>
          ) : (
            <>
              <span>Dar de alta y ver Onboarding</span>
              <Sparkles size={14} />
            </>
          )}
        </button>

        {/* Or Google */}
        <button
          type="button"
          onClick={onGoogle}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors"
        >
          <span>Registrar con Google Workspace</span>
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANTALLAZO 4: ONBOARDING PASO 0 - COMENSAL
// ─────────────────────────────────────────────────────────────
function OnboardingDinerScreen({
  data,
  onFinish,
}: {
  data: { name: string; email: string; zone: string };
  onFinish: () => void;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6 no-scrollbar text-center">
      {/* Confetti icon badge */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-brand animate-in zoom-in duration-300">
        <Sparkles size={32} />
      </div>

      <span className="mt-4 inline-block text-[10px] font-extrabold uppercase tracking-widest text-primary">
        ¡Bienvenido a Bocadoo Ecuador!
      </span>

      <h1 className="mt-1 text-2xl font-black text-foreground tracking-tight">
        ¡Hola, {data.name.split(" ")[0]}! 🎉
      </h1>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed px-2">
        Tu cuenta comensal en <b>{data.zone}</b> está lista. Como es tu primera vez, entras sin saldo prepagado. Explora los comedores afiliados en Quito y elige tu primer paquete.
      </p>

      {/* 3 Steps Guide (IHC Heurística #10: Ayuda clara e intuitiva) */}
      <div className="mt-6 space-y-3 text-left">
        <div className="flex items-start gap-3 rounded-2xl bg-card p-3.5 shadow-soft border border-border/70">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary font-black text-xs">
            1
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">Elige tu restaurante preferido</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Explora restaurantes en {data.zone} y compra tu primer plan de 5, 10 o 20
              almuerzos con descuento.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-card p-3.5 shadow-soft border border-border/70">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary font-black text-xs">
            2
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">Tu código QR personal listo</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Al llegar al restaurante, abre tu QR en pantalla completa. El cajero lo escanea en 2
              segundos.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-card p-3.5 shadow-soft border border-border/70">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary font-black text-xs">
            3
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">Control de tus almuerzos</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Revisa cuántos almuerzos te quedan en tiempo real y cuándo vence tu plan prepagado.
            </p>
          </div>
        </div>
      </div>

      {/* Gift badge */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-lavender/60 p-2.5 text-xs font-extrabold text-primary">
        <QrCode size={16} />
        <span>¡Tu código QR de bienvenida ya está generado!</span>
      </div>

      {/* Action to land on diner main dashboard */}
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onFinish}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-brand transition-all active:scale-[0.98]"
        >
          <span>Explorar restaurantes en Quito</span>
          <Store size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANTALLAZO 5: ONBOARDING PASO 0 - DUEÑO DE RESTAURANTE
// ─────────────────────────────────────────────────────────────
function OnboardingOwnerScreen({
  data,
  onFinish,
}: {
  data: { name: string; restaurant: string; email: string; zone: string; lunchPrice: string };
  onFinish: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [puestos, setPuestos] = useState(28);
  const [anotarMesa, setAnotarMesa] = useState(false);
  const [plansAccepted, setPlansAccepted] = useState(true);

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6 no-scrollbar">
      {/* Indicador de pasos */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
            {step}
          </span>
          <span className="text-xs font-black uppercase text-foreground">
            {step === 1 ? "1. Planes sugeridos" : step === 2 ? "2. Puestos y mesas" : "3. Ayudante de caja"}
          </span>
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="text-xs font-bold text-muted-foreground hover:text-primary"
        >
          Saltar todo
        </button>
      </div>

      {step === 1 && (
        <div className="mt-4 flex flex-1 flex-col animate-in fade-in">
          <div className="text-center">
            <h2 className="text-xl font-black text-foreground">Planes listos para publicar</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Preconfiguramos los 3 planes más vendidos en oficinas y universidades de Quito:
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-2xl border-2 border-primary/40 bg-accent/60 p-3.5">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                  SEMANAL
                </span>
                <p className="text-sm font-black text-foreground mt-0.5">5 almuerzos</p>
                <p className="text-xs text-muted-foreground">$3,00 por almuerzo · Vigencia 7 días</p>
              </div>
              <p className="text-lg font-black text-primary">$15,00</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border-2 border-primary/40 bg-accent/60 p-3.5">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                  QUINCENAL
                </span>
                <p className="text-sm font-black text-foreground mt-0.5">10 almuerzos</p>
                <p className="text-xs text-muted-foreground">$2,80 por almuerzo · Ahorra $2</p>
              </div>
              <p className="text-lg font-black text-primary">$28,00</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/10 p-3.5 shadow-xs">
              <div>
                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-black uppercase text-primary-foreground">
                  MENSUAL (RECOMENDADO)
                </span>
                <p className="text-sm font-black text-foreground mt-0.5">20 almuerzos</p>
                <p className="text-xs text-muted-foreground">$2,75 por almuerzo · Ahorra $5 al mes</p>
              </div>
              <p className="text-xl font-black text-primary">$55,00</p>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-brand active:scale-[0.98]"
            >
              <Check size={18} /> Usar estos planes
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-10 text-xs font-bold text-muted-foreground hover:underline"
            >
              Los editaré después
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 flex flex-1 flex-col animate-in fade-in">
          <div className="text-center">
            <h2 className="text-xl font-black text-foreground">Puestos de tu comedor</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Configura el aforo para que Bocadoo te ayude a optimizar rotación en hora pico:
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-muted p-4">
              <label className="text-xs font-black uppercase text-muted-foreground">
                Capacidad de comensales sentados
              </label>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPuestos((v) => Math.max(4, v - 2))}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-background text-xl font-black shadow-soft active:scale-95"
                >
                  <Minus size={20} />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-black text-primary">{puestos}</span>
                  <p className="text-xs font-bold text-muted-foreground">puestos / sillas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPuestos((v) => v + 2)}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground text-xl font-black shadow-brand active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="text-sm font-black text-foreground">¿Anotar número de mesa al cobrar?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Apagado por defecto para atender más rápido
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={anotarMesa}
                onClick={() => setAnotarMesa(!anotarMesa)}
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                  anotarMesa ? "justify-end bg-primary" : "justify-start bg-muted-foreground/30"
                }`}
              >
                <i className="h-5 w-5 rounded-full bg-background shadow-soft" />
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-brand active:scale-[0.98]"
            >
              Continuar a invitar ayudante
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 flex flex-1 flex-col animate-in fade-in text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary">
            <UserRound size={32} />
          </div>

          <h2 className="mt-3 text-xl font-black text-foreground">Invitar ayudante con rol CAJA</h2>
          <p className="mt-1 text-xs text-muted-foreground px-2">
            Tu ayudante podrá validar almuerzos y registrar ventas desde su propio teléfono sin ver
            tus ganancias ni reportes privados.
          </p>

          <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-left">
            <p className="text-xs font-black text-foreground uppercase tracking-wide">
              Enlace de invitación seguro
            </p>
            <p className="mt-1 text-xs text-muted-foreground font-mono bg-muted p-2 rounded-xl truncate">
              https://bocadoo.ec/app/unirse?rol=caja&rest=r1
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                "Únete como ayudante de caja en La Cuchara de San Blas en Bocadoo: https://bocadoo.ec/app/unirse?rol=caja&rest=r1",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-success text-xs font-black text-success-foreground shadow-xs active:scale-95"
            >
              <Phone size={14} /> Enviar invitación por WhatsApp
            </a>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={onFinish}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-brand active:scale-[0.98]"
            >
              <Store size={18} /> ¡Listo, abrir terminal de restaurante!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL: RECUPERACIÓN DE CONTRASEÑA (IHC & Heurística #9)
// ─────────────────────────────────────────────────────────────
function ForgotPasswordModal({
  isOpen,
  onClose,
  role,
  initialEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: AuthRole;
  initialEmail?: string;
}) {
  const [email, setEmail] = useState(initialEmail || "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[336px] max-w-[calc(100%-32px)] rounded-[28px] bg-background p-5 shadow-card animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-black text-sm">
            <LockKeyhole size={18} />
            <span>Recuperar contraseña</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground hover:bg-border"
          >
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div className="mt-4 text-center py-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="mt-3 text-base font-black text-foreground">¡Correo enviado!</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Hemos enviado un enlace y código de verificación a <b>{email}</b> para restablecer tu
              contraseña.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand"
            >
              Entendido, volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ingresa el correo asociado a tu cuenta de{" "}
              <b>{role === "diner" ? "comensal" : "restaurante"}</b> y te enviaremos instrucciones
              inmediatas.
            </p>
            <div className="mt-3 flex h-11 items-center gap-2 rounded-xl bg-muted px-3 text-xs">
              <Mail size={16} className="text-primary shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.ec"
                className="w-full bg-transparent text-xs text-foreground outline-none font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-brand disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <span>Enviar instrucciones</span>
              )}
            </button>
          </form>
        )}
      </div>
    </Overlay>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL: SELECTOR DE CUENTA GOOGLE REALISTA (Heurística #6 & #7)
// ─────────────────────────────────────────────────────────────
function GoogleAccountPickerModal({
  isOpen,
  onClose,
  role,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: AuthRole;
  onSelect: (email: string) => void;
}) {
  if (!isOpen) return null;

  const accounts = [
    {
      name: "Carlos Mejía",
      email: "carlos.mejia@gmail.com",
      role: "diner" as const,
      initials: "CM",
      tag: "Comensal Bocadoo",
    },
    {
      name: "María Toapanta",
      email: "maria.toapanta@gmail.com",
      role: "owner" as const,
      initials: "MT",
      tag: "La Cuchara de San Blas",
    },
  ];

  return (
    <Overlay onClose={onClose}>
      <div className="m-auto w-[340px] max-w-[calc(100%-32px)] rounded-[26px] bg-background p-5 shadow-card animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-xs font-black text-foreground">Acceder con Google</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full bg-muted text-foreground hover:bg-border"
          >
            <X size={14} />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Selecciona una cuenta para continuar en <b>Bocadoo Ecuador</b>
        </p>

        <div className="mt-4 space-y-2">
          {accounts.map((acc) => (
            <button
              type="button"
              key={acc.email}
              onClick={() => onSelect(acc.email)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition-all hover:border-primary hover:bg-accent/30 active:scale-[0.98]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                {acc.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-black text-foreground">{acc.name}</span>
                  {acc.role === role && (
                    <span className="rounded bg-accent px-1.5 py-0.2 text-[9px] font-extrabold text-primary">
                      Recomendada
                    </span>
                  )}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">{acc.email}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            onSelect(role === "diner" ? "usuario.nuevo@gmail.com" : "gerencia@restaurante.ec")
          }
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground"
        >
          <UserRound size={14} />
          <span>Usar otra cuenta de Google</span>
        </button>
      </div>
    </Overlay>
  );
}
