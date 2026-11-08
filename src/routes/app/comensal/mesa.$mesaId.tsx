import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { UnirmeMesaView } from "@/components/comensal";
import { AppShell } from "@/components/bocadoo/ui";
import { useBocadoo, RESTAURANT_ID } from "@/components/bocadoo/store";
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

  const { sharedTables, joinSharedTable, restaurants, menuDays, simulatedTodayKey, getRestaurantOccupancy } = useBocadoo();

  const currentState: ComponentState = search.state || "exito";

  const table = sharedTables.find((t) => t.id === mesaId);

  const targetRestaurantId = table?.restaurantId || RESTAURANT_ID;
  const restaurant = restaurants.find((r) => r.id === targetRestaurantId) || restaurants[0];

  const occupancy = getRestaurantOccupancy(targetRestaurantId);
  const occLabel = occupancy ? `${occupancy.status === "FLUIDO" ? "🟢" : occupancy.status === "MOVIDO" ? "🟡" : "🔴"} ${occupancy.label} · ${occupancy.detail}` : "🟢 Fluido · Llegas y te sientas";

  // Menú del día
  const menuKey = targetRestaurantId === RESTAURANT_ID ? simulatedTodayKey : `${simulatedTodayKey}_${targetRestaurantId}`;
  const todayMenu = menuDays[menuKey] || menuDays[simulatedTodayKey];

  const soups = todayMenu?.secciones?.sopa?.map((s) => s.nombre) || [
    "Locro de papa con queso y aguacate",
    "Sopa criolla tradicional",
  ];

  const mains = todayMenu?.secciones?.fuerte?.map((f, idx) => ({
    id: f.id,
    nombre: f.nombre,
    precio: f.precioCents ? `$${(f.precioCents / 100).toFixed(2).replace(".", ",")}` : "$3,00",
    foto: idx === 0 ? "/dishes/pollo-plancha.jpg" : idx === 2 ? "/dishes/bowl-quinoa.jpg" : "/dishes/locro-papa.jpg",
    veggie: f.nombre.toLowerCase().includes("veggie") || f.nombre.toLowerCase().includes("vegetariana"),
  })) || [
    {
      id: "f1",
      nombre: "Seco de pollo tierno con maduro frito",
      precio: "$3,00",
      foto: "/dishes/pollo-plancha.jpg",
    },
    {
      id: "f2",
      nombre: "Chuleta ahumada al grill con menestra",
      precio: "$3,25",
      foto: "/dishes/pollo-plancha.jpg",
    },
    {
      id: "f3",
      nombre: "Bowl veggie de quinoa y champiñones",
      precio: "$3,25",
      foto: "/dishes/bowl-quinoa.jpg",
      veggie: true,
    },
  ];

  return (
    <AppShell>
      <UnirmeMesaView
        state={currentState}
        mesaId={mesaId}
        restaurantId={targetRestaurantId}
        restaurantName={table?.restaurantNombre || restaurant?.nombre || "La Cuchara de San Blas"}
        meetTime={table?.hora || "13:00"}
        hostName={table?.anfitrionNombre || "Carlos Mejía"}
        occupancyLabel={occLabel}
        soups={soups}
        mains={mains}
        members={table?.miembros}
        onJoinSuccess={(data) => {
          joinSharedTable({
            mesaId,
            nombre: data.nombre,
            sopa: data.sopa,
            fuerte: data.fuerte,
            paraLlevar: data.paraLlevar,
          });
          toast.success(`¡Te has unido a la mesa de ${table?.anfitrionNombre || "Carlos"}!`);
        }}
        onBack={() => navigate({ to: "/app/comensal" })}
      />
    </AppShell>
  );
}
