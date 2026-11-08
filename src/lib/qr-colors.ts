/**
 * Colores del QR. Son los ÚNICOS hex permitidos en src/ fuera de styles.css.
 *
 * El QR va SIEMPRE con puntos #2D0050 sobre fondo blanco #FFFFFF, también en modo oscuro:
 * si se invierte o se tematiza, el lector de caja no lo escanea.
 * Espejo de --qr-fg / --qr-bg en src/styles.css (para el CSS: bg-qr-bg, text-qr-fg).
 */
export const QR_FOREGROUND = "#2D0050";
export const QR_BACKGROUND = "#FFFFFF";
