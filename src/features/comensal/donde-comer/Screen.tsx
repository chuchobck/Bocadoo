import React, { useState } from "react";
import { MapPin, AlertCircle, WifiOff, Loader2, Zap, Search } from "lucide-react";
import { OccupancyChip, UndoBanner, SearchInput } from "@/design-system";
import { FichaLocalModal } from "@/components/comensal/FichaLocalModal";
import { DONDE_COMER_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface RestaurantItem {
  id: string;
  name: string;
  distanceKm: number;
  occupancy: "LIBRE" | "MOVIDO" | "LLENO";
  featuredDish: string;
  hasPlan: boolean;
  hasMenu?: boolean;
  hasOffer?: boolean;
  logoUrl?: string | null;
}

export interface DondeComerScreenProps {
  restaurants?: RestaurantItem[] | undefined;
  onOrderSuccess?: ((orderNumber: string) => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  const first = parts[0] || "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] || "";
  return ((first[0] || "") + (second[0] || "")).toUpperCase() || "B";
}

export const DondeComerScreen: React.FC<DondeComerScreenProps> = ({
  restaurants = [
    {
      id: "r1",
      name: "La Cuchara de San Blas",
      distanceKm: 0.3,
      occupancy: "LIBRE",
      featuredDish: "Seco de pollo con maduro",
      hasPlan: true,
      hasMenu: true,
      hasOffer: true,
    },
    {
      id: "r2",
      name: "El Fogón Quiteño",
      distanceKm: 0.8,
      occupancy: "MOVIDO",
      featuredDish: "Locro de papa con queso",
      hasPlan: true,
      hasMenu: true,
      hasOffer: false,
    },
    {
      id: "r3",
      name: "Picantería Los Andes",
      distanceKm: 1.2,
      occupancy: "LLENO",
      featuredDish: "Fritada tradicional",
      hasPlan: false,
      hasMenu: false,
      hasOffer: false,
    },
  ],
  onOrderSuccess,
  onRetry,
  state = "exito",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCerca, setFilterCerca] = useState(false);
  const [filterConPlan, setFilterConPlan] = useState(false);
  const [filterLibre, setFilterLibre] = useState(false);
  const [filterOfertas, setFilterOfertas] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);
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
      if (!matchName && !matchDish) return false;
    }
    if (filterCerca && r.distanceKm >= 1.0) return false;
    if (filterConPlan && !r.hasPlan) return false;
    if (filterLibre && r.occupancy !== "LIBRE") return false;
    if (filterOfertas && !r.hasOffer) return false;
    return true;
  });

  const planRestaurants = restaurants.filter((r) => r.hasPlan);
  const offerRestaurants = restaurants.filter((r) => r.hasOffer);

  return (
    <div
      tabIndex={0}
      aria-label="Dónde comer"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      {/* Buscador fijo arriba con SearchInput del kit y fila de 4 chips */}
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 space-y-2.5">
        <h1 className="text-[20px] font-black text-[#4A0E78]">{DONDE_COMER_COPY.title}</h1>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar restaurante o plato"
        />

        <div className="grid grid-cols-4 gap-1.5 w-full">
          <button
            type="button"
            aria-pressed={filterCerca}
            onClick={() => setFilterCerca(!filterCerca)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 ${
              filterCerca
                ? "bg-[#7B2CBF] text-white shadow-xs"
                : "bg-[#F3E8FF] text-[#4A0E78]"
            }`}
          >
            {DONDE_COMER_COPY.filterNear}
          </button>
          <button
            type="button"
            aria-pressed={filterConPlan}
            onClick={() => setFilterConPlan(!filterConPlan)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 ${
              filterConPlan
                ? "bg-[#7B2CBF] text-white shadow-xs"
                : "bg-[#F3E8FF] text-[#4A0E78]"
            }`}
          >
            {DONDE_COMER_COPY.filterWithPlan}
          </button>
          <button
            type="button"
            aria-pressed={filterLibre}
            onClick={() => setFilterLibre(!filterLibre)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 ${
              filterLibre
                ? "bg-[#7B2CBF] text-white shadow-xs"
                : "bg-[#F3E8FF] text-[#4A0E78]"
            }`}
          >
            {DONDE_COMER_COPY.filterFree}
          </button>
          <button
            type="button"
            aria-pressed={filterOfertas}
            onClick={() => setFilterOfertas(!filterOfertas)}
            className={`w-full rounded-full py-2 px-1 text-center text-[13px] font-bold transition-all active:scale-95 ${
              filterOfertas
                ? "bg-[#7B2CBF] text-white shadow-xs"
                : "bg-[#F3E8FF] text-[#4A0E78]"
            }`}
          >
            {DONDE_COMER_COPY.filterOffers}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 space-y-5">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">
              {DONDE_COMER_COPY.loadingTitle}
            </h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center space-y-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] mx-auto">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">
              {DONDE_COMER_COPY.emptyTitle}
            </h2>
            <p className="text-[13px] font-semibold text-[#6B5B7B]">
              {DONDE_COMER_COPY.emptyDesc}
            </p>
            <button
              type="button"
              onClick={cleanAllFilters}
              className="rounded-full bg-[#7B2CBF] px-5 py-2 text-[14px] font-bold text-white shadow-xs active:scale-95"
            >
              Limpiar
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{DONDE_COMER_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{DONDE_COMER_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{DONDE_COMER_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* SECCIÓN 1: "Tu plan" (fila horizontal de logos donde tiene plan, 1 toque abre ficha) */}
            {planRestaurants.length > 0 && !searchQuery.trim() && !filterOfertas && (
              <section className="space-y-2">
                <h2 className="text-[15px] font-black text-[#4A0E78]">Tu plan</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                  {planRestaurants.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setSelectedRestaurant(res)}
                      className="flex flex-col items-center gap-1.5 focus:outline-none active:scale-95 transition-transform"
                    >
                      {res.logoUrl ? (
                        <img
                          src={res.logoUrl}
                          alt={res.name}
                          className="h-14 w-14 rounded-2xl object-cover border border-[#E7E1F2] shadow-xs"
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F3E8FF] text-[18px] font-black text-[#4A0E78] shadow-xs">
                          {getMonogram(res.name)}
                        </div>
                      )}
                      <span className="text-[13px] font-bold text-[#4A0E78] truncate max-w-[84px] text-center">
                        {res.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN 2: "Ofertas hoy" (solo si hay ofertas activas) */}
            {offerRestaurants.length > 0 && !filterConPlan && (
              <section className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#7B2CBF]" />
                  <h2 className="text-[15px] font-black text-[#4A0E78]">Ofertas hoy</h2>
                </div>
                <div className="space-y-2">
                  {offerRestaurants.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedRestaurant(res)}
                      className="rounded-[24px] border border-[#E7E1F2] bg-[#FAF8FC] p-3 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#7B2CBF] active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {res.logoUrl ? (
                          <img
                            src={res.logoUrl}
                            alt={res.name}
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-[#E7E1F2]"
                          />
                        ) : (
                          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F3E8FF] text-[18px] font-black text-[#4A0E78]">
                            {getMonogram(res.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-extrabold text-[#4A0E78] truncate">
                            {res.name}
                          </h3>
                          <span className="text-[13px] font-bold text-[#7B2CBF]">
                            Oferta flash activa
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#7B2CBF] px-3.5 py-1 text-[13px] font-bold text-white shrink-0">
                        Ver
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECCIÓN 3: "Cerca de ti" */}
            <section className="space-y-3">
              <h2 className="text-[15px] font-black text-[#4A0E78]">Cerca de ti</h2>

              {filteredRestaurants.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] mx-auto">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-[17px] font-extrabold text-[#4A0E78]">Sin resultados</h3>
                  <button
                    type="button"
                    onClick={cleanAllFilters}
                    className="rounded-full bg-[#7B2CBF] px-5 py-2 text-[14px] font-bold text-white shadow-xs active:scale-95"
                  >
                    Limpiar
                  </button>
                </div>
              ) : (
                filteredRestaurants.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedRestaurant(res)}
                    className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-[#E7E1F2] bg-white p-3.5 shadow-xs transition-all hover:border-[#7B2CBF] active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo 56px o monograma con iniciales sobre lila (#F3E8FF, texto #4A0E78) */}
                      {res.logoUrl ? (
                        <img
                          src={res.logoUrl}
                          alt={res.name}
                          className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-[#E7E1F2]"
                        />
                      ) : (
                        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#F3E8FF] text-[18px] font-black text-[#4A0E78]">
                          {getMonogram(res.name)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-[15px] font-extrabold text-[#4A0E78] truncate">
                            {res.name}
                          </h3>
                          <OccupancyChip status={res.occupancy} />
                        </div>

                        <div className="flex items-center gap-1 text-[13px] font-semibold text-[#6B5B7B] mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>a {res.distanceKm} km</span>
                        </div>

                        {/* Línea Hoy: <plato> (sin descripción larga) */}
                        <p className="mt-1 text-[13px] font-bold text-[#4A0E78] truncate">
                          Hoy: {res.featuredDish}
                        </p>
                      </div>
                    </div>

                    {/* Pedir en 1 toque con Deshacer de 10s cuando el local tiene menú publicado */}
                    {res.hasMenu && (
                      <div className="mt-2.5 flex justify-end border-t border-[#E7E1F2] pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUndoSeconds(10);
                            onOrderSuccess?.("42");
                          }}
                          className="rounded-full bg-[#7B2CBF] px-4 py-1.5 text-[13px] font-bold text-white shadow-xs hover:bg-[#6A24A6] active:scale-95 transition-all"
                        >
                          Pedir
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>

      <FichaLocalModal
        isOpen={Boolean(selectedRestaurant)}
        onClose={() => setSelectedRestaurant(null)}
        restaurantName={selectedRestaurant?.name || ""}
        distanceKm={selectedRestaurant?.distanceKm || 0.5}
        occupancy={selectedRestaurant?.occupancy || "LIBRE"}
        hasPlan={selectedRestaurant?.hasPlan || false}
        onOrderSuccess={(orderNum) => {
          setSelectedRestaurant(null);
          setUndoSeconds(10);
          onOrderSuccess?.(orderNum);
        }}
      />

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
