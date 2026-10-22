/**
 * Dominio de Cierre y Arqueo de Caja — Bocadoo
 * Reglas de negocio:
 * 1. Solo el dinero cobrado HOY en EFECTIVO forma parte del efectivo esperado en gaveta.
 * 2. Las transferencias se desglosan por separado.
 * 3. Los almuerzos del plan consumidos hoy no suman efectivo hoy (ingresaron cuando se vendió el plan).
 * 4. Comparación:
 *    - Diferencia = Contado - Esperado
 *    - 0: "Cuadra"
 *    - < 0: "Faltan $X"
 *    - > 0: "Sobran $X"
 */

import { type Cents, formatMoney } from "./money";

export interface CashClosureInput {
  efectivoContadoCents: Cents;
  ventasPosEfectivoCents: Cents;
  ventasPosTransferenciaCents: Cents;
  planesEfectivoCents: Cents;
  planesTransferenciaCents: Cents;
  almuerzosServidosHoy: number;
}

export interface CashClosureResult {
  efectivoContadoCents: Cents;
  efectivoEsperadoCents: Cents;
  transferenciasTotalCents: Cents;
  diferenciaCents: Cents;
  estado: "CUADRA" | "FALTA" | "SOBRA";
  etiquetaDiferencia: string;
  almuerzosServidosHoy: number;
}

/**
 * Realiza el balance y arqueo diario de caja.
 */
export function calculateCashClosure(input: CashClosureInput): CashClosureResult {
  const efectivoEsperado = input.ventasPosEfectivoCents + input.planesEfectivoCents;
  const transferenciasTotal = input.ventasPosTransferenciaCents + input.planesTransferenciaCents;
  const diferencia = input.efectivoContadoCents - efectivoEsperado;

  let estado: "CUADRA" | "FALTA" | "SOBRA" = "CUADRA";
  let etiquetaDiferencia = "Cuadra";

  if (diferencia < 0) {
    estado = "FALTA";
    etiquetaDiferencia = `Faltan ${formatMoney(Math.abs(diferencia))}`;
  } else if (diferencia > 0) {
    estado = "SOBRA";
    etiquetaDiferencia = `Sobran ${formatMoney(diferencia)}`;
  }

  return {
    efectivoContadoCents: input.efectivoContadoCents,
    efectivoEsperadoCents: efectivoEsperado,
    transferenciasTotalCents: transferenciasTotal,
    diferenciaCents: diferencia,
    estado,
    etiquetaDiferencia,
    almuerzosServidosHoy: input.almuerzosServidosHoy,
  };
}
