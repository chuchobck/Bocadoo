/**
 * Dominio Monetario de Bocadoo
 * Todo cálculo interno se realiza en CENTAVOS ENTEROS para evitar errores de coma flotante.
 * Formato oficial Ecuador: "$2,75", "$55,00", "$0,00".
 */

export type Cents = number;

/**
 * Formatea centavos a formato oficial con coma decimal: "$2,75", "$55,00".
 */
export function formatMoney(cents: Cents): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `$${dollars},${remainder.toString().padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Parsea un valor numérico o string ("2,75", "2.75", 2.75) a centavos enteros.
 */
export function parseToCents(input: string | number): Cents {
  if (typeof input === "number") {
    return Math.round(input * 100);
  }
  const clean = input.trim().replace("$", "").replace(/\s/g, "");
  if (!clean) return 0;
  // Soporta coma o punto decimal
  const normalized = clean.replace(",", ".");
  const val = parseFloat(normalized);
  return isNaN(val) ? 0 : Math.round(val * 100);
}

/**
 * Calcula la comisión de una venta (7% transparente).
 */
export function calculateCommission(cents: Cents, rate = 0.07): Cents {
  return Math.round(cents * rate);
}
