import React, { useState } from "react";
import {
  CajaView,
  CobrarPaseModal,
  PedidosEnCaminoView,
  ClientesPlanesView,
  CrearEditarPlanModal,
  PasarCartulinaModal,
  MenuDiaView,
  OfertaFlashModal,
  BuzonOpinionesView,
  CierreCajaView,
  MasAjustesView,
} from "@/components/dueno";
import { AppShell } from "@/components/bocadoo/ui";
import type { ComponentState } from "@/design-system";

export interface EstadosDuenoProps {
  initialScreen?: string | undefined;
  initialState?: ComponentState | undefined;
  chrome?: string | undefined;
}

export default function EstadosDueno({
  initialScreen = "caja",
  initialState = "exito",
  chrome: propChrome,
}: EstadosDuenoProps) {
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const paramScreen = searchParams?.get("pantalla") || initialScreen;
  const paramState =
    (searchParams?.get("estado") as ComponentState) || initialState;
  const paramOutcome = (searchParams?.get("resultado")?.toUpperCase() || searchParams?.get("outcome")?.toUpperCase() || "VERDE") as "VERDE" | "MORADO" | "ROJO";
  const paramPublished = searchParams?.get("publicada") === "1";
  const paramRole = (searchParams?.get("role") as "dueno" | "cajero") || "dueno";
  const showChrome =
    propChrome !== "0" && searchParams?.get("chrome") !== "0";

  const [selectedScreen, setSelectedScreen] = useState(paramScreen);
  const [selectedState, setSelectedState] = useState<ComponentState>(paramState);

  const screens = [
    { id: "caja", name: "1. Caja" },
    { id: "cobrar", name: "2. Cobrar pase" },
    { id: "pedidos", name: "3. Pedidos en camino" },
    { id: "clientes", name: "4. Clientes" },
    { id: "plan", name: "5. Crear/Editar plan" },
    { id: "cartulina", name: "6. Pasar cartulina" },
    { id: "menu", name: "7. Menú de hoy" },
    { id: "oferta", name: "8. Oferta flash" },
    { id: "opiniones", name: "9. Opiniones" },
    { id: "cierre", name: "10. Cierre de caja" },
    { id: "ajustes", name: "11. Ajustes" },
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
      data-testid="estados-dueno-ready"
      className={
        showChrome
          ? "min-h-screen bg-background p-4 font-sans"
          : "h-screen w-screen overflow-hidden bg-surface"
      }
    >
      {showChrome && (
        <div className="mx-auto max-w-xl mb-6 rounded-2xl bg-surface p-4 shadow-xs border border-border">
          <h2 className="text-[17px] font-black text-foreground mb-2">
            Visor de Estados Etapa 3 (Dueño / Cajero)
          </h2>

          {/* Pantallas */}
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

          {/* Estados */}
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

      {/* Marco de teléfono */}
      <div className={showChrome ? "mx-auto flex justify-center" : "h-full w-full"}>
        <AppShell>
          <div className="flex h-full flex-col bg-surface">
            {selectedScreen === "caja" && <CajaView role={paramRole} state={selectedState} />}

            {/* 2. Cobrar pase abierto en contexto sobre Caja */}
            {selectedScreen === "cobrar" && (
              <div className="relative h-full overflow-hidden">
                <CajaView role={paramRole} state="exito" />
                <CobrarPaseModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                  outcome={paramOutcome}
                  dinerName="Carlos Mejía"
                  remainingLunches={paramOutcome === "MORADO" ? 1 : paramOutcome === "ROJO" ? 0 : 13}
                />
              </div>
            )}

            {selectedScreen === "pedidos" && (
              <PedidosEnCaminoView state={selectedState} />
            )}

            {selectedScreen === "clientes" && (
              <ClientesPlanesView state={selectedState} />
            )}

            {/* 5. Crear / Editar plan en contexto sobre Clientes */}
            {selectedScreen === "plan" && (
              <div className="relative h-full overflow-hidden">
                <ClientesPlanesView state="exito" />
                <CrearEditarPlanModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                />
              </div>
            )}

            {/* 6. Pasar cartulina en contexto sobre Caja */}
            {selectedScreen === "cartulina" && (
              <div className="relative h-full overflow-hidden">
                <CajaView role={paramRole} state="exito" />
                <PasarCartulinaModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                />
              </div>
            )}

            {selectedScreen === "menu" && <MenuDiaView state={selectedState} />}

            {/* 8. Oferta flash en contexto sobre Caja */}
            {selectedScreen === "oferta" && (
              <div className="relative h-full overflow-hidden">
                <CajaView role={paramRole} state="exito" />
                <OfertaFlashModal
                  isOpen={true}
                  onClose={() => {}}
                  state={selectedState}
                  initialPublished={paramPublished}
                />
              </div>
            )}

            {selectedScreen === "opiniones" && (
              <BuzonOpinionesView state={selectedState} />
            )}

            {selectedScreen === "cierre" && (
              <CierreCajaView role={paramRole} state={selectedState} />
            )}

            {selectedScreen === "ajustes" && (
              <MasAjustesView currentRole={paramRole} state={selectedState} />
            )}
          </div>
        </AppShell>
      </div>
    </div>
  );
}
