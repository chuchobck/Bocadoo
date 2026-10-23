import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { UnirmeMesaView } from "@/components/comensal";
import { AppShell } from "@/components/bocadoo/ui";
import type { ComponentState } from "@/design-system";

export const Route = createFileRoute("/app/comensal/mesa/$mesaId")({
  validateSearch: z.object({
    state: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Unirme a mesa" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { mesaId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const currentState: ComponentState = search.state || "exito";

  return (
    <AppShell>
      <UnirmeMesaView
        state={currentState}
        mesaId={mesaId}
        restaurantName="La Cuchara de San Blas"
        meetTime="13:00"
        hostName="Carlos Mantilla"
        onJoinSuccess={() => {
          toast.success("¡Te has unido a la mesa!");
        }}
        onBack={() => navigate({ to: "/app/comensal" })}
      />
    </AppShell>
  );
}
