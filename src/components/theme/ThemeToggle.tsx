import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string; Icon: LucideIcon }> = [
  { value: "system", label: "Sistema", Icon: Monitor },
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Oscuro", Icon: Moon },
];

export interface ThemeToggleProps {
  /**
   * - `segmented`: control Sistema / Claro / Oscuro (Ajustes del comensal y del dueño).
   * - `icon`: botón sol/luna que alterna claro y oscuro (navbar de la landing).
   */
  variant?: "segmented" | "icon";
  className?: string;
}

/** Selector de tema reutilizable. Lee y escribe a través de `useTheme()`. */
export function ThemeToggle({ variant = "segmented", className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const groupRef = useRef<HTMLDivElement>(null);

  if (variant === "icon") {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={next === "dark" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        className={cn(
          "theme-toggle grid h-11 w-11 place-items-center rounded-full bg-secondary-container text-on-secondary-container active:scale-95",
          className,
        )}
      >
        {/* Ambos íconos van en el DOM y el CSS elige cuál mostrar según <html class="dark">:
            así no hay parpadeo de ícono antes de hidratar. */}
        <Moon className="theme-toggle-icon theme-toggle-icon--moon" size={20} aria-hidden="true" />
        <Sun className="theme-toggle-icon theme-toggle-icon--sun" size={20} aria-hidden="true" />
      </button>
    );
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = OPTIONS.findIndex((option) => option.value === theme);
    const next = OPTIONS[(index + step + OPTIONS.length) % OPTIONS.length];
    if (!next) return;
    setTheme(next.value);
    groupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-theme-option="${next.value}"]`)
      ?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Apariencia"
      onKeyDown={onKeyDown}
      className={cn(
        "grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-background p-1.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-theme-option={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[13px] font-bold transition-colors active:scale-95",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary-container hover:text-on-primary-container",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
