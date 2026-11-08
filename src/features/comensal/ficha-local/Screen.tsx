import React, { useState } from "react";
import {
  Utensils,
  AlertCircle,
  WifiOff,
  Loader2,
  Check,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { FICHA_LOCAL_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface FichaLocalScreenProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string | undefined;
  restaurantName?: string | undefined;
  distanceKm?: number | undefined;
  occupancy?: "LIBRE" | "MOVIDO" | "LLENO" | undefined;
  hasPlan?: boolean | undefined;
  hasPlanInRestaurant?: boolean | undefined;
  hasActiveOrderLimit?: boolean | undefined;
  soups?: string[] | undefined;
  /** Sopas que el dueño marcó "Se acabó": se ven pero no se pueden elegir. */
  soldOutSoups?: string[] | undefined;
  mains?: Array<{ id: string; nombre: string; precio?: string; foto?: string; veggie?: boolean; agotado?: boolean }> | undefined;
  juice?: string | undefined;
  dessert?: string | undefined;
  precioSuelto?: string | undefined;
  precioPlan?: string | undefined;
  coverImage?: string | undefined;
  onOrderSuccess?: ((orderNumber: string, orderDetails?: { soup: string; main: string; paraLlevar: boolean }) => void) | undefined;
  onOpenMesa?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const FichaLocalScreen: React.FC<FichaLocalScreenProps> = ({
  isOpen,
  onClose,
  restaurantId = "r1",
  restaurantName = "La Cuchara de San Blas",
  distanceKm = 0.3,
  occupancy = "LIBRE",
  hasPlanInRestaurant = true,
  hasActiveOrderLimit = false,
  soups = ["Locro de papa con queso y aguacate", "Sopa criolla de verduras"],
  soldOutSoups = [],
  mains = [
    {
      id: "m1",
      nombre: "Seco de pollo tierno con maduro frito",
      precio: "$3,00",
      foto: "/dishes/pollo-plancha.jpg",
    },
    {
      id: "m2",
      nombre: "Chuleta ahumada al grill con menestra",
      precio: "$3,25",
      foto: "/dishes/pollo-plancha.jpg",
    },
    {
      id: "m3",
      nombre: "Bowl veggie de quinoa y champiñones",
      precio: "$3,25",
      foto: "/dishes/bowl-quinoa.jpg",
      veggie: true,
    },
  ],
  juice = "Jugo natural de naranjilla",
  dessert = "Higos con queso fresco",
  precioSuelto = "$3,00",
  precioPlan = "$2,75",
  coverImage = "/dishes/locro-papa.jpg",
  onOrderSuccess,
  onOpenMesa,
  onRetry,
  state = "exito",
}) => {
  // Por defecto se elige el primer plato que todavía hay (nunca uno agotado)
  const [selectedSoup, setSelectedSoup] = useState<string>(
    soups.find((s) => !soldOutSoups.includes(s)) || soups[0] || "Locro de papa con queso",
  );
  const [selectedMain, setSelectedMain] = useState<string>(
    mains.find((m) => !m.agotado)?.nombre || mains[0]?.nombre || "Seco de pollo con maduro",
  );
  const [paraLlevar, setParaLlevar] = useState<boolean>(false);

  const handleOrder = () => {
    if (hasActiveOrderLimit) return;
    const orderNumber = "42";
    if (onOrderSuccess) onOrderSuccess(orderNumber, { soup: selectedSoup, main: selectedMain, paraLlevar });
    onClose();
  };

  const occColor =
    occupancy === "LIBRE"
      ? "text-success bg-success-container"
      : occupancy === "MOVIDO"
      ? "text-primary bg-primary-container"
      : "text-on-danger-container bg-danger-container";

  const occText =
    occupancy === "LIBRE"
      ? "🟢 Fluido · Llegas y te sientas"
      : occupancy === "MOVIDO"
      ? "🟡 Movido · Hora pico"
      : "🔴 Lleno · Espera ~15 min";

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={restaurantName}>
        <div className="space-y-4 py-1 pb-3">
          {state === "cargando" && (
            <div role="status" className="space-y-4 animate-pulse">
              <span className="sr-only">Cargando menú del local...</span>
              {/* Foto de portada skeleton */}
              <div className="h-44 w-full rounded-2xl bg-secondary-container/80" />

              {/* Fila de etiquetas de estado y ubicación */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-28 rounded-full bg-secondary-container" />
                <div className="h-6 w-36 rounded-full bg-secondary-container/80" />
              </div>

              {/* Opciones de platos */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="h-4 w-32 rounded-full bg-secondary-container" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 rounded-2xl border border-border bg-background p-2.5 space-y-1.5">
                    <div className="h-3 w-20 rounded-full bg-secondary-container" />
                    <div className="h-2.5 w-14 rounded-full bg-secondary-container/70" />
                  </div>
                  <div className="h-16 rounded-2xl border border-border bg-background p-2.5 space-y-1.5">
                    <div className="h-3 w-20 rounded-full bg-secondary-container" />
                    <div className="h-2.5 w-14 rounded-full bg-secondary-container/70" />
                  </div>
                </div>

                <div className="h-4 w-36 rounded-full bg-secondary-container pt-1" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 rounded-2xl border border-border bg-background p-2.5 space-y-1.5">
                    <div className="h-3 w-24 rounded-full bg-secondary-container" />
                    <div className="h-2.5 w-16 rounded-full bg-secondary-container/70" />
                  </div>
                  <div className="h-16 rounded-2xl border border-border bg-background p-2.5 space-y-1.5">
                    <div className="h-3 w-24 rounded-full bg-secondary-container" />
                    <div className="h-2.5 w-16 rounded-full bg-secondary-container/70" />
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="h-14 w-full rounded-full bg-primary/20 mt-4" />
            </div>
          )}

          {state === "vacio" && (
            <div className="py-6 text-center">
              <Utensils className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-[17px] font-bold text-foreground">{FICHA_LOCAL_COPY.emptyMenu}</h3>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-[24px] bg-danger-container p-4 text-center text-on-danger-container border border-danger">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <h3 className="text-[15px] font-extrabold">{FICHA_LOCAL_COPY.errorMenu}</h3>
              <button
                type="button"
                onClick={onRetry || onClose}
                className="mt-3 rounded-full bg-danger px-5 py-1.5 text-[13px] font-bold text-danger-foreground active:scale-95"
              >
                Reintentar
              </button>
            </div>
          )}

          {state === "offline" && (
            <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" />
              <span>{FICHA_LOCAL_COPY.offlineNotice}</span>
            </div>
          )}

          {(state === "exito" || state === "offline") && (
            <>
              {/* Tarjeta de cabecera con foto, badges y precios */}
              <div className="relative overflow-hidden rounded-[24px] border border-border bg-background">
                <div className="h-28 w-full overflow-hidden relative">
                  <img
                    src={coverImage}
                    alt={restaurantName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-scrim/60 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-image-foreground">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${occColor}`}>
                      {occText}
                    </span>
                    <span className="text-[12px] font-bold flex items-center gap-1 bg-scrim/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{distanceKm} km · {Math.max(2, Math.round(distanceKm * 12))} min a pie</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-extrabold text-primary block">
                      {hasPlanInRestaurant ? "🎟️ Tienes almuerzos activos aquí" : "Planes ejecutivos disponibles"}
                    </span>
                    <span className="text-[13px] font-bold text-foreground">
                      Desde {precioPlan} con plan · {precioSuelto} suelto
                    </span>
                  </div>
                  {onOpenMesa && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMesa();
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-primary-container text-primary px-3 py-1.5 text-[12px] font-extrabold active:scale-95 transition-all hover:bg-primary-container"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Armar mesa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sección Sopa */}
              <div>
                <span className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {FICHA_LOCAL_COPY.soupTitle}
                </span>
                <div className="space-y-1.5">
                  {soups.map((s) => {
                    const soldOut = soldOutSoups.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSoup(s)}
                        aria-pressed={selectedSoup === s}
                        disabled={soldOut}
                        className={`w-full rounded-2xl p-3 text-left font-bold text-[13px] transition-all flex items-center justify-between gap-2 active:scale-[0.99] ${
                          soldOut
                            ? "cursor-not-allowed bg-background text-muted-foreground border border-border"
                            : selectedSoup === s
                            ? "bg-primary-container text-foreground border border-primary shadow-xs"
                            : "bg-background text-muted-foreground border border-border"
                        }`}
                      >
                        <span className={soldOut ? "line-through opacity-60" : ""}>{s}</span>
                        {soldOut ? (
                          <span className="shrink-0 rounded-full bg-danger-container px-2 py-0.5 text-[13px] font-black text-on-danger-container">
                            {FICHA_LOCAL_COPY.soldOut}
                          </span>
                        ) : (
                          selectedSoup === s && <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sección Segundo con fotos y opciones */}
              <div>
                <span className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {FICHA_LOCAL_COPY.mainTitle}
                </span>
                <div className="space-y-2">
                  {mains.map((m) => (
                    <button
                      key={m.id || m.nombre}
                      type="button"
                      onClick={() => setSelectedMain(m.nombre)}
                      aria-pressed={selectedMain === m.nombre}
                      disabled={m.agotado}
                      className={`w-full rounded-2xl p-2.5 text-left font-bold text-[13px] transition-all flex items-center justify-between gap-2 active:scale-[0.99] ${
                        m.agotado
                          ? "cursor-not-allowed bg-background text-muted-foreground border border-border"
                          : selectedMain === m.nombre
                          ? "bg-primary-container text-foreground border border-primary shadow-xs"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 min-w-0 ${m.agotado ? "opacity-60" : ""}`}>
                        {m.foto && (
                          <img
                            src={m.foto}
                            alt={m.nombre}
                            className={`h-11 w-11 shrink-0 rounded-xl object-cover border border-border ${m.agotado ? "grayscale" : ""}`}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`truncate text-foreground ${m.agotado ? "line-through" : ""}`}>{m.nombre}</span>
                            {m.veggie && (
                              <span className="text-[10px] font-extrabold bg-success-container text-success px-1.5 py-0.2 rounded-sm shrink-0">
                                Veggie
                              </span>
                            )}
                          </div>
                          {m.precio && <span className="text-[11px] font-bold text-primary">{m.precio}</span>}
                        </div>
                      </div>
                      {m.agotado ? (
                        <span className="shrink-0 rounded-full bg-danger-container px-2 py-0.5 text-[13px] font-black text-on-danger-container">
                          {FICHA_LOCAL_COPY.soldOut}
                        </span>
                      ) : (
                        selectedMain === m.nombre && <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bebida y Postre incluidos */}
              <div className="rounded-[20px] bg-background border border-border p-3 text-[12px] space-y-1">
                <span className="font-extrabold text-foreground block">Almuerzo completo incluye:</span>
                <p className="text-muted-foreground">
                  🥤 <strong className="text-foreground">Jugo:</strong> {juice}
                </p>
                <p className="text-muted-foreground">
                  🍮 <strong className="text-foreground">Postre:</strong> {dessert}
                </p>
              </div>

              {/* Selector Aquí vs Para llevar */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setParaLlevar(false)}
                  className={`flex-1 rounded-2xl py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                    !paraLlevar
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background text-foreground border border-border"
                  }`}
                >
                  Para comer aquí 🍽️
                </button>
                <button
                  type="button"
                  onClick={() => setParaLlevar(true)}
                  className={`flex-1 rounded-2xl py-2.5 text-[13px] font-bold transition-all active:scale-95 ${
                    paraLlevar
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background text-foreground border border-border"
                  }`}
                >
                  Para llevar 🥡 (+ $0,25)
                </button>
              </div>

              {/* Botón de Preordenar en 1 toque */}
              <div className="pt-2">
                <ButtonPrimary onClick={handleOrder} disabled={hasActiveOrderLimit}>
                  {FICHA_LOCAL_COPY.orderButton}
                </ButtonPrimary>
                {hasActiveOrderLimit && (
                  <p className="mt-2 text-center text-[13px] font-bold text-danger">
                    {FICHA_LOCAL_COPY.orderLimitNotice}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </>
  );
};
