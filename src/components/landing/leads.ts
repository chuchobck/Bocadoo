/** Captura local de leads de la landing (respaldo en el dispositivo durante las entrevistas). */

export const LEADS_STORAGE_KEY = "bocadoo-captured-leads";

/**
 * Número de WhatsApp del equipo (solo dígitos, con código de país, ej. "593999999999").
 * Vacío = `wa.me/?text=` abre WhatsApp y deja elegir el contacto.
 */
export const LEAD_WHATSAPP_NUMBER = "";

export interface CapturedLead {
  nombre: string;
  restaurante: string;
  whatsapp: string;
  timestamp: string; // ISO
}

export function readLeads(): CapturedLead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CapturedLead[]) : [];
  } catch {
    return [];
  }
}

/** Agrega el lead al arreglo guardado. Devuelve false si el navegador no permite guardar. */
export function saveLead(lead: CapturedLead): boolean {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([...readLeads(), lead]));
    return true;
  } catch {
    return false;
  }
}

export function buildLeadWhatsAppUrl(lead: Pick<CapturedLead, "nombre" | "restaurante" | "whatsapp">): string {
  const text =
    `Hola equipo Bocadoo, soy ${lead.nombre} del restaurante ${lead.restaurante} ` +
    `(WhatsApp: ${lead.whatsapp}) y quiero digitalizar mis planes y probar el piloto.`;
  return `https://wa.me/${LEAD_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
