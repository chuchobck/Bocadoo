export const CAJA_COPY = {
  title: "Caja",
  markBusy: "Marcar lleno",
  busyCountdown: (min: number) => `Lleno (${min}m)`,
  ordersPending: (n: number) => `${n} en camino`,
  scanPass: "Escanear pase",
  chargeSingle: (price: string) => `Cobro suelto ${price}`,
  sellPlan: "Vender plan",
  modalTitle: (price: string) => `Cobro suelto: ${price}`,
  cash: "Efectivo",
  transfer: "Transferencia",
  cancel: "Cancelar",
  undoSingle: (price: string, method: string) => `Cobro ${price} (${method})`,
};
