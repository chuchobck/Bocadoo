import { describe, it, expect, vi } from "vitest";

/**
 * Simulación del comportamiento del stack de historial y eventos popstate de Android.
 * Verifica la máquina de estados de BottomSheet / Overlay:
 * 1. Abrir modal -> pushState con ID único.
 * 2. Cerrar con la X -> llamada explícita a history.back(), limpiando la entrada.
 * 3. Pulsar Atrás después de cerrar con X -> vuelve a la ruta anterior real, NO a una entrada huérfana.
 * 4. Pulsar Atrás con modal abierto -> popstate ejecuta onClose, y el desmonte NO hace doble back.
 * 5. Desmonte por cambio de ruta -> NO ejecuta history.back(), preservando la navegación.
 */

class MockBrowserHistory {
  private stack: Array<{ state: any; url: string }> = [];
  private currentIndex = -1;
  private listeners: Array<(event: { state: any }) => void> = [];

  constructor(initialUrl = "/app/dueno") {
    this.pushState(null, initialUrl);
  }

  get length() {
    return this.stack.length;
  }

  get state() {
    return this.stack[this.currentIndex]?.state ?? null;
  }

  get currentUrl() {
    return this.stack[this.currentIndex]?.url ?? "";
  }

  pushState(state: any, url: string) {
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push({ state, url });
    this.currentIndex = this.stack.length - 1;
  }

  back() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const event = { state: this.state };
      this.listeners.forEach((listener) => listener(event));
    }
  }

  addEventListener(type: string, listener: any) {
    if (type === "popstate") {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: any) {
    if (type === "popstate") {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }
}

/**
 * Nueva regla: history.back() solo se ejecuta cuando el USUARIO cierra explícitamente la hoja
 * (botón X o tocar fondo), NUNCA en el cleanup de desmontaje.
 */
function createBottomSheetController(history: MockBrowserHistory, onClose: () => void) {
  const stateId = "bocadoo-sheet-" + Date.now();
  history.pushState({ bocadooSheet: stateId }, history.currentUrl);
  let isPushed = true;

  const handlePopState = () => {
    isPushed = false;
    onClose();
  };

  history.addEventListener("popstate", handlePopState);

  // Cierre provocado por el usuario (X o fondo)
  const handleUserClose = () => {
    if (isPushed && history.state?.bocadooSheet === stateId) {
      isPushed = false;
      history.back();
    }
    onClose();
  };

  // Cleanup de desmontaje: NUNCA llama a history.back()
  const unmount = () => {
    history.removeEventListener("popstate", handlePopState);
  };

  return { handleUserClose, unmount };
}

describe("Android Back Button History Lifecycle (UI Design System)", () => {
  it("Caso (a): Abrir hoja, cerrar con X, pulsar Atrás: no queda entrada vacía ni sale de la pantalla", () => {
    const history = new MockBrowserHistory("/");
    history.pushState(null, "/app/dueno");
    expect(history.currentUrl).toBe("/app/dueno");
    expect(history.length).toBe(2);

    let isSheetOpen = true;
    const onClose = vi.fn(() => {
      isSheetOpen = false;
    });

    const controller = createBottomSheetController(history, onClose);
    expect(history.length).toBe(3);
    expect(history.state?.bocadooSheet).toBeDefined();

    // Usuario cierra tocando la X
    controller.handleUserClose();
    controller.unmount();

    expect(isSheetOpen).toBe(false);
    expect(history.state?.bocadooSheet).toBeUndefined();
    expect(history.currentUrl).toBe("/app/dueno");

    // Usuario pulsa Atrás en Android -> va a la pantalla anterior real (/)
    history.back();
    expect(history.currentUrl).toBe("/");
  });

  it("Caso (b): Abrir hoja y pulsar Atrás: se cierra la hoja y la pantalla sigue", () => {
    const history = new MockBrowserHistory("/");
    history.pushState(null, "/app/dueno");

    let isSheetOpen = true;
    const onClose = vi.fn(() => {
      isSheetOpen = false;
    });

    const controller = createBottomSheetController(history, onClose);

    // Usuario pulsa botón Atrás del sistema
    history.back();
    controller.unmount();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(isSheetOpen).toBe(false);
    expect(history.currentUrl).toBe("/app/dueno"); // La pantalla sigue activa
  });

  it("Caso (c): Abrir hoja y cambiar de ruta: la hoja se cierra y NO se retrocede una pantalla extra", () => {
    const history = new MockBrowserHistory("/");
    history.pushState(null, "/app/dueno");

    let isSheetOpen = true;
    const onClose = vi.fn(() => {
      isSheetOpen = false;
    });

    const controller = createBottomSheetController(history, onClose);

    // Usuario toca la barra inferior para ir a /app/dueno/menu
    // La hoja se desmonta SIN llamar a history.back()
    controller.unmount();
    history.pushState(null, "/app/dueno/menu");

    expect(history.currentUrl).toBe("/app/dueno/menu");
    // Al pulsar atrás desde la nueva ruta, regresa exactamente a /app/dueno
    history.back();
    expect(history.currentUrl).toBe("/app/dueno");
  });

  it("Caso (d): Abrir y cerrar 3 veces seguidas: el historial no crece indefinidamente", () => {
    const history = new MockBrowserHistory("/");
    history.pushState(null, "/app/dueno");

    for (let i = 0; i < 3; i++) {
      let isOpen = true;
      const controller = createBottomSheetController(history, () => {
        isOpen = false;
      });
      // Mientras está abierta, tiene el identificador del modal
      expect(history.state?.bocadooSheet).toBeDefined();

      // Cerrar
      controller.handleUserClose();
      controller.unmount();

      // Al cerrar, siempre regresa al estado original de /app/dueno
      expect(isOpen).toBe(false);
      expect(history.currentUrl).toBe("/app/dueno");
      expect(history.state?.bocadooSheet).toBeUndefined();
    }

    // El historial no se infla (no crece a 5 o más entradas)
    expect(history.length).toBeLessThanOrEqual(3);
    expect(history.currentUrl).toBe("/app/dueno");
  });
});
