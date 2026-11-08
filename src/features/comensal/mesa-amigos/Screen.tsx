import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  WifiOff,
  Loader2,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";
import { BocadooQr } from "@/components/bocadoo/BocadooQr";
import { toast } from "sonner";
import { BottomSheet, ButtonPrimary } from "@/design-system";
import { useBocadoo, SHARED_TABLE_QR_PREFIX } from "@/components/bocadoo/store";
import { MESA_AMIGOS_COPY } from "./copy";
import type { ComponentState } from "@/design-system";

export interface MesaAmigosScreenProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string | undefined;
  restaurantName?: string | undefined;
  onShareWhatsApp?: ((url: string) => void) | undefined;
  onRetry?: (() => void) | undefined;
  state?: ComponentState;
}

export const MesaAmigosScreen: React.FC<MesaAmigosScreenProps> = ({
  isOpen,
  onClose,
  restaurantId = "r1",
  restaurantName = "La Cuchara de San Blas",
  onShareWhatsApp,
  onRetry,
  state = "exito",
}) => {
  const { sharedTables, createSharedTable, notifyKitchenForTable, setSharedTableMode } = useBocadoo();

  const [selectedTime, setSelectedTime] = useState("13:00");
  const [copied, setCopied] = useState(false);
  const [activeMesaId, setActiveMesaId] = useState<string>("");

  const times = ["12:30", "13:00", "13:30", "14:00"];

  // Crear o recuperar mesa para este restaurante y horario
  useEffect(() => {
    if (!isOpen) return;

    const existing = sharedTables.find(
      (t) => t.restaurantId === restaurantId && t.hora === selectedTime && t.estado !== "FINALIZADA",
    );

    if (existing) {
      setActiveMesaId(existing.id);
    } else {
      const created = createSharedTable({
        restaurantId,
        restaurantNombre: restaurantName,
        hora: selectedTime,
        sopa: "Locro de papa con queso y aguacate",
        fuerte: "Seco de pollo tierno con maduro frito",
      });
      setActiveMesaId(created.id);
    }
  }, [isOpen, restaurantId, restaurantName, selectedTime, createSharedTable, sharedTables]);

  const currentTable = useMemo(() => {
    return (
      sharedTables.find((t) => t.id === activeMesaId) || {
        id: activeMesaId || "m1234",
        restaurantId,
        restaurantNombre: restaurantName,
        anfitrionNombre: "Carlos Mejía",
        anfitrionUserId: "u1",
        hora: selectedTime,
        creadaEn: new Date().toISOString(),
        miembros: [
          {
            id: "mem-host",
            nombre: "Tú (Anfitrión)",
            esAnfitrion: true,
            sopa: "Locro de papa con queso",
            fuerte: "Seco de pollo tierno con maduro",
            paraLlevar: false,
            unidoEn: new Date().toISOString(),
          },
        ],
        estado: "ABIERTA" as const,
      }
    );
  }, [sharedTables, activeMesaId, restaurantId, restaurantName, selectedTime]);

  const mesaUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    return `${origin}/app/comensal/mesa/${currentTable.id}`;
  }, [currentTable.id]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(mesaUrl);
      }
      setCopied(true);
      toast.success("¡Enlace copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info(`Copia este enlace: ${mesaUrl}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `¡Vamos a almorzar juntos en ${restaurantName} a las ${selectedTime}! 🍲 Elige tu plato y únete a nuestra mesa aquí: ${mesaUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (onShareWhatsApp) {
      onShareWhatsApp(whatsappUrl);
    } else {
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleNotifyKitchen = () => {
    notifyKitchenForTable(currentTable.id);
    toast.success("¡Avisado a cocina! El restaurante sabe que van en camino.");
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Mesa con amigos">
      <div className="space-y-4 py-1 pb-4">
        {state === "cargando" && (
          <div role="status" className="space-y-4 py-2 text-center animate-pulse">
            <span className="sr-only">Cargando mesa...</span>
            {/* Tarjeta con QR de la mesa skeleton */}
            <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-[24px] border border-border bg-surface p-4 shadow-md">
              <div className="h-36 w-36 rounded-xl bg-secondary-container/70" />
            </div>

            <div className="mx-auto space-y-1.5 max-w-[260px]">
              <div className="mx-auto h-3.5 w-40 rounded-full bg-secondary-container" />
              <div className="mx-auto h-3 w-52 rounded-full bg-secondary-container/70" />
            </div>

            {/* Botón compartir */}
            <div className="h-12 w-full rounded-full bg-primary/20" />

            {/* Lista de comensales en la mesa */}
            <div className="space-y-2 pt-2 text-left border-t border-border/60">
              <div className="h-3 w-32 rounded-full bg-secondary-container" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-secondary-container" />
                    <div className="h-3.5 w-28 rounded-full bg-secondary-container" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-secondary-container/70" />
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h4 className="text-[17px] font-extrabold text-foreground">{MESA_AMIGOS_COPY.emptyTitle}</h4>
            <p className="mt-1 text-[13px] font-semibold text-muted-foreground">{MESA_AMIGOS_COPY.emptyDesc}</p>
            <div className="mt-4">
              <ButtonPrimary onClick={onClose}>Ver locales</ButtonPrimary>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl bg-danger-container p-5 text-center text-on-danger-container">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h4 className="text-[17px] font-extrabold">{MESA_AMIGOS_COPY.errorTitle}</h4>
            <button
              type="button"
              onClick={onRetry || onClose}
              className="mt-3 rounded-full bg-danger px-5 py-2 text-[13px] font-bold text-danger-foreground active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{MESA_AMIGOS_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <>
            {/* Cabecera del restaurante y hora */}
            <div className="rounded-[24px] bg-background border border-border p-4 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-primary text-[12px] font-extrabold mb-1">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>Almuerzo compartido</span>
              </div>
              <h3 className="text-[18px] font-black text-foreground leading-tight">{restaurantName}</h3>
              <p className="text-[13px] font-semibold text-muted-foreground">
                Tus amigos eligen su plato y la mesa se sincroniza al instante
              </p>
            </div>

            {/* Selector de Horario */}
            <div>
              <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                {MESA_AMIGOS_COPY.timeLabel}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    aria-pressed={selectedTime === t}
                    className={`rounded-2xl py-2.5 text-[14px] font-bold transition-all active:scale-95 ${
                      selectedTime === t
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background text-foreground border border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* CÓDIGO QR GIGANTE DE LA MESA */}
            <div className="rounded-[28px] bg-gradient-to-b from-background to-primary-container border border-border p-5 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-[13px] font-extrabold text-primary mb-2">
                <QrCode className="h-4 w-4" />
                <span>QR de la mesa #{currentTable.id.toUpperCase()}</span>
              </div>

              <div
                data-testid="mesa-amigos-qr"
                className="relative mx-auto my-3 flex h-48 w-48 flex-col items-center justify-center rounded-[24px] bg-qr-bg p-3 shadow-md border border-border"
              >
                <BocadooQr
                  value={`${SHARED_TABLE_QR_PREFIX}${currentTable.id}`}
                  size={155}
                  level="M"
                  title={`QR de caja para la mesa ${currentTable.id}`}
                />
                <span className="mt-1 text-[11px] font-bold text-qr-fg">{currentTable.miembros.length} comensales</span>
              </div>

              <p className="text-[12px] font-medium text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                {MESA_AMIGOS_COPY.cashierHint}
              </p>
            </div>

            {/* Modo de pago de la mesa */}
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cómo se cobra la mesa">
              {(
                [
                  ["CADA_UNO", MESA_AMIGOS_COPY.modeEach, MESA_AMIGOS_COPY.modeEachHint],
                  ["INVITO_YO", MESA_AMIGOS_COPY.modeHost, MESA_AMIGOS_COPY.modeHostHint],
                ] as const
              ).map(([modo, label, hint]) => (
                <button
                  key={modo}
                  type="button"
                  data-testid={`mesa-modo-${modo}`}
                  aria-pressed={(currentTable.modo ?? "CADA_UNO") === modo}
                  onClick={() => setSharedTableMode(currentTable.id, modo)}
                  className={`rounded-2xl p-3 text-left transition-all active:scale-95 ${
                    (currentTable.modo ?? "CADA_UNO") === modo
                      ? "bg-primary-container border border-primary"
                      : "bg-background border border-border"
                  }`}
                >
                  <span className="block text-[13px] font-extrabold text-foreground">{label}</span>
                  <span className="block text-[11px] font-medium text-muted-foreground leading-snug">{hint}</span>
                </button>
              ))}
            </div>

            {/* Botones de acción rápida: WhatsApp y Copiar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 rounded-2xl bg-success text-success-foreground py-3 px-3 text-[14px] font-extrabold shadow-xs active:scale-95 transition-all hover:bg-success/90"
              >
                <Send className="h-4 w-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-2xl bg-background text-foreground border border-border py-3 px-3 text-[14px] font-extrabold active:scale-95 transition-all hover:bg-secondary-container"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-primary" />}
                <span>{copied ? "Copiado" : "Copiar link"}</span>
              </button>
            </div>

            {/* Enlace para probar cómo se ve para un invitado */}
            <button
              type="button"
              onClick={() => window.open(`/app/comensal/mesa/${currentTable.id}`, "_blank")}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[13px] font-bold text-primary hover:underline"
            >
              <span>Probar vista de invitado en otra pestaña</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            {/* Lista de comensales en vivo */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <span>En la mesa ({currentTable.miembros.length})</span>
                </span>
                <span className="text-[12px] font-bold text-success bg-success-container px-2 py-0.5 rounded-full">
                  {currentTable.estado === "EN_CAMINO" ? "En camino a cocina" : "Mesa activa"}
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {currentTable.miembros.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="flex items-center justify-between rounded-xl bg-background border border-border p-2.5 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-foreground truncate">{m.nombre}</span>
                        {m.esAnfitrion && (
                          <span className="text-[10px] font-black uppercase bg-primary-container text-primary px-1.5 py-0.2 rounded-sm">
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-muted-foreground truncate">
                        {m.fuerte ? `Plato: ${m.fuerte}` : "Eligiendo plato..."}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-primary shrink-0">
                      {m.paraLlevar ? "Para llevar" : "En local"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acción grupal: Avisar a cocina */}
            {currentTable.estado !== "EN_CAMINO" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNotifyKitchen}
                  className="w-full rounded-full bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-xs active:scale-95 transition-all hover:bg-primary-hover"
                >
                  Avisar a cocina: ¡Vamos {currentTable.miembros.length} en camino!
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
};
