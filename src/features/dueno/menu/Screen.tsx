import React, { useState } from "react";
import { Utensils, Check, AlertCircle, WifiOff, Loader2, ArrowLeft, Plus, RotateCcw, Archive, Edit3, X, Calendar, Eye, Clock } from "lucide-react";
import { ButtonPrimary, UndoBanner } from "@/design-system";
import { useBocadoo } from "@/components/bocadoo/store";
import { MENU_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface CatalogItem {
  id: string;
  name: string;
  section: string;
  extraPriceCents?: number;
  archived?: boolean;
}

export interface MenuDiaScreenProps {
  onPublishMenu?: (soup: string, main: string) => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

const DISH_IMAGES: Record<string, string> = {
  "Locro de papa con queso": "/dishes/locro-papa.jpg",
  "Locro de papa": "/dishes/locro-papa.jpg",
  "Seco de pollo con maduro": "/dishes/pollo-plancha.jpg",
  "Pollo a la plancha": "/dishes/pollo-plancha.jpg",
  "Bowl de quinoa": "/dishes/bowl-quinoa.jpg",
  "Higos con queso": "/dishes/higos-queso.jpg",
};

const WEEK_DAYS = [
  { day: "LUN", dish: "Seco de pollo" },
  { day: "MAR", dish: "Fritada" },
  { day: "MIÉ", dish: "Pollo grill" },
  { day: "JUE", dish: "Trucha frita" },
  { day: "VIE", dish: "Carne apanada" },
];

const INITIAL_CATALOG: CatalogItem[] = [
  { id: "c-s1", name: "Locro de papa con queso", section: "Sopa" },
  { id: "c-s2", name: "Sopa de lenteja", section: "Sopa" },
  { id: "c-s3", name: "Caldo de gallina criolla", section: "Sopa" },
  { id: "c-s4", name: "Crema de verduras", section: "Sopa" },
  { id: "c-m1", name: "Pollo a la plancha", section: "Segundo" },
  { id: "c-m2", name: "Seco de pollo con maduro", section: "Segundo" },
  { id: "c-m3", name: "Bowl de quinoa", section: "Segundo" },
  { id: "c-m4", name: "Trucha frita con ensalada", section: "Segundo" },
  { id: "c-d1", name: "Higos con queso", section: "Postre" },
  { id: "c-d2", name: "Dulce de zapallo", section: "Postre" },
  { id: "c-b1", name: "Jugo de naranjilla", section: "Bebida" },
  { id: "c-b2", name: "Jugo de mora", section: "Bebida" },
];

export const MenuDiaScreen: React.FC<MenuDiaScreenProps> = ({
  onPublishMenu,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const { publishMenu, simulatedTodayKey, menuDays } = useBocadoo();

  const [activeSegment, setActiveSegment] = useState<"hoy" | "catalogo">("hoy");
  const [catalog, setCatalog] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [activeSections, setActiveSections] = useState<string[]>(["Sopa", "Segundo"]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([
    "Locro de papa con queso",
    "Seco de pollo con maduro",
  ]);
  const [exhaustedDishes, setExhaustedDishes] = useState<string[]>([]);
  const [beverageActive, setBeverageActive] = useState(true);
  const [published, setPublished] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Crear plato rápido (2 toques: nombre + Guardar)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishSection, setNewDishSection] = useState("Segundo");

  const handleCreateDish = () => {
    if (!newDishName.trim()) return;
    const newItem: CatalogItem = {
      id: `c-new-${Date.now()}`,
      name: newDishName.trim(),
      section: newDishSection,
    };
    setCatalog((prev) => [...prev, newItem]);
    // Marcar para hoy automáticamente si la sección está activa
    setSelectedDishes((prev) => [...prev, newItem.name]);
    setNewDishName("");
    setShowAddModal(false);
  };

  const handleToggleDishToday = (dishName: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dishName) ? prev.filter((d) => d !== dishName) : [...prev, dishName]
    );
  };

  const handleToggleExhausted = (dishName: string) => {
    setExhaustedDishes((prev) =>
      prev.includes(dishName) ? prev.filter((d) => d !== dishName) : [...prev, dishName]
    );
  };

  const handleRepeatYesterday = () => {
    // 1 toque: Repite opciones frecuentes de ayer
    setSelectedDishes(["Locro de papa con queso", "Seco de pollo con maduro", "Trucha frita con ensalada"]);
    setExhaustedDishes([]);
  };

  const handlePublish = () => {
    setPublished(true);
    setUndoLabel(MENU_COPY.publishedUndo);
    setUndoSeconds(10);

    const firstSoup = selectedDishes.find((d) =>
      catalog.some((c) => c.name === d && c.section === "Sopa")
    ) || "Locro de papa con queso";

    const firstMain = selectedDishes.find((d) =>
      catalog.some((c) => c.name === d && c.section === "Segundo")
    ) || "Seco de pollo con maduro";

    // Publicar al store global para sincronizar con comensal en tiempo real
    publishMenu({
      fecha: simulatedTodayKey,
      secciones: {
        sopa: selectedDishes
          .filter((d) => catalog.some((c) => c.name === d && c.section === "Sopa"))
          .map((d, i) => ({ id: `s-${i}`, nombre: d, descripcion: "", agotado: exhaustedDishes.includes(d) })),
        fuerte: selectedDishes
          .filter((d) => catalog.some((c) => c.name === d && c.section === "Segundo"))
          .map((d, i) => ({ id: `m-${i}`, nombre: d, descripcion: "", agotado: exhaustedDishes.includes(d) })),
        postre: selectedDishes
          .filter((d) => catalog.some((c) => c.name === d && c.section === "Postre"))
          .map((d, i) => ({ id: `p-${i}`, nombre: d, descripcion: "", agotado: exhaustedDishes.includes(d) })),
        jugo: selectedDishes
          .filter((d) => catalog.some((c) => c.name === d && c.section === "Bebida"))
          .map((d, i) => ({ id: `j-${i}`, nombre: d, descripcion: "", agotado: exhaustedDishes.includes(d) })),
        adicional: [],
      },
    });

    onPublishMenu?.(firstSoup, firstMain);
  };

  const handleToggleSection = (section: string) => {
    setActiveSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleArchiveDish = (dishId: string) => {
    setCatalog((prev) =>
      prev.map((c) => (c.id === dishId ? { ...c, archived: !c.archived } : c))
    );
  };

  return (
    <div
      tabIndex={0}
      aria-label="Menú del día"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3.5 border-b border-[#F0EDF5] bg-white sticky top-0 z-10 space-y-3">
        {activeSegment === "hoy" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Volver a caja"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-widest text-[#7B2CBF]">
                  MENÚ DEL DÍA
                </span>
                <h1 className="text-[24px] font-black tracking-tight text-[#1F1135] leading-tight">
                  Miércoles 30
                </h1>
                <p className="text-[13px] font-semibold text-[#6B5B7B]">
                  Septiembre · 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Calendario del menú"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF] active:scale-95 transition-all"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSegment("catalogo")}
                aria-label="Agregar menú"
                className="grid h-10 w-10 place-items-center rounded-full bg-[#7B2CBF] text-white shadow-md active:scale-95 transition-all hover:bg-[#6A24A6]"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSegment("hoy")}
                aria-label="Volver al menú de hoy"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-widest text-[#7B2CBF]">
                  LA CUCHARA DE SAN BLAS
                </span>
                <h1 className="text-[22px] font-black tracking-tight text-[#1F1135] leading-tight">
                  Platos de la casa
                </h1>
              </div>
            </div>

            <span className="text-[13px] font-black text-[#7B2CBF]">
              {catalog.length} platos
            </span>
          </div>
        )}

        {/* Barra de control rápido: Estado y Segmentos */}
        <div className="flex items-center justify-between gap-2">
          {/* Estado del menú: Borrador en NEUTRO (no verde); Publicado en VERDE */}
          {published ? (
            <span className="rounded-full bg-[#E6F6EC] px-3 py-1 text-[13px] font-bold text-[#157A41]">
              {MENU_COPY.publishedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-[#F5F3FA] px-3 py-1 text-[13px] font-bold text-[#6B5B7B] border border-[#E7E1F2]">
              {MENU_COPY.draftBadge}
            </span>
          )}

          {/* Dos segmentos: "Hoy" y "Mis platos" */}
          <div className="flex gap-1 rounded-2xl bg-[#F5F3FA] p-1 border border-[#E7E1F2]">
            <button
              type="button"
              onClick={() => setActiveSegment("hoy")}
              aria-pressed={activeSegment === "hoy"}
              className={`rounded-xl px-3 py-1 text-center text-[13px] font-bold transition-all ${
                activeSegment === "hoy"
                  ? "bg-white text-[#7B2CBF] shadow-xs"
                  : "text-[#6B5B7B] hover:text-[#4A0E78]"
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setActiveSegment("catalogo")}
              aria-pressed={activeSegment === "catalogo"}
              className={`rounded-xl px-3 py-1 text-center text-[13px] font-bold transition-all ${
                activeSegment === "catalogo"
                  ? "bg-white text-[#7B2CBF] shadow-xs"
                  : "text-[#6B5B7B] hover:text-[#4A0E78]"
              }`}
            >
              Mis platos
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{MENU_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <Utensils className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{MENU_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{MENU_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{MENU_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{MENU_COPY.errorDesc}</p>
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
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{MENU_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* SEGMENTO 1: HOY (Estilo exacto Mockup Image 4) */}
            {activeSegment === "hoy" && (
              <div className="space-y-4">
                {/* Botón rápido "Repetir ayer" (1 toque) */}
                <div>
                  <button
                    type="button"
                    onClick={handleRepeatYesterday}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#F5F3FA] py-2.5 text-[14px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95 transition-all shadow-xs hover:border-[#7B2CBF]"
                  >
                    <RotateCcw className="h-4 w-4 text-[#7B2CBF]" />
                    <span>Repetir ayer</span>
                  </button>
                </div>

                {/* Franja de preórdenes activas para hoy */}
                <div
                  onClick={() => {
                    if (onBack) onBack();
                    else window.location.assign("/app/dueno/pedidos");
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Ver 3 pedidos en camino"
                  className="flex items-center justify-between rounded-2xl bg-[#F3E8FF] px-4 py-3 border border-[#EBD7FC] cursor-pointer hover:bg-[#EBD7FC] transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#7B2CBF] text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[13px] font-black text-[#1F1135]">
                        3 preórdenes en camino
                      </span>
                      <span className="text-[13px] font-medium text-[#6B5B7B]">
                        2 Seco de pollo · 1 Quinoa
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#7B2CBF] px-3 py-1 text-[13px] font-black text-white">
                    Ver
                  </span>
                </div>

                {/* Cuadrícula de 2 columnas de platos con fotos reales (Mockup Image 4) */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      name: "Locro de papa",
                      fullName: "Locro de papa con queso",
                      category: "SOPA",
                      image: "/dishes/locro-papa.jpg",
                    },
                    {
                      name: "Pollo a la plancha",
                      fullName: "Seco de pollo con maduro",
                      category: "SEGUNDO",
                      image: "/dishes/pollo-plancha.jpg",
                    },
                    {
                      name: "Bowl de quinoa",
                      fullName: "Trucha frita con ensalada",
                      category: "OPCIÓN VEGGIE",
                      image: "/dishes/bowl-quinoa.jpg",
                    },
                    {
                      name: "Higos con queso",
                      fullName: "Higos con queso",
                      category: "POSTRE",
                      image: "/dishes/higos-queso.jpg",
                    },
                  ].map((dish) => {
                    const isSelected = selectedDishes.includes(dish.fullName) || selectedDishes.includes(dish.name);
                    const isExhausted = exhaustedDishes.includes(dish.name) || exhaustedDishes.includes(dish.fullName);

                    return (
                      <div
                        key={dish.name}
                        className="rounded-[24px] border border-[#F0EDF5] bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Foto apetitosa del plato */}
                          <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F5F3FA]">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
                                isExhausted ? "grayscale opacity-60" : ""
                              }`}
                            />
                            {isExhausted && (
                              <span className="absolute top-2 right-2 rounded-full bg-[#FDEBEB] px-2 py-0.5 text-[13px] font-black uppercase text-[#C0392B]">
                                AGOTADO
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <span className="block text-[13px] font-black uppercase tracking-wider text-[#7B2CBF] mb-0.5">
                              {dish.category}
                            </span>
                            <h3 className="text-[14px] font-black text-[#1F1135] leading-tight line-clamp-1">
                              {dish.name}
                            </h3>
                          </div>
                        </div>

                        {/* Botón de estado: Se acabó / Agotado tras publicar o Disponible hoy */}
                        <div className="p-3 pt-0">
                          {published ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleExhausted(dish.name);
                                handleToggleExhausted(dish.fullName);
                              }}
                              className={`w-full rounded-full py-1.5 text-[13px] font-bold transition-all active:scale-95 ${
                                isExhausted
                                  ? "bg-[#C0392B] text-white shadow-xs"
                                  : "bg-[#F5F3FA] text-[#6B5B7B] border border-[#E7E1F2]"
                              }`}
                            >
                              {isExhausted ? "Agotado" : "Se acabó"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Disponible: ${dish.name}`}
                              onClick={() => handleToggleDishToday(dish.fullName)}
                              className={`w-full rounded-full py-1.5 text-[13px] font-bold transition-all flex items-center justify-center gap-1 ${
                                isSelected
                                  ? "bg-[#F3E8FF] text-[#7B2CBF] border border-[#EBD7FC]"
                                  : "bg-[#FAF8FC] text-[#6B5B7B] border border-[#E7E1F2]"
                              }`}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                              <span>Disponible hoy</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tarjeta de BEBIDA DE HOY con switch iOS (Mockup Image 4) */}
                <div className="flex items-center justify-between rounded-[24px] bg-[#F5F3FA] p-4 border border-[#E7E1F2]">
                  <div>
                    <span className="block text-[13px] font-extrabold uppercase tracking-wider text-[#6B5B7B]">
                      BEBIDA DE HOY
                    </span>
                    <h3 className="text-[15px] font-black text-[#1F1135] mt-0.5">
                      Jugo de naranjilla
                    </h3>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={beverageActive}
                    aria-label="Disponible bebida de hoy"
                    onClick={() => setBeverageActive((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus:outline-hidden ${
                      beverageActive ? "bg-[#7B2CBF]" : "bg-[#D9D3E6]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        beverageActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Sección "Menú de la semana" (Mockup Image 4) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-[#1F1135]">
                      Menú de la semana
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSegment("catalogo")}
                      className="text-[13px] font-bold text-[#7B2CBF] hover:underline"
                    >
                      Editar
                    </button>
                  </div>

                  <div
                    tabIndex={0}
                    aria-label="Menú de la semana"
                    className="flex gap-2 overflow-x-auto no-scrollbar pb-1 focus:outline-hidden"
                  >
                    {WEEK_DAYS.map((wd) => {
                      const isActive = wd.day === "MIÉ";
                      return (
                        <div
                          key={wd.day}
                          className={`rounded-[20px] p-3 min-w-[105px] border transition-all ${
                            isActive
                              ? "bg-[#7B2CBF] text-white border-[#7B2CBF] shadow-sm"
                              : "bg-white text-[#1F1135] border-[#F0EDF5]"
                          }`}
                        >
                          <span
                            className={`block text-[13px] font-black uppercase ${
                              isActive ? "text-white/80" : "text-[#6B5B7B]"
                            }`}
                          >
                            {wd.day}
                          </span>
                          <span className="text-[13px] font-black block mt-0.5 leading-tight line-clamp-1">
                            {wd.dish}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botón principal: 👁 Publicar menú */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#181126] py-3.5 text-[15px] font-black text-white shadow-md active:scale-95 transition-all hover:bg-[#25183E]"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{published ? "Actualizar menú" : "Publicar menú"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEGMENTO 2: AGREGAR MENÚ (Estilo exacto Mockup Image 3) */}
            {activeSegment === "catalogo" && (
              <div className="space-y-6">
                {/* Configuración rápida: Secciones activas */}
                <div className="rounded-[24px] bg-[#F5F3FA] p-3.5 border border-[#E7E1F2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold uppercase tracking-wider text-[#6B5B7B]">
                      Secciones activas
                    </span>
                    <span className="text-[13px] font-bold text-[#7B2CBF]">
                      {activeSections.length} activas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Sopa", "Segundo", "Postre", "Bebida"].map((sec) => {
                      const on = activeSections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleToggleSection(sec)}
                          aria-pressed={on}
                          className={`rounded-full px-3 py-1 text-[13px] font-bold transition-all ${
                            on
                              ? "bg-[#7B2CBF] text-white shadow-xs"
                              : "bg-white text-[#4A0E78] border border-[#E7E1F2]"
                          }`}
                        >
                          {sec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-[13px] font-extrabold uppercase tracking-wider text-[#6B5B7B] mb-4">
                    OPCIONES PARA EL ALMUERZO DIARIO
                  </span>

                  <div className="space-y-5">
                    {[
                      { key: "Bebida", label: "Jugo", emptyText: "Aún no hay platos en jugo." },
                      { key: "Sopa", label: "Sopa", emptyText: "Aún no hay platos en sopa." },
                      { key: "Segundo", label: "Plato fuerte", emptyText: "Aún no hay platos en plato fuerte." },
                      { key: "Postre", label: "Postre", emptyText: "Aún no hay platos en postre." },
                      { key: "Adicional", label: "Adicional", emptyText: "Aún no hay platos en adicional." },
                    ].map((sec) => {
                      const items = catalog.filter((c) => c.section === sec.key);
                      return (
                        <div key={sec.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[20px] font-black text-[#1F1135]">{sec.label}</h3>
                            <button
                              type="button"
                              onClick={() => {
                                setNewDishSection(sec.key);
                                setShowAddModal(true);
                              }}
                              className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3.5 py-1 text-[13px] font-bold text-[#7B2CBF] active:scale-95 transition-all hover:bg-[#EBD7FC]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Agregar</span>
                            </button>
                          </div>

                          {items.length === 0 ? (
                            <p className="py-3 text-center text-[13px] font-medium text-[#6B5B7B]">
                              {sec.emptyText}
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`rounded-2xl p-3 border bg-white flex items-center justify-between ${
                                    item.archived ? "opacity-50 border-[#E7E1F2]" : "border-[#E7E1F2] shadow-xs"
                                  }`}
                                >
                                  <span className="text-[14px] font-bold text-[#4A0E78]">
                                    {item.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleArchiveDish(item.id)}
                                      className="rounded-full bg-[#F5F3FA] px-2.5 py-1 text-[13px] font-bold text-[#6B5B7B] border border-[#E7E1F2] active:scale-95"
                                    >
                                      {item.archived ? "Desarchivar" : "Archivar"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Línea divisoria */}
                <div className="border-t border-[#F0EDF5]" />

                {/* Platos especiales (a la carta) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[18px] font-black text-[#1F1135]">
                        Platos a la carta (Especialidades de la casa)
                      </h3>
                      <p className="text-[13px] font-medium text-[#6B5B7B]">
                        Se ofrecen por separado, no forman parte del almuerzo del día.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDishSection("Segundo");
                        setShowAddModal(true);
                      }}
                      className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3.5 py-1 text-[13px] font-bold text-[#7B2CBF] active:scale-95 transition-all hover:bg-[#EBD7FC] shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>

                  <p className="py-3 text-center text-[13px] font-medium text-[#6B5B7B]">
                    Aún no hay platos a la carta.
                  </p>
                </div>

                {/* Botón inferior: Guardar platos */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSegment("hoy");
                      setUndoLabel("Platos de la casa guardados");
                      setUndoSeconds(10);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#7B2CBF] py-3.5 text-[15px] font-black text-white shadow-md active:scale-95 transition-all hover:bg-[#6A24A6]"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Guardar platos de la casa</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal para crear plato rápido (2 toques: nombre + Guardar) */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-xl animate-in slide-in-from-bottom space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-black text-[#4A0E78]">Nuevo plato</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                Nombre del plato
              </label>
              <input
                type="text"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                placeholder="Ej. Seco de carne con arroz"
                autoFocus
                className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[15px] font-bold text-[#4A0E78] focus:border-[#7B2CBF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                Sección
              </label>
              <div className="flex gap-2">
                {activeSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setNewDishSection(sec)}
                    className={`flex-1 rounded-xl py-2 text-[13px] font-bold transition-all ${
                      newDishSection === sec
                        ? "bg-[#7B2CBF] text-white shadow-xs"
                        : "bg-[#F5F3FA] text-[#4A0E78] border border-[#E7E1F2]"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <ButtonPrimary onClick={handleCreateDish}>
                Guardar plato
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}

      {undoSeconds > 0 && (
        <UndoBanner
          secondsLeft={undoSeconds}
          onUndo={() => {
            setUndoSeconds(0);
            setPublished(false);
          }}
          label={undoLabel}
        />
      )}
    </div>
  );
};
