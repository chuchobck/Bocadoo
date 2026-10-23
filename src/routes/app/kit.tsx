import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Utensils,
  UserRound,
  Store,
  Settings,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonGhost,
  BigNumber,
  Card,
  PassCard,
  Chip,
  Badge,
  ToggleSwitch,
  InputField,
  SearchInput,
  BottomSheet,
  ScanResultOverlay,
  UndoBanner,
  NavBar,
  TopBar,
  OccupancyChip,
  StampCard,
  DishCard,
  FeedbackCard,
  QuickPayBar,
  StateFeedback,
  type ComponentState,
} from "@/design-system";

export const Route = createFileRoute("/app/kit")({
  head: () => ({
    meta: [
      { title: "Kit de Diseño — Bocadoo" },
      { name: "description", content: "Los 22 componentes de Bocadoo con estados de interacción y los 5 estados obligatorios." },
    ],
  }),
  component: KitPage,
});

function KitPage() {
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [interactiveState, setInteractiveState] = useState<ComponentState>("exito");

  // Estados interactivos para pruebas
  const [toggleVal, setToggleVal] = useState(true);
  const [chipSelected, setChipSelected] = useState(true);
  const [searchVal, setSearchVal] = useState("La Cuchara");
  const [inputVal, setInputVal] = useState("0991234567");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scanResult, setScanResult] = useState<"VERDE" | "AVISO" | "ROJO" | null>(null);
  const [undoSeconds, setUndoSeconds] = useState(10);
  const [activeNav, setActiveNav] = useState("caja");
  const [dishSoldOut, setDishSoldOut] = useState(false);
  const [feedbackTag, setFeedbackTag] = useState("Rico");

  return (
    <div className="min-h-screen bg-[#F5F3FA] px-4 py-8 font-sans">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Cabecera Principal */}
        <header className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#7B2CBF] text-white shadow-[0_8px_20px_rgba(123,44,191,0.25)]">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-[28px] font-extrabold text-[#4A0E78]">Kit de Diseño Bocadoo</h1>
          <p className="mt-1 text-[15px] font-semibold text-[#6B5B7B]">
            22 componentes auditados según la guía de identidad oficial.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[13px] font-bold text-[#6B5B7B]">Marco de referencia:</span>
            <button
              type="button"
              onClick={() => setPlatform(platform === "ios" ? "android" : "ios")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F3E8FF] px-4 py-1.5 text-[13px] font-bold text-[#7B2CBF] transition-transform active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>{platform.toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            SECCIÓN A: PANTALLA DE EJEMPLO CON LOS 5 ESTADOS OBLIGATORIOS (StateFeedback)
            ========================================================================= */}
        <section className="rounded-[32px] border border-[#E7E1F2] bg-white p-6 shadow-[0_8px_24px_rgba(74,14,120,0.06)]">
          <div className="mb-4 flex items-center justify-between border-b border-[#E7E1F2] pb-3">
            <div>
              <span className="text-[13px] font-bold text-[#7B2CBF]">Componente 22</span>
              <h2 className="text-[20px] font-extrabold text-[#4A0E78]">StateFeedback (Los 5 Estados)</h2>
            </div>
            <span className="text-[13px] font-semibold text-[#6B5B7B]">Pantalla de ejemplo</span>
          </div>

          <p className="mb-4 text-[13px] font-semibold text-[#6B5B7B]">
            Demostración de los 5 estados obligatorios exigidos en cada pantalla de Bocadoo:
          </p>

          {/* Selector de los 5 estados */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(["exito", "cargando", "vacio", "error", "offline"] as ComponentState[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setInteractiveState(st)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-all ${
                  interactiveState === st
                    ? "bg-[#7B2CBF] text-white shadow-sm"
                    : "bg-[#F3E8FF] text-[#4A0E78] hover:bg-[#EBD7FC]"
                }`}
              >
                {st === "exito" && "1. Éxito (Normal)"}
                {st === "cargando" && "2. Cargando"}
                {st === "vacio" && "3. Vacío"}
                {st === "error" && "4. Error"}
                {st === "offline" && "5. Sin conexión"}
              </button>
            ))}
          </div>

          <StateFeedback
            state={interactiveState}
            emptyTitle="Sin platos para hoy"
            emptyMessage="El restaurante aún no publica su menú. Vuelve a consultar al mediodía."
            errorMessage="No pudimos conectar con los restaurantes cercanos."
            loadingMessage="Cargando menú del día..."
            onRetry={() => {
              toast.info("Reintentando carga...");
              setInteractiveState("exito");
            }}
          >
            {/* Contenido en estado Éxito */}
            <div className="space-y-3 rounded-2xl bg-[#F5F3FA] p-4 border border-[#E7E1F2]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[17px] font-extrabold text-[#4A0E78]">La Cuchara de San Blas</h4>
                  <span className="text-[13px] font-semibold text-[#6B5B7B]">3 platos disponibles</span>
                </div>
                <OccupancyChip status="LIBRE" />
              </div>
              <DishCard
                name="Seco de pollo con maduro"
                priceFormatted="$3,00"
                category="Segundo"
                isSoldOut={dishSoldOut}
                onToggleSoldOut={setDishSoldOut}
              />
            </div>
          </StateFeedback>
        </section>

        {/* =========================================================================
            SECCIÓN B: PIEZAS SUELTAS (Estados de Interacción UI)
            ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-[#E7E1F2] pb-2">
            <h2 className="text-[20px] font-extrabold text-[#4A0E78]">Piezas Interactivas Sueltas</h2>
            <p className="text-[13px] font-semibold text-[#6B5B7B]">
              Estados: Normal, Presionado, Foco, Deshabilitado y Cargando.
            </p>
          </div>

          {/* 1. ButtonPrimary */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">1. ButtonPrimary (Acción principal)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Fondo #7B2CBF, alto ≥56px</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Normal</span>
                <ButtonPrimary onClick={() => toast.success("¡Acción ejecutada!")}>Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Presionado (Active)</span>
                <ButtonPrimary className="scale-[0.98] bg-[#6A22A9]">Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Foco (Focus ring)</span>
                <ButtonPrimary className="ring-4 ring-[#E0AAFF]">Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Deshabilitado</span>
                <ButtonPrimary disabled>Vender plan</ButtonPrimary>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[13px] font-bold text-[#6B5B7B]">Cargando</span>
                <ButtonPrimary state="cargando">Vender plan</ButtonPrimary>
              </div>
            </div>
          </div>

          {/* 2. ButtonSecondary */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">2. ButtonSecondary</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Fondo #F3E8FF, texto #4A0E78</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Normal</span>
                <ButtonSecondary onClick={() => toast.success("Secundario pulsado")}>Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Foco</span>
                <ButtonSecondary className="ring-4 ring-[#E0AAFF]">Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Deshabilitado</span>
                <ButtonSecondary disabled>Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B]">Cargando</span>
                <ButtonSecondary state="cargando">Pasar cartulina</ButtonSecondary>
              </div>
            </div>
          </div>

          {/* 3. ButtonGhost */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">3. ButtonGhost</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Acción sutil</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] block mb-1">Normal</span>
                <ButtonGhost>Descartar</ButtonGhost>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] block mb-1">Deshabilitado</span>
                <ButtonGhost disabled>Descartar</ButtonGhost>
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] block mb-1">Cargando</span>
                <ButtonGhost state="cargando">Descartar</ButtonGhost>
              </div>
            </div>
          </div>

          {/* 4. BigNumber */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">4. BigNumber (Cifras protagonistas)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">32px a 56px, peso 800</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BigNumber value="14" label="almuerzos disponibles" sublabel="Vence 30 oct" size="lg" />
              <BigNumber value="14" label="almuerzos disponibles" size="lg" state="cargando" />
            </div>
          </div>

          {/* 7. Chip & 8. Badge */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">7. Chip & 8. Badge</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Selección y estado funcional</p>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] block mb-1">Chips (Normal y Seleccionado):</span>
                <div className="flex gap-2">
                  <Chip
                    label="Con plan"
                    selected={chipSelected}
                    onToggle={() => setChipSelected(!chipSelected)}
                  />
                  <Chip label="Cerca" selected={false} onToggle={() => {}} />
                  <Chip label="Cargando" state="cargando" />
                </div>
              </div>

              <div>
                <span className="text-[13px] font-bold text-[#6B5B7B] block mb-1">Badges (Éxito, Aviso, Peligro):</span>
                <div className="flex flex-wrap gap-2">
                  <Badge label="Validado" tone="success" />
                  <Badge label="Último almuerzo" tone="warning" />
                  <Badge label="Vencido" tone="danger" />
                  <Badge label="Cargando" state="cargando" />
                </div>
              </div>
            </div>
          </div>

          {/* 9. ToggleSwitch */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">9. ToggleSwitch</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">iOS vs Material 3</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <ToggleSwitch checked={toggleVal} onChange={setToggleVal} platform={platform} />
                <span className="text-[13px] font-bold text-[#4A0E78]">
                  {platform.toUpperCase()}: {toggleVal ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#6B5B7B]">Deshabilitado:</span>
                <ToggleSwitch checked={false} onChange={() => {}} platform={platform} state="vacio" />
              </div>
            </div>
          </div>

          {/* 10. InputField & 11. SearchInput */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-4">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">10. InputField & 11. SearchInput</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">radio 16px, foco morado</p>
            </div>
            <div className="space-y-3">
              <InputField
                label="Celular del cliente"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <InputField
                label="Campo con error"
                value="abc"
                onChange={() => {}}
                errorMessage="Solo números permitidos"
                state="error"
              />
              <SearchInput
                value={searchVal}
                onChange={setSearchVal}
                placeholder="Buscar restaurante..."
              />
            </div>
          </div>

          {/* 14. UndoBanner (Renderizado en línea dentro del kit) */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">14. UndoBanner (10 segundos)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Renderizado en línea</p>
            </div>
            <div className="space-y-3">
              <UndoBanner
                inline
                secondsLeft={undoSeconds}
                onUndo={() => {
                  toast.success("¡Almuerzo devuelto con éxito!");
                  setUndoSeconds(10);
                }}
              />
              <UndoBanner inline secondsLeft={10} onUndo={() => {}} state="cargando" />
            </div>
          </div>

          {/* 15. NavBar & 16. TopBar */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-4">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">15. NavBar & 16. TopBar</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Barras fijas de la app</p>
            </div>
            <TopBar
              title="Caja de hoy"
              onBack={() => toast.info("Volver")}
              rightAction={<Badge label="Abierto" tone="success" />}
            />
            <div className="overflow-hidden rounded-2xl border border-[#E7E1F2]">
              <NavBar
                items={[
                  { id: "caja", label: "Caja", icon: <Utensils className="h-5 w-5" /> },
                  { id: "clientes", label: "Clientes", icon: <UserRound className="h-5 w-5" /> },
                  { id: "menu", label: "Menú", icon: <Store className="h-5 w-5" /> },
                  { id: "mas", label: "Más", icon: <Settings className="h-5 w-5" /> },
                ]}
                activeId={activeNav}
                onSelect={setActiveNav}
              />
            </div>
          </div>

          {/* 21. QuickPayBar */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">21. QuickPayBar (Cobro rápido)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Total 32px 800</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#E7E1F2]">
              <QuickPayBar
                totalFormatted="$6,00"
                onPayCash={() => toast.success("Cobrado en Efectivo")}
                onPayTransfer={() => toast.success("Cobrado con Transferencia")}
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN C: TARJETAS Y MODALES COMPLEJOS (5, 6, 12, 13, 18, 19, 20)
            ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-[#E7E1F2] pb-2">
            <h2 className="text-[20px] font-extrabold text-[#4A0E78]">Tarjetas y Modales</h2>
            <p className="text-[13px] font-semibold text-[#6B5B7B]">
              Superficies visuales completas.
            </p>
          </div>

          {/* 5. Card & 6. PassCard */}
          <div className="grid gap-4 md:grid-cols-2">
            <PassCard
              restaurantName="La Cuchara de San Blas"
              remainingLunches={14}
              expiryDate="30 oct"
            />
            <StampCard
              restaurantName="La Cuchara de San Blas"
              currentStamps={7}
              rewardTitle="Almuerzo gratis"
            />
          </div>

          {/* 20. FeedbackCard */}
          <FeedbackCard
            tags={["Rico", "Rápido", "Porción"]}
            selectedTag={feedbackTag}
            onSelectTag={setFeedbackTag}
          />

          {/* 12. BottomSheet */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">12. BottomSheet</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Cierre solo por usuario</p>
            </div>
            <ButtonSecondary onClick={() => setIsSheetOpen(true)}>
              Abrir hoja inferior de prueba
            </ButtonSecondary>
            <BottomSheet
              isOpen={isSheetOpen}
              onClose={() => setIsSheetOpen(false)}
              title="Opciones de cobro"
            >
              <p className="text-[15px] font-semibold text-[#4A0E78] pb-4">
                Esta hoja sólo llama a history.back() cuando tú tocas la X o el fondo. Si cambias de ruta en el menú, se desmonta limpiamente sin saltos de historial.
              </p>
              <ButtonPrimary onClick={() => setIsSheetOpen(false)}>
                Entendido
              </ButtonPrimary>
            </BottomSheet>
          </div>

          {/* 13. ScanResultOverlay: Verde, Aviso (morado medio), Rojo, Gris */}
          <div className="rounded-[28px] border border-[#E7E1F2] bg-white p-5 space-y-3">
            <div className="border-b border-[#E7E1F2] pb-2">
              <h3 className="text-[17px] font-extrabold text-[#4A0E78]">13. ScanResultOverlay</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-[#6B5B7B]">Verde, Aviso (morado medio), Rojo, Gris</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setScanResult("VERDE")}
                className="rounded-full bg-[#E6F6EC] px-4 py-2 text-[13px] font-bold text-[#157A41]"
              >
                Ver Verde (Válido)
              </button>
              <button
                type="button"
                onClick={() => setScanResult("AVISO")}
                className="rounded-full bg-[#F3E8FF] px-4 py-2 text-[13px] font-bold text-[#9D4EDD]"
              >
                Ver Aviso (Morado medio)
              </button>
              <button
                type="button"
                onClick={() => setScanResult("ROJO")}
                className="rounded-full bg-[#FDEBEB] px-4 py-2 text-[13px] font-bold text-[#C0392B]"
              >
                Ver Rojo (No válido)
              </button>
            </div>

            {scanResult && (
              <div className="relative h-72 overflow-hidden rounded-2xl border border-[#E7E1F2]">
                <ScanResultOverlay
                  outcome={scanResult}
                  clientName="Carlos Mantilla"
                  remainingLunches={scanResult === "VERDE" ? 19 : scanResult === "AVISO" ? 1 : 0}
                  onUndo={() => {
                    toast.success("Deshecho");
                    setScanResult(null);
                  }}
                  onAction={() => setScanResult(null)}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
