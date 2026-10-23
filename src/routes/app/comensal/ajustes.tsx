import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PerfilView } from "@/components/comensal";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo, DINER_USER_ID, APP_USERS } from "@/components/bocadoo/store";
import type { ComponentState } from "@/design-system";

export const Route = createFileRoute("/app/comensal/ajustes")({
  validateSearch: z.object({
    state: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Mi cuenta" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { clientForUser } = useBocadoo();

  const user = APP_USERS.find((u) => u.id === DINER_USER_ID);
  const client = clientForUser(DINER_USER_ID);

  const currentState: ComponentState = search.state || "exito";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <PerfilView
            state={currentState}
            userName={user?.name || "Carlos Mantilla"}
            userPhone={user?.phone || "0991234567"}
            userPlanName={client?.planName || "Plan mensual de 20 almuerzos"}
          />
        </div>
        <NavBar active="Yo" />
      </div>
    </AppShell>
  );
}
