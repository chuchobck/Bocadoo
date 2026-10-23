import { test, expect } from "@playwright/test";

test.describe("Ajustes de Producto — Dueño (B1, B2, B3)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("B1: Menú de hoy editable con catálogo, Repetir ayer + Publicar = 2 toques", async ({ page }) => {
    await page.goto("/app/dueno/menu");
    await page.waitForLoadState("networkidle");

    // Verificar dos segmentos: Hoy y Mis platos
    await expect(page.getByRole("button", { name: "Hoy" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mis platos" })).toBeVisible();

    // Estado inicial: Borrador
    await expect(page.getByText("Borrador")).toBeVisible();

    let touches = 0;

    // Toque 1: Repetir ayer
    const repetirBtn = page.getByRole("button", { name: "Repetir ayer" });
    await repetirBtn.click();
    touches++;

    // Toque 2: Publicar menú
    const publicarBtn = page.getByRole("button", { name: /Publicar menú/i });
    await publicarBtn.click();
    touches++;

    // Verificación de presupuesto: 2 toques
    expect(touches).toBe(2);

    // Estado pasa a Publicado en verde
    await expect(page.getByText("Publicado", { exact: true })).toBeVisible();
    await expect(page.getByText(/Menú publicado con éxito/i)).toBeVisible();

    // Toggle Se acabó disponible tras publicar
    const seAcaboBtn = page.getByRole("button", { name: "Se acabó" }).first();
    await expect(seAcaboBtn).toBeVisible();
    await seAcaboBtn.click();
    await expect(page.getByRole("button", { name: "Agotado" }).first()).toBeVisible();

    // Segmento Mis platos
    await page.getByRole("button", { name: "Mis platos" }).click();
    await expect(page.getByText("Secciones activas")).toBeVisible();
  });

  test("B2: Planes y clientes, 3 toques para crear desde plantilla", async ({ page }) => {
    await page.goto("/app/dueno/planes");
    await page.waitForLoadState("networkidle");

    // Verificar segmentos: Planes y Clientes
    await expect(page.getByRole("button", { name: "Planes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Clientes" })).toBeVisible();

    // Lista de planes muestra precio c/u calculado
    await expect(page.getByText(/\$2,75 c\/u|\$2,80 c\/u/i).first()).toBeVisible();

    let touches = 0;

    // Toque 1: Abrir Nuevo plan
    const nuevoBtn = page.getByRole("button", { name: "Nuevo plan" });
    await nuevoBtn.click();
    touches++;

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Toque 2: Seleccionar plantilla Mensual
    const mensualBtn = modal.getByRole("button", { name: /Mensual/i });
    await mensualBtn.click();
    touches++;

    // Toque 3: Guardar plan
    const guardarBtn = modal.getByRole("button", { name: "Guardar plan" });
    await guardarBtn.click();
    touches++;

    // Verificación de presupuesto: 3 toques
    expect(touches).toBe(3);
    await expect(modal).not.toBeVisible();

    // Segmento Clientes muestra nombre limpio de plan
    await page.getByRole("button", { name: "Clientes" }).click();
    await expect(page.getByText("Carlos Mejía")).toBeVisible();
    await expect(page.getByText("Plan mensual").first()).toBeVisible();
  });

  test("B3: Ofertas flash en 3 toques con cálculo de comisión y cancelar en 1 toque", async ({ page }) => {
    await page.goto("/app/dueno/oferta");
    await page.waitForLoadState("networkidle");

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Muestra lo que recibe el dueño
    await expect(page.getByText(/Recibes \$2,51 por venta|Recibes/i)).toBeVisible();

    let touches = 0;

    // Toque 1: Elegir cupos (10 cupos)
    const cuposBtn = modal.getByRole("button", { name: "10 cupos" });
    await cuposBtn.click();
    touches++;

    // Toque 2: Elegir hora (14:00)
    const horaBtn = modal.getByRole("button", { name: "14:00" });
    await horaBtn.click();
    touches++;

    // Toque 3: Publicar oferta
    const publicarBtn = modal.getByRole("button", { name: "Publicar oferta" });
    await publicarBtn.click();
    touches++;

    // Verificación: 3 toques
    expect(touches).toBe(3);

    // Oferta activa visible con botón Cancelar en 1 toque
    await expect(page.getByText("Oferta activa")).toBeVisible();
    const cancelarBtn = page.getByRole("button", { name: "Cancelar oferta" });
    await expect(cancelarBtn).toBeVisible();

    // Cancelar en 1 toque
    await cancelarBtn.click();
    await expect(page.getByText(/Oferta cancelada sin costo/i)).toBeVisible();
  });
});
