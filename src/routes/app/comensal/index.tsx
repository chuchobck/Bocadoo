import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { MiPaseView } from "@/components/comensal";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo, DINER_USER_ID } from "@/components/bocadoo/store";
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
  } = useBocadoo();

  const client = clientForUser(DINER_USER_ID);
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
          currentStamps: 10,
        },
        {
          restaurantId: "r2",
          restaurantName: "El Fogón Quiteño",
          lunchesLeft: 6,
          expiryDate: "15 nov",
          hasMultipleExpiries: false,
          qrPayload: `BCD1.PASS.USER1.R2.${Date.now()}`,
          currentStamps: 4,
        },
      ]
    : [];

  // Pedido activo si existe
  const activeOrderObj = orders.find(
    (o) => o.comensalId === DINER_USER_ID && o.estado === "EN_CAMINO",
  );
  const activeOrder = activeOrderObj
    ? {
        orderNumber: "42",
        status: "PREPARANDO" as const,
        restaurantName: "La Cuchara de San Blas",
      }
    : undefined;

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
            onClaimReward={() => {
              toast.success("¡Premio pedido con éxito!");
            }}
          />
        </div>
        <NavBar active="Pase" />
      </div>
    </AppShell>
  );
}
