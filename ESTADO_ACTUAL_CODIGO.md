# Bocadoo — Estado actual del código

> Generado el 2026-11-07 a partir de la lectura del repo (rama `rediseno-3-toques`, con cambios sin commitear).
> Stack real: **TanStack Start + TanStack Router (file-based)**, React, Vite, Tailwind 4, Radix/shadcn, `sonner` (toasts), `lucide-react`, `zod` (search params).
> Nota: no hay Zustand ni Redux. El estado es un **Context propio + localStorage** (ver sección 3).

---

## 1. Árbol de rutas y navegación

Router: `src/router.tsx` (`createRouter` con `routeTree.gen.ts`, `scrollRestoration`). Rutas en `src/routes/`.

| URL | Archivo | Qué renderiza |
|---|---|---|
| `/` | `routes/index.tsx` | `LandingPage` |
| `/flujos` | `routes/flujos.tsx` | `FlujosPage` (guías paso a paso con mockups de celular) |
| `/app` | `routes/app/index.tsx` | `LoginScreen` (acepta `?role=diner\|owner&view=…`) |
| `/app/galeria` | `routes/app/galeria.tsx` | `BocadooShowcase` (galería de pantallas, ~1960 líneas) |
| `/app/kit` | `routes/app/kit.tsx` | `KitPage` (catálogo del design system) |
| **Comensal** | | |
| `/app/comensal` | `comensal/index.tsx` | `MiPaseView` (pase/QR, sellos, pedido activo, mesa activa, actividad, feedback). Search: `state`, `qr` |
| `/app/comensal/restaurantes` | `comensal/restaurantes.tsx` | `DondeComerView` (+ ficha, pedido, mesa, mapa) |
| `/app/comensal/planes` | `comensal/planes.tsx` | Lista de planes por local + `DetallePlanModal` |
| `/app/comensal/ajustes` | `comensal/ajustes.tsx` | `PerfilView` (pestaña "Yo") |
| `/app/comensal/mesa/$mesaId` | `comensal/mesa.$mesaId.tsx` | `UnirmeMesaView` (invitado entra a una mesa por link/QR) |
| `/app/comensal/estados` | `comensal/estados.tsx` | Solo DEV (`EstadosComensal`); en prod → `notFound` |
| **Dueño / Cajero** | | |
| `/app/dueno` | `dueno/index.tsx` | `CajaView` + `CobrarPaseModal` + `CobrarMesaModal`. Search: `role=dueno\|cajero`, `agregarCliente` |
| `/app/dueno/menu` | `dueno/menu.tsx` | `MenuDiaView` (menú del día + catálogo) |
| `/app/dueno/agregar-menu` | `dueno/agregar-menu.tsx` | `MenuDiaView` (mismo componente, otro punto de entrada) |
| `/app/dueno/planes` | `dueno/planes/index.tsx` | `ClientesPlanesView` (segmento planes) |
| `/app/dueno/planes/nuevo` | `dueno/planes/nuevo.tsx` | `ClientesPlanesView` + `CrearEditarPlanModal` |
| `/app/dueno/clientes` | `dueno/clientes.tsx` | `ClientesPlanesView` (segmento clientes) |
| `/app/dueno/cobrar` | `dueno/cobrar.tsx` | `ClientesPlanesView` (flujo cobrar plan) |
| `/app/dueno/descontar` | `dueno/descontar.tsx` | `CajaView` + `CobrarPaseModal` abierto |
| `/app/dueno/oferta` | `dueno/oferta.tsx` | `CajaView` + `OfertaFlashModal` abierto |
| `/app/dueno/registrar-consumo` | `dueno/registrar-consumo.tsx` | `RegistrarConsumoScreen` (POS) |
| `/app/dueno/pedidos` | `dueno/pedidos.tsx` | `PedidosEnCaminoView` |
| `/app/dueno/cierre` | `dueno/cierre.tsx` | `CierreCajaView` |
| `/app/dueno/metricas` | `dueno/metricas.tsx` | `MetricasScreen` |
| `/app/dueno/ajustes` | `dueno/ajustes.tsx` | `MasAjustesView` |
| `/app/dueno/opiniones` | `dueno/opiniones.tsx` | `BuzonOpinionesView` |
| `/app/dueno/caja` | `dueno/caja.tsx` | **Redirect** → `/app/dueno` |
| `/app/dueno/estados` | `dueno/estados.tsx` | Solo DEV (`EstadosDueno`) |

**404 (`__root.tsx`)**: además de mostrar la página 404, redirige `/app`→`/app`, `/caja` y `/dueno`→`/app/dueno`, `/comensal`→`/app/comensal`.

### Navegación inferior (`NavBar` en `components/bocadoo/ui.tsx`)
- **Comensal (4):** Pase `/app/comensal` · Restaurantes `/restaurantes` · Planes `/planes` · Yo `/ajustes`
- **Dueño (5):** Caja `/app/dueno` · Menú `/menu` · Planes `/planes` · Métricas `/metricas` · Ajustes `/ajustes`
- **Cajero (2):** Caja · Pedidos · Turno (`/ajustes`). El rol cajero se propaga con `?role=cajero`.

### Flujo de entrada
`/` (landing) → `/app` (login/registro) → login con cualquier correo válido + contraseña no vacía (setTimeout 700 ms, **sin backend**) → `/app/comensal` o `/app/dueno` según el rol elegido. Registro termina en onboarding → `/app/comensal/restaurantes` (comensal) o `/app/dueno` (dueño).
La landing incrusta el prototipo con `<iframe src="/app/{vista}?embed=1">`.

---

## 2. Pantallas y vistas implementadas

Arquitectura: `components/{dueno,comensal}/*.tsx` son **shims** de 4-5 líneas que re-exportan las pantallas reales de `src/features/{rol}/{feature}/Screen.tsx` (con `copy.ts` para textos y `hooks/`). Cada pantalla soporta los estados `ComponentState`: `exito | cargando | vacio | error | offline`.

### 2.1 Landing (`components/landing/LandingPage.tsx` + `landing.css`)
Nav con anclas `#como-funciona`, `#restaurantes`, `#comensales`, `#prototipo`, `#precios`.
1. **Hero** (`#inicio`): "¿Cuántos almuerzos se te escapan entre cuadernos…?" + CTA + link a `/flujos` + maqueta de celular con **iframe del prototipo** (pestañas por rol).
2. **Credenciales** (`.cred`).
3. **Problemas** (`#restaurantes`): "Tu plan funciona. Tu control, no." → Descuadres · Fugas de dinero · Filas lentas.
4. **Cómo funciona** (`#como-funciona`): "Del papel al QR en 3 pasos" → Registra a tus clientes · Cobra el plan · Escanea y descuenta.
5. **Comensales** (`#comensales`): "¿Seguro sabes cuántos almuerzos te quedan?".
6. **Beneficios** (sin id): "Más orden, más caja y menos estrés" → Liquidez al inicio del mes · Orden contable · Caja rápida en hora pico · Reportes de lo que más se vende.
7. **Prototipo** (`#prototipo`): "Toca, explora y prueba Bocadoo" (iframe interactivo).
8. **Precios** (`#precios`): "Gratis para el pequeño. Ganamos cuando tú ganas." → Restaurantes pequeños · Pago por resultado · Sin suscripción · Wallet de alimentación.
9. **Contacto** (`#contacto`): formulario de lead (`#leadForm`: nombre, restaurante, WhatsApp) con mensaje de gracias.

### 2.2 Autenticación (`components/bocadoo/auth.tsx`, 1997 líneas)
`LoginScreen` (selector de rol diner/owner, validación de correo/contraseña, "olvidé contraseña" `ForgotPasswordModal`, `GoogleAccountPickerModal` simulado) · `RegisterDinerScreen` · `RegisterOwnerScreen` (incluye `GoogleMapQuitoPicker` para ubicar el local) · `OnboardingDinerScreen` · `OnboardingOwnerScreen`. Medidor de fuerza de contraseña.

### 2.3 Vista Dueño
| Pantalla / modal | Archivo | Contenido |
|---|---|---|
| **Caja** (home, pestaña "Caja") | `features/dueno/caja/Screen.tsx` | Chip de aforo/"Marcar lleno" (20 min), botón grande **Escanear QR**, **Cobro suelto** (efectivo/transferencia + `UndoBanner` 10 s), **Vender plan**, **Oferta flash**, pedidos en camino, últimos movimientos del día, accesos a Cierre y Métricas. Banners "Mesa #X · N comensales · Cobrar" |
| `VenderPlanModal` | `caja/VenderPlanModal.tsx` | Elegir cliente → plan → método → confirmar, con deshacer |
| `CobrarPaseModal` (escáner) | `cobro-pase/Screen.tsx` | Resultados `VERDE` (descontado + deshacer), `MORADO` (sin plan → vender), `ROJO` (inválido); estados cargando/error |
| `CobrarMesaModal` | `cobro-pase/MesaModal.tsx` | Preview y validación de una mesa compartida (líneas por comensal: PLAN / PLAN_ANFITRION / SUELTO) |
| **Registrar consumo (POS)** | `registrar-consumo/Screen.tsx` | Modos `directa`/`plan`, categorías Almuerzos · A la carta · Extras · Bebidas, mesa, stepper, método de pago, venta + deshacer, "modo agotado" |
| **Menú** | `menu/Screen.tsx` | Segmentos `hoy` / `catalogo` (subsegmentos almuerzos / a la carta), secciones Sopa · Segundo · Bebida · Postre, selector rápido, opciones múltiples, marcar agotado, publicar |
| **Planes y clientes** | `clientes/Screen.tsx` | Segmentos `planes` / `clientes`; buscar/crear cliente, ficha, renovar, vender plan, editor de plan (tipo, días L-D, incluye) |
| `CrearEditarPlanModal` | `planes/Screen.tsx` | Tipo, nombre, almuerzos, vigencia, precio, cupos, días, incluye, visible en marketplace |
| `PasarCartulinaModal` | `cartulina/Screen.tsx` | Migrar cartulina física (nombre, celular, almuerzos restantes) |
| **Pedidos en camino** | `pedidos/Screen.tsx` | Lista de preórdenes, escanear/entregar |
| **Cierre de caja** | `cierre/Screen.tsx` | Totales del día, efectivo contado vs esperado, confirmar |
| **Métricas** | `metricas/Screen.tsx` | Pestañas de reportes + periodo (semana…); cards: ResumenDía, VentasPlanes, PlatosRanking, HorasPico, AlmuerzosPendientes/Vencidos, ClientesSeguimiento, ResumenSemanalWhatsApp |
| `OfertaFlashModal` | `oferta/Screen.tsx` | Ítem, % descuento o precio, cupos, hora fin, publicar/activa |
| **Buzón de opiniones** | `opiniones/Screen.tsx` | Feedback de comensales, detalle y responder |
| **Ajustes** | `ajustes/Screen.tsx` | Cambio de rol Dueño/Cajero, logo del local (upload a dataURL), migrar cartulina, enlace a métricas y opiniones |

### 2.4 Vista Comensal
| Pantalla / modal | Archivo | Contenido |
|---|---|---|
| **Pase** (home) | `pase/Screen.tsx` | Tarjetas de plan por local (almuerzos restantes, vencimiento, múltiples vencimientos), **QR del pase** (`BocadooQr`), tarjeta de **sellos** + reclamar premio, pedido activo, mesa activa, actividad reciente, estados vacío/offline |
| `EstadoPedidoModal` | `pedido/Screen.tsx` | Detalle y QR del pedido (30 min), modalidad aquí/llevar (+$0,25) |
| **Restaurantes** ("Dónde comer") | `donde-comer/Screen.tsx` | Búsqueda, zona, semáforo de ocupación, "Tu plan", "Ofertas hoy", lista de locales |
| `InteractiveMapModal` | `donde-comer/components/` | Mapa de Quito con zonas (`data/zones.ts`) |
| `FichaLocalModal` | `ficha-local/Screen.tsx` | Menú del día, horario, plan, precio suelto, preordenar |
| `MesaAmigosModal` | `mesa-amigos/Screen.tsx` | Crear mesa, hora, modo CADA_UNO / INVITO_YO, link/QR, avisar a cocina |
| **Unirme a mesa** | `unirme-mesa/Screen.tsx` | Invitado elige sopa/fuerte/llevar y se une |
| **Planes** | `routes/app/comensal/planes.tsx` + `planes/DetallePlanModal.tsx` | Marketplace de planes por local; "Solicitar plan" |
| **Calificar** | `calificar/Screen.tsx` | Feedback en un toque (etiquetas) 25 min tras almuerzo |
| **Yo** (Perfil) | `perfil/Screen.tsx` | Nombre, celular, plan, reintentar/iniciar sesión |

### 2.5 Herramientas de desarrollo
`/app/kit`, `/app/galeria`, `/flujos`, `DevPanel` (`src/dev/DevPanel.tsx`: adelantar días/minutos simulados, `resetDemoData`, escenario del escáner) y `*/estados` (solo `import.meta.env.DEV`).

---

## 3. Estructura de datos y manejo de estado

### 3.1 Dónde vive el estado — **dos sistemas paralelos, sin conectar**

**A) Store global `useBocadoo()`** — `components/bocadoo/store.tsx` (~4100 líneas).
- `BocadooProvider` + `createContext`; estado único `State` con `useState`, hidratado desde `localStorage["bocadoo-demo-v3"]`, persistido en cada cambio y difundido a otras pestañas por `BroadcastChannel("bocadoo-sync-v3")`.
- Reloj simulado (`simulatedDaysOffset`, `simulatedMinutesOffset`) para demos.
- Dinero siempre en **centavos enteros**; helpers `money`, `moneyShort`, `parseMoneyToCents`.
- Datos seed: 5 `APP_USERS` (comensal demo = `u1` Carlos Mejía), restaurantes `r1` (La Cuchara de San Blas), `r2` (El Fogón Quiteño)…

**B) Repositorios `src/data/repositories/*`** — clases con `storageSync` (`data/local/sync.ts`: localStorage + `BroadcastChannel("bocadoo-multitab-sync")`). Claves propias (p. ej. `bocadoo-local-config`). Usados por:
`localRepository` (config del local, logo, aforo) · `clientsRepository` (clientes de la lista del dueño) · `plansRepository` · `ordersRepository` (pedidos en camino del dueño) · `salesRepository` (totales del cierre).

**C) `useState` local** en casi todas las pantallas (formularios, modales, segmentos, catálogos iniciales como `INITIAL_CATALOG` en el menú).
**D) Mocks puros**: `features/dueno/metricas/data/reportes.mock.ts` (reportes), `donde-comer/data/zones.ts`.

Capa de dominio pura y testeada (`src/domain/`): `plans.ts` (FIFO, estados POR_VENCER…), `money.ts` (comisión 7 %), `occupancy.ts`, `qr.ts`, `redemption.ts`, `cash.ts`, `feedback.ts` (`FEEDBACK_DELAY_MIN`), `dates.ts`.

### 3.2 Interfaces principales (extractos de `store.tsx`)

```ts
type StaffRole = "OWNER" | "CASHIER";

type Restaurant = {
  id: string; nombre: string; zona: string; puestos: number; anotarMesa: boolean;
  precioSueltoCents: number; recargoParaLlevarCents: number;
  lat: number; lng: number; horario: string; abierto: boolean;
  descripcionCorta?: string; tags?: string[];
  manualBusyUntil?: string; logoUrl?: string | null; direccion?: string;
};

type AppUser = { id: string; name: string; username: string; email: string; phone: string };
type Staff   = { id: string; userId: string; restaurantId: string; rol: StaffRole; nombre: string; telefono?: string };
type Client  = { id: string; restaurantId: string; userId?: string; nombre: string; telefono: string; correo: string };

// ---- Planes ----
type PlanType = "Semanal" | "Quincenal" | "Mensual" | "Libre";
type PlanTemplate = {
  id: string; restaurantId: string; tipo: PlanType; nombre: string;
  almuerzos: number; precioCents: number; vigenciaDias: number; cupos: number;
  visibleEnMarketplace: boolean; activo: boolean;
};
type SubscriptionStatus = "ACTIVA" | "AGOTADA" | "VENCIDA" | "ANULADA";
type Subscription = {
  id: string; clientId: string; templateId: string; origen: "VENTA" | "MIGRADA";
  almuerzosTotales: number; almuerzosRestantes: number;
  compradaEn: string; venceEn: string; estado: SubscriptionStatus; anotacion?: string;
};
type PlanRequest = { id: string; clientId: string; templateId: string; estado: "PENDIENTE" | "COBRADA" | "EXPIRADA"; creadaEn: string };

// ---- Consumo / ventas / pagos ----
type Redemption = {
  id: string; subscriptionId: string; restaurantId: string; staffId: string;
  creadoEn: string; paraLlevar: boolean; idempotencyKey: string; revierteA?: string;
};
type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA";
type Payment = {
  id: string; montoCents: number; metodo: PaymentMethod; subscriptionId?: string; saleId?: string;
  cobradoPor: string; creadoEn: string; revierteA?: string; fotoComprobante?: string;
};
type SaleItem = { platoId: string; nombre: string; cant: number; precioCents: number; isLunch?: boolean };
type Sale = {
  id: string; restaurantId: string; ticket: number; items: SaleItem[]; totalCents: number;
  paraLlevar: boolean; mesa?: string; creadoEn: string; revierteA?: string;
  sellos?: { clientId: string; cant: number };
};

// ---- Menú ----
type MenuSectionId = "jugo" | "sopa" | "fuerte" | "postre" | "adicional";
type MenuDish = { id: string; nombre: string; descripcion: string; precioCents?: number; agotado: boolean; porciones?: number; foto?: string };
type MenuDay  = { restaurantId?: string; fecha: string; secciones: Record<MenuSectionId, MenuDish[]>; publicadoEn?: string };

// ---- Preórdenes ----
type OrderStatus = "BORRADOR" | "EN_CAMINO" | "CANJEADA" | "SERVIDA" | "EXPIRADA" | "CANCELADA";
type Order = {
  id: string; comensalId: string; comensalNombre: string; restaurantId: string;
  items: { platoId: string; nombre: string; seccion: string; precioCents?: number }[];
  tipo: "AQUI" | "LLEVAR"; totalCents: number; recargoLlevarCents: number;
  estado: OrderStatus; creadaEn: string; venceEn: string; qrPayload: string;
  canjeadaEn?: string; subscriptionIdUsed?: string; paymentIdUsed?: string;
};

// ---- Fidelización, feedback, ofertas ----
type StampCardConfig = { restaurantId: string; activa: boolean; meta: number; premio: string; nombre?: string; cuenta?: "almuerzo" | "plato" };
type StampRecord = { clientId: string; restaurantId: string; sellos: number; premiosDisponibles: number; historiaCanjes: { fecha: string; motivo: string }[] };
type FeedbackItem = { id: string; redemptionId: string; restaurantId: string; clientId: string; clientName: string; tags: string[]; comentarioPrivado?: string; creadoEn: string; respuestaRestaurante?: string; respondidoEn?: string };
type FlashOffer = { id: string; restaurantId: string; titulo: string; descripcion: string; precioCents: number; precioOriginalCents: number; stockTotal: number; stockRestante: number; expiraEn: string; activa: boolean; creadaEn: string };
type CommissionEntry = { id: string; tipo: "FLASH_OFFER" | "MARKETPLACE_DEAL"; referenciaId: string; restaurantId: string; montoVentaCents: number; tasaPorcentaje: number; comisionCents: number; creadoEn: string };

// ---- Mesa compartida ----
type SharedTable = {
  id: string; restaurantId: string; restaurantNombre: string; anfitrionNombre: string; anfitrionUserId: string;
  hora: string; creadaEn: string;
  miembros: { id: string; nombre: string; esAnfitrion: boolean; sopa?: string; fuerte?: string; paraLlevar?: boolean; unidoEn: string }[];
  estado: "ABIERTA" | "EN_CAMINO" | "EN_MESA" | "FINALIZADA";
  modo?: "CADA_UNO" | "INVITO_YO"; validadaEn?: string;
};

// ---- Reclamos y cierre ----
type Claim = { id: string; redemptionId: string; mensaje: string; estado: "PENDIENTE" | "DEVUELTO" | "RECHAZADO"; creadoEn: string; respuesta?: string; resueltoEn?: string };
type CashClosure = {
  id: string; fecha: string; esperadoCents: number; contadoCents: number; diferenciaCents: number;
  cerradoEn: string; cerradoPor: string;
  desglose: { efectivoCents: number; transferenciasCents: number; planesCents: number; posCents: number; almuerzosServidos: number; almuerzosLlevar: number };
};

// ---- Estado global ----
type State = {
  simulatedDaysOffset: number; simulatedMinutesOffset: number; activeRole: StaffRole;
  restaurants: Restaurant[]; staff: Staff[]; clients: Client[];
  planTemplates: PlanTemplate[]; subscriptions: Subscription[]; redemptions: Redemption[];
  payments: Payment[]; sales: Sale[]; menuDays: Record<string, MenuDay>;
  planRequests: PlanRequest[]; claims: Claim[]; cashClosures: CashClosure[];
  orders: Order[]; stampConfigs: Record<string, StampCardConfig>; stampRecords: Record<string, StampRecord>;
  feedbackList: FeedbackItem[]; flashOffers: FlashOffer[]; commissionLedger: CommissionEntry[];
  dinerZone: string | null; soundEnabled: boolean; commissionRate: number;
  scannerDemoScenario: string; dinerHasPlanOverride: boolean | null;
  dismissedFeedbackIds: string[]; sharedTables: SharedTable[];
};
```

**Modelos paralelos de los repositorios** (distintos a los del store): `ClientRecord {id,name,phone,remainingLunches,habitualPlanId,habitualPlanName,lastVisit}`, `PlanConfig {id,name,lunches,priceCents,priceFormatted,daysValidity,active}`, `OrderItem {id,orderNumber,dinerName,soup,main,minutesAgo,delivered,expiresInMinutes}`, `LocalConfig {restaurantId,name,address,totalSeats,singleLunchPriceCents,occupancy,isManualBusy,logoUrl…}`. Tipos de dominio en `domain/plans.ts` (`PlanItem`) y `data/repositories/types.ts` (`DinerClient`, `MenuItemDish`, `SaleTransaction`).

---

## 4. Flujos que YA funcionan vs. botones estáticos

### 4.1 Ya cambian estado (persisten en localStorage y se sincronizan entre pestañas)
Acciones expuestas por `useBocadoo()` **y usadas por la UI**:

| Flujo | Acción(es) | Dónde se dispara |
|---|---|---|
| Vender plan en caja (+ deshacer) | `sellPlan`, `undoPayment` | `VenderPlanModal` |
| Registrar consumo/POS (+ deshacer) | `posSale`, `undoSale` | `RegistrarConsumoScreen` |
| Marcar plato agotado | `toggleSoldOut` | POS y Menú |
| Publicar menú del día | `publishMenu` | `features/dueno/menu` |
| Cobrar plan a cliente | `chargePlan` | `ClientesPlanesView` |
| Solicitar plan (comensal) | `requestPlan` | `/app/comensal/planes` |
| Preorden individual / para llevar | `createPreOrder` (+ toast "Pedido #N enviado a cocina") | `/app/comensal/restaurantes` |
| Elegir zona del comensal | `setDinerZone` | restaurantes |
| Mesa con amigos: crear / unirse / modo / avisar cocina | `createSharedTable`, `joinSharedTable`, `setSharedTableMode`, `notifyKitchenForTable` | `MesaAmigosModal`, `/mesa/$mesaId` |
| Cobrar mesa (preview + validar) | `previewSharedTable`, `validateSharedTable` | `CobrarMesaModal` (banner en Caja) |
| Feedback tras almuerzo | `submitFeedback`, `dismissFeedback` | `/app/comensal` |
| Reclamar premio de sellos | `claimStampReward` | `/app/comensal` |
| Cambiar rol Dueño ⇄ Cajero | `setStaffRole` | Ajustes dueño |
| Demo: adelantar tiempo / reset | `advanceDemoDays`, `advanceSimulatedMinutes`, `resetDemoData` | `DevPanel` |

Con repositorios (persisten, pero **en otra clave**, sin relación con el store): marcar/limpiar "Lleno" (`localRepository`), logo del local, crear/renovar cliente y cartulina física (`clientsRepository`), guardar plan (`plansRepository.savePlan`), entregar pedido (`ordersRepository.deliverOrder`), registrar venta para el cierre (`salesRepository.recordSale`, llamado desde `VenderPlanModal`).

### 4.2 Solo visuales / desconectados (importante antes de construir encima)
- **Escáner QR del dueño (`CobrarPaseModal`) NO descuenta nada.** En `/app/dueno` y `/app/dueno/descontar` se abre con valores fijos (`outcome="VERDE"`, "Carlos Mejía", 13 almuerzos). `redeemLunch`, `undoRedemption` y `discountLunch` existen en el store y están testeados en dominio, pero **ninguna pantalla los llama**. No hay cámara real ni lectura de QR; el `BocadooQr` solo *genera* el código.
- **Cobro suelto** (Caja): abre el modal y muestra el `UndoBanner`, pero `onChargeSingle` no está conectado desde la ruta → no registra venta ni cambia totales.
- **Oferta flash**: `OfertaFlashScreen` guarda la oferta en `useState` local (`activeOffer`). `launchFlashOffer`/`redeemFlashOffer` del store no se usan; el comensal ("Ofertas hoy") no ve lo que publica el dueño.
- **Pedidos en camino (dueño)** lee `ordersRepository` (3 pedidos mock fijos), **no** los `orders` que crea el comensal con `createPreOrder` → el pedido del comensal no aparece en la pantalla del dueño. (En Caja el contador `preorderCount` sí lee del store.)
- **Cierre de caja** usa `salesRepository.getTodayTotals()`; `closeCash` del store no se llama desde la pantalla.
- **Métricas**: 100 % datos de `reportes.mock.ts`.
- **Opiniones (dueño)**: lista propia; no lee `feedbackList` del store ni usa `replyFeedback`.
- **Planes (dueño)**: `ClientesPlanesView` mantiene `INITIAL_PLANS` en `useState` y `plansRepository`; no usa `addPlan/updatePlan/togglePlan` del store. Los planes que ve el comensal (`planTemplates`) no cambian con lo que crea el dueño.
- **Menú → comensal**: el catálogo y selecciones de "hoy" del dueño viven en `useState`; solo `publishMenu`/`toggleSoldOut` tocan el store.
- **Auth**: login/registro/Google/olvidé contraseña son simulados (no validan credenciales ni crean cuentas). Rol y usuario demo fijos (`DINER_USER_ID="u1"`, `RESTAURANT_ID="r1"`).
- **Perfil comensal**: "Iniciar sesión"/"reintentar" hacen `window.location.reload()`. Ajustes del comensal no tiene más acciones.
- **Landing**: el formulario de contacto solo cambia a mensaje de gracias (sin envío).
- **Sin implementar en la UI aunque el store tiene la acción**: `fileClaim`, `refundRedemption`, `dismissClaim`, `extendSubscription`, `confirmPlanRequest`, `copyPreviousMenu`, `configureStampCard`, `replyFeedback`, `scanOrder`, `serveOrder`, `cancelPreOrder`, `migrateCard`, `updateRestaurant`, `linkUser`, `addContact`.

> Verificado por lectura de código y `grep` de usos; no se ejecutó la app. Los usos de acciones se buscaron por nombre en `src/` (si alguna se llama de forma dinámica, no se habría detectado).

---

## 5. Componentes clave reutilizables

### 5.1 Design system (`src/design-system/`, exportado en `index.ts`; tokens en `tokens.ts` + `theme.css`)
- **Botones:** `ButtonPrimary`, `ButtonSecondary`, `ButtonGhost`
- **Tarjetas:** `Card`, `PassCard` (pase con QR), `StampCard` (sellos), `DishCard`, `FeedbackCard`
- **Inputs:** `InputField`, `SearchInput`, `ToggleSwitch`, `Chip`, `Badge`
- **Navegación:** `NavBar`, `TopBar`, `OccupancyChip` (semáforo Fluido/Movido/Lleno), `QuickPayBar`
- **Overlays:** `BottomSheet`, `ScanResultOverlay`, `UndoBanner` (deshacer 10 s)
- **Feedback/tipografía:** `StateFeedback` (vacío/error/offline), `BigNumber`
- Tipos: `ComponentState` (`types.ts`)

### 5.2 Helpers de app (`components/bocadoo/ui.tsx`)
`AppShell` (marco de celular / modo `embed`), `DeviceFrame`, `Logo`, `NavBar` (versión con rutas por rol), `Overlay`, `BottomSheet`, `ModalHeader`, `ScreenHeader`, `SectionTitle`, `Avatar`, `Transaction`, `SettingsRow`, `QuickAction`, `Toggle`, `FieldLabel`, `PrimaryButton`, `SecondaryButton`, `PaymentMethods`, `PosItem`, `Stepper`, `StatusBadge`, `ScanCorner`, hook `useGoBack(fallback)`, `TXN_ICONS`.
> Ojo: existen **dos** `NavBar` y **dos** `BottomSheet` (design-system y `bocadoo/ui.tsx`). Las rutas usan los de `bocadoo/ui.tsx`; las pantallas de `features/` usan los del design-system. Conviene elegir uno al agregar pantallas nuevas.

### 5.3 Otros
- `BocadooQr` (generador de QR), `ThemeToggle`, `components/ui/*` (shadcn/Radix: dialog, sheet, drawer, tabs, select, calendar, chart, sonner, etc.)
- `components/flujos/` (`kit.tsx`, `flows.tsx`, `screens.tsx`) para mockups de la página `/flujos`.
- Plataforma: `src/platform/` (`haptics`, `share`, `safeArea`, `usePlatform`, `feedback`).

### 5.4 Convenciones para nuevas funciones
1. Carpeta `src/features/{dueno|comensal}/<feature>/` con `Screen.tsx`, `copy.ts` (textos), `hooks/`, `components/`, `index.ts`.
2. Shim en `components/{rol}/<Nombre>.tsx` + export en su `index.ts`.
3. Ruta fina en `src/routes/app/...` que envuelve en `<AppShell>` + `<NavBar>` y conecta store/navegación por props.
4. Soportar los 5 `ComponentState` usando `StateFeedback`.
5. Dinero en centavos (`money()`); reglas puras en `src/domain/` con test.
6. Antes de commitear: `npm run lint:brand` (`scripts/lint-brand.mjs`).
7. Para que algo se vea en ambos roles (p. ej. pedido del comensal → dueño) usar **el store** (`useBocadoo`), no los repositorios.
