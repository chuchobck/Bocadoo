/**
 * Dominio de Fechas y Tiempo de Servicio — Bocadoo
 * Huso horario oficial: América/Guayaquil (UTC-5).
 * Formatos de marca: "Vence 30 oct", "Hoy 13:12", "Hace 5 min".
 */

const MONTH_NAMES_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

/**
 * Retorna fecha formateada para vigencias de planes: "Vence 30 oct".
 */
export function formatPlanExpiration(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()] || "";
  return `Vence ${day} ${month}`;
}

/**
 * Retorna hora corta en formato 24h: "13:12".
 */
export function formatTime24h(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Retorna formato para movimientos: "Hoy 13:12" o "30 oct 13:12".
 */
export function formatMovementDate(date: Date | string, referenceNow = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const isToday =
    d.getFullYear() === referenceNow.getFullYear() &&
    d.getMonth() === referenceNow.getMonth() &&
    d.getDate() === referenceNow.getDate();

  const time = formatTime24h(d);
  if (isToday) return `Hoy ${time}`;
  return `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]} ${time}`;
}

/**
 * Calcula la fecha del último día del mes en curso (vencimiento por defecto).
 */
export function getEndOfCurrentMonth(reference = new Date()): Date {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  // El día 0 del mes siguiente es el último día del mes actual
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

/**
 * Diferencia en días entre dos fechas.
 */
export function differenceInCalendarDays(target: Date | string, reference: Date | string = new Date()): number {
  const t = typeof target === "string" ? new Date(target) : target;
  const r = typeof reference === "string" ? new Date(reference) : reference;
  const utct = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const utcr = Date.UTC(r.getFullYear(), r.getMonth(), r.getDate());
  return Math.floor((utct - utcr) / (1000 * 60 * 60 * 24));
}

/**
 * Diferencia en minutos entre dos timestamps.
 */
export function differenceInMinutes(target: Date | string, reference: Date | string = new Date()): number {
  const t = typeof target === "string" ? new Date(target) : target;
  const r = typeof reference === "string" ? new Date(reference) : reference;
  return Math.floor((t.getTime() - r.getTime()) / (1000 * 60));
}
