import { createFileRoute } from "@tanstack/react-router";

import { FlujosPage } from "@/components/flujos/FlujosPage";

export const Route = createFileRoute("/flujos")({
  head: () => ({
    meta: [
      { title: "Bocadoo · Flujos MVP pantalla por pantalla" },
      {
        name: "description",
        content:
          "Recorre cada flujo de Bocadoo con dos celulares: comensal y dueño. Pagos, preórdenes, QR y modo offline.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: FlujosPage,
});
