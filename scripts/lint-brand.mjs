import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const FORBIDDEN_TOKENS = [
  // Typography sizes forbidden
  /text-\[7px\]/g,
  /text-\[8px\]/g,
  /text-\[9px\]/g,
  /text-\[10px\]/g,
  /text-\[11px\]/g,
  /text-\[12px\]/g,

  // Dark/black backgrounds forbidden
  /card-dark/g,
  /\bbg-black\b/g,
  /#000000\b/gi,
  /\bOutfit\b/g,

  // Forbidden off-palette colors
  /\bamber-/g,
  /\borange-/g,
  /\byellow-/g,

  // Forbidden alerts/confirms
  /window\.confirm/g,
  /\balert\(/g,

  // Forbidden words in UI / copy
  /suscripción/gi,
  /transacción/gi,
  /\bcanje\b/gi,
  /canjear/gi,
  /redención/gi,
  /\bgestión\b/gi,
  /\bmódulo\b/gi,
  /\bdashboard\b/gi,
  /\bprocesar\b/gi,
  /\bítem/gi,
  /\bmigrar\b/gi,
  /\bcomanda\b/gi,
  /\bTOTP\b/g,
  /\bBCD-PASS\b/g,
];

// Target directories for new architecture
const TARGET_DIRS = ["src/design-system", "src/features", "src/domain", "src/platform"];

function scanDir(dir, violations) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, violations);
      } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry) && !entry.includes(".test.") && !entry.includes(".spec.")) {
        const content = readFileSync(fullPath, "utf-8");
        FORBIDDEN_TOKENS.forEach((pattern) => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              file: fullPath,
              pattern: pattern.toString(),
              count: matches.length,
            });
          }
        });
      }
    }
  } catch (err) {
    // directory might not exist yet during incremental steps
  }
}

const violations = [];
for (const dir of TARGET_DIRS) {
  scanDir(dir, violations);
}

if (violations.length > 0) {
  console.error("\x1b[31m[lint:brand] Infracciones de marca detectadas:\x1b[0m");
  for (const v of violations) {
    console.error(`  - ${v.file}: ${v.count}x patrón ${v.pattern}`);
  }
  process.exit(1);
} else {
  console.log("\x1b[32m[lint:brand] 0 infracciones detectadas. Marca e identidad 100% limpias.\x1b[0m");
  process.exit(0);
}
