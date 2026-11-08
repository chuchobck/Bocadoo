import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { DondeComerView } from "@/components/comensal";
import { AppShell, NavBar } from "@/components/bocadoo/ui";
import {
  useBocadoo,
  DINER_USER_ID,
  RESTAURANT_ID,
  getSimulatedDistanceKm,
  money,
} from "@/components/bocadoo/store";
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
  const navigate = useNavigate();
  const {
    restaurants,
    createPreOrder,
    menuDays,
    flashOffers,
    simulatedTodayKey,
    dinerZone,
    setDinerZone,
    planTemplates,
    clientForUser,
  } = useBocadoo();

  const client = clientForUser(DINER_USER_ID);
  const activeSubs = client?.activeSubscriptions || [];

  // Mapear restaurantes de la store a items con dominio puro y datos ricos de IHC
  const restaurantItems = restaurants.map((r, idx) => {
    const occDomain = calculateOccupancy({
      totalSeats: r.puestos || 30,
      dinersLast25Min: idx === 0 ? 10 : idx === 1 ? 22 : 28,
      manualBusyUntil: r.manualBusyUntil,
    });

    const menuKey = r.id === RESTAURANT_ID ? simulatedTodayKey : `${simulatedTodayKey}_${r.id}`;
    const todayMenu = menuDays[menuKey] || (r.id === RESTAURANT_ID ? menuDays[simulatedTodayKey] : undefined);
    const hasMenu = Boolean(todayMenu && todayMenu.publicadoEn);

    // Primer plato publicado de segundo o sopa
    const soupName = todayMenu?.secciones?.sopa?.[0]?.nombre;
    const forteName = todayMenu?.secciones?.fuerte?.[0]?.nombre;
    const featuredDish =
      soupName && forteName
        ? `${soupName.split(" ")[0]} ${soupName.split(" ")[1] || ""} · ${forteName}`
        : forteName || soupName || r.descripcionCorta || "Seco de pollo con maduro";

    const liveOffer = flashOffers.find(
      (f) => f.restaurantId === r.id && f.activa && f.stockRestante > 0,
    );
    const hasOffer = Boolean(liveOffer);
    const hasPlan =
      activeSubs.some((s) => {
        const tpl = planTemplates.find((t) => t.id === s.templateId);
        return tpl?.restaurantId === r.id && s.almuerzosRestantes > 0;
      }) || r.id === RESTAURANT_ID;

    // Distancia calculada con la zona comensal
    const distanceKm = getSimulatedDistanceKm(dinerZone, r.lat, r.lng);

    // Fotos de platos según restaurante
    const coverImage =
      r.id === "r1"
        ? "/dishes/locro-papa.jpg"
        : r.id === "r2"
        ? "/dishes/bowl-quinoa.jpg"
        : r.id === "r3"
        ? "/dishes/pollo-plancha.jpg"
        : r.id === "r4"
        ? "/dishes/locro-papa.jpg"
        : "/dishes/pollo-plancha.jpg";

    const mainsList = todayMenu?.secciones?.fuerte?.map((f, fIdx) => ({
      id: f.id,
      nombre: f.nombre,
      precio: f.precioCents ? `$${(f.precioCents / 100).toFixed(2).replace(".", ",")}` : `$${(r.precioSueltoCents / 100).toFixed(2).replace(".", ",")}`,
      foto: fIdx === 0 ? "/dishes/pollo-plancha.jpg" : fIdx === 1 ? "/dishes/bowl-quinoa.jpg" : "/dishes/locro-papa.jpg",
      veggie: f.nombre.toLowerCase().includes("veggie") || f.nombre.toLowerCase().includes("vegetariana"),
      agotado: f.agotado,
    })) || [
      { id: "m1", nombre: "Seco de pollo tierno con maduro frito", precio: "$3,00", foto: "/dishes/pollo-plancha.jpg" },
      { id: "m2", nombre: "Chuleta ahumada al grill con menestra", precio: "$3,25", foto: "/dishes/pollo-plancha.jpg" },
    ];

    const soldOutSoups = todayMenu?.secciones?.sopa?.filter((s) => s.agotado).map((s) => s.nombre) ?? [];
    const soupsList = todayMenu?.secciones?.sopa?.map((s) => s.nombre) || [
      "Locro de papa con queso y aguacate",
      "Sopa criolla de verduras",
    ];

    return {
      id: r.id,
      name: r.nombre,
      distanceKm,
      occupancy: occDomain.level,
      featuredDish,
      hasPlan,
      hasMenu,
      hasOffer,
      offerTitle: liveOffer?.titulo,
      offerPrice: liveOffer ? money(liveOffer.precioCents) : undefined,
      offerOriginalPrice: liveOffer ? money(liveOffer.precioOriginalCents) : undefined,
      offerSlotsLeft: liveOffer?.stockRestante,
      logoUrl: r.logoUrl || null,
      coverImage,
      zona: r.zona,
      direccion: r.direccion,
      lat: r.lat,
      lng: r.lng,
      precioSuelto: `$${(r.precioSueltoCents / 100).toFixed(2).replace(".", ",")}`,
      precioPlan: `$${Math.max(2.5, (r.precioSueltoCents - 25) / 100).toFixed(2).replace(".", ",")}`,
      soups: soupsList,
      soldOutSoups,
      mains: mainsList,
      juice: todayMenu?.secciones?.jugo?.[0]?.nombre || "Jugo natural de temporada",
      dessert: todayMenu?.secciones?.postre?.[0]?.nombre || "Dulce de la casa",
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
            selectedZone={dinerZone}
            onSelectZone={(zone) => setDinerZone(zone)}
            onOrderSuccess={(orderNum, details) => {
              createPreOrder({
                userId: DINER_USER_ID,
                restaurantId: RESTAURANT_ID,
                tipo: details?.paraLlevar ? "LLEVAR" : "AQUI",
                items: [
                  {
                    platoId: "p-soup",
                    nombre: details?.soup || "Locro de papa con queso y aguacate",
                    seccion: "sopa",
                  },
                  {
                    platoId: "p-main",
                    nombre: details?.main || "Seco de pollo tierno con maduro frito",
                    seccion: "fuerte",
                    precioCents: 300,
                  },
                ],
              });
              toast.success(`Pedido #${orderNum} enviado a cocina`, {
                action: {
                  label: "Ver QR",
                  onClick: () => navigate({ to: "/app/comensal" }),
                },
              });
            }}
          />
        </div>
        <NavBar active="Restaurantes" />
      </div>
    </AppShell>
  );
}
