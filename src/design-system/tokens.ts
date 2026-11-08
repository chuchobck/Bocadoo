/**
 * Design Tokens — Bocadoo
 * Los colores y sombras son REFERENCIAS a las variables CSS de src/styles.css, que es la única
 * fuente de verdad (claro/oscuro). Aquí no se escriben hex: usa `var(--token)` o la utilidad
 * de Tailwind equivalente. Reglas de uso en docs/IDENTIDAD_BOCADOO.md y las 3 Reglas de Oro.
 */

export const TOKENS = {
  colors: {
    // Morados de marca
    primary: "var(--primary)",
    primaryHover: "var(--primary-hover)",
    textPrimary: "var(--foreground)",
    textSecondary: "var(--muted-foreground)",
    lavender: "var(--primary-container)",
    lilacSoft: "var(--primary-container)",

    // Superficies y neutros
    appBackground: "var(--background)",
    card: "var(--surface)",
    border: "var(--border)",

    // Estados funcionales (Solo Verde, Rojo y Morado Medio)
    success: "var(--success)",
    successBg: "var(--success-container)",
    successText: "var(--success)",

    error: "var(--danger)",
    errorBg: "var(--danger-container)",
    errorText: "var(--on-danger-container)",

    // Advertencia funcional en gama morada
    warning: "var(--primary)",
    warningBg: "var(--primary-container)",
    warningText: "var(--on-primary-container)",
  },

  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    sizes: {
      metadata: "13px",
      body: "15px",
      button: "17px",
      title: "20px",
      bigNumber: "44px",
      giantNumber: "56px",
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  radii: {
    capsule: "9999px",
    card: "32px",
    sheet: "32px",
    input: "16px",
    chip: "16px",
    button: "9999px",
    scanner: "28px",
  },

  touchTargets: {
    minApp: "48px",
    minCaja: "64px",
    navBarHeight: "72px",
  },

  shadows: {
    soft: "var(--shadow-sm)",
    card: "var(--shadow)",
    brand: "var(--shadow-brand)",
    pressed: "var(--shadow-sm)",
  },

  transitions: {
    fast: "150ms ease",
    standard: "220ms cubic-bezier(0.16, 1, 0.3, 1)",
    bounce: "350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  durations: {
    undoBufferSeconds: 10,
    qrRefreshSeconds: 30,
    manualBusyMinutes: 20,
    peakHourSimMinutes: 25,
  },
} as const;

export type BocadooColors = typeof TOKENS.colors;
