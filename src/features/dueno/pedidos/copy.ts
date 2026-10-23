export const PEDIDOS_COPY = {
  title: "Pedidos en camino",
  activeCount: (count: number) => `${count} activos`,
  deliverButton: "Entregar",
  orderDelivered: (number: string) => `Pedido #${number} entregado`,
  emptyTitle: "Sin pedidos pendientes",
  emptyDesc: "Todos los almuerzos fueron despachados.",
  backToCaja: "Volver a caja",
  loadingTitle: "Cargando pedidos",
  errorTitle: "Error al cargar pedidos",
  offlineBadge: "Sin conexión · Modo seguro",
} as const;
