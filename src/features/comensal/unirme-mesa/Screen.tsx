import React, { useState } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  WifiOff,
  Loader2,
  CheckCircle2,
  Utensils,
  MapPin,
  Check,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { ButtonPrimary, TopBar } from "@/design-system";
import { UNIRME_MESA_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface UnirmeMesaMember {
  id: string;
  nombre: string;
  esAnfitrion?: boolean | undefined;
  sopa?: string | undefined;
  fuerte?: string | undefined;
  paraLlevar?: boolean | undefined;
}

export interface UnirmeMesaScreenProps {
  mesaId?: string | undefined;
  restaurantId?: string | undefined;
  restaurantName?: string | undefined;
  meetTime?: string | undefined;
  hostName?: string | undefined;
  occupancyLabel?: string | undefined;
  soups?: string[] | undefined;
  mains?: Array<{ id: string; nombre: string; precio?: string; foto?: string; veggie?: boolean }> | undefined;
  members?: UnirmeMesaMember[] | undefined;
  onJoinSuccess?: ((data: { nombre: string; sopa: string; fuerte: string; paraLlevar: boolean }) => void) | undefined;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const UnirmeMesaScreen: React.FC<UnirmeMesaScreenProps> = ({
  mesaId = "m1234",
  restaurantId = "r1",
  restaurantName = "La Cuchara de San Blas",
  meetTime = "13:00",
  hostName = "Carlos Mejía",
  occupancyLabel = "🟢 Fluido · Llegas y te sientas",
  soups = ["Locro de papa con queso y aguacate", "Sopa criolla tradicional"],
  mains = [
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
  ],
  members = [
    {
      id: "mem-host",
      nombre: "Carlos Mejía",
      esAnfitrion: true,
      sopa: "Locro de papa",
      fuerte: "Seco de pollo",
    },
  ],
  onJoinSuccess,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const [guestName, setGuestName] = useState("Valentina Ortiz");
  const [selectedSoup, setSelectedSoup] = useState<string>(soups[0] || "Locro de papa");
  const [selectedMain, setSelectedMain] = useState<string>(mains[0]?.nombre || "Seco de pollo");
  const [paraLlevar, setParaLlevar] = useState<boolean>(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    setJoined(true);
    if (onJoinSuccess) {
      onJoinSuccess({
        nombre: guestName.trim() || "Comensal invitado",
        sopa: selectedSoup,
        fuerte: selectedMain,
        paraLlevar,
      });
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar">
      <TopBar title={UNIRME_MESA_COPY.title} onBack={onBack} />

      <main className="flex-1 p-4 pb-12 flex flex-col justify-between space-y-4">
        {state === "cargando" && (
          <div role="status" className="flex-1 space-y-6 py-4 animate-pulse">
            <span className="sr-only">Cargando mesa...</span>
            {/* Tarjeta explicativa skeleton */}
            <div className="rounded-[28px] border border-border bg-surface p-5 space-y-2 text-center shadow-xs">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary-container" />
              <div className="mx-auto h-4 w-44 rounded-full bg-secondary-container mt-2" />
              <div className="mx-auto h-3 w-60 rounded-full bg-secondary-container/70" />
            </div>

            {/* Cajas de código PIN */}
            <div className="space-y-2 text-center">
              <div className="mx-auto h-3 w-36 rounded-full bg-secondary-container" />
              <div className="flex justify-center gap-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-14 rounded-2xl border border-border bg-surface"
                  />
                ))}
              </div>
            </div>

            {/* Botón de acción */}
            <div className="pt-6">
              <div className="h-14 w-full rounded-full bg-primary/20" />
            </div>
          </div>
        )}

        {state === "vacio" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
            <Users className="h-14 w-14 text-muted-foreground mb-2" />
            <h3 className="text-[20px] font-extrabold text-foreground">{UNIRME_MESA_COPY.emptyTitle}</h3>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{UNIRME_MESA_COPY.emptyDesc}</p>
            <div className="mt-6 w-full">
              <ButtonPrimary onClick={onBack || (() => {})}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
            <div className="rounded-2xl bg-danger-container p-6 text-center text-on-danger-container w-full">
              <AlertCircle className="mx-auto h-10 w-10 mb-2" />
              <h3 className="text-[17px] font-extrabold">{UNIRME_MESA_COPY.errorTitle}</h3>
              <button
                type="button"
                onClick={onRetry || (() => window.location.reload())}
                className="mt-4 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{UNIRME_MESA_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Tarjeta de Invitación */}
            <div className="rounded-[28px] bg-gradient-to-b from-background to-primary-container p-5 border border-border text-center space-y-2 shadow-xs">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface text-primary shadow-xs">
                <Users className="h-7 w-7" />
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-surface text-primary text-[12px] font-extrabold shadow-2xs">
                <Sparkles className="h-3 w-3" />
                <span>Mesa #{mesaId.toUpperCase()}</span>
              </div>
              <h2 className="text-[20px] font-black text-foreground leading-tight">{restaurantName}</h2>
              <p className="text-[13px] font-semibold text-muted-foreground">
                Invitación creada por <span className="font-bold text-foreground">{hostName}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-foreground border border-border">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Almuerzo a las {meetTime}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-success border border-border">
                  <span>{occupancyLabel}</span>
                </div>
              </div>
            </div>

            {/* Quién eres (Nombre) */}
            <div className="rounded-[24px] bg-background border border-border p-3.5 space-y-1.5">
              <label className="text-[12px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Tu nombre en la mesa
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Escribe tu nombre"
                className="w-full rounded-xl bg-surface border border-border px-3.5 py-2 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
              <div className="flex gap-1.5 pt-0.5">
                {["Valentina Ortiz", "Mateo C.", "Diego S."].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGuestName(n)}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-primary hover:bg-primary-container"
                  >
                    + {n.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Menú: Sopa y Segundo en 1 toque */}
            <div className="space-y-3">
              <h3 className="text-[14px] font-extrabold text-foreground">Elige tu almuerzo de hoy</h3>

              {/* Sopa */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider block">
                  1. Sopa del día
                </span>
                <div className="space-y-1.5">
                  {soups.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSoup(s)}
                      className={`w-full rounded-2xl p-3 text-left font-bold text-[13px] transition-all flex items-center justify-between active:scale-[0.99] ${
                        selectedSoup === s
                          ? "bg-primary-container text-foreground border border-primary shadow-xs"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      <span>{s}</span>
                      {selectedSoup === s && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plato Fuerte */}
              <div className="space-y-1.5">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider block">
                  2. Plato fuerte
                </span>
                <div className="space-y-2">
                  {mains.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMain(m.nombre)}
                      className={`w-full rounded-2xl p-3 text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                        selectedMain === m.nombre
                          ? "bg-primary-container text-foreground border border-primary shadow-xs"
                          : "bg-background text-muted-foreground border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {m.foto && (
                          <img
                            src={m.foto}
                            alt={m.nombre}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[13px] text-foreground truncate">{m.nombre}</span>
                            {m.veggie && (
                              <span className="text-[10px] font-extrabold bg-success-container text-success px-1.5 py-0.2 rounded-sm shrink-0">
                                Veggie
                              </span>
                            )}
                          </div>
                          {m.precio && <span className="text-[11px] font-bold text-primary">{m.precio}</span>}
                        </div>
                      </div>
                      {selectedMain === m.nombre && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modalidad */}
              <div className="flex gap-2 pt-1">
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
            </div>

            {/* Quiénes están en la mesa */}
            <div className="rounded-[24px] bg-background border border-border p-3.5 space-y-2">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Compañeros en la mesa ({members.length})
              </span>
              <div className="space-y-1.5">
                {members.map((mem) => (
                  <div key={mem.id} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>{mem.nombre}</span>
                      {mem.esAnfitrion && (
                        <span className="text-[9px] uppercase px-1 rounded-sm bg-primary-container text-primary">
                          Host
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground truncate max-w-[140px] text-right">
                      {mem.fuerte || "Confirmado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de Unirse */}
            {joined ? (
              <div className="rounded-2xl bg-success-container border border-success/20 p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-success font-extrabold text-[15px]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{UNIRME_MESA_COPY.joinedBadge}</span>
                </div>
                <p className="text-[12px] font-semibold text-success">
                  Tu almuerzo ({selectedMain}) está reservado para las {meetTime}.
                </p>
                <p className="text-[12px] font-semibold text-success">
                  Se sumó al QR de la mesa de {hostName}. No necesitas hacer fila en caja.
                </p>
                <button
                  type="button"
                  onClick={onBack || (() => {})}
                  className="mt-2 w-full rounded-full bg-success text-success-foreground py-2.5 text-[13px] font-bold active:scale-95 shadow-xs"
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <ButtonPrimary onClick={handleJoin}>
                  {UNIRME_MESA_COPY.joinButton}
                </ButtonPrimary>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
