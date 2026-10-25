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
  "Sopa de lenteja": "/dishes/locro-papa.jpg",
  "Caldo de gallina criolla": "/dishes/locro-papa.jpg",
  "Crema de verduras": "/dishes/locro-papa.jpg",
  "Seco de pollo con maduro": "/dishes/pollo-plancha.jpg",
  "Pollo a la plancha": "/dishes/pollo-plancha.jpg",
  "Bowl de quinoa": "/dishes/bowl-quinoa.jpg",
  "Trucha frita con ensalada": "/dishes/bowl-quinoa.jpg",
  "Higos con queso": "/dishes/higos-queso.jpg",
  "Dulce de zapallo": "/dishes/higos-queso.jpg",
  "Jugo de naranjilla": "/dishes/jugo-naranjilla.jpg",
  "Jugo de mora": "/dishes/jugo-naranjilla.jpg",
};

function getDishImage(dishName: string, category: string): string {
  if (DISH_IMAGES[dishName]) return DISH_IMAGES[dishName];
  if (category === "Bebida") return "/dishes/jugo-naranjilla.jpg";
  if (category === "Sopa") return "/dishes/locro-papa.jpg";
  if (category === "Postre") return "/dishes/higos-queso.jpg";
  if (category === "Veggie" || dishName.toLowerCase().includes("quinoa")) return "/dishes/bowl-quinoa.jpg";
  return "/dishes/pollo-plancha.jpg";
}

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
  const [activeSections, setActiveSections] = useState<string[]>(["Sopa", "Segundo", "Bebida"]);

  // Los 4 componentes claros del almuerzo diario
  const [todaySoup, setTodaySoup] = useState<string>("Locro de papa con queso");
  const [todayMain, setTodayMain] = useState<string>("Pollo a la plancha");
  const [todayVeggie, setTodayVeggie] = useState<string>("Bowl de quinoa");
  const [todayBeverage, setTodayBeverage] = useState<string>("Jugo de naranjilla");
  const [todayDessert, setTodayDessert] = useState<string>("Higos con queso");

  const [selectedDishes, setSelectedDishes] = useState<string[]>([
    "Locro de papa con queso",
    "Pollo a la plancha",
    "Bowl de quinoa",
    "Jugo de naranjilla",
  ]);
  const [exhaustedDishes, setExhaustedDishes] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Modal para cambiar plato en 1 toque (Ley del mínimo esfuerzo)
  const [selectingSlot, setSelectingSlot] = useState<"sopa" | "main" | "veggie" | "beverage" | "dessert" | null>(null);
  const [selectingSection, setSelectingSection] = useState<"Sopa" | "Segundo" | "Bebida" | "Postre" | null>(null);
  const [quickDishInput, setQuickDishInput] = useState<string>("");

  // Modal de creación en catálogo
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishSection, setNewDishSection] = useState("Segundo");

  const openSelector = (
    slot: "sopa" | "main" | "veggie" | "beverage" | "dessert",
    section: "Sopa" | "Segundo" | "Bebida" | "Postre"
  ) => {
    setSelectingSlot(slot);
    setSelectingSection(section);
    setQuickDishInput("");
  };

  const handleSelectDishForToday = (dishName: string) => {
    if (selectingSlot === "sopa") setTodaySoup(dishName);
    else if (selectingSlot === "main") setTodayMain(dishName);
    else if (selectingSlot === "veggie") setTodayVeggie(dishName);
    else if (selectingSlot === "beverage") setTodayBeverage(dishName);
    else if (selectingSlot === "dessert") setTodayDessert(dishName);

    setSelectedDishes((prev) => (prev.includes(dishName) ? prev : [...prev, dishName]));
    setSelectingSlot(null);
    setSelectingSection(null);
  };

  const handleCreateQuickDish = () => {
    if (!quickDishInput.trim() || !selectingSection) return;
    const newName = quickDishInput.trim();
    const newItem: CatalogItem = {
      id: `c-quick-${Date.now()}`,
      name: newName,
      section: selectingSection,
    };
    setCatalog((prev) => [...prev, newItem]);
    handleSelectDishForToday(newName);
    setQuickDishInput("");
  };

  const handleCreateDish = () => {
    if (!newDishName.trim()) return;
    const newItem: CatalogItem = {
      id: `c-new-${Date.now()}`,
      name: newDishName.trim(),
      section: newDishSection,
    };
    setCatalog((prev) => [...prev, newItem]);
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
    // 1 toque: Repite la combinación ganadora de ayer (Ley del mínimo esfuerzo)
    setTodaySoup("Locro de papa con queso");
    setTodayMain("Pollo a la plancha");
    setTodayVeggie("Bowl de quinoa");
    setTodayBeverage("Jugo de naranjilla");
    setTodayDessert("Higos con queso");
    setSelectedDishes([
      "Locro de papa con queso",
      "Pollo a la plancha",
      "Bowl de quinoa",
      "Jugo de naranjilla",
    ]);
    setExhaustedDishes([]);
  };

  const handlePublish = () => {
    setPublished(true);
    setUndoLabel(MENU_COPY.publishedUndo);
    setUndoSeconds(10);

    // Publicar al store global para sincronizar con comensal en tiempo real
    publishMenu({
      fecha: simulatedTodayKey,
      secciones: {
        sopa: [
          {
            id: "s-1",
            nombre: todaySoup,
            descripcion: "",
            agotado: exhaustedDishes.includes(todaySoup),
          },
        ],
        fuerte: [
          {
            id: "m-1",
            nombre: todayMain,
            descripcion: "",
            agotado: exhaustedDishes.includes(todayMain),
          },
          {
            id: "m-2",
            nombre: todayVeggie,
            descripcion: "",
            agotado: exhaustedDishes.includes(todayVeggie),
          },
        ],
        postre: [
          {
            id: "p-1",
            nombre: todayDessert,
            descripcion: "",
            agotado: exhaustedDishes.includes(todayDessert),
          },
        ],
        jugo: [
          {
            id: "j-1",
            nombre: todayBeverage,
            descripcion: "",
            agotado: exhaustedDishes.includes(todayBeverage),
          },
        ],
        adicional: [],
      },
    });

    onPublishMenu?.(todaySoup, todayMain);
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

                {/* Cuadrícula de 4 componentes del almuerzo de hoy (Sopa, Segundo, Veggie, Bebida) */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      category: "SOPA",
                      slot: "sopa" as const,
                      section: "Sopa" as const,
                      name: todaySoup,
                      image: getDishImage(todaySoup, "Sopa"),
                    },
                    {
                      category: "SEGUNDO",
                      slot: "main" as const,
                      section: "Segundo" as const,
                      name: todayMain,
                      image: getDishImage(todayMain, "Segundo"),
                    },
                    {
                      category: "OPCIÓN VEGGIE",
                      slot: "veggie" as const,
                      section: "Segundo" as const,
                      name: todayVeggie,
                      image: getDishImage(todayVeggie, "Veggie"),
                    },
                    {
                      category: "BEBIDA",
                      slot: "beverage" as const,
                      section: "Bebida" as const,
                      name: todayBeverage,
                      image: getDishImage(todayBeverage, "Bebida"),
                    },
                  ].map((dish) => {
                    const isExhausted = exhaustedDishes.includes(dish.name);

                    return (
                      <div
                        key={dish.category}
                        className="rounded-[24px] border border-[#F0EDF5] bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Foto apetitosa del plato con botón Cambiar en 1 toque */}
                          <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F5F3FA]">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className={`h-full w-full object-cover transition-transform duration-300 ${
                                isExhausted ? "grayscale opacity-60" : ""
                              }`}
                            />
                            {isExhausted ? (
                              <span className="absolute top-2 right-2 rounded-full bg-[#FDEBEB] px-2 py-0.5 text-[13px] font-black uppercase text-[#C0392B]">
                                AGOTADO
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openSelector(dish.slot, dish.section)}
                                aria-label={`Cambiar ${dish.category}`}
                                className="absolute top-2 right-2 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[13px] font-bold text-[#7B2CBF] shadow-xs active:scale-95 transition-all hover:bg-white flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3 text-[#7B2CBF]" />
                                <span>Cambiar</span>
                              </button>
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
                              onClick={() => handleToggleExhausted(dish.name)}
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
                              onClick={() => openSelector(dish.slot, dish.section)}
                              className="w-full rounded-full py-1.5 text-[13px] font-bold transition-all flex items-center justify-center gap-1 bg-[#F3E8FF] text-[#7B2CBF] border border-[#EBD7FC] hover:bg-[#EBD7FC]"
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
                {/* Banner educativo: Ley del mínimo esfuerzo y no-destrucción de datos */}
                <div className="rounded-[24px] bg-[#F3E8FF] p-4 border border-[#EBD7FC] flex items-start gap-3 shadow-xs">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7B2CBF] text-white">
                    <Utensils className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-[#1F1135]">
                      Tus platos nunca se pierden
                    </h3>
                    <p className="mt-0.5 text-[13px] font-medium text-[#6B5B7B] leading-snug">
                      Conserva siempre el historial de ventas y favoritos. Si dejas de preparar un plato temporalmente, usa <strong>Archivar</strong> para ocultarlo del selector sin borrar su data.
                    </p>
                  </div>
                </div>

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
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[14px] font-bold text-[#4A0E78]">
                                        {item.name}
                                      </span>
                                      {item.id === "c-s1" || item.id === "c-m1" ? (
                                        <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[13px] font-black text-[#D97706]">
                                          ⭐ Más pedido
                                        </span>
                                      ) : null}
                                    </div>
                                    <span className="text-[13px] font-medium text-[#6B5B7B]">
                                      {item.archived ? "Archivado · Oculto del menú diario" : "Activo en opciones de almuerzo"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleArchiveDish(item.id)}
                                      className="rounded-full bg-[#F5F3FA] px-2.5 py-1 text-[13px] font-bold text-[#6B5B7B] border border-[#E7E1F2] active:scale-95"
                                    >
                                      {item.archived ? "Activar" : "Archivar"}
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

      {/* Modal selector rápido de categoría (Ley del mínimo esfuerzo: 1 toque cambia el plato de hoy) */}
      {selectingSlot && selectingSection && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Elegir ${selectingSection} del día`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#4A0E78]/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => {
            setSelectingSlot(null);
            setSelectingSection(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDF5]">
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-wider text-[#7B2CBF]">
                  Almuerzo de hoy
                </span>
                <h3 className="text-[17px] font-black text-[#1F1135]">
                  Elegir {selectingSection.toLowerCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectingSlot(null);
                  setSelectingSection(null);
                }}
                aria-label="Cerrar selector"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#F5F3FA] text-[#6B5B7B] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista de opciones disponibles en 1 toque */}
            <div className="max-h-60 overflow-y-auto space-y-2 py-1 pr-0.5">
              {catalog
                .filter((c) => c.section === selectingSection && !c.archived)
                .map((item) => {
                  const isCurrent =
                    (selectingSlot === "sopa" && todaySoup === item.name) ||
                    (selectingSlot === "main" && todayMain === item.name) ||
                    (selectingSlot === "veggie" && todayVeggie === item.name) ||
                    (selectingSlot === "beverage" && todayBeverage === item.name) ||
                    (selectingSlot === "dessert" && todayDessert === item.name);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectDishForToday(item.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                        isCurrent
                          ? "border-[#7B2CBF] bg-[#F3E8FF] text-[#7B2CBF] shadow-xs"
                          : "border-[#F0EDF5] bg-[#FAF8FC] text-[#1F1135] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold">{item.name}</span>
                        {item.id === "c-s1" || item.id === "c-m1" ? (
                          <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[13px] font-black text-[#D97706]">
                            ⭐ Más pedido
                          </span>
                        ) : null}
                      </div>
                      {isCurrent ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span className="text-[13px] font-bold text-[#7B2CBF]">
                          Elegir
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Input rápido para agregar una nueva receta al vuelo si hoy cocinó algo nuevo */}
            <div className="pt-2 border-t border-[#F0EDF5] space-y-2">
              <label htmlFor="quick-dish-input" className="block text-[13px] font-bold text-[#6B5B7B]">
                ¿Preparaste una nueva {selectingSection.toLowerCase()}?
              </label>
              <div className="flex gap-2">
                <input
                  id="quick-dish-input"
                  type="text"
                  placeholder={`Ej. ${selectingSection === "Sopa" ? "Sancocho de carne" : selectingSection === "Bebida" ? "Limonada imperial" : "Seco de chivo"}`}
                  value={quickDishInput}
                  onChange={(e) => setQuickDishInput(e.target.value)}
                  className="flex-1 rounded-xl border border-[#E7E1F2] bg-[#F5F3FA] px-3 py-2 text-[14px] font-bold text-[#1F1135] focus:border-[#7B2CBF] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCreateQuickDish}
                  className="rounded-xl bg-[#7B2CBF] px-4 py-2 text-[13px] font-black text-white active:scale-95 transition-all shadow-xs"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear plato en catálogo completo */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Nuevo plato para la casa"
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
              <label htmlFor="new-dish-name-input" className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                Nombre del plato
              </label>
              <input
                id="new-dish-name-input"
                type="text"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                placeholder="Ej. Seco de carne con arroz"
                autoFocus
                className="w-full rounded-2xl border border-[#E7E1F2] bg-[#F5F3FA] p-3 text-[15px] font-bold text-[#4A0E78] focus:border-[#7B2CBF] focus:outline-hidden"
              />
            </div>

            <div>
              <span className="block text-[13px] font-bold text-[#6B5B7B] mb-1">
                Sección
              </span>
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
