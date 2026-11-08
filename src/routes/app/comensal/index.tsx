import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { MiPaseView } from "@/components/comensal";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo, DINER_USER_ID, orderDisplayNumber } from "@/components/bocadoo/store";
import type { ComponentState } from "@/design-system";

export const Route = createFileRoute("/app/comensal/")({
  validateSearch: z.object({
    state: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
    qr: z.boolean().optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Mi pase" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const {
    clientForUser,
    dinerHasPlanOverride,
    pendingFeedbackRedemptions,
    submitFeedback,
    dismissFeedback,
    orders,
    sharedTables,
    dinerTransactions,
    restaurants,
    rawClients,
    stampConfigs,
    getClientStampRecord,
    claimStampReward,
  } = useBocadoo();

  const client = clientForUser(DINER_USER_ID);

  // Tarjeta de sellos de cada local: lo que configuró el dueño + los sellos del comensal
  const stampsFor = (restaurantId: string) => {
    const cfg = stampConfigs[restaurantId];
    // El comensal tiene una ficha de cliente distinta en cada local
    const localClient = rawClients.find(
      (c) => c.userId === DINER_USER_ID && c.restaurantId === restaurantId,
    );
    const record = localClient ? getClientStampRecord(localClient.id, restaurantId) : undefined;
    const restaurantName = restaurants.find((r) => r.id === restaurantId)?.nombre ?? "";
    return {
      currentStamps: record?.sellos ?? 0,
      rewardsAvailable: record?.premiosDisponibles ?? 0,
      stampGoal: cfg?.meta ?? 10,
      stampReward: cfg?.premio ?? "Almuerzo gratis",
      stampCardName: cfg?.nombre || `Tarjeta ${restaurantName}`,
      stampCountMode: cfg?.cuenta ?? "almuerzo",
    };
  };
  const activeSubs = client?.activeSubscriptions || [];
  const primarySub = activeSubs[0];

  const hasPlan =
    dinerHasPlanOverride !== null
      ? dinerHasPlanOverride
      : (client?.lunchesLeft ?? 14) > 0;

  // Adaptar planes del comensal
  const plans = hasPlan
    ? [
        {
          restaurantId: "r1",
          restaurantName: "La Cuchara de San Blas",
          lunchesLeft: client?.lunchesLeft ?? 14,
          expiryDate: "30 oct",
          hasMultipleExpiries: true,
          multipleExpiryText: "3 vencen el 30 oct",
          qrPayload: `BCD1.PASS.USER1.R1.${Date.now()}`,
          ...stampsFor("r1"),
        },
        {
          restaurantId: "r2",
          restaurantName: "El Fogón Quiteño",
          lunchesLeft: 6,
          expiryDate: "15 nov",
          hasMultipleExpiries: false,
          qrPayload: `BCD1.PASS.USER1.R2.${Date.now()}`,
          ...stampsFor("r2"),
        },
      ]
    : [];

  // Pedido activo si existe
  const activeOrderObj = orders.find(
    (o) => o.comensalId === DINER_USER_ID && o.estado === "EN_CAMINO",
  );
  const activeOrder = activeOrderObj
    ? {
        orderNumber: orderDisplayNumber(activeOrderObj.id),
        status: "PREPARANDO" as const,
        restaurantName: "La Cuchara de San Blas",
        qrPayload: activeOrderObj.qrPayload,
        detail: activeOrderObj.items.map((i) => i.nombre).join(" + "),
      }
    : undefined;

  // Mesa con amigos activa (como anfitrión o invitado)
  const tableObj = sharedTables.find(
    (t) =>
      t.estado !== "FINALIZADA" &&
      (t.anfitrionUserId === DINER_USER_ID || t.miembros.some((m) => m.id === DINER_USER_ID)),
  );
  const activeTable = tableObj
    ? {
        id: tableObj.id,
        restaurantName: tableObj.restaurantNombre,
        hora: tableObj.hora,
        membersCount: tableObj.miembros.length,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/app/comensal/mesa/${tableObj.id}`,
      }
    : undefined;

  // Últimos movimientos del comensal
  const recentActivity = dinerTransactions.slice(0, 5).map((t) => ({
    id: t.id,
    name: t.name,
    detail: t.detail,
    value: t.value,
    positive: t.positive,
    kind: (t.icon === "bag" ? "plan" : t.icon === "utensils" ? "lunch" : "other") as "plan" | "lunch" | "other",
  }));

  // Feedback tras consumo (solo a los FEEDBACK_DELAY_MIN = 25 min tras almuerzo validado)
  const pendingRedemptions = client ? pendingFeedbackRedemptions(client.id) : [];
  const hasRecentRedemption = pendingRedemptions.length > 0;
  const targetRedemption = pendingRedemptions[0];

  const currentState: ComponentState = search.state || (hasPlan ? "exito" : "vacio");

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <MiPaseView
            state={currentState}
            plans={plans}
            hasRecentRedemption={hasRecentRedemption}
            activeOrder={activeOrder}
            activeTable={activeTable}
            recentActivity={recentActivity}
            onViewLocales={() => navigate({ to: "/app/comensal/restaurantes" })}
            onFeedbackSubmit={(tag) => {
              submitFeedback({
                redemptionId: targetRedemption?.id || "demo-red",
                restaurantId: targetRedemption?.restaurantId || "r1",
                clientId: client?.id || "c1",
                tags: [tag],
              });
              toast.success("¡Gracias por calificar!");
            }}
            onFeedbackDismiss={() => {
              if (targetRedemption) {
                dismissFeedback(targetRedemption.id);
              }
            }}
            dinerName={client?.nombre}
            onClaimReward={(restaurantId) => {
              const localClient = rawClients.find(
                (c) => c.userId === DINER_USER_ID && c.restaurantId === restaurantId,
              );
              if (!localClient) return;
              const res = claimStampReward(localClient.id, restaurantId);
              if (res.ok) toast.success("¡Premio listo! Muéstralo en caja.");
              else toast.error(res.message);
            }}
          />
        </div>
        <NavBar active="Pase" />
      </div>
    </AppShell>
  );
}
