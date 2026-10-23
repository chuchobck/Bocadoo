import { test, expect } from "@playwright/test";

test.describe("Comportamiento del botón Atrás de Android (BottomSheet real)", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Navegar primero a la raíz para tener un historial previo real
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("Caso (a): abrir hoja, cerrar con X, pulsar Atrás: no queda entrada vacía ni se sale de la pantalla", async ({
    page,
  }) => {
    // Navegar a /app/kit
    await page.goto("/app/kit");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/app/kit");

    // Abrir hoja inferior real
    const openBtn = page.getByRole("button", { name: /Abrir hoja inferior de prueba/i });
    await openBtn.waitFor({ state: "visible" });
    await openBtn.click();

    // Comprobar que la hoja está visible y tiene título
    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).toBeVisible({ timeout: 10000 });

    // Comprobar que el historial tiene el identificador del modal
    const stateDuringOpen = await page.evaluate(() => window.history.state);
    expect(Boolean(stateDuringOpen?.bocadooSheetId || stateDuringOpen?.bocadooSheet)).toBe(true);

    // Cerrar con la X explícita
    const closeBtn = page.getByRole("button", { name: "Cerrar", exact: true });
    await closeBtn.click();

    // La hoja se cerró
    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).not.toBeVisible();

    // El estado de window.history ya no tiene el modal
    const stateAfterClose = await page.evaluate(() => window.history.state);
    expect(Boolean(stateAfterClose?.bocadooSheetId || stateAfterClose?.bocadooSheet)).toBe(false);

    // Al pulsar Atrás del navegador (simulando Atrás de Android)
    await page.goBack();
    await page.waitForTimeout(300);

    // Regresa a la pantalla anterior real (/), no a una entrada huérfana de modal
    expect(page.url()).toBe("http://localhost:5173/");
  });

  test("Caso (b): abrir hoja, pulsar Atrás: se cierra la hoja y la pantalla sigue", async ({ page }) => {
    await page.goto("/app/kit");
    await page.waitForLoadState("networkidle");

    const openBtn = page.getByRole("button", { name: /Abrir hoja inferior de prueba/i });
    await openBtn.scrollIntoViewIfNeeded();
    await openBtn.click();

    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).toBeVisible({ timeout: 10000 });

    // Pulsar botón Atrás del navegador con la hoja abierta
    await page.goBack();
    await page.waitForTimeout(300);

    // La hoja se cerró pero la pantalla sigue siendo /app/kit
    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).not.toBeVisible();
    expect(page.url()).toContain("/app/kit");
  });

  test("Caso (c): abrir hoja, comprobar clic en pestaña bloqueado, cerrar con X, navegar y verificar sin retroceso extra", async ({
    page,
  }) => {
    await page.goto("/app/comensal");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/app/comensal");

    // Abrir hoja inferior real (Mis sellos)
    const openBtn = page.getByRole("button", { name: /Mis sellos/i });
    await openBtn.click();

    // Comprobar que la hoja está abierta y visible con su título
    const heading = page.getByRole("dialog").getByRole("heading", { name: "Mis sellos" });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 1. Comprobar que el clic en una pestaña queda bloqueado porque la hoja modal cubre la barra
    const comerTab = page.getByRole("link", { name: /Comer/i });
    let clickBlocked = false;
    try {
      // Intentar clic con timeout corto: Playwright esperará a que sea clickeable y fallará por intercepción del backdrop
      await comerTab.click({ timeout: 1000 });
    } catch {
      clickBlocked = true;
    }
    expect(clickBlocked).toBe(true);

    // La hoja sigue visible y la pantalla no cambió
    await expect(heading).toBeVisible();
    expect(page.url()).toContain("/app/comensal");

    // 2. Cerrar con la X explícita
    const closeBtn = page.getByRole("dialog").getByRole("button", { name: "Cerrar", exact: true });
    await closeBtn.click();
    await expect(heading).not.toBeVisible({ timeout: 5000 });

    // 3. Ahora sí navegar a otra pestaña
    await comerTab.click();
    await expect(page).toHaveURL(/.*\/app\/comensal\/restaurantes/);

    // 4. Comprobar que permanece estable y no retrocede una pantalla de más
    await page.waitForTimeout(300);
    expect(page.url()).toContain("/app/comensal/restaurantes");

    // Al pulsar Atrás, retrocede únicamente a la pantalla previa (/), no a una entrada huérfana de modal
    await page.goBack();
    await page.waitForTimeout(300);
    expect(page.url()).toBe("http://localhost:5173/");
  });

  test("Caso (d): abrir y cerrar 3 veces seguidas: el historial no crece", async ({ page }) => {
    await page.goto("/app/kit");
    await page.waitForLoadState("networkidle");

    const openBtn = page.getByRole("button", { name: /Abrir hoja inferior de prueba/i });
    await openBtn.scrollIntoViewIfNeeded();

    // Abrir y cerrar una vez para establecer el estado de la hoja
    await openBtn.click();
    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).toBeVisible({ timeout: 10000 });
    const closeBtn = page.getByRole("button", { name: "Cerrar" });
    await closeBtn.click();
    await expect(page.getByRole("heading", { name: "Opciones de cobro" })).not.toBeVisible();

    const initialLength = await page.evaluate(() => window.history.length);

    for (let i = 0; i < 3; i++) {
      await openBtn.click();
      await expect(page.getByRole("heading", { name: "Opciones de cobro" })).toBeVisible({ timeout: 10000 });

      await closeBtn.click();
      await expect(page.getByRole("heading", { name: "Opciones de cobro" })).not.toBeVisible();
      await page.waitForTimeout(200);

      const currentLength = await page.evaluate(() => window.history.length);
      // Con la guarda contra StrictMode, history.length después de abrir y cerrar es IGUAL al inicial
      expect(currentLength).toBe(initialLength);
    }
  });

  test("Hojas anidadas: abrir Ficha, abrir Sellos encima, Atrás cierra solo Sellos, Atrás otra vez cierra Ficha, y history.length vuelve al inicial", async ({
    page,
  }) => {
    await page.goto("/app/comensal/restaurantes");
    await page.waitForLoadState("networkidle");

    // Precalentar las 2 ranuras de historial
    await page.getByRole("heading", { name: "La Cuchara de San Blas" }).first().click();
    await page.getByRole("button", { name: /Ver tarjeta de sellos del local|Ver mis sellos/i }).click();
    await page.goBack();
    await page.goBack();
    await page.waitForTimeout(200);

    const initialLength = await page.evaluate(() => window.history.length);

    // 1. Abrir Ficha del local haciendo clic en la tarjeta del restaurante
    await page.getByRole("heading", { name: "La Cuchara de San Blas" }).first().click();

    // Comprobar que el diálogo Ficha está abierto
    const fichaHeading = page.getByRole("dialog").getByRole("heading", { name: "La Cuchara de San Blas" });
    await expect(fichaHeading).toBeVisible({ timeout: 5000 });

    // 2. Abrir Sellos encima desde Ficha
    const sellosBtn = page.getByRole("button", { name: /Ver tarjeta de sellos del local|Ver mis sellos/i });
    await expect(sellosBtn).toBeVisible({ timeout: 5000 });
    await sellosBtn.click();

    // Comprobar que Sellos está abierto encima
    const sellosHeading = page.getByRole("dialog").getByRole("heading", { name: "Mis sellos" });
    await expect(sellosHeading).toBeVisible({ timeout: 5000 });

    // 3. Atrás cierra solo la de arriba (Sellos)
    await page.goBack();
    await page.waitForTimeout(300);

    await expect(sellosHeading).not.toBeVisible();
    await expect(fichaHeading).toBeVisible(); // Ficha sigue abierta

    // 4. Atrás otra vez cierra la Ficha
    await page.goBack();
    await page.waitForTimeout(300);

    await expect(fichaHeading).not.toBeVisible(); // Ficha cerrada

    // 5. Comprobar que history.length vuelve al inicial
    const finalLength = await page.evaluate(() => window.history.length);
    expect(finalLength).toBe(initialLength);
  });
});
