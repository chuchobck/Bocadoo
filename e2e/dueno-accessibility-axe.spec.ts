import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Auditoría de Accesibilidad Axe Etapa 3 Dueño (WCAG 2.2 AA)", () => {
  const platforms = [
    { name: "iOS", width: 390, height: 844 },
    { name: "Android", width: 412, height: 915 },
  ];

  const screens = [
    { id: "caja", name: "1. Caja" },
    { id: "cobrar", name: "2. Cobrar pase" },
    { id: "pedidos", name: "3. Pedidos en camino" },
    { id: "clientes", name: "4. Clientes" },
    { id: "plan", name: "5. Crear/Editar plan" },
    { id: "cartulina", name: "6. Pasar cartulina" },
    { id: "menu", name: "7. Menú de hoy" },
    { id: "oferta", name: "8. Oferta flash" },
    { id: "opiniones", name: "9. Opiniones" },
    { id: "cierre", name: "10. Cierre de caja" },
    { id: "ajustes", name: "11. Ajustes" },
  ];

  const states = ["exito", "cargando", "vacio", "error", "offline"];

  for (const platform of platforms) {
    for (const sc of screens) {
      test(`${sc.name} en ${platform.name} cumple WCAG 2.2 AA en sus 5 estados con letra al 200%`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: platform.width, height: platform.height });

        for (const st of states) {
          await page.goto(`/app/dueno/estados?pantalla=${sc.id}&estado=${st}&chrome=0`);
          await page.waitForLoadState("domcontentloaded");

          // 1. Esperar que el visor dev esté listo
          await expect(page.getByTestId("estados-dueno-ready")).toBeVisible();
          await expect(page.locator("text=Cargando visor dev...")).toHaveCount(0);

          // 2. Comprobar que el contenido principal esperado esté visible antes de auditar
          if (st === "exito") {
            if (sc.id === "caja") {
              await expect(page.getByRole("button", { name: "Escanear pase de comensal" })).toBeVisible();
            } else if (sc.id === "cobrar") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByText("Almuerzo registrado")).toBeVisible();
            } else if (sc.id === "pedidos") {
              await expect(page.getByRole("button", { name: "Entregar" }).first()).toBeVisible();
            } else if (sc.id === "clientes") {
              await expect(page.getByRole("button", { name: /Nuevo plan|Vender plan/i }).first()).toBeVisible();
            } else if (sc.id === "plan") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("button", { name: "Guardar plan" })).toBeVisible();
            } else if (sc.id === "cartulina") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("button", { name: /Digitalizar cartulina|Activar/i })).toBeVisible();
            } else if (sc.id === "menu") {
              await expect(page.getByRole("button", { name: "Publicar menú" })).toBeVisible();
            } else if (sc.id === "oferta") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("button", { name: "Publicar oferta" })).toBeVisible();
            } else if (sc.id === "opiniones") {
              await expect(page.getByText("Carlos Mejía").first()).toBeVisible();
            } else if (sc.id === "cierre") {
              await expect(page.getByRole("button", { name: /Cerrar turno|Cerrar caja/i })).toBeVisible();
            } else if (sc.id === "ajustes") {
              await expect(page.getByRole("button", { name: /Dueño \(Todo\)/i })).toBeVisible();
            }
          } else if (st === "cargando") {
            await expect(page.locator(".animate-spin, .animate-pulse").first()).toBeVisible();
          } else if (st === "vacio") {
            await expect(page.getByRole("heading").first()).toBeVisible();
          } else if (st === "error") {
            await expect(page.getByRole("button", { name: "Reintentar" }).first()).toBeVisible();
          } else if (st === "offline") {
            await expect(page.locator("text=Sin conexión").first()).toBeVisible();
          }

          // Escalar letra al 200% según pauta de accesibilidad WCAG 1.4.4
          await page.evaluate(() => {
            document.documentElement.style.fontSize = "200%";
            const style = document.createElement("style");
            style.innerHTML = "* { animation: none !important; transition: none !important; }";
            document.head.appendChild(style);
          });
          await page.waitForTimeout(200);

          // Analizar accesibilidad completa con Axe (wcag2a, wcag2aa, wcag22aa)
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
            .analyze();

          expect(
            results.violations,
            `Violaciones Axe en ${sc.name} [${st}] (${platform.name}): ${JSON.stringify(
              results.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                nodes: v.nodes.map((n) => n.target),
              })),
              null,
              2
            )}`
          ).toEqual([]);
        }
      });
    }
  }
});
