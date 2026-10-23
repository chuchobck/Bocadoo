import { test, expect } from "@playwright/test";

test.describe("Ajustes de Producto — Comensal (A1, A2, A3)", () => {
  test("A1: Entrada directa sin saludo ni bienvenida", async ({ page }) => {
    await page.goto("/app/comensal");
    await page.waitForLoadState("networkidle");

    // QR y saldo visibles de inmediato
    await expect(page.getByRole("heading", { name: "La Cuchara de San Blas" })).toBeVisible();
    await expect(page.getByTestId("comensal-qr")).toBeVisible();
    await expect(page.getByText("14")).toBeVisible();

    // Aserción e2e: el texto visible de /app/comensal NO contiene "Hola" ni "Bienvenido"
    const visibleText = await page.locator("body").innerText();
    expect(visibleText).not.toContain("Hola");
    expect(visibleText).not.toContain("Bienvenido");
    expect(visibleText).not.toContain("bienvenido");
    expect(visibleText).not.toContain("hola");
  });

  test("A2: Calificar solo aparece tras 25 min y se va al responder", async ({ page }) => {
    await page.goto("/app/comensal");
    await page.waitForLoadState("networkidle");

    // Al abrir la app normalmente, la tarjeta NO debe aparecer de inmediato
    await expect(page.getByRole("heading", { name: "¿Qué tal hoy?" })).not.toBeVisible();

    // Avanzar 25 minutos con el botón del panel demo (?demo=1)
    await page.goto("/app/comensal?demo=1");
    await page.waitForLoadState("networkidle");

    // Ir a pestaña Tiempo en panel demo
    const timeTab = page.getByRole("navigation").getByText(/Tiempo/i);
    if (await timeTab.isVisible()) {
      await timeTab.click();
      const advanceBtn = page.getByRole("button", { name: /\+25 min feedback/i });
      if (await advanceBtn.isVisible()) {
        await advanceBtn.click();
      }
    }

    // Ahora la tarjeta aparece SOBRE el pase
    await expect(page.getByRole("heading", { name: "¿Qué tal hoy?" })).toBeVisible({ timeout: 5000 });

    // 1 toque en "Rico" y se va
    const ricoBtn = page.getByRole("button", { name: "Rico" });
    await expect(ricoBtn).toBeVisible();
    await ricoBtn.click();

    // Verificación: se retira inmediatamente
    await expect(page.getByRole("heading", { name: "¿Qué tal hoy?" })).not.toBeVisible({ timeout: 5000 });
  });

  test("A3: Dónde comer buscador, chips cortos, secciones y tarjeta con logo", async ({ page }) => {
    await page.goto("/app/comensal/restaurantes");
    await page.waitForLoadState("networkidle");

    // Buscador fijo arriba
    const searchInput = page.getByPlaceholder("Buscar restaurante o plato");
    await expect(searchInput).toBeVisible();

    // Chips cortos: Cerca, Con plan, Libre, Ofertas
    await expect(page.getByRole("button", { name: "Cerca" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Con plan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Libre" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ofertas" })).toBeVisible();

    // Secciones: "Tu plan" y "Cerca de ti"
    await expect(page.getByRole("heading", { name: "Tu plan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cerca de ti" })).toBeVisible();

    // Tarjeta con Hoy: <plato>
    await expect(page.getByText(/Hoy:/i).first()).toBeVisible();

    // Filtrar con búsqueda sin resultados
    await searchInput.fill("PlatoInexistenteXYZ");
    await expect(page.getByRole("heading", { name: "Sin resultados" })).toBeVisible();
    const limpiarBtn = page.getByRole("button", { name: "Limpiar", exact: true });
    await expect(limpiarBtn).toBeVisible();

    // Limpiar restablece la lista
    await limpiarBtn.click();
    await expect(page.getByRole("heading", { name: "Cerca de ti" })).toBeVisible();

    // Abrir ficha del local en 1 toque
    await page.getByRole("heading", { name: "La Cuchara de San Blas" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "La Cuchara de San Blas" })).toBeVisible();
  });
});
