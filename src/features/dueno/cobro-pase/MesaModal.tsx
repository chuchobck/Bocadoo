import React, { useState } from "react";
import { CheckCircle2, Users, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useBocadoo, SHARED_TABLE_QR_PREFIX } from "@/components/bocadoo/store";
import type { SharedTableLine } from "@/components/bocadoo/store";

export const parseMesaQr = (payload: string): string | null =>
  payload.startsWith(SHARED_TABLE_QR_PREFIX) ? payload.slice(SHARED_TABLE_QR_PREFIX.length) : null;

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(".", ",")}`;

const VIA_LABEL: Record<SharedTableLine["via"], string> = {
  PLAN: "Plan prepagado",
  PLAN_ANFITRION: "Plan del anfitrión",
  SUELTO: "Paga suelto",
};

export interface CobrarMesaModalProps {
  mesaId: string | null;
  onClose: () => void;
}

export const CobrarMesaModal: React.FC<CobrarMesaModalProps> = ({ mesaId, onClose }) => {
  const { sharedTables, previewSharedTable, validateSharedTable } = useBocadoo();
  const [done, setDone] = useState<ReturnType<typeof validateSharedTable> | null>(null);

  if (!mesaId) return null;
  const table = sharedTables.find((t) => t.id === mesaId);
  const preview = previewSharedTable(mesaId);

  const close = () => {
    setDone(null);
    onClose();
  };

  const handleValidate = () => {
    const res = validateSharedTable(mesaId);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setDone(res);
  };

  const lines = done && done.ok ? done.lines : preview.ok ? preview.lines : [];
  const totalSuelto = done && done.ok ? done.totalSueltoCents : preview.ok ? preview.totalSueltoCents : 0;
  const sellos = done && done.ok ? done.sellos : preview.ok ? preview.sellos : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="cobrar-mesa-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-[4px] p-4"
    >
      <div className="relative w-full max-w-sm rounded-[32px] bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {!preview.ok && !done ? (
          <div className="py-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-10 w-10 text-danger" />
            <h2 className="text-[17px] font-extrabold text-foreground">{preview.message}</h2>
          </div>
        ) : (
          <>
            <div className="text-center">
              {done ? (
                <CheckCircle2 className="mx-auto mb-1 h-10 w-10 text-success" />
              ) : (
                <Users className="mx-auto mb-1 h-10 w-10 text-primary" />
              )}
              <h2 className="text-[18px] font-black text-foreground">
                Mesa #{mesaId.toUpperCase()} · {lines.length} comensales
              </h2>
              <p className="text-[12px] font-semibold text-muted-foreground">
                {table?.anfitrionNombre}
                {table?.modo === "INVITO_YO" ? " invita a todos" : " · cada quien lo suyo"}
              </p>
            </div>

            <ul className="mt-4 space-y-1.5">
              {lines.map((l) => (
                <li
                  key={l.memberId}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5 text-[13px]"
                >
                  <div className="min-w-0">
                    <span className="block truncate font-extrabold text-foreground">{l.nombre}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{l.plato}</span>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-bold ${l.via === "SUELTO" ? "text-primary" : "text-success"}`}
                  >
                    {VIA_LABEL[l.via]}
                    {l.via === "SUELTO" ? ` · ${money(l.montoCents)}` : ""}
                  </span>
                </li>
              ))}
            </ul>

            {sellos.length > 0 && (
              <p className="mt-3 text-center text-[12px] font-semibold text-muted-foreground">
                Sellos: {sellos.map((s) => `${s.nombre} +${s.cant}`).join(" · ")}
              </p>
            )}

            {done ? (
              <button
                type="button"
                onClick={close}
                className="mt-4 w-full rounded-full bg-success py-3 text-[15px] font-bold text-success-foreground active:scale-95"
              >
                Listo, mesa validada
              </button>
            ) : (
              <button
                type="button"
                data-testid="cobrar-mesa-confirm"
                onClick={handleValidate}
                className="mt-4 w-full rounded-full bg-success py-3 text-[15px] font-extrabold text-success-foreground active:scale-95"
              >
                Cobrar mesa completa{totalSuelto > 0 ? ` · ${money(totalSuelto)} en caja` : ""}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
