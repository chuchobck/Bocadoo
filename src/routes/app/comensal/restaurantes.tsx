import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { DondeComerView } from "@/components/comensal";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import { useBocadoo, DINER_USER_ID } from "@/components/bocadoo/store";
import { calculateOccupancy } from "@/domain/occupancy";
import type { ComponentState } from "@/design-system";

export const Route = createFileRoute("/app/comensal/restaurantes")({
  validateSearch: z.object({
    state: z.enum(["exito", "cargando", "vacio", "error", "offline"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Bocadoo — Dónde comer" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { restaurants, createPreOrder, menuDays, flashOffers, simulatedTodayKey } = useBocadoo();

  // Mapear restaurantes de la store a items con dominio puro
  const restaurantItems = restaurants.map((r, idx) => {
    const occ = calculateOccupancy({
      totalSeats: r.puestos || 30,
      dinersLast25Min: idx === 0 ? 10 : idx === 1 ? 22 : 28,
      manualBusyUntil: r.manualBusyUntil,
    });

    const menuKey = r.id === "r1" ? simulatedTodayKey : `${simulatedTodayKey}_${r.id}`;
    const todayMenu = menuDays[menuKey] || (r.id === "r1" ? menuDays[simulatedTodayKey] : undefined);
    const hasMenu = Boolean(todayMenu && todayMenu.publicadoEn);

    // Primer plato publicado de segundo o sopa
    const firstDish =
      todayMenu?.secciones?.fuerte?.[0]?.nombre ||
      todayMenu?.secciones?.sopa?.[0]?.nombre ||
      r.descripcionCorta ||
      "Seco de pollo con maduro";

    const hasOffer = flashOffers.some((f) => f.restaurantId === r.id && f.activa);

    return {
      id: r.id,
      name: r.nombre,
      distanceKm: r.id === "r1" ? 0.3 : r.id === "r2" ? 0.8 : 1.2,
      occupancy: occ.level,
      featuredDish: firstDish,
      hasPlan: r.id === "r1" || r.id === "r2",
      hasMenu,
      hasOffer,
      logoUrl: r.logoUrl || null,
    };
  });

  const currentState: ComponentState = search.state || "exito";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <DondeComerView
            state={currentState}
            restaurants={restaurantItems}
            onOrderSuccess={(orderNum) => {
              createPreOrder({
                userId: DINER_USER_ID,
                restaurantId: "r1",
                tipo: "AQUI",
                items: [
                  {
                    platoId: "p1",
                    nombre: "Almuerzo ejecutivo",
                    seccion: "fuerte",
                    precioCents: 350,
                  },
                ],
              });
              toast.success(`Pedido ${orderNum} enviado a cocina`);
            }}
          />
        </div>
        <NavBar active="Comer" />
      </div>
    </AppShell>
  );
}
