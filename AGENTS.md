<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Prototipo interactivo con estado simulado en localStorage y sincronización multiventana mediante BroadcastChannel; sin backend.
- Tecnologías: React, TanStack Router, Vite, Tailwind CSS, lucide-react, sonner, qrcode.react.

### Fase 1 (P1–P10)
- Store unificado con subscriptions, redemptions, payments, sales, menuDays, planRequests, claims y cashClosures.
- Caja rápida en 1 toque con búfer de deshacer de 10 segundos.
- Soporte para migración de cartulinas físicas, POS directo y ventas de planes.

### Fase 2 (P11–P15)
- **P11 Marketplace y Semáforo de Ocupación**: 5 restaurantes de ejemplo con coordenadas en Quito, cálculo dinámico de distancia y ocupación `(ventas + canjes "para comer aquí" últimos 25 min) ÷ puestos` (Fluido < 60%, Movido 60-85%, Lleno > 85%). Interruptor manual de dueño [Local lleno] con cuenta regresiva de 20 min. Búsqueda y chips con `aria-pressed`.
- **P12 Preórdenes individuales y para llevar**: Selección de sopa y segundo, QR con cuenta regresiva de 30 min (`BCD-ORD-...`). Franja en caja "X en camino". Escaneo resuelve descuento de plan o cobro POS. Regla de comensal: si expiran ≥ 3 órdenes en 7 días, límite de 1 orden activa.
- **P13 Tarjeta de sellos**: Configuración por el dueño (meta 10, premio configurable). Cada almuerzo validado por QR suma 1 sello automático con animación. Canje de premio genera venta de $0 (motivo "Premio") para cuadre de caja.
- **P14 Feedback**: Tarjeta comensal 20 min post-consumo con etiquetas de 1 toque y nota privada. Conteos públicos agregados en ficha (eliminado puntaje fijo). Buzón privado para el dueño con respuesta directa al comensal.
- **P15 Ofertas Flash & Comisiones**: Lanzamiento de ofertas con cupos y hora fin. Aviso transparente: "Publicar es gratis. Pagas el 7 % solo de lo que se canjee" (`COMMISSION_RATE = 0.07`). Canje en caja registra venta y asiento en `commissionLedger`. Panel "Lo que te trajo Bocadoo" para el dueño con métricas y comisiones acumuladas.
