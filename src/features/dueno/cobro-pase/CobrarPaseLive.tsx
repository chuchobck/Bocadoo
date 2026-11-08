import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useBocadoo, DINER_USER_ID, RESTAURANT_ID } from "@/components/bocadoo/store";

import { CobrarPaseScreen } from "./Screen";

type Outcome = "VERDE" | "MORADO" | "ROJO";

interface ScanResolution {
  outcome: Outcome;
  dinerName: string;
  /** Almuerzos que le quedan tras el descuento (solo informativo). */
  lunchesLeft: number;
  detailText?: string | undefined;
  undo?: (() => boolean) | undefined;
}

export interface CobrarPaseLiveProps {
  isOpen: boolean;
  onClose: () => void;
  /** Comensal que "se escanea" cuando no hay una preorden en camino. Por defecto el comensal demo. */
  userId?: string;
  onSellPlan?: () => void;
}

/**
 * Escáner de caja conectado al store.
 * Al abrirse simula la lectura del QR y la resuelve contra el estado real:
 *  - si hay una preorden EN_CAMINO del local, la valida con `scanOrder` (plan o cobro suelto);
 *  - si no, descuenta un almuerzo del plan activo del comensal con `redeemLunch`.
 * El comensal ve bajar su saldo (y subir su sello) en vivo por la sincronización del store.
 */
export const CobrarPaseLive: React.FC<CobrarPaseLiveProps> = ({
  isOpen,
  onClose,
  userId = DINER_USER_ID,
  onSellPlan,
}) => {
  const {
    orders,
    clientForUser,
    redeemLunch,
    undoRedemption,
    scanOrder,
    undoScanOrder,
  } = useBocadoo();
  const [resolution, setResolution] = useState<ScanResolution | null>(null);
  const scannedRef = useRef(false);

  const resolveScan = (): ScanResolution => {
    // 1) Preorden en camino más reciente de este local
    const order = orders
      .filter((o) => o.restaurantId === RESTAURANT_ID && o.estado === "EN_CAMINO")
      .sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())[0];

    if (order) {
      const before = clientForUser(order.comensalId)?.lunchesLeft ?? 0;
      const res = scanOrder(order.id);
      if (!res.ok) {
        return { outcome: "ROJO", dinerName: order.comensalNombre, lunchesLeft: before, detailText: res.message };
      }
      if (res.redemption) {
        const left = Math.max(0, before - 1);
        return {
          outcome: left === 0 ? "MORADO" : "VERDE",
          dinerName: order.comensalNombre,
          lunchesLeft: left,
          detailText: `Preorden validada · le quedan ${left} almuerzos`,
          undo: () => undoScanOrder(order.id),
        };
      }
      // Sin plan: la preorden se cobró suelta en caja (no se puede deshacer desde aquí)
      return {
        outcome: "VERDE",
        dinerName: order.comensalNombre,
        lunchesLeft: before,
        detailText: res.message,
      };
    }

    // 2) Pase de plan del comensal
    const client = clientForUser(userId);
    if (!client) {
      return {
        outcome: "ROJO",
        dinerName: "Comensal no encontrado",
        lunchesLeft: 0,
        detailText: "No tiene ficha en este restaurante.",
      };
    }
    const res = redeemLunch({ clientId: client.id });
    if (res.status === "SUCCESS") {
      return {
        outcome: res.isLastLunch ? "MORADO" : "VERDE",
        dinerName: client.nombre,
        lunchesLeft: res.lunchesLeft,
        undo: () => undoRedemption(res.redemption.id),
      };
    }
    return {
      outcome: "ROJO",
      dinerName: client.nombre,
      lunchesLeft: 0,
      detailText: res.message,
    };
  };

  // Un solo descuento por apertura del escáner (evita doble descuento por re-render o StrictMode)
  useEffect(() => {
    if (!isOpen) {
      scannedRef.current = false;
      setResolution(null);
      return;
    }
    if (scannedRef.current) return;
    scannedRef.current = true;
    setResolution(resolveScan());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUndo = () => {
    if (resolution?.undo?.()) toast.info("Descuento deshecho: el almuerzo volvió al plan");
  };

  return (
    <CobrarPaseScreen
      isOpen={isOpen}
      onClose={onClose}
      state={resolution ? "exito" : "cargando"}
      outcome={resolution?.outcome ?? "VERDE"}
      dinerName={resolution?.dinerName ?? ""}
      remainingLunches={resolution?.lunchesLeft ?? 0}
      detailText={resolution?.detailText}
      undoable={Boolean(resolution?.undo)}
      onUndoRedemption={resolution?.undo ? handleUndo : undefined}
      onSellPlan={onSellPlan}
    />
  );
};
