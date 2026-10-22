/**
 * Compartir en Bocadoo (Flujo "Mesa con amigos")
 * Utiliza Web Share API nativa con fallback automático a WhatsApp web/app.
 */

export async function shareRestaurantTable({
  restaurantName,
  todayDish,
  url = window.location.href,
}: {
  restaurantName: string;
  todayDish?: string;
  url?: string;
}): Promise<boolean> {
  const shareText = todayDish
    ? `¡Vamos a almorzar en ${restaurantName}! Hoy tienen ${todayDish}.`
    : `¡Vamos a almorzar en ${restaurantName}!`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `Almuerzo en ${restaurantName} — Bocadoo`,
        text: shareText,
        url,
      });
      return true;
    } catch {
      // Si el usuario canceló el share sheet, no hacer fallback
      return false;
    }
  }

  // Fallback directo a WhatsApp
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  return true;
}
