import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Layers,
  Laptop,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Smartphone,
  User,
  Zap,
} from "lucide-react";

import { usePlatform } from "@/platform/usePlatform";
import { useBocadoo } from "@/components/bocadoo/store";
import { toast } from "sonner";

export function DevPanel() {
  const navigate = useNavigate();
  const { platform, setPlatform, isAndroid, isIos } = usePlatform();
  const {
    activeRole,
    setStaffRole,
    simulatedDaysOffset,
    advanceDemoDays,
    advanceSimulatedMinutes,
    simulatePeakHour,
    scannerDemoScenario,
    setScannerDemoScenario,
    dinerHasPlanOverride,
    setDinerHasPlanOverride,
    resetDemoData,
    commissionRate,
    setCommissionRate,
    scanAndFastForward25Min,
  } = useBocadoo();

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"platform" | "roles" | "time" | "scanner">("platform");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search;
    const hasDemoParam = /[?&]demo=1(&|$)/.test(search) || /[?&]demo=true(&|$)/.test(search);
    const storedDemo = localStorage.getItem("bocadoo-demo-active") === "true";

    if (hasDemoParam || storedDemo) {
      setIsVisible(true);
      if (hasDemoParam) {
        localStorage.setItem("bocadoo-demo-active", "true");
      }
    }
  }, []);

  if (!isVisible) return null;

  const scenarios = [
    { id: "NORMAL", label: "✓ Validado normal", desc: "Saldo suficiente" },
    { id: "SCAN_AND_WAIT_25", label: "⏱️ Escanear y esperar 25 min", desc: "Activa calificación" },
    { id: "ORDER_PREORDER", label: "🛍️ Preorden en camino (P12)", desc: "Descuenta comanda" },
    { id: "STAMP_REWARD", label: "🎁 Premio sellos $0 (P13)", desc: "Venta $0 en caja" },
    { id: "FLASH_OFFER", label: "⚡ Oferta flash $2,50 (P15)", desc: "Aplica comisión 7%" },
    { id: "LAST_LUNCH", label: "! Último almuerzo", desc: "Aviso de saldo 1" },
    { id: "EXPIRING_SOON", label: "! Vence pronto", desc: "Aviso de caducidad" },
    { id: "NO_BALANCE", label: "× Sin saldo", desc: "0 almuerzos" },
    { id: "PLAN_EXPIRED", label: "× Plan vencido", desc: "Caducado" },
    { id: "WRONG_RESTAURANT", label: "× Otro restaurante", desc: "De otro local" },
    { id: "EXPIRED_QR", label: "× QR expirado", desc: "Captura > 30s" },
    { id: "ALREADY_REDEEMED", label: "— Ya validado", desc: "Leído hace segundos" },
  ];

  return (
    <aside
      aria-label="Panel de demostración y pruebas"
      className="fixed bottom-3 right-3 z-50 max-w-[calc(100vw-24px)] rounded-3xl border border-primary/30 bg-card/95 text-foreground shadow-2xl backdrop-blur-md transition-all duration-300 md:bottom-5 md:right-5 font-sans"
      style={{ width: isOpen ? "420px" : "auto" }}
    >
      {/* Barra de cabecera */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border/80">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Zap size={14} />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-primary">
            Panel Dev / Demo (?demo=1)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Minimizar panel demo" : "Expandir panel demo"}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Sub-pestañas */}
          <nav className="flex rounded-xl bg-muted p-1 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("platform")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === "platform"
                  ? "bg-card text-primary font-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              📱 Dispositivo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === "roles"
                  ? "bg-card text-primary font-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              👥 Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scanner")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === "scanner"
                  ? "bg-card text-primary font-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              📷 Escenarios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("time")}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === "time"
                  ? "bg-card text-primary font-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              ⏱️ Tiempo
            </button>
          </nav>

          {/* TAB 1: PLATAFORMA (iOS 390x844 vs Android 412x915) */}
          {activeTab === "platform" && (
            <div className="space-y-3 animate-in fade-in">
              <div>
                <p className="text-[11px] font-black uppercase text-muted-foreground mb-1.5">
                  Marco y Convenciones Móviles
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlatform("ios");
                      toast.success("Plataforma cambiada a iOS (390×844)", {
                        description: "Notch Dynamic Island, reloj 9:41 y barra inferior activos.",
                      });
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border-2 transition-all ${isIos
                        ? "border-primary bg-accent/70 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="text-base font-black">🍏 iOS</span>
                    <span className="text-[11px] font-semibold">390 × 844 pt</span>
                    <span className="text-[10px] text-muted-foreground">Notch + Home Bar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPlatform("android");
                      toast.success("Plataforma cambiada a Android (412×915)", {
                        description: "Reloj a la izquierda, iconos Material y sin Dynamic Island.",
                      });
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border-2 transition-all ${isAndroid
                        ? "border-primary bg-accent/70 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    <span className="text-base font-black">🤖 Android</span>
                    <span className="text-[11px] font-semibold">412 × 915 dp</span>
                    <span className="text-[10px] text-muted-foreground">Material 3 + Full</span>
                  </button>
                </div>
              </div>

              {/* Tasa de comisión configurable */}
              <div className="rounded-2xl border border-border bg-muted/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground">Comisión Bocadoo:</span>
                  <span className="text-xs font-black text-primary font-mono">
                    {Math.round(commissionRate * 100)} %
                  </span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  {[0.05, 0.07, 0.1].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        setCommissionRate(rate);
                        toast.success(`Comisión actualizada al ${Math.round(rate * 100)} %`);
                      }}
                      className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${commissionRate === rate
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border border-border hover:bg-muted"
                        }`}
                    >
                      {Math.round(rate * 100)} %
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES Y SIMULACIÓN DE ESTADO */}
          {activeTab === "roles" && (
            <div className="space-y-3 animate-in fade-in">
              <div>
                <p className="text-[11px] font-black uppercase text-muted-foreground mb-1.5">
                  Cambiar Rol de Sesión
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/app/comensal" });
                      toast.info("Navegando a vista de Comensal");
                    }}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl bg-card border border-border p-2.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
                  >
                    <User size={16} className="text-primary" />
                    <span>Comensal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole("OWNER");
                      navigate({ to: "/app/dueno" });
                      toast.info("Rol Dueña (María) activado");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-black transition-all active:scale-95 ${activeRole === "OWNER"
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                  >
                    <Layers size={16} className="text-primary" />
                    <span>Dueña</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole("CASHIER");
                      navigate({ to: "/app/dueno" });
                      toast.info("Rol Ayudante Caja activado");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-black transition-all active:scale-95 ${activeRole === "CASHIER"
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                  >
                    <Laptop size={16} className="text-primary" />
                    <span>Cajero</span>
                  </button>
                </div>
              </div>

              {/* Simulación Comensal: Con Tarjeta vs Sin Tarjeta */}
              <div className="rounded-2xl border border-border bg-muted/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Estado de Comensal:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = dinerHasPlanOverride === false ? true : false;
                      setDinerHasPlanOverride(next);
                      toast.info(next ? "Comensal con plan activo" : "Comensal nuevo (sin plan)");
                    }}
                    className="rounded-lg bg-card px-2.5 py-1 text-xs font-black text-primary border border-border shadow-xs hover:bg-muted"
                  >
                    {dinerHasPlanOverride === false ? "Ver como nuevo" : "Ver con plan activo"}
                  </button>
                </div>
              </div>

              {/* Llenar credenciales en login */}
              <div className="rounded-2xl border border-border bg-muted/60 p-3">
                <p className="text-[11px] font-black uppercase text-muted-foreground mb-1.5">
                  Autofill en Pantalla Login
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/app", search: { role: "diner", view: "login" } });
                      toast.info("Ir a Login Comensal demo");
                    }}
                    className="flex-1 rounded-lg bg-card py-1.5 text-xs font-bold text-foreground border border-border hover:bg-muted text-center"
                  >
                    Comensal demo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/app", search: { role: "owner", view: "login" } });
                      toast.info("Ir a Login Dueña demo");
                    }}
                    className="flex-1 rounded-lg bg-card py-1.5 text-xs font-bold text-foreground border border-border hover:bg-muted text-center"
                  >
                    Dueña demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESCENARIOS DE ESCANEO DE CAJA (P5, P12, P13, P15) */}
          {activeTab === "scanner" && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase text-muted-foreground">
                  Escenario de Escáner Activo
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/app/dueno/descontar" })}
                  className="text-xs font-black text-primary hover:underline"
                >
                  Ir al Escáner →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                {scenarios.map((s) => {
                  const on = scannerDemoScenario === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id === "SCAN_AND_WAIT_25") {
                          scanAndFastForward25Min();
                          toast.success("Almuerzo validado y transcurrieron 25 min", {
                            description: "Tarjeta de calificación activada en Mi pase.",
                          });
                        } else {
                          setScannerDemoScenario(s.id);
                          toast.success(`Escenario seleccionado: ${s.label}`);
                        }
                      }}
                      className={`rounded-xl p-2 text-left border text-xs transition-all ${on
                          ? "border-primary bg-accent text-primary font-black shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                    >
                      <p className="truncate font-black">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CONTROL DE TIEMPO SIMULADO */}
          {activeTab === "time" && (
            <div className="space-y-3 animate-in fade-in">
              <div>
                <p className="text-[11px] font-black uppercase text-muted-foreground mb-1.5">
                  Adelantar Fechas (Piloto)
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      advanceDemoDays(1);
                      toast.info("Avanzaste 1 día");
                    }}
                    className="flex-1 rounded-xl bg-card border border-border py-2 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
                  >
                    +1 día
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      advanceDemoDays(7);
                      toast.info("Avanzaste 7 días");
                    }}
                    className="flex-1 rounded-xl bg-card border border-border py-2 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
                  >
                    +7 días
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      advanceDemoDays(-simulatedDaysOffset);
                      toast.success("Fecha reseteada a hoy");
                    }}
                    className="flex-1 rounded-xl bg-card border border-border py-2 text-xs font-bold text-foreground hover:bg-muted active:scale-95"
                  >
                    Hoy ({simulatedDaysOffset}d)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black uppercase text-muted-foreground mb-1.5">
                  Simulaciones Rápidas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      advanceSimulatedMinutes(25);
                      toast.info("Avanzaste 25 min", {
                        description: "Feedback activado y preórdenes avanzadas.",
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border p-2.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
                  >
                    <Clock size={15} className="text-primary" />
                    <span>+25 min feedback</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      simulatePeakHour("r1");
                      toast.warning("Hora pico simulada", {
                        description: "Semáforo pasó a Lleno en La Cuchara.",
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border p-2.5 text-xs font-black text-foreground hover:bg-muted active:scale-95"
                  >
                    <Flame size={15} className="text-primary" />
                    <span>Simular hora pico</span>
                  </button>
                </div>
              </div>

              {/* Botón de reset de fábrica de datos demo */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData();
                    toast.success("Datos de demo restablecidos por completo.");
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-bold text-muted-foreground hover:text-foreground active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span>Restablecer datos demo de fábrica</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
