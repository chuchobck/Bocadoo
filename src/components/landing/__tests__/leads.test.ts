import { describe, expect, it } from "vitest";

import { buildLeadWhatsAppUrl } from "../leads";

describe("buildLeadWhatsAppUrl", () => {
  it("arma el mensaje prellenado con nombre, restaurante y WhatsApp", () => {
    const url = buildLeadWhatsAppUrl({
      nombre: "María Torres",
      restaurante: "Sazón de Casa",
      whatsapp: "0991234567",
    });
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    const text = decodeURIComponent(url.split("?text=")[1] ?? "");
    expect(text).toBe(
      "Hola equipo Bocadoo, soy María Torres del restaurante Sazón de Casa (WhatsApp: 0991234567) y quiero digitalizar mis planes y probar el piloto.",
    );
  });
});
