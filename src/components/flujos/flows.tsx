import {
  CalendarCheck,
  Receipt,
  ScanLine,
  ShoppingBag,
  Users,
  Utensils,
  WalletCards,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { Role } from "./roles";
import {
  CajaScreen,
  CierreScreen,
  CobroSueltoScreen,
  ColaScreen,
  DeUnaScreen,
  EscanerScreen,
  FichaScreen,
  MenuDiaScreen,
  MesaScreen,
  OfertaDuenoScreen,
  OfertaQrScreen,
  PaseScreen,
  PedidoScreen,
  PedidosScreen,
  PlanesScreen,
  RestaurantesScreen,
  ScanOkScreen,
  VenderPlanScreen,
} from "./screens";

export type FlowStatus = "hoy" | "propuesto" | "disenado";

export const STATUS_LABEL: Record<FlowStatus, string> = {
  hoy: "En la app hoy",
  propuesto: "Propuesto",
  disenado: "Diseñado",
};

export interface Signal {
  /** Texto corto sobre el puente entre celulares. */
  label: string;
  dir: "toDueno" | "toComensal" | "both";
  /** `off` = sin internet: línea cortada y sin punto viajando. */
  tone?: "ok" | "off";
}

export interface FlowStep {
  title: string;
  caption: string;
  /** Celular que actúa en este paso (el otro se atenúa). */
  focus: Role;
  comensal: ReactNode;
  dueno: ReactNode;
  signal?: Signal;
}

export interface FlowNote {
  heading: string;
  tone: "ok" | "wait" | "info";
  items: string[];
}

export interface Flow {
  id: string;
  title: string;
  blurb: string;
  status: FlowStatus;
  icon: LucideIcon;
  steps: FlowStep[];
  notes?: FlowNote[];
}

export const FLOWS: Flow[] = [
  {
    id: "plan",
    title: "Vender un plan",
    blurb: "El dueño cobra el plan en caja y el comensal lo recibe al instante.",
    status: "hoy",
    icon: WalletCards,
    steps: [
      {
        title: "Toca Vender plan",
        caption: "Luis quiere el plan mensual y paga en el mostrador.",
        focus: "dueno",
        comensal: <PaseScreen v="sinplan" />,
        dueno: <CajaScreen tap="sell" />,
      },
      {
        title: "Comensal, plan y pago",
        caption: "Elige a Luis, el Plan mensual de $55,00 y Efectivo. Un toque en Activar.",
        focus: "dueno",
        comensal: <PaseScreen v="sinplan" />,
        dueno: <VenderPlanScreen v="elige" />,
      },
      {
        title: "Ya está en su celular",
        caption: "El pase aparece con su QR y 20 almuerzos. El dueño tiene 10 s para Deshacer.",
        focus: "comensal",
        comensal: <PaseScreen v="plan" left={20} />,
        dueno: <VenderPlanScreen v="ok" />,
        signal: { label: "Plan activo", dir: "toComensal" },
      },
    ],
  },
  {
    id: "qr",
    title: "Almorzar con el pase",
    blurb: "El comensal muestra su QR, el dueño lo escanea y el almuerzo se descuenta.",
    status: "hoy",
    icon: ScanLine,
    steps: [
      {
        title: "Muestra su pase",
        caption: "Carlos abre su pase: le quedan 14 almuerzos y su QR está listo.",
        focus: "comensal",
        comensal: <PaseScreen v="plan" />,
        dueno: <CajaScreen tap="scan" />,
      },
      {
        title: "El dueño escanea",
        caption: "Un solo botón en caja. Plan, preorden o mesa: se reconoce solo.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" />,
        dueno: <EscanerScreen />,
        signal: { label: "QR del pase", dir: "toDueno" },
      },
      {
        title: "Almuerzo registrado",
        caption: "Se descuenta 1 almuerzo, suma 1 sello y queda Deshacer por 10 segundos.",
        focus: "dueno",
        comensal: <PaseScreen v="validado" left={13} />,
        dueno: (
          <ScanOkScreen
            name="Carlos Mejía"
            title="Almuerzo registrado"
            detail="Le quedan 13 almuerzos"
          />
        ),
        signal: { label: "Le quedan 13", dir: "both" },
      },
      {
        title: "Opina en un toque",
        caption:
          "Después de comer, Carlos ve “¿Qué tal hoy?” en su pase. El dueño lo lee en Opiniones.",
        focus: "comensal",
        comensal: <PaseScreen v="calificar" left={13} />,
        dueno: <CajaScreen />,
      },
    ],
  },
  {
    id: "preorden",
    title: "Preordenar y retirar",
    blurb: "Reserva el almuerzo antes de llegar. Se paga en caja, solo en efectivo.",
    status: "hoy",
    icon: CalendarCheck,
    steps: [
      {
        title: "Mira el menú de hoy",
        caption: "Carlos abre La Cuchara: sopa del día y segundos a elegir.",
        focus: "comensal",
        comensal: <FichaScreen v="menu" />,
        dueno: <CajaScreen />,
      },
      {
        title: "Elige sopa y segundo",
        caption: "Dos toques. El aviso es claro: pagas en caja, solo efectivo.",
        focus: "comensal",
        comensal: <FichaScreen v="elige" />,
        dueno: <CajaScreen />,
      },
      {
        title: "QR por 30 minutos",
        caption: "Le sale la orden #42 con cuenta regresiva. En caja aparece “1 en camino”.",
        focus: "dueno",
        comensal: <PedidoScreen v="qr" />,
        dueno: <CajaScreen enCamino={1} tap="enCamino" />,
        signal: { label: "1 en camino", dir: "toDueno" },
      },
      {
        title: "Ve el pedido",
        caption: "En Pedidos en camino ya sabe qué servir. Carlos llega y muestra su QR.",
        focus: "dueno",
        comensal: <PedidoScreen v="qr" />,
        dueno: <PedidosScreen v="lista" />,
        signal: { label: "QR #42", dir: "toDueno" },
      },
      {
        title: "Cobra en efectivo",
        caption: "$3,00 en efectivo y entrega. No hay otro método para preórdenes.",
        focus: "dueno",
        comensal: <PedidoScreen v="qr" />,
        dueno: <PedidosScreen v="cobrar" />,
      },
      {
        title: "Entregado",
        caption: "El pedido sale de “en camino” y el cobro entra al cuadre de caja.",
        focus: "comensal",
        comensal: <PedidoScreen v="entregado" />,
        dueno: <PedidosScreen v="entregado" />,
        signal: { label: "Entregado", dir: "toComensal" },
      },
    ],
    notes: [
      {
        heading: "Regla de producto",
        tone: "info",
        items: [
          "La preorden es una reserva sin pago en línea: se cobra al retirar, solo en efectivo. Así no hay reembolsos si alguien no llega.",
          "Si expiran 3 órdenes en 7 días, el comensal queda limitado a 1 orden activa.",
          "Propuesto: pagarla por adelantado con De Una para quitar el cobro en caja (ver “Preorden pagada con De Una”).",
        ],
      },
    ],
  },
  {
    id: "mesa",
    title: "Mesa con amigos",
    blurb: "Un solo QR en caja valida el almuerzo de todos.",
    status: "hoy",
    icon: Users,
    steps: [
      {
        title: "Crea la mesa",
        caption: "Carlos fija las 13:00, elige “Cada quien lo suyo” e invita por WhatsApp.",
        focus: "comensal",
        comensal: <MesaScreen v="creada" />,
        dueno: <CajaScreen />,
      },
      {
        title: "La caja ya la espera",
        caption: "Arriba de la caja aparece la mesa #M1234 con 3 comensales a las 13:00.",
        focus: "dueno",
        comensal: <MesaScreen v="creada" />,
        dueno: <CajaScreen mesa tap="scan" />,
        signal: { label: "Mesa #M1234", dir: "toDueno" },
      },
      {
        title: "Un escaneo, tres almuerzos",
        caption: "Cada amigo con plan descuenta el suyo. Cero filas en hora pico.",
        focus: "dueno",
        comensal: <MesaScreen v="validada" />,
        dueno: (
          <ScanOkScreen
            name="Mesa #M1234"
            title="3 almuerzos registrados"
            detail="Cada quien lo suyo"
            undo="Mesa descontada"
          />
        ),
        signal: { label: "3 validados", dir: "both" },
      },
    ],
  },
  {
    id: "oferta",
    title: "Oferta flash",
    blurb: "El dueño publica una oferta gratis y paga el 7 % solo de lo que se valide.",
    status: "hoy",
    icon: Zap,
    steps: [
      {
        title: "Toca Oferta flash",
        caption: "Sobran almuerzos a la 13:00. Desde la caja, un toque.",
        focus: "dueno",
        comensal: <RestaurantesScreen v="lista" />,
        dueno: <CajaScreen tap="oferta" />,
      },
      {
        title: "Arma la oferta",
        caption: "Menú de hoy −10 %, 10 cupos, hasta las 14:00. Recibe $2,51 por venta.",
        focus: "dueno",
        comensal: <RestaurantesScreen v="lista" />,
        dueno: <OfertaDuenoScreen v="form" />,
      },
      {
        title: "Aparece cerca",
        caption: "Los comensales la ven en Ofertas hoy, dentro de Dónde comer.",
        focus: "comensal",
        comensal: <RestaurantesScreen v="oferta" />,
        dueno: <OfertaDuenoScreen v="activa" />,
        signal: { label: "Oferta visible", dir: "toComensal" },
      },
      {
        title: "Recibe su código",
        caption: "Un QR de la oferta, válido hasta la hora que fijó el dueño.",
        focus: "comensal",
        comensal: <OfertaQrScreen />,
        dueno: <CajaScreen tap="scan" />,
      },
      {
        title: "Se valida y se cobra",
        caption: "El dueño escanea. Bocadoo cobra $0,19 de comisión solo por esta venta.",
        focus: "dueno",
        comensal: <OfertaQrScreen />,
        dueno: (
          <ScanOkScreen
            name="Oferta validada"
            title="Menú de hoy · $2,70"
            detail="Recibes $2,51 · comisión $0,19"
            undo="Oferta registrada"
          />
        ),
        signal: { label: "Comisión $0,19", dir: "toDueno" },
      },
    ],
  },
  {
    id: "menu",
    title: "Menú del día",
    blurb: "El dueño publica lo de hoy y, cuando un plato se acaba, lo marca solo a ese.",
    status: "hoy",
    icon: Utensils,
    steps: [
      {
        title: "Arma el menú de hoy",
        caption: "Sus platos ya están guardados: elige las opciones de cada sección y publica.",
        focus: "dueno",
        comensal: <FichaScreen v="vacio" />,
        dueno: <MenuDiaScreen v="borrador" />,
      },
      {
        title: "Ya lo ven todos",
        caption: "Al publicar, el menú aparece en la ficha del local, listo para preordenar.",
        focus: "comensal",
        comensal: <FichaScreen v="publicado" />,
        dueno: <MenuDiaScreen v="publicado" />,
        signal: { label: "Menú publicado", dir: "toComensal" },
      },
      {
        title: "Se acabó el seco",
        caption: "A la 1 p. m. se termina el seco de pollo. El dueño toca solo ese plato.",
        focus: "dueno",
        comensal: <FichaScreen v="publicado" />,
        dueno: <MenuDiaScreen v="seAcaba" />,
      },
      {
        title: "Solo ese sale del menú",
        caption: "El comensal ve “Se acabó” y no lo puede elegir. El pollo a la plancha sigue.",
        focus: "comensal",
        comensal: <FichaScreen v="agotado" />,
        dueno: <MenuDiaScreen v="agotado" />,
        signal: { label: "Seco de pollo: se acabó", dir: "toComensal" },
      },
    ],
    notes: [
      {
        heading: "Cómo funciona “Se acabó”",
        tone: "info",
        items: [
          "Cada plato tiene su propio interruptor: Hay / Se acabó. Marcar uno no afecta a los otros de la misma sección.",
          "Se actualiza al instante en la ficha del local y en la caja, sin volver a publicar el menú.",
          "Al copiar el menú a otro día, todos los platos vuelven a “Hay”.",
        ],
      },
    ],
  },
  {
    id: "cierre",
    title: "Cierre de caja",
    blurb: "Al final del turno: efectivo, transferencias y comisión, todo cuadrado.",
    status: "hoy",
    icon: Receipt,
    steps: [
      {
        title: "Revisa el turno",
        caption: "34 almuerzos servidos. Efectivo, transferencias y la comisión de Bocadoo.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" left={13} />,
        dueno: <CierreScreen v="resumen" />,
      },
      {
        title: "Cierra y cuadra",
        caption: "Cuenta el cajón y toca Cerrar turno. Si falta o sobra dinero, la app lo dice.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" left={13} />,
        dueno: <CierreScreen v="cerrado" />,
      },
    ],
  },
  {
    id: "deuna",
    title: "Plan con De Una",
    blurb: "El comensal compra el plan desde su celular y paga con De Una.",
    status: "propuesto",
    icon: Zap,
    steps: [
      {
        title: "Elige su plan",
        caption: "Carlos ve los planes de La Cuchara y toca Pedir plan en el mensual.",
        focus: "comensal",
        comensal: <PlanesScreen v="lista" />,
        dueno: <CajaScreen />,
      },
      {
        title: "Elige De Una",
        caption: "Efectivo en caja sigue disponible como opción.",
        focus: "comensal",
        comensal: <PlanesScreen v="sheet" />,
        dueno: <CajaScreen />,
      },
      {
        title: "Confirma en De Una",
        caption: "Se abre su app De Una con el monto exacto y la referencia de Bocadoo.",
        focus: "comensal",
        comensal: <DeUnaScreen v="confirmar" amount="$55,00" tap />,
        dueno: <CajaScreen />,
        signal: { label: "Abre De Una", dir: "toComensal" },
      },
      {
        title: "Pago recibido",
        caption: "Bocadoo recibe la confirmación y activa el plan solo. El dueño no toca nada.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" left={20} />,
        dueno: <CajaScreen toast="Carlos Mejía pagó $55,00 · De Una" />,
        signal: { label: "$55,00 confirmados", dir: "toDueno" },
      },
      {
        title: "Cuadra solo",
        caption: "En el cierre, De Una aparece en su propia línea, separada del efectivo.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" left={20} />,
        dueno: <CierreScreen v="resumen" deUna />,
      },
    ],
    notes: [
      {
        heading: "Por definir antes de construirlo",
        tone: "wait",
        items: [
          "Cómo llega la confirmación del pago: integración con De Una o un aviso manual de “Recibí” del dueño. Hay que validarlo con De Una.",
          "Quién asume la comisión del medio de pago: el restaurante o el comensal.",
          "Reembolsos: se registran como un movimiento aparte, nunca se borra el pago original.",
        ],
      },
      {
        heading: "Reglas ya decididas",
        tone: "ok",
        items: [
          "Efectivo en caja siempre queda como opción.",
          "Para preórdenes con De Una, ver el flujo “Preorden pagada con De Una”.",
        ],
      },
    ],
  },
  {
    id: "deuna-preorden",
    title: "Preorden pagada con De Una",
    blurb: "El comensal paga la preorden desde su celular y en caja solo se entrega.",
    status: "propuesto",
    icon: CalendarCheck,
    steps: [
      {
        title: "Elige y paga con De Una",
        caption: "Carlos elige locro y seco, y paga con De Una. Efectivo sigue como opción.",
        focus: "comensal",
        comensal: <FichaScreen v="pago" />,
        dueno: <CajaScreen />,
      },
      {
        title: "Confirma en De Una",
        caption:
          "Se abre su app De Una con $3,00 y la referencia de la orden #42. Un toque y listo.",
        focus: "comensal",
        comensal: <DeUnaScreen v="confirmar" amount="$3,00" reference="BCD-ORD-42" tap />,
        dueno: <CajaScreen />,
        signal: { label: "Abre De Una", dir: "toComensal" },
      },
      {
        title: "Llega ya pagada",
        caption: "Bocadoo recibe la confirmación: orden “Pagada” y en caja, “1 en camino”.",
        focus: "dueno",
        comensal: <PedidoScreen v="qr" paid />,
        dueno: <CajaScreen enCamino={1} tap="enCamino" toast="Orden #42 pagada · $3,00 · De Una" />,
        signal: { label: "$3,00 confirmados", dir: "toDueno" },
      },
      {
        title: "Solo entrega",
        caption:
          "Carlos llega y muestra el QR. Sin contar billetes ni dar vuelto: el dueño toca Entregar.",
        focus: "dueno",
        comensal: <PedidoScreen v="qr" paid />,
        dueno: <PedidosScreen v="lista" paid />,
        signal: { label: "QR #42", dir: "toDueno" },
      },
      {
        title: "Entregado",
        caption: "En el cierre, el pago aparece en la línea De Una, separado del efectivo.",
        focus: "comensal",
        comensal: <PedidoScreen v="entregado" paid />,
        dueno: <PedidosScreen v="entregado" paid />,
        signal: { label: "Entregado", dir: "toComensal" },
      },
    ],
    notes: [
      {
        heading: "Por qué",
        tone: "ok",
        items: [
          "En hora pico, cobrar en efectivo cada preorden es un cuello de botella: contar, dar vuelto y buscar cambio.",
          "Con De Una la preorden llega pagada y la caja solo escanea y entrega.",
          "De Una funciona como Yape en Perú o Nequi en Colombia: el comensal paga con su celular desde su cuenta.",
        ],
      },
      {
        heading: "Por definir antes de construirlo",
        tone: "wait",
        items: [
          "Si no llega en 30 minutos: reembolso automático o saldo a favor en el local. Se registra como movimiento aparte, nunca se borra el pago.",
          "Si se acaba el plato después de pagar: el dueño ofrece otro segundo o se devuelve.",
          "Cómo llega la confirmación del pago: integración con De Una o aviso manual de “Recibí”.",
        ],
      },
    ],
  },
  {
    id: "deuna-suelto",
    title: "Almuerzo suelto con De Una",
    blurb: "Un cliente sin plan paga $3,00 escaneando un QR en caja.",
    status: "propuesto",
    icon: ShoppingBag,
    steps: [
      {
        title: "Toca Cobro suelto",
        caption: "Llega alguien sin plan. El dueño abre el cobro suelto.",
        focus: "dueno",
        comensal: <PaseScreen v="sinplan" />,
        dueno: <CajaScreen tap="single" />,
      },
      {
        title: "Elige De Una",
        caption: "Agrega el almuerzo al ticket y elige De Una como método.",
        focus: "dueno",
        comensal: <PaseScreen v="sinplan" />,
        dueno: <CobroSueltoScreen v="ticket" />,
      },
      {
        title: "El cliente escanea",
        caption: "La caja muestra el QR de cobro y el cliente lo paga desde su app De Una.",
        focus: "comensal",
        comensal: <DeUnaScreen v="confirmar" amount="$3,00" tap />,
        dueno: <CobroSueltoScreen v="qr" />,
        signal: { label: "QR de cobro", dir: "toComensal" },
      },
      {
        title: "Pagado en segundos",
        caption: "Llega la confirmación y el dueño entrega el almuerzo.",
        focus: "dueno",
        comensal: <DeUnaScreen v="ok" amount="$3,00" />,
        dueno: <CobroSueltoScreen v="pagado" />,
        signal: { label: "$3,00 confirmados", dir: "toDueno" },
      },
    ],
    notes: [
      {
        heading: "Por definir antes de construirlo",
        tone: "wait",
        items: [
          "El QR de cobro lo emite De Una, no Bocadoo. Falta confirmar si se puede asociar al ticket de Bocadoo.",
          "Sin internet este cobro no funciona: ahí queda solo efectivo (ver Modo offline).",
        ],
      },
    ],
  },
  {
    id: "offline",
    title: "Modo offline",
    blurb: "Se cae el internet en hora pico y la caja sigue cobrando.",
    status: "disenado",
    icon: WifiOff,
    steps: [
      {
        title: "Se cae el internet",
        caption:
          "La caja avisa y sigue funcionando. El QR del comensal ya está guardado en su celular.",
        focus: "dueno",
        comensal: <PaseScreen v="offline" />,
        dueno: <CajaScreen offline deUnaOff />,
        signal: { label: "Sin internet", dir: "both", tone: "off" },
      },
      {
        title: "Escanea igual",
        caption:
          "El pase se valida en el celular del dueño, se descuenta y queda guardado en cola.",
        focus: "dueno",
        comensal: <PaseScreen v="offline" left={13} />,
        dueno: (
          <ScanOkScreen
            offline
            name="Carlos Mejía"
            title="Almuerzo registrado"
            detail="Le quedan 13 almuerzos"
          />
        ),
        signal: { label: "Guardado en el celular", dir: "toDueno", tone: "off" },
      },
      {
        title: "Todo queda en cola",
        caption:
          "Pases y cobros en efectivo se acumulan. De Una y transferencia esperan al internet.",
        focus: "dueno",
        comensal: <PaseScreen v="offline" left={13} />,
        dueno: <ColaScreen v="cola" />,
        signal: { label: "3 por enviar", dir: "toDueno", tone: "off" },
      },
      {
        title: "Vuelve y se envía",
        caption: "Al reconectar, la cola sube en orden, de la más antigua a la más nueva.",
        focus: "dueno",
        comensal: <PaseScreen v="plan" left={13} />,
        dueno: <ColaScreen v="sync" />,
        signal: { label: "Enviando 2 de 3", dir: "toComensal" },
      },
      {
        title: "Todo al día",
        caption:
          "El comensal ve su saldo actualizado y el cierre de caja cuadra igual que siempre.",
        focus: "comensal",
        comensal: <PaseScreen v="validado" left={13} />,
        dueno: <ColaScreen v="listo" />,
        signal: { label: "Le quedan 13", dir: "toComensal" },
      },
    ],
    notes: [
      {
        heading: "Funciona sin internet",
        tone: "ok",
        items: [
          "Escanear el pase del comensal (el QR ya está en su celular).",
          "Cobrar en efectivo: almuerzo suelto y preórdenes.",
          "Vender un plan en efectivo y Deshacer.",
        ],
      },
      {
        heading: "Espera a que vuelva el internet",
        tone: "wait",
        items: [
          "Pagos con De Una y transferencias: el botón avisa “necesita internet”.",
          "Publicar menú u ofertas: se publican al conectar.",
          "Calificaciones del comensal: se envían al conectar.",
        ],
      },
      {
        heading: "Al volver, reglas simples",
        tone: "info",
        items: [
          "La cola se envía en el orden en que se hizo, nada se pierde.",
          "Si un mismo pase se escaneó dos veces sin internet, el segundo queda marcado en el cierre para revisarlo.",
          "El cierre de caja avisa si aún quedan cosas por enviar.",
        ],
      },
      {
        heading: "Estado real hoy",
        tone: "wait",
        items: [
          "El prototipo guarda todo en el propio celular y ya muestra los avisos de “Sin conexión”.",
          "Falta construir la cola real y el envío al reconectar. Esta animación es el comportamiento objetivo.",
        ],
      },
    ],
  },
];
