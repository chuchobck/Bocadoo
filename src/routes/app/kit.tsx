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
    <div className="min-h-screen bg-background px-4 py-8 font-sans">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Cabecera Principal */}
        <header className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-brand">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-[28px] font-extrabold text-foreground">Kit de Diseño Bocadoo</h1>
          <p className="mt-1 text-[15px] font-semibold text-muted-foreground">
            22 componentes auditados según la guía de identidad oficial.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[13px] font-bold text-muted-foreground">Marco de referencia:</span>
            <button
              type="button"
              onClick={() => setPlatform(platform === "ios" ? "android" : "ios")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-4 py-1.5 text-[13px] font-bold text-primary transition-transform active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>{platform.toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            SECCIÓN A: PANTALLA DE EJEMPLO CON LOS 5 ESTADOS OBLIGATORIOS (StateFeedback)
            ========================================================================= */}
        <section className="rounded-[32px] border border-border bg-surface p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-[13px] font-bold text-primary">Componente 22</span>
              <h2 className="text-[20px] font-extrabold text-foreground">StateFeedback (Los 5 Estados)</h2>
            </div>
            <span className="text-[13px] font-semibold text-muted-foreground">Pantalla de ejemplo</span>
          </div>

          <p className="mb-4 text-[13px] font-semibold text-muted-foreground">
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
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary-container text-foreground hover:bg-secondary-container"
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
            <div className="space-y-3 rounded-2xl bg-background p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[17px] font-extrabold text-foreground">La Cuchara de San Blas</h4>
                  <span className="text-[13px] font-semibold text-muted-foreground">3 platos disponibles</span>
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
          <div className="border-b border-border pb-2">
            <h2 className="text-[20px] font-extrabold text-foreground">Piezas Interactivas Sueltas</h2>
            <p className="text-[13px] font-semibold text-muted-foreground">
              Estados: Normal, Presionado, Foco, Deshabilitado y Cargando.
            </p>
          </div>

          {/* 1. ButtonPrimary */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">1. ButtonPrimary (Acción principal)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Fondo primary, alto ≥56px</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Normal</span>
                <ButtonPrimary onClick={() => toast.success("¡Acción ejecutada!")}>Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Presionado (Active)</span>
                <ButtonPrimary className="scale-[0.98] bg-primary-hover">Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Foco (Focus ring)</span>
                <ButtonPrimary className="ring-4 ring-primary/40">Vender plan</ButtonPrimary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Deshabilitado</span>
                <ButtonPrimary disabled>Vender plan</ButtonPrimary>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[13px] font-bold text-muted-foreground">Cargando</span>
                <ButtonPrimary state="cargando">Vender plan</ButtonPrimary>
              </div>
            </div>
          </div>

          {/* 2. ButtonSecondary */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">2. ButtonSecondary</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Fondo primary-container, texto foreground</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Normal</span>
                <ButtonSecondary onClick={() => toast.success("Secundario pulsado")}>Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Foco</span>
                <ButtonSecondary className="ring-4 ring-primary/40">Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Deshabilitado</span>
                <ButtonSecondary disabled>Pasar cartulina</ButtonSecondary>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground">Cargando</span>
                <ButtonSecondary state="cargando">Pasar cartulina</ButtonSecondary>
              </div>
            </div>
          </div>

          {/* 3. ButtonGhost */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">3. ButtonGhost</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Acción sutil</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <span className="text-[13px] font-bold text-muted-foreground block mb-1">Normal</span>
                <ButtonGhost>Descartar</ButtonGhost>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground block mb-1">Deshabilitado</span>
                <ButtonGhost disabled>Descartar</ButtonGhost>
              </div>
              <div>
                <span className="text-[13px] font-bold text-muted-foreground block mb-1">Cargando</span>
                <ButtonGhost state="cargando">Descartar</ButtonGhost>
              </div>
            </div>
          </div>

          {/* 4. BigNumber */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">4. BigNumber (Cifras protagonistas)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">32px a 56px, peso 800</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BigNumber value="14" label="almuerzos disponibles" sublabel="Vence 30 oct" size="lg" />
              <BigNumber value="14" label="almuerzos disponibles" size="lg" state="cargando" />
            </div>
          </div>

          {/* 7. Chip & 8. Badge */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">7. Chip & 8. Badge</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Selección y estado funcional</p>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[13px] font-bold text-muted-foreground block mb-1">Chips (Normal y Seleccionado):</span>
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
                <span className="text-[13px] font-bold text-muted-foreground block mb-1">Badges (Éxito, Aviso, Peligro):</span>
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
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">9. ToggleSwitch</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">iOS vs Material 3</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <ToggleSwitch checked={toggleVal} onChange={setToggleVal} platform={platform} />
                <span className="text-[13px] font-bold text-foreground">
                  {platform.toUpperCase()}: {toggleVal ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">Deshabilitado:</span>
                <ToggleSwitch checked={false} onChange={() => {}} platform={platform} state="vacio" />
              </div>
            </div>
          </div>

          {/* 10. InputField & 11. SearchInput */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">10. InputField & 11. SearchInput</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">radio 16px, foco morado</p>
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
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">14. UndoBanner (10 segundos)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Renderizado en línea</p>
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
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">15. NavBar & 16. TopBar</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Barras fijas de la app</p>
            </div>
            <TopBar
              title="Caja de hoy"
              onBack={() => toast.info("Volver")}
              rightAction={<Badge label="Abierto" tone="success" />}
            />
            <div className="overflow-hidden rounded-2xl border border-border">
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
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">21. QuickPayBar (Cobro rápido)</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Total 32px 800</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
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
          <div className="border-b border-border pb-2">
            <h2 className="text-[20px] font-extrabold text-foreground">Tarjetas y Modales</h2>
            <p className="text-[13px] font-semibold text-muted-foreground">
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
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">12. BottomSheet</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Cierre solo por usuario</p>
            </div>
            <ButtonSecondary onClick={() => setIsSheetOpen(true)}>
              Abrir hoja inferior de prueba
            </ButtonSecondary>
            <BottomSheet
              isOpen={isSheetOpen}
              onClose={() => setIsSheetOpen(false)}
              title="Opciones de cobro"
            >
              <p className="text-[15px] font-semibold text-foreground pb-4">
                Esta hoja sólo llama a history.back() cuando tú tocas la X o el fondo. Si cambias de ruta en el menú, se desmonta limpiamente sin saltos de historial.
              </p>
              <ButtonPrimary onClick={() => setIsSheetOpen(false)}>
                Entendido
              </ButtonPrimary>
            </BottomSheet>
          </div>

          {/* 13. ScanResultOverlay: Verde, Aviso (morado medio), Rojo, Gris */}
          <div className="rounded-[28px] border border-border bg-surface p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="text-[17px] font-extrabold text-foreground">13. ScanResultOverlay</h3>
              <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">Verde, Aviso (morado medio), Rojo, Gris</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setScanResult("VERDE")}
                className="rounded-full bg-success-container px-4 py-2 text-[13px] font-bold text-success"
              >
                Ver Verde (Válido)
              </button>
              <button
                type="button"
                onClick={() => setScanResult("AVISO")}
                className="rounded-full bg-primary-container px-4 py-2 text-[13px] font-bold text-primary"
              >
                Ver Aviso (Morado medio)
              </button>
              <button
                type="button"
                onClick={() => setScanResult("ROJO")}
                className="rounded-full bg-danger-container px-4 py-2 text-[13px] font-bold text-on-danger-container"
              >
                Ver Rojo (No válido)
              </button>
            </div>

            {scanResult && (
              <div className="relative h-72 overflow-hidden rounded-2xl border border-border">
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
