import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

export const FORBIDDEN_TOKENS = [
  // Tipografía prohibida (< 13px)
  { name: "text-[7px]", regex: /text-\[7px\]/g },
  { name: "text-[8px]", regex: /text-\[8px\]/g },
  { name: "text-[9px]", regex: /text-\[9px\]/g },
  { name: "text-[10px]", regex: /text-\[10px\]/g },
  { name: "text-[11px]", regex: /text-\[11px\]/g },
  { name: "text-[12px]", regex: /text-\[12px\]/g },

  // Fondos y textos negros / oscuros prohibidos
  { name: "card-dark", regex: /card-dark/g },
  { name: "bg-black", regex: /\bbg-black\b/g },
  { name: "text-black", regex: /\btext-black\b/g },
  { name: "#000000", regex: /#000000\b/gi },

  // Tipografía no autorizada
  { name: "Outfit font", regex: /\bOutfit\b/g },

  // Colores sueltos: todo color sale de los tokens de src/styles.css (claro y oscuro).
  // Se exceptúan los archivos de COLOR_ALLOWED_FILES (ver abajo).
  { name: "hex suelto (#rgb / #rrggbb)", regex: /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, color: true },
  { name: "rgb()/rgba()/hsl()/oklch() suelto", regex: /\b(?:rgba?|hsla?|oklch)\(/g, color: true },

  // Colores fuera de la paleta oficial (sin ámbar, naranja ni amarillo)
  { name: "amber-*", regex: /\bamber-/g },
  { name: "orange-*", regex: /\borange-/g },
  { name: "yellow-*", regex: /\byellow-/g },
  {
    name: "ámbar (palabra)",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])[aá]mbar(es)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "amarillo (palabra)",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])amarill[oa]s?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "naranja/naranjo (palabra)",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])naranj[ao]s?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },

  // Diálogos nativos bloqueantes
  { name: "window.confirm", regex: /window\.confirm/g },
  { name: "alert()", regex: /\balert\(/g },

  // Palabras prohibidas en la experiencia de usuario (con límites de palabra Unicode)
  {
    name: "suscripción",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])suscripci[oó]n(es)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "transacción",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])transacci[oó]n(es)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "canje",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])canjes?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "canjear",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])canje(ar|ado|ada|ados|adas|an|a|o)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "redención",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])redenci[oó]n(es)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "gestión",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])gesti[oó]n(es)?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "módulo",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])m[oó]dulos?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "dashboard",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])dashboards?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "procesar",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])proces(ar|ando|ado|ada|a|an|o)(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  {
    name: "ítem",
    regex: /(?<![a-záéíóúñA-ZÁÉÍÓÚÑ])ítems?(?![a-záéíóúñA-ZÁÉÍÓÚÑ])/giu,
  },
  { name: "migrar", regex: /\bmigrar\b/gi },
  { name: "comanda", regex: /\bcomanda\b/gi },
  { name: "TOTP", regex: /\bTOTP\b/g },
  { name: "BCD-PASS", regex: /\bBCD-PASS\b/g },
];

/**
 * Únicos archivos donde se permiten colores literales:
 * - styles.css: fuente única de verdad de los tokens (claro/oscuro).
 * - qr-colors.ts: colores del QR (siempre #2D0050 sobre #FFFFFF, también en oscuro).
 * - ui/chart.tsx: selectores CSS que apuntan a los atributos por defecto de recharts (no pintan nada).
 */
export const COLOR_ALLOWED_FILES = new Set([
  "src/styles.css",
  "src/lib/qr-colors.ts",
  "src/components/ui/chart.tsx",
]);

/**
 * Piezas base ya corregidas y 100% libres de infracciones de marca (0 infracciones).
 * Se mantienen vigiladas; cualquier infracción aquí falla inmediatamente.
 */
export const BASE_PIECES_CLEAN = [
  "src/components/ui/alert-dialog.tsx",
  "src/components/ui/dialog.tsx",
  "src/components/ui/drawer.tsx",
  "src/components/ui/sheet.tsx",
  "src/routes/__root.tsx",
  "src/styles.css",
];

/**
 * Pantallas y flujos viejos pendientes de rediseño (Etapas 2 a 5).
 * Esta lista SOLO puede encogerse y debe llegar a 0 al final de la Etapa 5.
 * Se anota el conteo exacto de infracciones de cada archivo:
 */
export const LEGACY_SCREEN_FILES = {
  "src/components/bocadoo/auth.tsx": 64, // Etapa 4: Login & onboarding
  "src/components/bocadoo/store.tsx": 28, // Modelo de datos retrocompatible
  "src/components/bocadoo/ui.tsx": 5, // Primitivas legadas a sustituir por src/design-system
  "src/components/landing/LandingPage.tsx": 5, // Landing
  "src/routes/app/galeria.tsx": 216, // Etapa 5: Galería nueva
  "src/features/comensal/donde-comer/Screen.tsx": 16,
  "src/features/comensal/ficha-local/Screen.tsx": 9,
  "src/features/comensal/mesa-amigos/Screen.tsx": 7,
  "src/features/comensal/pase/Screen.tsx": 9,
  "src/features/comensal/pedido/Screen.tsx": 6,
  "src/features/comensal/unirme-mesa/Screen.tsx": 13,
  "src/features/dueno/caja/Screen.tsx": 6,
  "src/features/dueno/planes/Screen.tsx": 17,
  "src/features/dueno/registrar-consumo/Screen.tsx": 31,
  "src/routes/app/comensal/planes.tsx": 13,
};

export const LEGACY_FILES = new Set(Object.keys(LEGACY_SCREEN_FILES));

function scanDirectory(dir, fileList = []) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        // Excluir src/dev y directorios de test
        if (entry !== "dev" && entry !== "__tests__" && entry !== "node_modules") {
          scanDirectory(fullPath, fileList);
        }
      } else if (
        /\.(tsx|ts|jsx|js|css)$/.test(entry) &&
        !entry.includes(".test.") &&
        !entry.includes(".spec.")
      ) {
        fileList.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error al escanear directorio ${dir}:`, err);
  }
  return fileList;
}

const allFiles = scanDirectory("src");
const perFileViolations = new Map();
const unlistedViolations = [];
const legacyCleanCandidates = [];

for (const filePath of allFiles) {
  const normalizedPath = relative(".", filePath).replace(/\\/g, "/");
  const content = readFileSync(filePath, "utf-8");
  const issues = [];

  for (const token of FORBIDDEN_TOKENS) {
    if (token.color && COLOR_ALLOWED_FILES.has(normalizedPath)) continue;
    if (token.name === "card-dark" && normalizedPath === "src/styles.css") continue;
    // Resetear regex global
    token.regex.lastIndex = 0;
    const matches = content.match(token.regex);
    if (matches && matches.length > 0) {
      issues.push({ token: token.name, count: matches.length });
    }
  }

  const totalCount = issues.reduce((sum, item) => sum + item.count, 0);

  if (totalCount > 0) {
    perFileViolations.set(normalizedPath, { totalCount, issues });
    if (!LEGACY_FILES.has(normalizedPath)) {
      unlistedViolations.push({ file: normalizedPath, totalCount, issues });
    }
  } else if (LEGACY_FILES.has(normalizedPath)) {
    legacyCleanCandidates.push(normalizedPath);
  }
}

console.log("\n=======================================================");
console.log("🔍 REPORTE DE LINT:BRAND (Identidad y Buenas Prácticas)");
console.log("=======================================================\n");

console.log(`Archivos escaneados en src/: ${allFiles.length}`);
console.log(`Archivos legado permitidos con infracciones: ${perFileViolations.size - unlistedViolations.length}`);
console.log(`Archivos no autorizados con infracciones: ${unlistedViolations.length}\n`);

console.log("--- Desglose de infracciones por archivo legado ---");
for (const [file, info] of perFileViolations.entries()) {
  const isLegacy = LEGACY_FILES.has(file);
  const tag = isLegacy ? "\x1b[33m[LEGACY]\x1b[0m" : "\x1b[31m[NUEVO/NO PERMITIDO]\x1b[0m";
  console.log(`${tag} ${file}: ${info.totalCount} infracciones`);
  for (const issue of info.issues) {
    console.log(`    - ${issue.token}: ${issue.count}`);
  }
}

if (legacyCleanCandidates.length > 0) {
  console.log("\n\x1b[36m🎉 ARCHIVOS LEGADO LIMPIOS (¡Pueden removerse de LEGACY_FILES!):\x1b[0m");
  for (const file of legacyCleanCandidates) {
    console.log(`  - ${file}`);
  }
}

if (unlistedViolations.length > 0) {
  console.error("\n\x1b[31m❌ ERROR LINT:BRAND: Se encontraron infracciones en archivos fuera de la lista LEGACY:\x1b[0m");
  for (const v of unlistedViolations) {
    console.error(`  ✖ ${v.file} (${v.totalCount} infracciones no autorizadas)`);
    for (const issue of v.issues) {
      console.error(`      * ${issue.token}: ${issue.count}`);
    }
  }
  console.error("\nCorrige las infracciones o usa el sistema de diseño antes de continuar.\n");
  process.exit(1);
} else {
  console.log("\n\x1b[32m✔ LINT:BRAND PASÓ: Todos los archivos nuevos están limpios de infracciones de marca.\x1b[0m\n");
  process.exit(0);
}
