import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Auditoría de Accesibilidad Axe Completa (WCAG 2.2 AA)", () => {
  const platforms = [
    { name: "iOS", width: 390, height: 844 },
    { name: "Android", width: 412, height: 915 },
  ];

  const screens = [
    { id: "pase", name: "1. Mi pase" },
    { id: "comer", name: "2. Dónde comer" },
    { id: "ficha", name: "3. Ficha local" },
    { id: "sellos", name: "4. Mis sellos" },
    { id: "calificar", name: "5. Calificar" },
    { id: "mesa", name: "6. Mesa amigos" },
    { id: "unirme", name: "7. Unirme mesa" },
    { id: "pedido", name: "8. Tu pedido" },
    { id: "cuenta", name: "9. Mi cuenta" },
  ];

  const states = ["exito", "cargando", "vacio", "error", "offline"];

  for (const platform of platforms) {
    for (const sc of screens) {
      test(`${sc.name} en ${platform.name} cumple WCAG 2.2 AA en sus 5 estados con letra al 200%`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: platform.width, height: platform.height });

        for (const st of states) {
          await page.goto(`/app/comensal/estados?pantalla=${sc.id}&estado=${st}&chrome=0`);
          await page.waitForLoadState("domcontentloaded");

          // 1. Esperar que el visor dev esté listo y que no haya fallback atascado
          await expect(page.getByTestId("estados-comensal-ready")).toBeVisible();
          await expect(page.locator("text=Cargando visor dev...")).toHaveCount(0);

          // 2. Verificar que el contenido principal esperado esté visible según la pantalla y el estado
          if (st === "exito") {
            if (sc.id === "pase") {
              await expect(page.getByRole("img", { name: "Código QR del pase" })).toBeVisible();
            } else if (sc.id === "comer") {
              await expect(page.getByText("La Cuchara de San Blas").first()).toBeVisible();
            } else if (sc.id === "ficha") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("dialog").getByRole("button", { name: /Preordenar|Pedir/i })).toBeVisible();
            } else if (sc.id === "sellos") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("heading", { name: "Mis sellos" })).toBeVisible();
            } else if (sc.id === "calificar") {
              await expect(page.getByText(/¿Qué tal|Calificar/i).first()).toBeVisible();
            } else if (sc.id === "mesa") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("button", { name: /WhatsApp|Compartir/i })).toBeVisible();
            } else if (sc.id === "unirme") {
              await expect(page.getByRole("button", { name: /Unirme/i })).toBeVisible();
            } else if (sc.id === "pedido") {
              await expect(page.getByRole("dialog")).toBeVisible();
              await expect(page.getByRole("heading", { name: "Tu pedido" })).toBeVisible();
            } else if (sc.id === "cuenta") {
              await expect(page.getByRole("heading", { name: "Carlos Mejía" })).toBeVisible();
            }
          } else if (st === "cargando") {
            await expect(page.locator(".animate-spin, .animate-pulse").first()).toBeVisible();
          } else if (st === "vacio") {
            await expect(page.getByRole("button").first()).toBeVisible();
          } else if (st === "error") {
            await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
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
