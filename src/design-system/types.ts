/**
 * Tipos de estado estándar para el sistema de diseño Bocadoo.
 * Los 5 estados obligatorios en cada componente del kit:
 * - cargando: Esqueleto / animación de carga.
 * - vacio: Sin datos o estado inicial disponible.
 * - error: Fallo de validación, error de servidor o entrada inválida.
 * - offline: Sin conexión a internet o red inestable.
 * - exito: Renderizado normal y funcional con datos.
 */

export type ComponentState = "cargando" | "vacio" | "error" | "offline" | "exito";

export interface BaseComponentProps {
  state?: ComponentState | undefined;
  className?: string | undefined;
}
