import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Check,
  Plus,
  WalletCards,
  Banknote,
  Smartphone,
  Zap,
  X,
  Sparkles,
} from "lucide-react";
import { BottomSheet } from "@/design-system";
import { useBocadoo, RESTAURANT_ID, type Client, type PlanTemplate, type PaymentMethod } from "@/components/bocadoo/store";
import { salesRepository } from "@/data/repositories/sales.repository";
import { toast } from "sonner";

export interface VenderPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VenderPlanModal: React.FC<VenderPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { rawClients, planTemplates, sellPlan, undoPayment } = useBocadoo();
  const clientsList = rawClients || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Planes activos del restaurante
  const activePlans = useMemo(() => {
    return planTemplates.filter(
      (p) => (p.restaurantId === RESTAURANT_ID || !p.restaurantId) && p.activo
    );
  }, [planTemplates]);

  // Si no hay plan seleccionado, preseleccionar el primero (Ley del Mínimo Esfuerzo)
  const effectiveSelectedPlanId = selectedPlanId || activePlans[0]?.id || "";
  const currentPlan = activePlans.find((p) => p.id === effectiveSelectedPlanId);

  // Filtrar clientes existentes por término de búsqueda
  const filteredClients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return clientsList.slice(0, 5); // Mostrar los 5 comensales más habituales
    return clientsList.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q))
    ).slice(0, 6);
  }, [clientsList, searchTerm]);

  // Seleccionar comensal en 1 toque
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setNewClientName("");
  };

  // Crear nuevo comensal en 1 toque desde la búsqueda
  const handleCreateQuickClient = () => {
    const name = searchTerm.trim();
    if (!name) return;
    setNewClientName(name);
    setSelectedClient(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedClient(null);
    setNewClientName("");
    setSelectedPlanId(activePlans[0]?.id || "");
    setPaymentMethod("EFECTIVO");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Confirmar y activar plan (máximo 3 toques)
  const handleConfirmSale = () => {
    if (!currentPlan) {
      toast.error("Selecciona un plan para vender");
      return;
    }

    let targetClient: Client;
    if (selectedClient) {
      targetClient = selectedClient;
    } else if (newClientName.trim()) {
      targetClient = {
        id: `c-quick-${Date.now()}`,
        restaurantId: RESTAURANT_ID,
        nombre: newClientName.trim(),
        telefono: "0990000000",
        correo: `${newClientName.toLowerCase().replace(/\s+/g, ".")}@cliente.bocadoo.ec`,
      };
    } else {
      toast.error("Selecciona o escribe el nombre del comensal");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Registrar venta en el store de Bocadoo
      const res = sellPlan({
        target: { kind: "client", client: targetClient },
        template: currentPlan,
        metodo: paymentMethod,
        staffId: "st1",
      });

      // 2. Asentar en el repositorio de ventas para cuadre de caja
      salesRepository.recordSale({
        type: "PLAN",
        amountFormatted: `$${(currentPlan.precioCents / 100).toFixed(2).replace(".", ",")}`,
        amountCents: currentPlan.precioCents,
        method: paymentMethod === "EFECTIVO" ? "EFECTIVO" : "TRANSFERENCIA",
        clientName: targetClient.nombre,
      });

      // 3. Notificación con búfer de deshacer de 10 segundos
      const priceFmt = `$${(currentPlan.precioCents / 100).toFixed(2).replace(".", ",")}`;
      toast.success(
        `Plan activado: ${currentPlan.nombre} para ${targetClient.nombre} (${priceFmt})`,
        {
          duration: 10000,
          action: {
            label: "Deshacer (10s)",
            onClick: () => {
              if (res && res.payment) {
                undoPayment(res.payment.id);
                toast.info("Venta de plan revertida");
              }
            },
          },
        }
      );

      handleClose();
      onSuccess?.();
    } catch {
      toast.error("No se pudo registrar la venta");
      setIsSubmitting(false);
    }
  };

  const effectiveClientName = selectedClient?.nombre || newClientName;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Vender plan en caja">
      <div className="space-y-4 py-1 pb-2">
        {/* PASO 1: SELECCIONAR O BUSCAR COMENSAL */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Comensal
          </label>

          {effectiveClientName ? (
            <div className="flex items-center justify-between rounded-2xl bg-primary-container p-3 border border-primary/30">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                  {effectiveClientName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="block text-[14px] font-black text-foreground">
                    {effectiveClientName}
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {selectedClient ? "Cliente registrado" : "Nuevo cliente"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                  setNewClientName("");
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface text-foreground hover:bg-secondary-container"
                title="Cambiar comensal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Buscador de comensal */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o teléfono..."
                  className="w-full rounded-2xl border border-outline bg-input-bg py-2.5 pl-10 pr-3 text-[14px] font-bold text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              {/* Botón rápido si escribe un nombre nuevo */}
              {searchTerm.trim().length > 1 &&
                !clientsList.some(
                  (c) => c.nombre.toLowerCase() === searchTerm.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={handleCreateQuickClient}
                    className="flex w-full items-center justify-between rounded-2xl border border-dashed border-primary bg-primary-container/40 p-2.5 text-left text-[13px] font-extrabold text-primary hover:bg-primary-container"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Registrar y vender a &quot;{searchTerm.trim()}&quot;</span>
                    </span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      1 toque
                    </span>
                  </button>
                )}

              {/* Chips rápidos de comensales frecuentes */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground px-1">
                  Comensales frecuentes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[13px] font-bold text-foreground transition-all active:scale-95 hover:border-primary hover:bg-secondary-container"
                    >
                      <Users className="h-3 w-3 text-primary" />
                      <span>{client.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* PASO 2: SELECCIONAR PLAN ACTIVO DEL RESTAURANTE */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Seleccionar Plan
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activePlans.map((plan: PlanTemplate) => {
              const isSelected = plan.id === effectiveSelectedPlanId;
              const unitPrice = (plan.precioCents / 100 / plan.almuerzos).toFixed(2).replace(".", ",");
              const totalPrice = (plan.precioCents / 100).toFixed(2).replace(".", ",");

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col justify-between rounded-2xl p-3 text-left transition-all active:scale-95 border ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40"
                      : "border-border bg-background text-foreground hover:border-primary hover:bg-secondary-container"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[13px] font-black leading-tight line-clamp-1">
                      {plan.nombre}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </div>
                  <div className="flex items-baseline justify-between w-full mt-1">
                    <span className={`text-xs font-semibold ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {plan.almuerzos} almuerzos · ${unitPrice} c/u
                    </span>
                    <span className="text-[15px] font-black leading-none">
                      ${totalPrice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 3: MÉTODO DE PAGO */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            3. Método de pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("EFECTIVO")}
              className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-[13px] font-extrabold border transition-all active:scale-95 ${
                paymentMethod === "EFECTIVO"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-background text-foreground hover:bg-secondary-container"
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("TRANSFERENCIA")}
              className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-[13px] font-extrabold border transition-all active:scale-95 ${
                paymentMethod === "TRANSFERENCIA"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-background text-foreground hover:bg-secondary-container"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Transfer.</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("DEUNA")}
              className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-[13px] font-extrabold border transition-all active:scale-95 ${
                paymentMethod === "DEUNA"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-background text-foreground hover:bg-secondary-container"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Deuna</span>
            </button>
          </div>
        </div>

        {/* BOTÓN DE CONFIRMACIÓN */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!effectiveClientName || !currentPlan || isSubmitting}
            onClick={handleConfirmSale}
            className="w-full rounded-full bg-primary py-3.5 px-4 text-[15px] font-black text-primary-foreground shadow-brand transition-all duration-150 active:scale-[0.98] hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {currentPlan
                ? `Activar ${currentPlan.nombre} · $${(currentPlan.precioCents / 100).toFixed(2).replace(".", ",")}`
                : "Selecciona un plan"}
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
