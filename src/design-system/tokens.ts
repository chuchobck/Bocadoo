/**
 * Design Tokens — Bocadoo
 * Única fuente de verdad de valores visuales, dimensiones y reglas de diseño.
 * Basado en docs/IDENTIDAD_BOCADOO.md y las 3 Reglas de Oro.
 */

export const TOKENS = {
  colors: {
    // Morados de marca
    primary: "#7B2CBF",
    primaryHover: "#6A22A9",
    textPrimary: "#4A0E78",
    textSecondary: "#6B5B7B",
    lavender: "#E0AAFF",
    lilacSoft: "#F3E8FF",

    // Superficies y neutros
    appBackground: "#F5F3FA",
    card: "#FFFFFF",
    border: "#E7E1F2",

    // Estados funcionales (Solo Verde, Rojo y Morado Medio)
    success: "#1F9D55",
    successBg: "#E6F6EC",
    successText: "#157A41",

    error: "#C0392B",
    errorBg: "#FDEBEB",
    errorText: "#C0392B",

    // Advertencia funcional en gama morada (#9D4EDD)
    warning: "#9D4EDD",
    warningBg: "#F3E8FF",
    warningText: "#4A0E78",
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
    soft: "0 4px 16px rgba(74, 14, 120, 0.06)",
    card: "0 10px 28px rgba(74, 14, 120, 0.08)",
    brand: "0 12px 30px rgba(123, 44, 191, 0.22)",
    pressed: "0 2px 8px rgba(74, 14, 120, 0.12)",
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
