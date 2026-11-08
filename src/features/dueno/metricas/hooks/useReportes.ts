import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentState } from "@/design-system";
import { localRepository } from "@/data/repositories/local.repository";
import { obtenerFuenteReportes, type FuenteReportes } from "../data/reportes.mock";
import {
  calcularAlmuerzosPendientes,
  calcularAlmuerzosVencidos,
  calcularClientesEnRiesgo,
  calcularClientesPorRenovar,
  calcularHorasPico,
  calcularRankingPlatos,
  calcularResumenDia,
  calcularResumenSemanal,
  calcularVentasPlanes,
} from "../logic/reportes";

/**
 * Carga la fuente de datos (hoy: mock; mañana: API) y entrega los reportes ya calculados.
 * Los componentes solo pintan lo que reciben.
 */
export function useReportes() {
  const [hoy, setHoy] = useState(() => new Date());
  const [fuente, setFuente] = useState<FuenteReportes | null>(null);
  const [estado, setEstado] = useState<ComponentState>("cargando");

  const cargar = useCallback(async () => {
    setEstado("cargando");
    const ahora = new Date();
    try {
      const datos = await obtenerFuenteReportes(ahora);
      setHoy(ahora);
      setFuente(datos);
      setEstado(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "exito");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const reportes = useMemo(() => {
    if (!fuente) return null;
    return {
      resumenDia: calcularResumenDia(fuente, hoy),
      pendientes: calcularAlmuerzosPendientes(fuente, hoy),
      ventas: {
        semana: calcularVentasPlanes(fuente, hoy, "semana"),
        mes: calcularVentasPlanes(fuente, hoy, "mes"),
      },
      porRenovar: calcularClientesPorRenovar(fuente, hoy),
      enRiesgo: calcularClientesEnRiesgo(fuente, hoy),
      vencidos: calcularAlmuerzosVencidos(fuente, hoy),
      horasPico: calcularHorasPico(fuente, hoy),
      platos: calcularRankingPlatos(fuente, hoy),
      resumenSemanal: calcularResumenSemanal(fuente, hoy),
    };
  }, [fuente, hoy]);

  return {
    estado,
    hoy,
    reportes,
    nombreLocal: localRepository.getConfig().name,
    recargar: cargar,
  };
}

export type Reportes = NonNullable<ReturnType<typeof useReportes>["reportes"]>;
