import { useState, useTransition } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import {
  WalletCards,
  CheckCircle2,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Percent,
  Clock,
  ArrowRight,
  MapPin,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { UndoBanner } from "@/design-system";
import {
  useBocadoo,
  DINER_USER_ID,
  RESTAURANT_ID,
  money,
  type PlanTemplate,
} from "@/components/bocadoo/store";
import { DetallePlanModal } from "@/features/comensal/planes/DetallePlanModal";

export const Route = createFileRoute("/app/comensal/planes")({
  validateSearch: z.object({
    state: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Planes de almuerzo" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    restaurants,
    planTemplates,
    clientForUser,
    requestPlan,
    getActiveSubsForUserAndRestaurant,
  } = useBocadoo();

  const [selectedRestId, setSelectedRestId] = useState<string>(RESTAURANT_ID);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanTemplate | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [isChangingRest, setIsChangingRest] = useState(false);

  const currentRest = restaurants.find((r) => r.id === selectedRestId) || restaurants[0]!;
  const templatesForRest = planTemplates.filter(
    (t) => t.restaurantId === selectedRestId && t.activo,
  );

  // Suscripciones activas en el restaurante actualmente seleccionado
  const activeSubsInSelectedRest = getActiveSubsForUserAndRestaurant(
    DINER_USER_ID,
    selectedRestId,
  );
  const primarySub = activeSubsInSelectedRest[0];
  const primarySubTemplate = primarySub
    ? planTemplates.find((t) => t.id === primarySub.templateId)
    : undefined;

  const handleSelectRestaurant = (restId: string) => {
    if (restId === selectedRestId) return;
    setIsChangingRest(true);
    setSelectedRestId(restId);
    // Simulación de lazy loading al consultar disponibilidad y planes del restaurante
    setTimeout(() => {
      setIsChangingRest(false);
    }, 320);
  };

  const handleConfirmPlanRequest = (templateId: string, name: string) => {
    requestPlan(templateId, DINER_USER_ID);
    setUndoSeconds(10);
    toast.success(`¡Solicitud de ${name} enviada! Acércate a caja para activar.`);
  };

  const currentInitials = currentRest.nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "B";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden bg-surface">
        <header className="px-4 py-3 border-b border-border bg-surface sticky top-0 z-10">
          <h1 className="text-[20px] font-black text-foreground">Planes de almuerzo</h1>
          <p className="text-[12px] font-semibold text-muted-foreground">
            Ahorra en cada comida y olvídate del efectivo diario
          </p>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-4 pb-20">
          {/* DASHBOARD DINÁMICO DE PLANES: Actualizado al restaurante seleccionado */}
          <section
            aria-label="Dashboard informativo de planes"
            className="rounded-[28px] border border-primary/25 bg-gradient-to-br from-primary-container/40 via-surface to-background p-4.5 shadow-xs space-y-3.5 transition-all"
          >
            {/* Cabecera del restaurante dentro del dashboard con degradado elegante */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground font-black text-[17px] shadow-sm shrink-0">
                  {currentInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary-container/80 px-2 py-0.5 rounded-full">
                      Restaurante seleccionado
                    </span>
                  </div>
                  <h2 className="text-[17px] font-black text-foreground leading-tight truncate mt-0.5">
                    {currentRest.nombre}
                  </h2>
                  <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{currentRest.direccion || currentRest.zona}</span>
                  </p>
                </div>
              </div>

              {primarySub ? (
                <span className="text-[11px] font-black text-success bg-success-container px-2.5 py-1 rounded-full shrink-0">
                  Plan Activo
                </span>
              ) : (
                <span className="text-[11px] font-bold text-muted-foreground bg-surface px-2.5 py-1 rounded-full border border-border shrink-0">
                  Sin plan activo
                </span>
              )}
            </div>

            {/* CONTENIDO DEL DASHBOARD: SI TIENE PLAN ACTIVO EN ESTE RESTAURANTE */}
            {primarySub ? (
              <div className="space-y-3 pt-2 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-extrabold text-foreground">
                      {primarySubTemplate?.nombre || "Plan prepagado"}
                    </span>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      Vence el{" "}
                      {new Date(primarySub.venceEn).toLocaleDateString("es-EC", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · Canje con QR en caja
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[22px] font-black text-primary leading-none">
                      {primarySub.almuerzosRestantes}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      de {primarySub.almuerzosTotales} restantes
                    </span>
                  </div>
                </div>

                {/* Barra de progreso de consumo del plan */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-border/60 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            8,
                            (primarySub.almuerzosRestantes / primarySub.almuerzosTotales) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>
                      {primarySub.almuerzosTotales - primarySub.almuerzosRestantes} consumidos
                    </span>
                    <span className="text-primary font-bold">
                      {Math.round(
                        (primarySub.almuerzosRestantes / primarySub.almuerzosTotales) * 100,
                      )}
                      % disponible
                    </span>
                  </div>
                </div>

                {/* Acciones y beneficios del plan activo */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-success flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ahorro activo de hasta $5,00/mes</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate({ to: "/app/comensal" })}
                    className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-primary-foreground bg-primary hover:bg-primary-hover px-3.5 py-1.5 rounded-full shadow-2xs active:scale-95 transition-all"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Ver pase QR</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CONTENIDO DEL DASHBOARD: SI NO TIENE PLAN ACTIVO EN ESTE RESTAURANTE */
              <div className="space-y-2.5 pt-2 border-t border-border/70 text-[12px]">
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Actualmente no tienes un plan contratado en{" "}
                  <strong className="text-foreground">{currentRest.nombre}</strong>. El almuerzo
                  suelto diario cuesta{" "}
                  <span className="font-bold text-foreground">
                    {money(currentRest.precioSueltoCents || 300)}
                  </span>
                  .
                </p>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground font-semibold">
                    💡 Con un plan Bocadoo:
                  </span>
                  <span className="font-extrabold text-success">
                    Ahorras hasta {money(50)} por almuerzo
                  </span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  👇 Selecciona un plan a continuación para solicitarlo sin pago inmediato:
                </p>
              </div>
            )}
          </section>

          {/* SELECTOR HORIZONTAL DE RESTAURANTE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Selecciona restaurante
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {restaurants.length} disponibles
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {restaurants.map((r) => {
                const isSelected = selectedRestId === r.id;
                const hasActivePlan = getActiveSubsForUserAndRestaurant(
                  DINER_USER_ID,
                  r.id,
                ).length > 0;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRestaurant(r.id)}
                    className={`px-3 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-black"
                        : "bg-background text-foreground border border-border hover:bg-surface"
                    }`}
                  >
                    <span>{r.nombre}</span>
                    {hasActivePlan && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected ? "bg-primary-foreground" : "bg-success"
                        }`}
                        title="Tienes un plan activo aquí"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LISTA DE PLANES OFERTADOS CON LAZY LOADING / SKELETON */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-black text-foreground">
                Planes disponibles en {currentRest.nombre}
              </span>
              <span className="text-[12px] font-bold text-success bg-success-container px-2.5 py-0.5 rounded-full">
                Suelto: {money(currentRest.precioSueltoCents || 300)}
              </span>
            </div>

            {isChangingRest ? (
              /* LAZY LOADING SKELETON STATE */
              <div className="space-y-3 py-1">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-[24px] border border-border bg-surface p-4 shadow-xs animate-pulse space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-36 bg-border/60 rounded-full" />
                        <div className="h-3 w-28 bg-border/40 rounded-full" />
                      </div>
                      <div className="h-6 w-16 bg-border/60 rounded-full" />
                    </div>
                    <div className="h-8 w-full bg-border/30 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : templatesForRest.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-background border border-border p-4 text-[13px] text-muted-foreground space-y-1">
                <AlertCircle className="h-6 w-6 text-muted-foreground/60 mx-auto" />
                <p className="font-semibold text-foreground">Sin planes disponibles</p>
                <p>Este restaurante aún no ha publicado planes activos en el marketplace.</p>
              </div>
            ) : (
              templatesForRest.map((tpl) => {
                const perLunchCents = Math.round(tpl.precioCents / tpl.almuerzos);
                const savingCents =
                  (currentRest.precioSueltoCents || 300) * tpl.almuerzos - tpl.precioCents;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedPlanForModal(tpl)}
                    className="rounded-[24px] border border-border bg-surface p-4 shadow-xs hover:border-primary/60 transition-all space-y-3 cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-extrabold text-foreground group-hover:text-primary transition-colors">
                            {tpl.nombre}
                          </h3>
                          {savingCents > 0 && (
                            <span className="text-[11px] font-extrabold bg-success-container text-success px-2 py-0.5 rounded-full">
                              Ahorras {money(savingCents)}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                          {tpl.almuerzos} almuerzos · Vigencia de {tpl.vigenciaDias} días hábiles
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[18px] font-black text-primary block leading-none">
                          {money(tpl.precioCents)}
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {money(perLunchCents)} c/u
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-success" />
                        <span>Canje con QR · Ver términos</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanForModal(tpl);
                        }}
                        className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-[13px] font-bold shadow-xs active:scale-95 transition-all hover:bg-primary-hover flex items-center gap-1"
                      >
                        <span>Pedir plan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* BENEFICIOS DE LOS PLANES PREPAGADOS */}
          <div className="rounded-[24px] bg-background border border-border p-4 text-[12px] space-y-2 text-muted-foreground">
            <span className="font-extrabold text-foreground block text-[13px]">
              ¿Por qué prepagar con Bocadoo?
            </span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Sin colas en caja: muestras tu QR y te sientas a almorzar.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Ahorro garantizado de hasta $5,00 cada mes frente a pagar suelto.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span>Acumulas sellos automáticos para premios y almuerzos gratis.</span>
            </div>
          </div>
        </div>

        <NavBar active="Planes" />

        {/* MODAL DE DETALLE Y TÉRMINOS DEL PLAN */}
        <DetallePlanModal
          isOpen={Boolean(selectedPlanForModal)}
          onClose={() => setSelectedPlanForModal(null)}
          plan={selectedPlanForModal}
          restaurant={currentRest}
          onConfirmRequest={handleConfirmPlanRequest}
        />

        {undoSeconds > 0 && (
          <UndoBanner
            secondsLeft={undoSeconds}
            onUndo={() => {
              setUndoSeconds(0);
              toast.info("Solicitud de plan cancelada");
            }}
            label="Plan solicitado · Deshacer"
          />
        )}
      </div>
    </AppShell>
  );
}
