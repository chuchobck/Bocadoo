import { useNavigate } from "@tanstack/react-router";
import { Check, ImagePlus, Pencil, Plus, Sparkles, Trash2, Utensils, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  MENU_SECTIONS,
  emptyMenu,
  loadMenu,
  newDishId,
  saveMenu,
  shrinkPhoto,
  type MenuDish,
  type MenuSectionId,
  type SavedMenu,
  type SpecialDish,
} from "./menu-service";
import { money, useBocadoo } from "./store";
import {
  BottomSheet,
  ModalHeader,
  Overlay,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SectionTitle,
} from "./ui";

const PRICE_RE = /^\d+([.,]\d{1,2})?$/;

/** Devuelve el precio como número, `undefined` si está vacío o `null` si no es válido. */
const parsePrice = (text: string) => {
  const t = text.trim();
  if (!t) return undefined;
  return PRICE_RE.test(t) ? Number(t.replace(",", ".")) : null;
};

const inputClass = (error?: string) =>
  `flex h-10 w-full items-center rounded-xl bg-muted px-3.5 text-[11px] font-semibold outline-none ring-primary focus:ring-2 ${error ? "ring-2 ring-danger" : ""}`;

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <>
      <label htmlFor={id} className="mb-2 mt-4 block text-[9px] font-black text-muted-foreground">
        {label}
      </label>
      {children(id, error ? errorId : undefined)}
      {error && (
        <p id={errorId} className="mt-1.5 text-[9px] font-bold text-danger">
          {error}
        </p>
      )}
    </>
  );
};

type Editing =
  | { kind: "section"; section: MenuSectionId; dish?: MenuDish }
  | { kind: "special"; dish?: SpecialDish };

function DishSheet({
  editing,
  onClose,
  onSave,
}: {
  editing: Editing;
  onClose: () => void;
  onSave: (dish: MenuDish | SpecialDish) => void;
}) {
  const special = editing.kind === "special";
  const sectionLabel =
    editing.kind === "section"
      ? MENU_SECTIONS.find((s) => s.id === editing.section)?.label
      : "Plato especial";
  const [name, setName] = useState(editing.dish?.name ?? "");
  const [description, setDescription] = useState(editing.dish?.description ?? "");
  const [price, setPrice] = useState(
    editing.dish?.price !== undefined ? String(editing.dish.price).replace(".", ",") : "",
  );
  const [photo, setPhoto] = useState(special ? editing.dish?.photo : undefined);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPhoto(await shrinkPhoto(file));
    } catch {
      toast.error("No pudimos leer esa foto. Prueba con otra imagen.");
    }
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Escribe el nombre del plato.";
    const value = parsePrice(price);
    if (value === null) next.price = "Usa un precio válido, por ejemplo 2,50.";
    else if (special && value === undefined) next.price = "Los platos a la carta necesitan precio.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const base = {
      id: editing.dish?.id ?? newDishId(),
      name: name.trim(),
      description: description.trim(),
    };
    onSave(
      special
        ? { ...base, price: value ?? 0, ...(photo ? { photo } : {}) }
        : { ...base, ...(value !== undefined && value !== null ? { price: value } : {}) },
    );
  };

  return (
    <Overlay onClose={onClose}>
      <BottomSheet>
        <ModalHeader
          icon={special ? Sparkles : Utensils}
          eyebrow={(sectionLabel ?? "").toUpperCase()}
          title={editing.dish ? "Editar plato" : "Agregar plato"}
          onClose={onClose}
        />
        <Field label="NOMBRE DEL PLATO" error={errors.name}>
          {(id, describedBy) => (
            <input
              id={id}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Locro de papa"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy}
              className={inputClass(errors.name)}
            />
          )}
        </Field>
        <Field label="DESCRIPCIÓN CORTA">
          {(id) => (
            <input
              id={id}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
              placeholder="Ej. Con aguacate y queso"
              className={inputClass()}
            />
          )}
        </Field>
        <Field label={special ? "PRECIO" : "PRECIO (OPCIONAL)"} error={errors.price}>
          {(id, describedBy) => (
            <input
              id={id}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="$0,00"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={describedBy}
              className={inputClass(errors.price)}
            />
          )}
        </Field>
        {special && (
          <>
            <p className="mb-2 mt-4 text-[9px] font-black text-muted-foreground">FOTO (OPCIONAL)</p>
            {photo ? (
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={photo}
                  alt={name || "Foto del plato"}
                  className="h-[110px] w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Quitar foto"
                  onClick={() => setPhoto(undefined)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 outline-none ring-primary focus-visible:ring-2"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border text-muted-foreground ring-primary focus-within:ring-2">
                <ImagePlus size={20} className="text-primary" />
                <span className="text-[9px] font-bold">Subir foto del plato</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pickPhoto(e.target.files?.[0])}
                />
              </label>
            )}
          </>
        )}
        <PrimaryButton onClick={submit}>
          <Check size={16} /> {editing.dish ? "Guardar cambios" : "Agregar plato"}
        </PrimaryButton>
        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
      </BottomSheet>
    </Overlay>
  );
}

const DishRow = ({
  name,
  description,
  price,
  photo,
  onEdit,
  onRemove,
}: {
  name: string;
  description: string;
  price?: number | undefined;
  photo?: string | undefined;
  onEdit: () => void;
  onRemove: () => void;
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
    <div className="flex min-w-0 items-center gap-3">
      {photo && (
        <img src={photo} alt={name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
      )}
      <div className="min-w-0">
        <p className="truncate text-[11px] font-extrabold">{name}</p>
        {description && (
          <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{description}</p>
        )}
        {price !== undefined && (
          <p className="mt-0.5 text-[10px] font-black text-primary">{money(price)}</p>
        )}
      </div>
    </div>
    <div className="flex gap-1.5">
      <button
        type="button"
        aria-label={`Editar ${name}`}
        onClick={onEdit}
        className="grid h-8 w-8 place-items-center rounded-full bg-accent text-primary outline-none ring-primary focus-visible:ring-2"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        aria-label={`Quitar ${name}`}
        onClick={onRemove}
        className="grid h-8 w-8 place-items-center rounded-full bg-danger-soft text-danger outline-none ring-primary focus-visible:ring-2"
      >
        <Trash2 size={13} />
      </button>
    </div>
  </div>
);

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[9px] font-bold text-primary outline-none ring-primary focus-visible:ring-2"
  >
    <Plus size={11} strokeWidth={3} /> Agregar
  </button>
);

const Empty = ({ children }: { children: ReactNode }) => (
  <p className="py-3 text-center text-xs text-muted-foreground">{children}</p>
);

// Acciones del dueño 6: armar el menú del día y la carta de platos especiales.
export function AddMenuScreen() {
  const navigate = useNavigate();
  const { publishMenu } = useBocadoo();
  const [menu, setMenu] = useState<SavedMenu>(emptyMenu);
  const [editing, setEditing] = useState<Editing | null>(null);

  // Si ya hay un menú guardado, se edita ese.
  useEffect(() => {
    loadMenu().then((saved) => saved && setMenu(saved));
  }, []);

  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((d) => d.id === item.id)
      ? list.map((d) => (d.id === item.id ? item : d))
      : [...list, item];

  const saveDish = (dish: MenuDish | SpecialDish) => {
    if (!editing) return;
    setMenu((m) =>
      editing.kind === "special"
        ? { ...m, specials: upsert(m.specials, dish as SpecialDish) }
        : {
            ...m,
            sections: {
              ...m.sections,
              [editing.section]: upsert(m.sections[editing.section], dish as MenuDish),
            },
          },
    );
    setEditing(null);
  };

  const removeDish = (section: MenuSectionId | "special", id: string) =>
    setMenu((m) =>
      section === "special"
        ? { ...m, specials: m.specials.filter((d) => d.id !== id) }
        : {
            ...m,
            sections: { ...m.sections, [section]: m.sections[section].filter((d) => d.id !== id) },
          },
    );

  const total =
    Object.values(menu.sections).reduce((sum, list) => sum + list.length, 0) + menu.specials.length;

  const save = async () => {
    if (total === 0) {
      toast.error("Agrega al menos un plato para guardar el menú.");
      return;
    }
    try {
      await saveMenu(menu);
      publishMenu({
        secciones: {
          sopa: menu.sections.sopa.map((d) => ({
            id: d.id,
            nombre: d.name,
            descripcion: d.description,
            agotado: false,
          })),
          fuerte: menu.sections.fuerte.map((d) => ({
            id: d.id,
            nombre: d.name,
            descripcion: d.description,
            precioCents: d.price ? Math.round(d.price * 100) : undefined,
            agotado: false,
          })),
          jugo: menu.sections.jugo.map((d) => ({
            id: d.id,
            nombre: d.name,
            descripcion: d.description,
            agotado: false,
          })),
          postre: menu.sections.postre.map((d) => ({
            id: d.id,
            nombre: d.name,
            descripcion: d.description,
            agotado: false,
          })),
          adicional: menu.sections.adicional.map((d) => ({
            id: d.id,
            nombre: d.name,
            descripcion: d.description,
            precioCents: d.price ? Math.round(d.price * 100) : undefined,
            agotado: false,
          })),
        },
      });
    } catch {
      toast.error("No se pudo guardar. Prueba con fotos más livianas.");
      return;
    }
    toast.success("Menú guardado y publicado", {
      description: "Tus clientes ya pueden ver el menú de hoy.",
    });
    navigate({ to: "/app/dueno/menu" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <ScreenHeader
          eyebrow="LA CUCHARA DE SAN BLAS"
          title="Agregar menú"
          back="/app/dueno/menu"
          action={
            <span className="text-[11px] font-extrabold text-primary">
              {total} {total === 1 ? "plato" : "platos"}
            </span>
          }
        />
        <p className="mb-1 mt-5 text-[9px] font-black text-muted-foreground">MENÚ DEL DÍA</p>
        {MENU_SECTIONS.map(({ id, label }) => (
          <section key={id} className="mt-4" aria-label={label}>
            <SectionTitle
              action={
                <AddButton
                  label={`Agregar plato a ${label}`}
                  onClick={() => setEditing({ kind: "section", section: id })}
                />
              }
            >
              {label}
            </SectionTitle>
            <div className="mt-2 space-y-2">
              {menu.sections[id].length === 0 ? (
                <Empty>Aún no hay platos en {label.toLowerCase()}.</Empty>
              ) : (
                menu.sections[id].map((dish) => (
                  <DishRow
                    key={dish.id}
                    {...dish}
                    onEdit={() => setEditing({ kind: "section", section: id, dish })}
                    onRemove={() => removeDish(id, dish.id)}
                  />
                ))
              )}
            </div>
          </section>
        ))}

        <section className="mt-6 border-t border-border pt-4" aria-label="Platos especiales">
          <SectionTitle
            action={
              <AddButton
                label="Agregar plato especial"
                onClick={() => setEditing({ kind: "special" })}
              />
            }
          >
            Platos especiales (a la carta)
          </SectionTitle>
          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Se venden aparte, no forman parte del menú del día.
          </p>
          <div className="mt-2 space-y-2">
            {menu.specials.length === 0 ? (
              <Empty>Aún no hay platos a la carta.</Empty>
            ) : (
              menu.specials.map((dish) => (
                <DishRow
                  key={dish.id}
                  {...dish}
                  onEdit={() => setEditing({ kind: "special", dish })}
                  onRemove={() => removeDish("special", dish.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
      <div className="shrink-0 px-5 pb-7">
        <PrimaryButton onClick={save}>
          <Check size={16} /> Guardar menú
        </PrimaryButton>
      </div>
      {editing && (
        <DishSheet editing={editing} onClose={() => setEditing(null)} onSave={saveDish} />
      )}
    </div>
  );
}
