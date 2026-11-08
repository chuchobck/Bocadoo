import React, { useState } from "react";
import {
  MiPaseView,
  DondeComerView,
  FichaLocalModal,
  MesaAmigosModal,
  UnirmeMesaView,
  EstadoPedidoModal,
  PerfilView,
} from "@/components/comensal";
import { AppShell } from "@/components/bocadoo/ui";
import type { ComponentState } from "@/design-system";

export interface EstadosComensalProps {
  initialScreen?: string | undefined;
  initialState?: ComponentState | undefined;
  chrome?: string | undefined;
}

export default function EstadosComensal({
  initialScreen = "pase",
  initialState = "exito",
  chrome: propChrome,
}: EstadosComensalProps) {
  // Leer query params si existen en la ventana
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const paramScreen = searchParams?.get("pantalla") || initialScreen;
  const paramState =
    (searchParams?.get("estado") as ComponentState) || initialState;
  const showChrome =
    propChrome !== "0" && searchParams?.get("chrome") !== "0";

  const [selectedScreen, setSelectedScreen] = useState(paramScreen);
  const [selectedState, setSelectedState] = useState<ComponentState>(paramState);

  const screens = [
    { id: "pase", name: "1. Mi pase" },
    { id: "comer", name: "2. Dónde comer" },
    { id: "ficha", name: "3. Ficha local" },
    { id: "sellos", name: "4. Mis sellos" },
    { id: "calificar", name: "5. Calificar" },
    { id: "mesa", name: "6. Mesa amigos" },
    { id: "unirme", name: "7. Unirme mesa" },
    { id: "pedido", name: "8. Tu pedido" },
    { id: "cuenta", name: "9. Mi cuenta" },
  ];

  const states: ComponentState[] = [
    "exito",
    "cargando",
    "vacio",
    "error",
    "offline",
  ];

  return (
    <div
      data-testid="estados-comensal-ready"
      className={
        showChrome
          ? "min-h-screen bg-background p-4 font-sans"
          : "h-screen w-screen overflow-hidden bg-surface"
      }
    >
      {showChrome && (
        <div className="mx-auto max-w-lg mb-6 rounded-2xl bg-surface p-4 shadow-xs border border-border">
          <h2 className="text-[17px] font-black text-foreground mb-2">
            Visor de Estados (Solo Dev)
          </h2>

          {/* Pantalla */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {screens.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScreen(sc.id)}
                className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all ${
                  selectedScreen === sc.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary-container text-foreground"
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>

          {/* Estado */}
          <div className="flex flex-wrap gap-1.5">
            {states.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all ${
                  selectedState === st
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground border border-border"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visor en marco de celular */}
      <div className={showChrome ? "mx-auto flex justify-center" : "h-full w-full"}>
        <AppShell>
          <div className="flex h-full flex-col bg-surface">
            {selectedScreen === "pase" && <MiPaseView state={selectedState} />}

            {selectedScreen === "comer" && (
              <DondeComerView state={selectedState} />
            )}

            {/* 3. Ficha local abierta en contexto sobre Dónde comer */}
            {selectedScreen === "ficha" && (
              <div className="relative h-full overflow-hidden">
                <DondeComerView state="exito" />
                <FichaLocalModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                />
              </div>
            )}

            {/* 4. Mis sellos abierta en contexto sobre Mi pase */}
            {selectedScreen === "sellos" && (
              <div className="relative h-full overflow-hidden">
                <MiPaseView state={selectedState} />
              </div>
            )}

            {/* 5. Calificar: los 5 estados distintos mostrados en contexto sobre Mi pase */}
            {selectedScreen === "calificar" && (
              <div className="relative h-full overflow-y-auto no-scrollbar">
                <MiPaseView
                  state="exito"
                  hasRecentRedemption={true}
                  feedbackState={selectedState}
                />
              </div>
            )}

            {/* 6. Mesa amigos abierta en contexto sobre Mi pase */}
            {selectedScreen === "mesa" && (
              <div className="relative h-full overflow-hidden">
                <MiPaseView state="exito" />
                <MesaAmigosModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                />
              </div>
            )}

            {selectedScreen === "unirme" && (
              <UnirmeMesaView state={selectedState} />
            )}

            {/* 8. Tu pedido abierta en contexto sobre Dónde comer */}
            {selectedScreen === "pedido" && (
              <div className="relative h-full overflow-hidden">
                <DondeComerView state="exito" />
                <EstadoPedidoModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                />
              </div>
            )}

            {selectedScreen === "cuenta" && <PerfilView state={selectedState} />}
          </div>
        </AppShell>
      </div>
    </div>
  );
}
