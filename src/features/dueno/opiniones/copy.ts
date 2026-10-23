export const OPINIONES_COPY = {
  title: "Opiniones",
  respondButton: "Responder",
  solutionModalTitle: (name: string) => `Responder a ${name}`,
  cancel: "Cancelar",
  emptyTitle: "Sin opiniones pendientes",
  emptyDesc: "No tienes mensajes nuevos de comensales.",
  loadingTitle: "Cargando opiniones",
  errorTitle: "Error al cargar buzón",
  errorDesc: "No se pudieron obtener las opiniones.",
  offlineBadge: "Sin conexión · Opiniones guardadas",
  sentUndo: (name: string) => `Respuesta enviada a ${name}`,
} as const;
