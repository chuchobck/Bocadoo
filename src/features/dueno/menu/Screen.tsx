import React, { useState } from "react";
import { Utensils, Check, AlertCircle, WifiOff, Loader2, ArrowLeft, Plus, RotateCcw, Archive, Edit3, X } from "lucide-react";
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

const INITIAL_CATALOG: CatalogItem[] = [
  { id: "c-s1", name: "Locro de papa con queso", section: "Sopa" },
  { id: "c-s2", name: "Sopa de lenteja", section: "Sopa" },
  { id: "c-s3", name: "Caldo de gallina criolla", section: "Sopa" },
  { id: "c-s4", name: "Crema de verduras", section: "Sopa" },
  { id: "c-m1", name: "Seco de pollo con maduro", section: "Segundo" },
  { id: "c-m2", name: "Trucha frita con ensalada", section: "Segundo" },
  { id: "c-m3", name: "Carne apanada con menestra", section: "Segundo" },
  { id: "c-m4", name: "Seco de chivo andino", section: "Segundo" },
  { id: "c-d1", name: "Higos con queso", section: "Postre" },
  { id: "c-d2", name: "Dulce de zapallo", section: "Postre" },
  { id: "c-b1", name: "Jugo de mora", section: "Bebida" },
  { id: "c-b2", name: "Limonada imperial", section: "Bebida" },
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
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 space-y-2.5">
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
            <h1 className="text-[20px] font-black text-[#4A0E78]">{MENU_COPY.title}</h1>
          </div>

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
        </div>

        {/* Dos segmentos: "Hoy" y "Mis platos" */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F5F3FA] p-1 border border-[#E7E1F2]">
          <button
            type="button"
            onClick={() => setActiveSegment("hoy")}
            aria-pressed={activeSegment === "hoy"}
            className={`rounded-xl py-2 text-center text-[14px] font-bold transition-all ${
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
            className={`rounded-xl py-2 text-center text-[14px] font-bold transition-all ${
              activeSegment === "catalogo"
                ? "bg-white text-[#7B2CBF] shadow-xs"
                : "text-[#6B5B7B] hover:text-[#4A0E78]"
            }`}
          >
            Mis platos
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20">
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
            {/* SEGMENTO 1: HOY */}
            {activeSegment === "hoy" && (
              <div className="space-y-5">
                {/* Barra de acción rápida: Repetir ayer (1 toque) y + Plato */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRepeatYesterday}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#F5F3FA] py-2.5 text-[14px] font-bold text-[#4A0E78] border border-[#E7E1F2] active:scale-95 transition-all shadow-xs"
                  >
                    <RotateCcw className="h-4 w-4 text-[#7B2CBF]" />
                    <span>Repetir ayer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-1 rounded-2xl bg-[#F3E8FF] px-4 py-2.5 text-[14px] font-bold text-[#7B2CBF] active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Plato</span>
                  </button>
                </div>

                {/* Secciones configuradas */}
                {activeSections.map((section) => {
                  const sectionDishes = catalog.filter((c) => c.section === section && !c.archived);

                  return (
                    <div key={section} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold uppercase tracking-wider text-[#6B5B7B]">
                          {section}
                        </span>
                        <span className="text-[13px] font-semibold text-[#7B2CBF]">
                          {sectionDishes.filter((d) => selectedDishes.includes(d.name)).length} seleccionados
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sectionDishes.map((dish) => {
                          const isSelected = selectedDishes.includes(dish.name);
                          const isExhausted = exhaustedDishes.includes(dish.name);

                          return (
                            <div
                              key={dish.id}
                              className={`rounded-[20px] p-3 border transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-white border-[#7B2CBF] shadow-xs"
                                  : "bg-[#FAF8FC] border-[#E7E1F2] opacity-80"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleDishToday(dish.name)}
                                className="flex-1 flex items-center gap-3 text-left"
                              >
                                <div
                                  className={`grid h-6 w-6 place-items-center rounded-lg border transition-all ${
                                    isSelected
                                      ? "bg-[#7B2CBF] border-[#7B2CBF] text-white"
                                      : "border-[#E7E1F2] bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="h-4 w-4" />}
                                </div>
                                <div>
                                  <span className={`text-[14px] font-bold ${isExhausted ? "line-through text-[#6B5B7B]" : "text-[#4A0E78]"}`}>
                                    {dish.name}
                                  </span>
                                  {dish.extraPriceCents && (
                                    <span className="ml-2 text-[13px] font-semibold text-[#7B2CBF]">
                                      +${(dish.extraPriceCents / 100).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </button>

                              {/* Toggle "Se acabó" editable después de publicar */}
                              {published && isSelected && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleExhausted(dish.name)}
                                  className={`rounded-full px-2.5 py-1 text-[13px] font-bold transition-all active:scale-95 ${
                                    isExhausted
                                      ? "bg-[#C0392B] text-white"
                                      : "bg-[#F5F3FA] text-[#6B5B7B] border border-[#E7E1F2]"
                                  }`}
                                >
                                  {isExhausted ? "Agotado" : "Se acabó"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Publicar menú: Repetir ayer + Publicar = 2 toques */}
                <div className="pt-2">
                  <ButtonPrimary onClick={handlePublish}>
                    {published ? "Actualizar menú" : MENU_COPY.publishButton}
                  </ButtonPrimary>
                </div>
              </div>
            )}

            {/* SEGMENTO 2: MIS PLATOS (Catálogo exclusivo del restaurante) */}
            {activeSegment === "catalogo" && (
              <div className="space-y-5">
                {/* Configurar Secciones del restaurante */}
                <div className="rounded-[24px] bg-[#F5F3FA] p-4 border border-[#E7E1F2] space-y-2">
                  <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block">
                    Secciones activas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Sopa", "Segundo", "Postre", "Bebida"].map((sec) => {
                      const on = activeSections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleToggleSection(sec)}
                          aria-pressed={on}
                          className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all ${
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

                {/* Botón Crear plato en 2 toques */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="w-full rounded-2xl bg-[#F3E8FF] py-3 text-[14px] font-bold text-[#7B2CBF] border border-[#E0AAFF] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo plato al catálogo</span>
                </button>

                {/* Lista del catálogo por sección */}
                {activeSections.map((sec) => {
                  const items = catalog.filter((c) => c.section === sec);
                  return (
                    <div key={sec} className="space-y-2">
                      <h3 className="text-[14px] font-extrabold text-[#4A0E78]">{sec}</h3>
                      <div className="space-y-2">
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
                    </div>
                  );
                })}
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
