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

export interface ALaCarteItem {
  id: string;
  name: string;
  price: number;
  description: string;
  archived?: boolean;
}

const INITIAL_A_LA_CARTE: ALaCarteItem[] = [
  {
    id: "alc-1",
    name: "Fritada tradicional con mote",
    price: 6.5,
    description: "Carne de cerdo dorada con mote, chulpi y tostado",
  },
  {
    id: "alc-2",
    name: "Churrasco con papas y huevo",
    price: 5.5,
    description: "Lomo a la plancha con papas fritas y ensalada",
  },
  {
    id: "alc-3",
    name: "Ceviche mixto de camarón",
    price: 7.0,
    description: "Con chifle, maíz tostado y aguacate",
  },
  {
    id: "alc-4",
    name: "Trucha al ajillo con patacones",
    price: 6.0,
    description: "Trucha fresca en salsa de ajo con patacones",
  },
];

export const MenuDiaScreen: React.FC<MenuDiaScreenProps> = ({
  onPublishMenu,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const { publishMenu, toggleSoldOut, simulatedTodayKey, menuDays } = useBocadoo();

  const [activeSegment, setActiveSegment] = useState<"hoy" | "catalogo">("hoy");
  const [catalogSubSegment, setCatalogSubSegment] = useState<"almuerzos" | "alacarta">("almuerzos");
  const [catalog, setCatalog] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [aLaCarteCatalog, setALaCarteCatalog] = useState<ALaCarteItem[]>(INITIAL_A_LA_CARTE);
  const [activeSections, setActiveSections] = useState<string[]>(["Sopa", "Segundo", "Bebida"]);

  // Múltiples opciones por sección para el almuerzo diario (ej. 3 sopas, 3 segundos, 1 jugo, 1 postre)
  const [todaySoups, setTodaySoups] = useState<string[]>([
    "Locro de papa con queso",
    "Sopa de lenteja",
  ]);
  const [todayMains, setTodayMains] = useState<string[]>([
    "Pollo a la plancha",
    "Seco de pollo con maduro",
    "Bowl de quinoa",
  ]);
  const [todayBeverages, setTodayBeverages] = useState<string[]>([
    "Jugo de naranjilla",
  ]);
  const [todayDesserts, setTodayDesserts] = useState<string[]>([
    "Higos con queso",
  ]);

  const [exhaustedDishes, setExhaustedDishes] = useState<string[]>(() =>
    Object.values(menuDays[simulatedTodayKey]?.secciones ?? {}).flatMap((dishes) =>
      dishes.filter((d) => d.agotado).map((d) => d.nombre),
    ),
  );
  const [published, setPublished] = useState(false);
  const [undoSeconds, setUndoSeconds] = useState(0);
  const [undoLabel, setUndoLabel] = useState("");

  // Modal para seleccionar múltiples platos en 1 toque
  const [selectingSection, setSelectingSection] = useState<"Sopa" | "Segundo" | "Bebida" | "Postre" | null>(null);
  const [quickDishInput, setQuickDishInput] = useState<string>("");

  // Modales de creación
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishSection, setNewDishSection] = useState("Segundo");

  const [showALaCarteModal, setShowALaCarteModal] = useState(false);
  const [newAlcName, setNewAlcName] = useState("");
  const [newAlcPrice, setNewAlcPrice] = useState("");
  const [newAlcDesc, setNewAlcDesc] = useState("");

  const openSelector = (
    section: "Sopa" | "Segundo" | "Bebida" | "Postre"
  ) => {
    setSelectingSection(section);
    setQuickDishInput("");
  };

  const handleToggleDishInTodayCategory = (dishName: string, section: "Sopa" | "Segundo" | "Bebida" | "Postre") => {
    if (section === "Sopa") {
      setTodaySoups((prev) =>
        prev.includes(dishName)
          ? prev.length > 1 ? prev.filter((d) => d !== dishName) : prev
          : [...prev, dishName]
      );
    } else if (section === "Segundo") {
      setTodayMains((prev) =>
        prev.includes(dishName)
          ? prev.length > 1 ? prev.filter((d) => d !== dishName) : prev
          : [...prev, dishName]
      );
    } else if (section === "Bebida") {
      setTodayBeverages((prev) =>
        prev.includes(dishName)
          ? prev.length > 1 ? prev.filter((d) => d !== dishName) : prev
          : [...prev, dishName]
      );
    } else if (section === "Postre") {
      setTodayDesserts((prev) =>
        prev.includes(dishName)
          ? prev.length > 1 ? prev.filter((d) => d !== dishName) : prev
          : [...prev, dishName]
      );
    }
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
    handleToggleDishInTodayCategory(newName, selectingSection);
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
    if (newDishSection === "Sopa") setTodaySoups((prev) => [...prev, newItem.name]);
    else if (newDishSection === "Segundo") setTodayMains((prev) => [...prev, newItem.name]);
    else if (newDishSection === "Bebida") setTodayBeverages((prev) => [...prev, newItem.name]);
    else if (newDishSection === "Postre") setTodayDesserts((prev) => [...prev, newItem.name]);
    setNewDishName("");
    setShowAddModal(false);
  };

  const handleCreateALaCarte = () => {
    if (!newAlcName.trim()) return;
    const priceNum = parseFloat(newAlcPrice.replace(",", ".")) || 5.0;
    const newItem: ALaCarteItem = {
      id: `alc-new-${Date.now()}`,
      name: newAlcName.trim(),
      price: priceNum,
      description: newAlcDesc.trim() || "Especialidad de la casa preparada al momento",
    };
    setALaCarteCatalog((prev) => [...prev, newItem]);
    setNewAlcName("");
    setNewAlcPrice("");
    setNewAlcDesc("");
    setShowALaCarteModal(false);
  };

  const handleToggleExhausted = (dishName: string) => {
    const willBeExhausted = !exhaustedDishes.includes(dishName);
    setExhaustedDishes((prev) =>
      prev.includes(dishName) ? prev.filter((d) => d !== dishName) : [...prev, dishName]
    );

    // Sincroniza en vivo con el POS y el comensal: sin editar ni volver a publicar el menú
    const sections = menuDays[simulatedTodayKey]?.secciones;
    if (!sections) return;
    for (const dishes of Object.values(sections)) {
      const match = dishes.find((d) => d.nombre === dishName);
      if (match) {
        if (match.agotado !== willBeExhausted) toggleSoldOut(match.id);
        break;
      }
    }
  };


  const handlePublish = () => {
    setPublished(true);
    setUndoLabel(MENU_COPY.publishedUndo);
    setUndoSeconds(10);

    // Publicar al store global para sincronizar con comensal en tiempo real
    publishMenu({
      fecha: simulatedTodayKey,
      secciones: {
        sopa: todaySoups.map((s, idx) => ({
          id: `s-${idx}`,
          nombre: s,
          descripcion: "",
          agotado: exhaustedDishes.includes(s),
        })),
        fuerte: todayMains.map((m, idx) => ({
          id: `m-${idx}`,
          nombre: m,
          descripcion: "",
          agotado: exhaustedDishes.includes(m),
        })),
        postre: todayDesserts.map((p, idx) => ({
          id: `p-${idx}`,
          nombre: p,
          descripcion: "",
          agotado: exhaustedDishes.includes(p),
        })),
        jugo: todayBeverages.map((j, idx) => ({
          id: `j-${idx}`,
          nombre: j,
          descripcion: "",
          agotado: exhaustedDishes.includes(j),
        })),
        adicional: [],
      },
    });

    onPublishMenu?.(todaySoups[0] || "Locro de papa con queso", todayMains[0] || "Pollo a la plancha");
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

  const handleArchiveALaCarte = (id: string) => {
    setALaCarteCatalog((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    );
  };

  return (
    <div
      tabIndex={0}
      aria-label="Menú del día"
      className="flex h-full flex-col bg-surface overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3.5 border-b border-border bg-surface sticky top-0 z-10 space-y-3">
        {activeSegment === "hoy" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Volver a caja"
                  className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-widest text-primary">
                  MENÚ DEL DÍA
                </span>
                <h1 className="text-[24px] font-black tracking-tight text-foreground leading-tight">
                  Miércoles 30
                </h1>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  Septiembre · 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Calendario del menú"
                className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-primary active:scale-95 transition-all"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSegment("catalogo")}
                aria-label="Agregar menú"
                className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md active:scale-95 transition-all hover:bg-primary-hover"
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
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-widest text-primary">
                  LA CUCHARA DE SAN BLAS
                </span>
                <h1 className="text-[22px] font-black tracking-tight text-foreground leading-tight">
                  Platos de la casa
                </h1>
              </div>
            </div>

            <span className="text-[13px] font-black text-primary">
              {catalog.length} platos
            </span>
          </div>
        )}

        {/* Barra de control rápido: Estado y Segmentos */}
        <div className="flex items-center justify-between gap-2">
          {/* Estado del menú: Borrador en NEUTRO (no verde); Publicado en VERDE */}
          {published ? (
            <span className="rounded-full bg-success-container px-3 py-1 text-[13px] font-bold text-success">
              {MENU_COPY.publishedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-background px-3 py-1 text-[13px] font-bold text-muted-foreground border border-border">
              {MENU_COPY.draftBadge}
            </span>
          )}

          {/* Dos segmentos: "Hoy" y "Mis platos" */}
          <div className="flex gap-1 rounded-2xl bg-background p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveSegment("hoy")}
              aria-pressed={activeSegment === "hoy"}
              className={`rounded-xl px-3 py-1 text-center text-[13px] font-bold transition-all ${
                activeSegment === "hoy"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-3 text-[17px] font-extrabold text-foreground">{MENU_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h2 className="text-[17px] font-extrabold text-foreground">{MENU_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{MENU_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-danger-container p-6 text-center text-on-danger-container border border-danger">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{MENU_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{MENU_COPY.errorDesc}</p>
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
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{MENU_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* SEGMENTO 1: HOY (Estilo exacto Mockup Image 4) */}
            {activeSegment === "hoy" && (
              <div className="space-y-4">

                {/* Franja de preórdenes activas para hoy */}
                <div
                  onClick={() => {
                    if (onBack) onBack();
                    else window.location.assign("/app/dueno/pedidos");
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Ver 3 pedidos en camino"
                  className="flex items-center justify-between rounded-2xl bg-primary-container px-4 py-3 border border-primary-container cursor-pointer hover:bg-secondary-container transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[13px] font-black text-foreground">
                        3 preórdenes en camino
                      </span>
                      <span className="text-[13px] font-medium text-muted-foreground">
                        2 Seco de pollo · 1 Quinoa
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1 text-[13px] font-black text-primary-foreground">
                    Ver
                  </span>
                </div>

                <p className="flex items-start gap-2 rounded-2xl bg-background px-3 py-2 text-[13px] font-semibold text-muted-foreground">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{MENU_COPY.soldOutHint}</span>
                </p>

                {/* Cuadrícula de componentes del almuerzo de hoy (soporta múltiples opciones por sección) */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  {[
                    {
                      category: "SOPA",
                      section: "Sopa" as const,
                      items: todaySoups,
                      image: getDishImage(todaySoups[0] || "Locro de papa con queso", "Sopa"),
                    },
                    {
                      category: "SEGUNDO",
                      section: "Segundo" as const,
                      items: todayMains.filter((m) => !m.toLowerCase().includes("quinoa")),
                      image: getDishImage(todayMains[0] || "Pollo a la plancha", "Segundo"),
                    },
                    {
                      category: "OPCIÓN VEGGIE",
                      section: "Segundo" as const,
                      items: todayMains.filter((m) => m.toLowerCase().includes("quinoa")).length > 0
                        ? todayMains.filter((m) => m.toLowerCase().includes("quinoa"))
                        : ["Bowl de quinoa"],
                      image: getDishImage("Bowl de quinoa", "Veggie"),
                    },
                    {
                      category: "BEBIDA",
                      section: "Bebida" as const,
                      items: todayBeverages,
                      image: getDishImage(todayBeverages[0] || "Jugo de naranjilla", "Bebida"),
                    },
                  ].map((dish) => {
                    return (
                      <div
                        key={dish.category}
                        className="rounded-[24px] border border-border bg-surface overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Foto apetitosa con botón Cambiar/Agregar en 1 toque */}
                          <div className="relative aspect-4/3 w-full overflow-hidden bg-background">
                            <img
                              src={dish.image}
                              alt={dish.category}
                              className="h-full w-full object-cover transition-transform duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => openSelector(dish.section)}
                              aria-label={`Cambiar ${dish.category.toLowerCase()}`}
                              className="absolute top-2 right-2 rounded-full bg-surface/95 backdrop-blur-xs px-2.5 py-1 text-[13px] font-bold text-primary shadow-xs active:scale-95 transition-all hover:bg-surface flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3 text-primary" />
                              <span>Opciones ({dish.items.length})</span>
                            </button>
                          </div>

                          <div className="p-3">
                            <span className="block text-[13px] font-black uppercase tracking-wider text-primary mb-1.5">
                              {dish.category} ({dish.items.length})
                            </span>
                            {/* Cada plato es su propio interruptor: se marca agotado solo ese, no la sección */}
                            <div className="space-y-1.5">
                              {dish.items.map((itemName) => {
                                const isExhausted = exhaustedDishes.includes(itemName);
                                return (
                                  <button
                                    key={itemName}
                                    type="button"
                                    onClick={() => handleToggleExhausted(itemName)}
                                    aria-pressed={isExhausted}
                                    aria-label={
                                      isExhausted
                                        ? `${itemName}: se acabó. Toca si volvió a haber`
                                        : `${itemName}: hay. Toca si se acabó`
                                    }
                                    className={`w-full rounded-xl border px-2.5 py-1.5 text-left transition-all active:scale-[0.98] ${
                                      isExhausted
                                        ? "border-danger bg-danger-container"
                                        : "border-border bg-background"
                                    }`}
                                  >
                                    <span
                                      className={`block text-[13px] font-extrabold leading-tight line-clamp-2 ${
                                        isExhausted ? "line-through text-muted-foreground" : "text-foreground"
                                      }`}
                                    >
                                      {itemName}
                                    </span>
                                    <span
                                      className={`mt-0.5 flex items-center gap-1 text-[13px] font-black ${
                                        isExhausted ? "text-on-danger-container" : "text-success"
                                      }`}
                                    >
                                      {isExhausted ? (
                                        <X className="h-3.5 w-3.5 stroke-[3]" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                      )}
                                      {isExhausted ? MENU_COPY.dishSoldOut : MENU_COPY.dishAvailable}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sección "Menú de la semana" (Mockup Image 4) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-foreground">
                      Menú de la semana
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSegment("catalogo")}
                      className="text-[13px] font-bold text-primary hover:underline"
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
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-surface text-foreground border-border"
                          }`}
                        >
                          <span
                            className={`block text-[13px] font-black uppercase ${
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
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
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-footer-bg py-3.5 text-[15px] font-black text-image-foreground shadow-md active:scale-95 transition-all hover:bg-footer-bg"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{published ? "Actualizar menú" : "Publicar menú"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEGMENTO 2: MIS PLATOS / CATÁLOGO CON SUB-SEGMENTOS MODULARES */}
            {activeSegment === "catalogo" && (
              <div className="space-y-5">
                {/* Sub-segmentos modulares: Almuerzos vs A la carta */}
                <div className="flex gap-1 rounded-2xl bg-background p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setCatalogSubSegment("almuerzos")}
                    aria-pressed={catalogSubSegment === "almuerzos"}
                    className={`flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all ${
                      catalogSubSegment === "almuerzos"
                        ? "bg-surface text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Almuerzos del día
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogSubSegment("alacarta")}
                    aria-pressed={catalogSubSegment === "alacarta"}
                    className={`flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all ${
                      catalogSubSegment === "alacarta"
                        ? "bg-surface text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Platos a la carta
                  </button>
                </div>

                {/* SUB-SEGMENTO 1: ALMUERZOS DEL DÍA */}
                {catalogSubSegment === "almuerzos" && (
                  <div className="space-y-5">
                    {/* Banner educativo: Ley del mínimo esfuerzo y no-destrucción de datos */}
                    <div className="rounded-[24px] bg-primary-container p-4 border border-primary-container flex items-start gap-3 shadow-xs">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Utensils className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black text-foreground">
                          Tus platos nunca se pierden
                        </h3>
                        <p className="mt-0.5 text-[13px] font-medium text-muted-foreground leading-snug">
                          Conserva siempre el historial de ventas y favoritos. Si dejas de preparar un plato temporalmente, usa <strong>Archivar</strong> para ocultarlo del selector sin borrar su data.
                        </p>
                      </div>
                    </div>

                    {/* Configuración rápida: Secciones activas */}
                    <div className="rounded-[24px] bg-background p-3.5 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          Secciones activas
                        </span>
                        <span className="text-[13px] font-bold text-primary">
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
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-surface text-foreground border border-border"
                              }`}
                            >
                              {sec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Categorías de almuerzo */}
                    <div className="space-y-5">
                      {[
                        { key: "Bebida", label: "Jugo", emptyText: "Aún no hay platos en jugo." },
                        { key: "Sopa", label: "Sopa", emptyText: "Aún no hay platos en sopa." },
                        { key: "Segundo", label: "Plato fuerte", emptyText: "Aún no hay platos en plato fuerte." },
                        { key: "Postre", label: "Postre", emptyText: "Aún no hay platos en postre." },
                      ].map((sec) => {
                        const items = catalog.filter((c) => c.section === sec.key);
                        return (
                          <div key={sec.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[18px] font-black text-foreground">{sec.label}</h3>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewDishSection(sec.key);
                                  setShowAddModal(true);
                                }}
                                className="flex items-center gap-1 rounded-full bg-primary-container px-3.5 py-1 text-[13px] font-bold text-primary active:scale-95 transition-all hover:bg-secondary-container"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Agregar</span>
                              </button>
                            </div>

                            {items.length === 0 ? (
                              <p className="py-3 text-center text-[13px] font-medium text-muted-foreground">
                                {sec.emptyText}
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`rounded-2xl p-3 border bg-surface flex items-center justify-between ${
                                      item.archived ? "opacity-50 border-border" : "border-border shadow-xs"
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-bold text-foreground">
                                          {item.name}
                                        </span>
                                        {item.id === "c-s1" || item.id === "c-m1" ? (
                                          <span className="rounded-full bg-primary-container px-2 py-0.5 text-[13px] font-black text-on-primary-container">
                                            ⭐ Más pedido
                                          </span>
                                        ) : null}
                                      </div>
                                      <span className="text-[13px] font-medium text-muted-foreground">
                                        {item.archived ? "Archivado · Oculto de hoy" : "Activo en opciones de almuerzo"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleArchiveDish(item.id)}
                                        className="rounded-full bg-background px-2.5 py-1 text-[13px] font-bold text-muted-foreground border border-border active:scale-95"
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

                    {/* Botón inferior: Guardar platos */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSegment("hoy");
                          setUndoLabel("Platos de la casa guardados");
                          setUndoSeconds(10);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-black text-primary-foreground shadow-md active:scale-95 transition-all hover:bg-primary-hover"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Guardar platos de la casa</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUB-SEGMENTO 2: PLATOS A LA CARTA */}
                {catalogSubSegment === "alacarta" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[18px] font-black text-foreground">
                          Especialidades de la casa
                        </h3>
                        <p className="text-[13px] font-medium text-muted-foreground">
                          Platos individuales que se venden a precio libre fuera del combo de almuerzo.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowALaCarteModal(true)}
                        className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-black text-primary-foreground active:scale-95 transition-all shadow-xs shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo plato</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {aLaCarteCatalog.map((alc) => (
                        <div
                          key={alc.id}
                          className={`rounded-2xl p-4 border bg-surface flex items-center justify-between ${
                            alc.archived ? "opacity-50 border-border" : "border-border shadow-xs"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[15px] font-extrabold text-foreground">
                                {alc.name}
                              </h4>
                              <span className="rounded-full bg-success-container px-2 py-0.5 text-[13px] font-black text-success">
                                ${alc.price.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                            <p className="text-[13px] font-medium text-muted-foreground">
                              {alc.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleArchiveALaCarte(alc.id)}
                            className="rounded-full bg-background px-3 py-1.5 text-[13px] font-bold text-muted-foreground border border-border active:scale-95 shrink-0"
                          >
                            {alc.archived ? "Activar" : "Archivar"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal selector rápido con selección múltiple (Ley del mínimo esfuerzo) */}
      {selectingSection && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Elegir ${selectingSection} del día`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setSelectingSection(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-5 shadow-2xl animate-in slide-in-from-bottom space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <span className="block text-[13px] font-extrabold uppercase tracking-wider text-primary">
                  Almuerzo de hoy
                </span>
                <h3 className="text-[17px] font-black text-foreground">
                  Elegir {selectingSection.toLowerCase()}s
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectingSection(null)}
                aria-label="Cerrar selector"
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[13px] font-medium text-muted-foreground">
              Selecciona las opciones que ofreces hoy (puedes marcar varias):
            </p>

            {/* Lista de opciones con toggle de selección múltiple */}
            <div className="max-h-60 overflow-y-auto space-y-2 py-1 pr-0.5">
              {catalog
                .filter((c) => c.section === selectingSection && !c.archived)
                .map((item) => {
                  const isCurrent =
                    (selectingSection === "Sopa" && todaySoups.includes(item.name)) ||
                    (selectingSection === "Segundo" && todayMains.includes(item.name)) ||
                    (selectingSection === "Bebida" && todayBeverages.includes(item.name)) ||
                    (selectingSection === "Postre" && todayDesserts.includes(item.name));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleDishInTodayCategory(item.name, selectingSection)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                        isCurrent
                          ? "border-primary bg-primary-container text-primary shadow-xs"
                          : "border-border bg-background text-foreground hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold">{item.name}</span>
                        {item.id === "c-s1" || item.id === "c-m1" ? (
                          <span className="rounded-full bg-primary-container px-2 py-0.5 text-[13px] font-black text-on-primary-container">
                            ⭐ Más pedido
                          </span>
                        ) : null}
                      </div>
                      {isCurrent ? (
                        <div className="flex items-center gap-1 text-[13px] font-bold text-primary">
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Incluido</span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-bold text-muted-foreground">
                          + Agregar
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Input rápido para agregar una nueva receta al vuelo si hoy cocinó algo nuevo */}
            <div className="pt-2 border-t border-border space-y-2">
              <label htmlFor="quick-dish-input" className="block text-[13px] font-bold text-muted-foreground">
                ¿Preparaste una nueva {selectingSection.toLowerCase()}?
              </label>
              <div className="flex gap-2">
                <input
                  id="quick-dish-input"
                  type="text"
                  placeholder={`Ej. ${selectingSection === "Sopa" ? "Caldo de bola" : selectingSection === "Bebida" ? "Jugo de maracuyá" : "Chivo al hueco"}`}
                  value={quickDishInput}
                  onChange={(e) => setQuickDishInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCreateQuickDish}
                  className="rounded-xl bg-primary px-4 py-2 text-[13px] font-black text-primary-foreground active:scale-95 transition-all shadow-xs"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Botón de cierre con resumen */}
            <div className="pt-2">
              <ButtonPrimary onClick={() => setSelectingSection(null)}>
                ✓ Listo para hoy
              </ButtonPrimary>
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-5 shadow-xl animate-in slide-in-from-bottom space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-black text-foreground">Nuevo plato</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label htmlFor="new-dish-name-input" className="block text-[13px] font-bold text-muted-foreground mb-1">
                Nombre del plato
              </label>
              <input
                id="new-dish-name-input"
                type="text"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                placeholder="Ej. Seco de carne con arroz"
                autoFocus
                className="w-full rounded-2xl border border-border bg-background p-3 text-[15px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <span className="block text-[13px] font-bold text-muted-foreground mb-1">
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
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background text-foreground border border-border"
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

      {/* Modal para crear plato a la carta */}
      {showALaCarteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Nueva especialidad a la carta"
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim/40 backdrop-blur-[4px] p-4 animate-in fade-in"
          onClick={() => setShowALaCarteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[32px] bg-surface p-5 shadow-xl animate-in slide-in-from-bottom space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-black text-foreground">Plato a la carta</h3>
              <button
                type="button"
                onClick={() => setShowALaCarteModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label htmlFor="new-alc-name-input" className="block text-[13px] font-bold text-muted-foreground mb-1">
                Nombre del plato
              </label>
              <input
                id="new-alc-name-input"
                type="text"
                value={newAlcName}
                onChange={(e) => setNewAlcName(e.target.value)}
                placeholder="Ej. Parrillada mixta"
                autoFocus
                className="w-full rounded-2xl border border-border bg-background p-3 text-[15px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="new-alc-price-input" className="block text-[13px] font-bold text-muted-foreground mb-1">
                Precio en dólares
              </label>
              <input
                id="new-alc-price-input"
                type="text"
                value={newAlcPrice}
                onChange={(e) => setNewAlcPrice(e.target.value)}
                placeholder="Ej. 6.50"
                className="w-full rounded-2xl border border-border bg-background p-3 text-[15px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="new-alc-desc-input" className="block text-[13px] font-bold text-muted-foreground mb-1">
                Descripción
              </label>
              <input
                id="new-alc-desc-input"
                type="text"
                value={newAlcDesc}
                onChange={(e) => setNewAlcDesc(e.target.value)}
                placeholder="Ej. Con patacones y ensalada"
                className="w-full rounded-2xl border border-border bg-background p-3 text-[15px] font-bold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <ButtonPrimary onClick={handleCreateALaCarte}>
                Guardar especialidad
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
