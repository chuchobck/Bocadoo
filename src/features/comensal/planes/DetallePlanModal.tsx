import React, { useState } from "react";
import {
  ShieldCheck,
  Percent,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BottomSheet } from "@/design-system";
import { money, type PlanTemplate, type Restaurant } from "@/components/bocadoo/store";

export interface DetallePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanTemplate | null;
  restaurant: Restaurant | null;
  onConfirmRequest: (templateId: string, planName: string) => void;
}

export const DetallePlanModal: React.FC<DetallePlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  restaurant,
  onConfirmRequest,
}) => {
  const [showFullTerms, setShowFullTerms] = useState(false);

  if (!plan || !restaurant) return null;

  const precioSuelto = restaurant.precioSueltoCents || 300;
  const precioPlan = plan.precioCents;
  const totalSuelto = precioSuelto * plan.almuerzos;
  const ahorroCents = Math.max(0, totalSuelto - precioPlan);
  const perLunchCents = Math.round(precioPlan / plan.almuerzos);
  const discountPercent = totalSuelto > 0 ? Math.round((ahorroCents / totalSuelto) * 100) : 0;

  const initials = restaurant.nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "B";

  const handleConfirm = () => {
    onConfirmRequest(plan.id, plan.nombre);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Detalle y Términos del Plan">
      <div className="space-y-4 py-2 pb-6 max-h-[80vh] overflow-y-auto no-scrollbar">
        {/* Cabecera del Restaurante con monograma y dirección */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background border border-border">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-primary-foreground font-black text-[16px] shadow-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-black text-foreground truncate">{restaurant.nombre}</h3>
            <p className="text-[12px] font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{restaurant.direccion || restaurant.zona}</span>
            </p>
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Horario: {restaurant.horario || "11:30 - 15:30"}</span>
            </p>
          </div>
        </div>

        {/* Tarjeta del Plan y Desglose Financiero */}
        <div className="rounded-[24px] bg-gradient-to-br from-primary-container/30 via-primary-container/10 to-background border border-primary/20 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary-container px-2.5 py-0.5 rounded-full inline-block mb-1">
                {plan.tipo} · {plan.almuerzos} almuerzos
              </span>
              <h2 className="text-[18px] font-black text-foreground leading-tight">{plan.nombre}</h2>
              <p className="text-[12px] font-semibold text-muted-foreground mt-0.5">
                Vigencia de {plan.vigenciaDias} días hábiles
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[22px] font-black text-primary block leading-none">
                {money(precioPlan)}
              </span>
              <span className="text-[12px] font-bold text-muted-foreground mt-0.5 block">
                {money(perLunchCents)} / comida
              </span>
            </div>
          </div>

          {/* Desglose de Descuento y Ahorro */}
          <div className="rounded-2xl bg-surface border border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground font-semibold">
              <span>{plan.almuerzos} almuerzos a precio regular ({money(precioSuelto)} c/u):</span>
              <span className="line-through">{money(totalSuelto)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] font-black text-foreground">
              <span>Precio especial prepago Bocadoo:</span>
              <span className="text-primary">{money(precioPlan)}</span>
            </div>
            {ahorroCents > 0 && (
              <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-success flex items-center gap-1.5">
                  <Percent className="h-4 w-4" />
                  <span>Tu descuento directo ({discountPercent}% OFF)</span>
                </span>
                <span className="text-[13px] font-black text-success bg-success-container px-2.5 py-0.5 rounded-full">
                  Ahorras {money(ahorroCents)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breve descripción del Plan */}
        <div className="rounded-2xl bg-background border border-border p-3.5 space-y-2">
          <h4 className="text-[13px] font-extrabold text-foreground flex items-center gap-1.5">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            <span>¿Qué incluye cada almuerzo?</span>
          </h4>
          <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">
            Cada almuerzo incluye: sopa o crema casera del día, plato fuerte a tu elección (pollo,
            carne, pescado o plato vegetariano), jugo natural fresco de fruta y postre tradicional de
            la casa.
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="bg-surface px-2.5 py-1 rounded-full border border-border">
              🍽️ Para comer aquí
            </span>
            <span className="bg-surface px-2.5 py-1 rounded-full border border-border">
              🥡 Para llevar (aplica recargo tarrina)
            </span>
            <span className="bg-surface px-2.5 py-1 rounded-full border border-border">
              ⚡ Canje con QR sin efectivo
            </span>
          </div>
        </div>

        {/* Breve descripción del Restaurante */}
        <div className="rounded-2xl bg-background border border-border p-3.5 space-y-1.5">
          <h4 className="text-[13px] font-extrabold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Sobre {restaurant.nombre}</span>
          </h4>
          <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">
            {restaurant.descripcionCorta ||
              "Comida casera fresca preparada a diario con ingredientes locales de la mejor calidad."}
          </p>
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {restaurant.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Términos y Condiciones */}
        <div className="rounded-2xl bg-background border border-border p-3.5 space-y-2">
          <button
            type="button"
            onClick={() => setShowFullTerms(!showFullTerms)}
            className="w-full flex items-center justify-between text-[13px] font-extrabold text-foreground active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Términos y condiciones del plan</span>
            </span>
            {showFullTerms ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div className="space-y-1.5 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              <span>
                <strong>Vigencia:</strong> Válido por {plan.vigenciaDias} días desde el momento de activación.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              <span>
                <strong>Canje seguro:</strong> Cada almuerzo se debita al escanear tu código QR en caja.
              </span>
            </div>

            {showFullTerms && (
              <>
                <div className="flex items-start gap-2 pt-1 border-t border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Horario:</strong> Válido de lunes a viernes en horario de almuerzo ({restaurant.horario}).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>No acumulable:</strong> Los consumos no utilizados dentro del período caducan automáticamente y no son reembolsables en efectivo.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Transferencia:</strong> Puedes utilizar tus almuerzos con amigos en tu misma mesa si vienes acompañado.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botón de Confirmación de 1 toque */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-full bg-primary text-primary-foreground py-3.5 px-4 font-black text-[14px] shadow-sm hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Confirmar y solicitar plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-[11px] text-center text-muted-foreground font-semibold">
            Solicitas sin pago inmediato · Pagas en caja en efectivo o transferencia al activar
          </p>
        </div>
      </div>
    </BottomSheet>
  );
};

