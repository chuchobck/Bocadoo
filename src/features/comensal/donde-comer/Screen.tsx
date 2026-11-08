import React, { useState } from "react";
import {
  MapPin,
  AlertCircle,
  WifiOff,
  Loader2,
  Zap,
  Search,
  Users,
  QrCode,
  UtensilsCrossed,
  Clock,
  Sparkles,
  ChevronDown,
  Check,
  Eye,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { OccupancyChip, UndoBanner, SearchInput, BottomSheet } from "@/design-system";
import { FichaLocalModal } from "@/components/comensal/FichaLocalModal";
import type { FichaBreakfast, FichaOrderDetails } from "@/features/comensal/ficha-local";
import { MesaAmigosModal } from "@/components/comensal/MesaAmigosModal";
import { InteractiveMapModal } from "./components";
import { DINER_ZONES } from "@/components/bocadoo/store";
import { DONDE_COMER_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

/** Oferta publicada por un local: liquidación flash de hoy o promo programada de horas muertas. */
export interface RestaurantOffer {
  id: string;
  restaurantId: string;
  modalidad: "FLASH_HOY" | "HORA_VALLE";
  titulo: string;
  precio?: string | undefined;
  precioOriginal?: string | undefined;
  /** Precio en centavos enteros; 0 = no se puede reservar desde aquí. */
  precioCents: number;
  cuposRestantes: number;
  /** Texto listo para mostrar: "⚡ Flash · Quedan 5 cupos · hasta 14:00" o "📅 Promo Mar y Jue 16:00 - 18:00 · -20%". */
  badge: string;
  /** Se puede reservar ahora (dentro de su horario y con cupos). */
  vigenteAhora: boolean;
  /** Aplica hoy (para las promos programadas: hoy es uno de sus días). */
  aplicaHoy: boolean;
}

function offersOf(r: RestaurantItem): RestaurantOffer[] {
  if (r.offers) return r.offers;
  if (!r.hasOffer) return [];
  const cupos = r.offerSlotsLeft ?? 0;
  return [
    {
      id: `legacy-${r.id}`,
      restaurantId: r.id,
      modalidad: "FLASH_HOY",
      titulo: r.offerTitle ?? "Oferta flash activa",
      precio: r.offerPrice,
      precioOriginal: r.offerOriginalPrice,
      precioCents: 0,
      cuposRestantes: cupos,
      badge: `⚡ Flash · Quedan ${cupos} ${cupos === 1 ? "cupo" : "cupos"}`,
      vigenteAhora: true,
      aplicaHoy: true,
    },
  ];
}

export interface RestaurantItem {
  id: string;
  name: string;
  distanceKm: number;
  occupancy: "LIBRE" | "MOVIDO" | "LLENO";
  featuredDish: string;
  hasPlan: boolean;
  hasMenu?: boolean;
  hasOffer?: boolean;
  /** Datos de la oferta flash activa (la publica el dueño desde su Caja). */
  offerTitle?: string | undefined;
  offerPrice?: string | undefined;
  offerOriginalPrice?: string | undefined;
  offerSlotsLeft?: number | undefined;
  logoUrl?: string | null;
  coverImage?: string;
  zona?: string;
  direccion?: string | undefined;
  lat?: number;
  lng?: number;
  precioSuelto?: string;
  precioPlan?: string;
  soups?: string[];
  soldOutSoups?: string[];
  mains?: Array<{ id: string; nombre: string; precio?: string; foto?: string; veggie?: boolean; agotado?: boolean }>;
  juice?: string;
  dessert?: string;
  /** Desayunos publicados hoy por el local. */
  breakfasts?: FichaBreakfast[];
  /** Todas las ofertas activas del local (flash y promos programadas). */
  offers?: RestaurantOffer[];
}

export interface DondeComerScreenProps {
  restaurants?: RestaurantItem[] | undefined;
  onOrderSuccess?: ((orderNumber: string, details?: FichaOrderDetails) => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
  selectedZone?: string | null;
  onSelectZone?: (zone: string) => void;
  /** Reserva (preorden) de una oferta directamente desde la lista. */
  onReserveOffer?: ((offer: RestaurantOffer) => void) | undefined;
}

export function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  const first = parts[0] || "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] || "";
  return ((first[0] || "") + (second[0] || "")).toUpperCase() || "B";
}

const ZONE_DESCRIPTIONS: Record<string, string> = {
  "Frente a la PUCE": "Av. 12 de Octubre y La Católica",
  "La Floresta": "Madrid, Coruña y Redondel",
  "La Mariscal": "Plaza Foch, Amazonas y Colón",
  "Centro Histórico": "San Blas, Plaza del Teatro y Grande",
  "Cumbayá": "Parque Central y USFQ",
  "UDLA Granados": "Redondel del Ciclista y Simón Bolívar",
  "EPN / Salesiana": "Ladrón de Guevara y Politécnica",
};

export const DondeComerScreen: React.FC<DondeComerScreenProps> = ({
  restaurants = [
    {
      id: "r1",
      name: "La Cuchara de San Blas",
      distanceKm: 0.3,
      occupancy: "LIBRE",
      featuredDish: "Locro de papa · Seco de pollo con maduro",
      hasPlan: true,
      hasMenu: true,
      hasOffer: true,
      coverImage: "/dishes/locro-papa.jpg",
      zona: "Frente a la PUCE",
      precioSuelto: "$3,00",
      precioPlan: "$2,75",
      soups: ["Locro de papa con queso y aguacate", "Sopa criolla de verduras"],
      mains: [
        { id: "m1", nombre: "Seco de pollo tierno con maduro frito", precio: "$3,00", foto: "/dishes/pollo-plancha.jpg" },
        { id: "m2", nombre: "Chuleta ahumada al grill con menestra", precio: "$3,25", foto: "/dishes/pollo-plancha.jpg" },
        { id: "m3", nombre: "Bowl veggie de quinoa y champiñones", precio: "$3,25", foto: "/dishes/bowl-quinoa.jpg", veggie: true },
      ],
      juice: "Jugo natural de naranjilla",
      dessert: "Higos con queso fresco",
    },
    {
      id: "r2",
      name: "El Fogón Quiteño",
      distanceKm: 0.8,
      occupancy: "MOVIDO",
      featuredDish: "Crema de zapallo · Pechuga al romero",
      hasPlan: true,
      hasMenu: true,
      hasOffer: false,
      coverImage: "/dishes/bowl-quinoa.jpg",
      zona: "La Floresta",
      precioSuelto: "$3,25",
      precioPlan: "$3,00",
      soups: ["Crema de zapallo con semillas tostadas"],
      mains: [
        { id: "r2-m1", nombre: "Pechuga al romero con ensalada fresca", precio: "$3,25", foto: "/dishes/pollo-plancha.jpg" },
        { id: "r2-m2", nombre: "Salteado de vegetales crocantes", precio: "$3,25", foto: "/dishes/bowl-quinoa.jpg", veggie: true },
      ],
      juice: "Limonada de hierbabuena",
      dessert: "Mousse de maracuyá",
    },
    {
      id: "r3",
      name: "Picantería Los Andes",
      distanceKm: 1.2,
      occupancy: "LLENO",
      featuredDish: "Caldo de bola · Pescado frito con patacones",
      hasPlan: false,
      hasMenu: true,
      hasOffer: false,
      coverImage: "/dishes/pollo-plancha.jpg",
      zona: "La Mariscal",
      precioSuelto: "$3,50",
      precioPlan: "$3,30",
      soups: ["Caldo de bola manaba"],
      mains: [
        { id: "r3-m1", nombre: "Pescado frito con arroz y patacones", precio: "$3,50", foto: "/dishes/pollo-plancha.jpg" },
      ],
    },
  ],
  onOrderSuccess,
  onRetry,
  state = "exito",
  selectedZone = "Frente a la PUCE",
  onSelectZone,
  onReserveOffer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCerca, setFilterCerca] = useState(false);
  const [filterConPlan, setFilterConPlan] = useState(false);
  const [filterLibre, setFilterLibre] = useState(false);
  const [filterOfertas, setFilterOfertas] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);
  const [mesaRestaurant, setMesaRestaurant] = useState<RestaurantItem | null>(null);
  const [isMesaOpen, setIsMesaOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);

  const cleanAllFilters = () => {
    setSearchQuery("");
    setFilterCerca(false);
    setFilterConPlan(false);
    setFilterLibre(false);
    setFilterOfertas(false);
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.name.toLowerCase().includes(q);
      const matchDish = r.featuredDish.toLowerCase().includes(q);
      const matchZona = r.zona?.toLowerCase().includes(q);
      const soldOutSoups = r.soldOutSoups ?? [];
      const matchActiveDish =
        (r.breakfasts ?? []).some((b) => !b.agotado && b.nombre.toLowerCase().includes(q)) ||
        (r.soups ?? []).some((sp) => !soldOutSoups.includes(sp) && sp.toLowerCase().includes(q)) ||
        (r.mains ?? []).some((m) => !m.agotado && m.nombre.toLowerCase().includes(q)) ||
        offersOf(r).some((o) => o.titulo.toLowerCase().includes(q));
      if (!matchName && !matchDish && !matchZona && !matchActiveDish) return false;
    }
    if (filterCerca && r.distanceKm >= 1.0) return false;
    if (filterConPlan && !r.hasPlan) return false;
    if (filterLibre && r.occupancy !== "LIBRE") return false;
    if (filterOfertas && !r.hasOffer) return false;
    return true;
  });

  const planRestaurants = restaurants.filter((r) => r.hasPlan);
  // "Ofertas hoy": flash de hoy + promos programadas que aplican hoy
  const todayOfferEntries = restaurants.flatMap((r) =>
    offersOf(r)
      .filter((o) => o.aplicaHoy)
      .map((o) => ({ res: r, offer: o })),
  );

  const openMesaModal = (restaurant?: RestaurantItem) => {
    setMesaRestaurant(restaurant || restaurants[0] || null);
    setIsMesaOpen(true);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Dónde comer"
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      {/* Header fijo con selector de sector interactivo y buscador */}
      <header className="px-4 py-3 border-b border-border bg-surface sticky top-0 z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[20px] font-black text-foreground">{DONDE_COMER_COPY.title}</h1>

          {/* UN SOLO BOTÓN INTUITIVO QUE INDICA UBICACIÓN PARA VER LUGARES CERCANOS */}
          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container hover:bg-primary-container/80 text-primary border border-primary/25 font-extrabold text-[12px] active:scale-95 transition-all shadow-2xs group cursor-pointer"
            title="Ver tu ubicación y los lugares más cercanos en el mapa"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
            <span>Lugares cercanos</span>
          </button>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar restaurante o plato"
        />

        {/* CHIPS DE FILTRO PULIDOS SIN BORDES NEGROS (IMAGEN 2) */}
        <div className="grid grid-cols-4 gap-1.5 w-full pt-0.5">
          <button
            type="button"
            aria-pressed={filterCerca}
            onClick={() => setFilterCerca(!filterCerca)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 outline-hidden focus:outline-hidden focus:ring-0 ${
              filterCerca
                ? "bg-primary text-primary-foreground shadow-xs font-black border border-primary"
                : "bg-background text-muted-foreground border border-border hover:bg-secondary-container"
            }`}
          >
            {DONDE_COMER_COPY.filterNear}
          </button>
          <button
            type="button"
            aria-pressed={filterConPlan}
            onClick={() => setFilterConPlan(!filterConPlan)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 outline-hidden focus:outline-hidden focus:ring-0 ${
              filterConPlan
                ? "bg-primary text-primary-foreground shadow-xs font-black border border-primary"
                : "bg-background text-muted-foreground border border-border hover:bg-secondary-container"
            }`}
          >
            {DONDE_COMER_COPY.filterWithPlan}
          </button>
          <button
            type="button"
            aria-pressed={filterLibre}
            onClick={() => setFilterLibre(!filterLibre)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 outline-hidden focus:outline-hidden focus:ring-0 ${
              filterLibre
                ? "bg-primary text-primary-foreground shadow-xs font-black border border-primary"
                : "bg-background text-muted-foreground border border-border hover:bg-secondary-container"
            }`}
          >
            {DONDE_COMER_COPY.filterFree}
          </button>
          <button
            type="button"
            aria-pressed={filterOfertas}
            onClick={() => setFilterOfertas(!filterOfertas)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 outline-hidden focus:outline-hidden focus:ring-0 ${
              filterOfertas
                ? "bg-primary text-primary-foreground shadow-xs font-black border border-primary"
                : "bg-background text-muted-foreground border border-border hover:bg-secondary-container"
            }`}
          >
            {DONDE_COMER_COPY.filterOffers}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 space-y-4">
        {state === "cargando" && (
          <div role="status" className="space-y-4 animate-pulse">
            <span className="sr-only">Cargando restaurantes...</span>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-xs"
              >
                {/* Banner de foto skeleton */}
                <div className="relative h-36 w-full bg-secondary-container/80">
                  <div className="absolute left-3 top-3 h-5 w-24 rounded-full bg-surface/70" />
                  <div className="absolute right-3 top-3 h-5 w-20 rounded-full bg-surface/70" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                    <div className="h-4 w-32 rounded-full bg-white/70" />
                    <div className="h-4 w-16 rounded-full bg-white/70" />
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-44 rounded-full bg-secondary-container" />
                    <div className="h-5 w-16 rounded-full bg-secondary-container/80" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-5/6 rounded-full bg-secondary-container/70" />
                    <div className="h-3 w-3/5 rounded-full bg-secondary-container/60" />
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <div className="h-5 w-20 rounded-full bg-secondary-container/60" />
                    <div className="h-5 w-24 rounded-full bg-secondary-container/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center space-y-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-muted-foreground mx-auto">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="text-[17px] font-extrabold text-foreground">
              {DONDE_COMER_COPY.emptyTitle}
            </h2>
            <p className="text-[13px] font-semibold text-muted-foreground">
              {DONDE_COMER_COPY.emptyDesc}
            </p>
            <button
              type="button"
              onClick={cleanAllFilters}
              className="rounded-full bg-primary px-5 py-2 text-[14px] font-bold text-primary-foreground shadow-xs active:scale-95"
            >
              Limpiar
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{DONDE_COMER_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{DONDE_COMER_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{DONDE_COMER_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* HERO IHC SUTIL: ALMORZAR EN GRUPO (LIMPIO Y SIN SOBRECARGA) */}
            {!searchQuery.trim() && (
              <div
                onClick={() => openMesaModal(restaurants[0])}
                className="cursor-pointer relative overflow-hidden rounded-[24px] bg-hero-gradient p-4 text-image-foreground shadow-md ring-2 ring-primary/40 active:scale-[0.98] transition-all hover:shadow-lg"
              >
                {/* Círculos decorativos */}
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-image-foreground/15" />
                <div aria-hidden className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-image-foreground/10" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface text-foreground text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <span>Nuevo · Mesa con amigos</span>
                    </div>
                    <h2 className="text-[19px] font-black text-image-foreground leading-tight">
                      ¡Almuerza en grupo y ganen juntos! 🎉
                    </h2>
                    <p className="text-[12.5px] font-semibold text-image-foreground/90 leading-snug">
                      Crea una mesa, comparte tu QR y coordinen el almuerzo en 1 toque.
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[12.5px] font-black text-foreground shadow-sm">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Crear mesa</span>
                      <span aria-hidden>→</span>
                    </div>
                  </div>
                  <div className="grid h-14 w-14 shrink-0 animate-bounce place-items-center rounded-2xl bg-surface text-foreground shadow-md">
                    <Users className="h-7 w-7" />
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 1: "Tu plan" (Requerido para test E2E) */}
            {planRestaurants.length > 0 && !searchQuery.trim() && !filterOfertas && (
              <section className="space-y-2">
                <h2 className="text-[15px] font-black text-foreground">Tu plan</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {planRestaurants.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setSelectedRestaurant(res)}
                      className="flex flex-col items-center gap-1.5 focus:outline-hidden active:scale-95 transition-transform shrink-0"
                    >
                      {res.coverImage || res.logoUrl ? (
                        <div className="relative">
                          <img
                            src={res.coverImage || res.logoUrl!}
                            alt={res.name}
                            className="h-14 w-14 rounded-2xl object-cover border border-border shadow-xs"
                          />
                          <div className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px]">
                            🎟️
                          </div>
                        </div>
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-container text-[18px] font-black text-foreground shadow-xs">
                          {getMonogram(res.name)}
                        </div>
                      )}
                      <span className="text-[12px] font-bold text-foreground truncate max-w-[84px] text-center">
                        {res.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN 2: "Ofertas hoy" (flash de hoy y promos horas muertas) */}
            {todayOfferEntries.length > 0 && !filterConPlan && (
              <section className="space-y-2" data-testid="ofertas-hoy">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-primary" />
                  <h2 className="text-[15px] font-black text-foreground">Ofertas hoy</h2>
                </div>
                <div className="space-y-2">
                  {todayOfferEntries.map(({ res, offer }) => {
                    const canReserve = Boolean(onReserveOffer) && offer.precioCents > 0;
                    return (
                      <div
                        key={offer.id}
                        onClick={() => setSelectedRestaurant(res)}
                        className="rounded-[22px] border border-primary/30 bg-gradient-to-r from-background to-primary-container p-3 shadow-xs flex items-center justify-between gap-2 cursor-pointer hover:border-primary active:scale-[0.99] transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {res.coverImage ? (
                            <img
                              src={res.coverImage}
                              alt={res.name}
                              className="h-12 w-12 shrink-0 rounded-2xl object-cover border border-border"
                            />
                          ) : (
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-container text-[16px] font-black text-foreground">
                              {getMonogram(res.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-[14px] font-extrabold text-foreground truncate">
                              {res.name}
                            </h3>
                            <span
                              data-testid="oferta-badge"
                              className="block text-[13px] font-bold leading-tight text-primary"
                            >
                              {offer.badge}
                            </span>
                            <span className="block truncate text-[13px] font-semibold text-foreground">
                              {offer.titulo}
                            </span>
                            {offer.precio && (
                              <span className="block text-[13px] font-semibold text-muted-foreground">
                                <span className="font-black text-foreground">{offer.precio}</span>
                                {offer.precioOriginal && (
                                  <span className="ml-1 line-through">{offer.precioOriginal}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        {canReserve ? (
                          <button
                            type="button"
                            disabled={!offer.vigenteAhora}
                            aria-label={`Reservar ${offer.titulo}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReserveOffer?.(offer);
                            }}
                            className="rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground shrink-0 shadow-xs active:scale-95 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
                          >
                            {offer.vigenteAhora ? "Reservar" : "Fuera de horario"}
                          </button>
                        ) : (
                          <span className="rounded-full bg-primary px-3.5 py-1 text-[13px] font-bold text-primary-foreground shrink-0 shadow-xs">
                            Ver
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECCIÓN 3: "Cerca de ti" (TARJETAS LIMPIAS, MÍNIMO ESFUERZO) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-black text-foreground">Cerca de ti</h2>
                <span className="text-[12px] font-semibold text-muted-foreground">
                  {filteredRestaurants.length} locales
                </span>
              </div>

              {filteredRestaurants.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-muted-foreground mx-auto">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-[17px] font-extrabold text-foreground">Sin resultados</h3>
                  <button
                    type="button"
                    onClick={cleanAllFilters}
                    className="rounded-full bg-primary px-5 py-2 text-[14px] font-bold text-primary-foreground shadow-xs active:scale-95"
                  >
                    Limpiar
                  </button>
                </div>
              ) : (
                filteredRestaurants.map((res) => {
                  const walkingMin = Math.max(2, Math.round(res.distanceKm * 12));

                  return (
                    <div
                      key={res.id}
                      onClick={() => setSelectedRestaurant(res)}
                      className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-border bg-surface shadow-xs transition-all hover:border-primary hover:shadow-sm active:scale-[0.99]"
                    >
                      {/* Portada fotográfica con badges flotantes */}
                      <div className="relative h-28 w-full overflow-hidden bg-background">
                        {res.coverImage ? (
                          <img
                            src={res.coverImage}
                            alt={res.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-primary-container text-[24px] font-black text-foreground">
                            {getMonogram(res.name)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-scrim/60 via-transparent to-scrim/20" />

                        {/* Badges superiores */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <OccupancyChip status={res.occupancy} />
                          <span className="rounded-full bg-scrim/55 px-2 py-0.5 text-[11px] font-bold text-image-foreground backdrop-blur-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{res.distanceKm} km · {walkingMin} min</span>
                          </span>
                        </div>

                        {/* Nombre del local */}
                        <div className="absolute bottom-2 left-3 right-3 text-image-foreground">
                          <h3 className="text-[16px] font-black leading-tight truncate drop-shadow-xs">
                            {res.name}
                          </h3>
                        </div>
                      </div>

                      {/* Cuerpo de la tarjeta simplificado (Ley del Mínimo Esfuerzo) */}
                      <div className="p-3 space-y-2">
                        {/* Menú del día claro y directo (requerido por tests con "Hoy:") */}
                        <p className="text-[13px] font-extrabold text-foreground truncate">
                          Hoy: {res.featuredDish}
                        </p>

                        {/* Ofertas del local con su badge según modalidad */}
                        {offersOf(res).slice(0, 2).map((offer) => (
                          <div
                            key={offer.id}
                            className="flex items-center justify-between gap-2 rounded-xl bg-primary-container px-2.5 py-1.5"
                          >
                            <span
                              data-testid="oferta-badge"
                              className="text-[13px] font-extrabold leading-tight text-primary"
                            >
                              {offer.badge}
                            </span>
                            {onReserveOffer && offer.precioCents > 0 && (
                              <button
                                type="button"
                                disabled={!offer.vigenteAhora}
                                aria-label={`Reservar ${offer.titulo} en ${res.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReserveOffer(offer);
                                }}
                                className="shrink-0 rounded-full bg-primary px-3 py-1 text-[13px] font-bold text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
                              >
                                {offer.vigenteAhora ? "Reservar" : "Fuera de horario"}
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Precios directos y sin ruido */}
                        <div className="flex items-center justify-between text-[12px]">
                          <div>
                            <span className="font-black text-primary text-[14px]">
                              {res.precioSuelto || "$3,00"}
                            </span>
                            <span className="text-muted-foreground text-[11px] ml-1.5 font-medium">
                              (Desde {res.precioPlan || "$2,75"} con plan)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {res.breakfasts?.some((b) => !b.agotado) && (
                              <span className="text-[10px] font-extrabold text-primary bg-primary-container px-2 py-0.5 rounded-full">
                                ☀️ Desayunos
                              </span>
                            )}
                            {res.hasPlan && (
                              <span className="text-[10px] font-extrabold text-primary bg-primary-container px-2 py-0.5 rounded-full">
                                🎟️ Plan activo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fila de Acciones limpias: Ver Menú + Mesa + Pedir */}
                        <div className="flex items-center gap-2 pt-1 border-t border-border">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRestaurant(res);
                            }}
                            className="flex-1 rounded-full bg-primary-container py-1.5 text-[12px] font-extrabold text-foreground active:scale-95 transition-all hover:bg-primary-container flex items-center justify-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Ver Menú</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMesaModal(res);
                            }}
                            className="rounded-full bg-background border border-border px-3 py-1.5 text-[12px] font-extrabold text-primary active:scale-95 transition-all hover:bg-primary-container flex items-center gap-1"
                            title="Armar mesa con amigos"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>Mesa</span>
                          </button>

                          {res.hasMenu && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUndoSeconds(10);
                                onOrderSuccess?.("42");
                              }}
                              className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-primary-foreground shadow-xs hover:bg-primary-hover active:scale-95 transition-all"
                            >
                              Pedir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </>
        )}
      </main>

      {/* MODAL DEL MAPA INTERACTIVO Y UBICACIÓN CON RANGOS Y RUTAS */}
      <InteractiveMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        restaurants={restaurants}
        selectedZone={selectedZone || null}
        onSelectZone={(zone) => {
          onSelectZone?.(zone);
        }}
        onOpenFicha={(r) => {
          setSelectedRestaurant(r);
        }}
      />

      {/* Ficha Completa del Local */}
      <FichaLocalModal
        isOpen={Boolean(selectedRestaurant)}
        onClose={() => setSelectedRestaurant(null)}
        restaurantId={selectedRestaurant?.id || "r1"}
        restaurantName={selectedRestaurant?.name || ""}
        distanceKm={selectedRestaurant?.distanceKm || 0.5}
        occupancy={selectedRestaurant?.occupancy || "LIBRE"}
        hasPlanInRestaurant={selectedRestaurant?.hasPlan || false}
        soups={selectedRestaurant?.soups}
        soldOutSoups={selectedRestaurant?.soldOutSoups}
        mains={selectedRestaurant?.mains}
        juice={selectedRestaurant?.juice}
        dessert={selectedRestaurant?.dessert}
        breakfasts={selectedRestaurant?.breakfasts}
        precioSuelto={selectedRestaurant?.precioSuelto}
        precioPlan={selectedRestaurant?.precioPlan}
        coverImage={selectedRestaurant?.coverImage}
        onOpenMesa={() => {
          if (selectedRestaurant) openMesaModal(selectedRestaurant);
        }}
        onOrderSuccess={(orderNum, details) => {
          setSelectedRestaurant(null);
          setUndoSeconds(10);
          onOrderSuccess?.(orderNum, details);
        }}
      />

      {/* Modal Mesa con amigos & Código QR */}
      <MesaAmigosModal
        isOpen={isMesaOpen}
        onClose={() => setIsMesaOpen(false)}
        restaurantId={mesaRestaurant?.id || "r1"}
        restaurantName={mesaRestaurant?.name || "La Cuchara de San Blas"}
      />

      {/* Búfer de Deshacer de 10s */}
      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => setUndoSeconds(0)}
          label="Pedido enviado · Deshacer"
        />
      )}
    </div>
  );
};
