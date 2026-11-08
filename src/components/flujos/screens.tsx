/*
 * Maquetas de /flujos copiadas de las pantallas reales de la app
 * (pase, caja, hojas inferiores, pedidos, cierre). Datos de ejemplo fijos.
 */
import {
  ArrowRight,
  BarChart3,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  CloudUpload,
  Landmark,
  MapPin,
  Percent,
  QrCode,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Utensils,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Btn, Chip, Header, QrBox, Screen, SectionLabel, Sheet, Tap, Toast } from "./kit";

const LOCAL = "La Cuchara de San Blas";

/* ───────────────────────── COMENSAL ───────────────────────── */

function PaseHero({ left, mesa = false }: { left: number; mesa?: boolean }) {
  return (
    <header className="rounded-b-[40px] bg-hero-gradient px-5 pb-[72px] pt-4 text-image-foreground">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-image-foreground/20">
            <Utensils className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-wider text-image-foreground/80">
              Tu almuerzo de hoy
            </p>
            <p className="truncate text-[16px] font-black leading-tight">La Cuchara</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-container px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-[13px] font-black text-success">Pase activo</span>
        </span>
      </div>
      <p className="mt-4 text-center text-[22px] font-black leading-tight">{LOCAL}</p>
      <div className="mt-2 flex items-baseline justify-center gap-2">
        <span className="text-[56px] font-extrabold leading-none tracking-tight">{left}</span>
        <span className="text-[19px] font-bold">almuerzos</span>
      </div>
      <p className="mt-1 text-center text-[13px] font-semibold text-image-foreground/85">
        {mesa ? "3 en la mesa · 13:00" : "Vencen el 1 dic"}
      </p>
    </header>
  );
}

export function PaseScreen({
  v,
  left = 14,
}: {
  v: "sinplan" | "plan" | "offline" | "validado" | "calificar";
  left?: number;
}) {
  if (v === "sinplan") {
    return (
      <Screen role="comensal" tab="Pase">
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-container text-primary">
            <Utensils className="h-8 w-8" aria-hidden />
          </span>
          <p className="text-[24px] font-black">Sin planes activos</p>
          <p className="mt-2 text-[15px] font-semibold text-muted-foreground">
            Encuentra un restaurante cercano y adquiere tu primer paquete.
          </p>
          <Btn className="mt-8 w-full">Explorar restaurantes</Btn>
        </div>
      </Screen>
    );
  }

  if (v === "offline") {
    return (
      <Screen role="comensal" tab="Pase" offline>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-background py-1.5 text-[13px] font-bold text-muted-foreground">
            <WifiOff className="h-4 w-4" aria-hidden /> Sin conexión · Código guardado
          </div>
          <div className="rounded-[32px] bg-hero-gradient p-6 text-center text-image-foreground shadow-lg">
            <p className="text-[22px] font-black leading-tight">{LOCAL}</p>
            <div className="mx-auto my-5 w-fit">
              <QrBox value="BCD-CARLOS-0412" size={150} />
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[48px] font-extrabold leading-none">{left}</span>
              <span className="text-[17px] font-bold">almuerzos</span>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-image-foreground/85">
              Vencen el 1 dic
            </p>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen role="comensal" tab="Pase">
      <PaseHero left={left} />
      <div className="relative -mt-12 space-y-4 px-4">
        <div className="flex flex-col items-center rounded-[32px] border border-border bg-surface p-5 text-center shadow-lg">
          <QrBox value="BCD-CARLOS-0412" size={150} />
          <p className="mt-3 text-[13px] font-semibold text-muted-foreground">
            Muestra este código en caja.
          </p>
        </div>
        {v === "calificar" ? (
          <div className="flj-in relative rounded-[28px] border border-border bg-primary-container/60 p-4">
            <p className="text-[19px] font-black">¿Qué tal hoy?</p>
            <div className="mt-3 flex gap-2">
              {["Rico", "Rápido", "Porción"].map((t, i) => (
                <span
                  key={t}
                  className={cn(
                    "relative rounded-full px-5 py-2.5 text-[15px] font-extrabold",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-surface text-primary",
                  )}
                >
                  {t}
                  {i === 0 && <Tap />}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13px] font-semibold text-muted-foreground">
              Un toque. El dueño lo lee en Opiniones.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <span className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-primary-container/50 text-[15px] font-extrabold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Mis sellos
              </span>
              <span className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-primary-container/50 text-[15px] font-extrabold text-foreground">
                <Users className="h-4 w-4 text-primary" aria-hidden /> Mi mesa
              </span>
            </div>
            <SectionLabel>Últimos movimientos</SectionLabel>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-container text-primary">
                <Utensils className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[15px] font-extrabold">La Cuchara</p>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  {v === "validado" ? "Almuerzo consumido · ahora" : "Almuerzo consumido · ayer"}
                </p>
              </div>
              <span className="text-[15px] font-black">−1</span>
            </div>
          </>
        )}
      </div>
      {v === "validado" && <Toast icon={CheckCircle2}>Almuerzo registrado · +1 sello</Toast>}
    </Screen>
  );
}

interface PlanRow {
  nombre: string;
  detalle: string;
  precio: string;
  cu: string;
  ahorro?: string;
}

const PLANES: PlanRow[] = [
  {
    nombre: "Plan semanal",
    detalle: "5 almuerzos · 7 días hábiles",
    precio: "$15,00",
    cu: "$3,00 c/u",
  },
  {
    nombre: "Plan quincenal",
    detalle: "10 almuerzos · 18 días hábiles",
    precio: "$28,00",
    cu: "$2,80 c/u",
    ahorro: "Ahorras $2,00",
  },
  {
    nombre: "Plan mensual",
    detalle: "20 almuerzos · 35 días hábiles",
    precio: "$55,00",
    cu: "$2,75 c/u",
    ahorro: "Ahorras $5,00",
  },
];

export function PlanesScreen({ v }: { v: "lista" | "sheet" }) {
  return (
    <Screen role="comensal" tab="Planes">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[24px] font-black leading-tight">Planes de almuerzo</p>
        <p className="text-[13px] font-semibold text-muted-foreground">
          Ahorra en cada comida y olvídate del efectivo diario
        </p>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2 overflow-hidden">
          <Chip tone="brand" className="px-4 py-2.5 text-[15px]">
            La Cuchara
          </Chip>
          <Chip className="px-4 py-2.5 text-[15px]">Verde Limón</Chip>
          <Chip className="px-4 py-2.5 text-[15px]">El Rincón</Chip>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-extrabold">Planes en La Cuchara</p>
          <Chip tone="ok">Suelto: $3,00</Chip>
        </div>
        {PLANES.map((p, i) => (
          <div key={p.nombre} className="rounded-[24px] border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-[18px] font-black">
                  {p.nombre}
                  {p.ahorro && <Chip tone="ok">{p.ahorro}</Chip>}
                </p>
                <p className="text-[13px] font-semibold text-muted-foreground">{p.detalle}</p>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-black text-primary">{p.precio}</p>
                <p className="text-[13px] font-bold text-muted-foreground">{p.cu}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden /> Con QR en caja
              </span>
              <span className="relative flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-[15px] font-extrabold text-primary-foreground">
                Pedir plan <ArrowRight className="h-4 w-4" aria-hidden />
                {v === "lista" && i === 2 && <Tap />}
              </span>
            </div>
          </div>
        ))}
      </div>
      {v === "sheet" && (
        <Sheet title="¿Cómo pagas?">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-primary-container p-3">
            <span className="text-[15px] font-extrabold">Plan mensual · 20 almuerzos</span>
            <span className="text-[17px] font-black text-primary">$55,00</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-primary-container/60 p-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1 leading-tight">
                <p className="text-[16px] font-black">De Una</p>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  Se activa al instante
                </p>
              </div>
              <Check className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary-container text-muted-foreground">
                <Banknote className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1 leading-tight">
                <p className="text-[16px] font-black">Efectivo en caja</p>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  El dueño lo activa al cobrar
                </p>
              </div>
            </div>
          </div>
          <Btn tap className="mt-4" icon={Zap}>
            Pagar $55,00 con De Una
          </Btn>
        </Sheet>
      )}
    </Screen>
  );
}

/** App externa De Una: dibujada con la paleta de la página, sin imitar su marca. */
export function DeUnaScreen({
  v,
  amount,
  tap = false,
  reference = "BCD-PAGO-0412",
}: {
  v: "confirmar" | "ok";
  amount: string;
  tap?: boolean;
  reference?: string;
}) {
  return (
    <div className="flj-in flex h-full flex-col bg-background px-5 pb-8 pt-14 text-foreground">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[22px] font-black">
          <Zap className="h-6 w-6 text-primary" aria-hidden /> De Una
        </span>
        <Chip tone="muted">Otra app</Chip>
      </div>
      {v === "confirmar" ? (
        <>
          <div className="mt-8 rounded-[28px] border border-border bg-surface p-6 text-center">
            <p className="text-[15px] font-bold text-muted-foreground">Vas a pagar a</p>
            <p className="text-[20px] font-black">{LOCAL}</p>
            <p className="my-5 text-[56px] font-black leading-none tracking-tight">{amount}</p>
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-background py-2.5 text-[13px] font-bold text-muted-foreground">
              <Landmark className="h-4 w-4" aria-hidden /> Cuenta de ahorros •••• 4821
            </div>
          </div>
          <p className="mt-3 text-center text-[13px] font-semibold text-muted-foreground">
            Referencia Bocadoo · {reference}
          </p>
          <div className="mt-auto">
            <Btn tap={tap}>Confirmar pago</Btn>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="h-12 w-12" aria-hidden />
          </span>
          <p className="text-[26px] font-black">Pago enviado</p>
          <p className="text-[15px] font-semibold text-muted-foreground">
            {amount} a {LOCAL}
          </p>
          <p className="mt-4 text-[15px] font-bold text-primary">Volviendo a Bocadoo…</p>
        </div>
      )}
    </div>
  );
}

function DondeComerBase({ oferta, children }: { oferta: boolean; children?: ReactNode }) {
  return (
    <Screen role="comensal" tab="Restaurantes">
      <div className="space-y-3 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[24px] font-black">Dónde comer</p>
          <Chip icon={MapPin}>Lugares cercanos</Chip>
        </div>
        <div className="flex h-12 items-center gap-2 rounded-full border border-border bg-background px-4 text-[15px] font-semibold text-muted-foreground">
          <Search className="h-5 w-5" aria-hidden /> Buscar restaurante o plato
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["Cerca", "Con plan", "Libre", "Ofertas"].map((f) => (
            <span
              key={f}
              className="rounded-full border border-border py-2 text-center text-[13px] font-bold text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-4">
        {oferta && (
          <>
            <p className="flex items-center gap-1.5 text-[17px] font-black">
              <Zap className="h-4 w-4 text-primary" aria-hidden /> Ofertas hoy
            </p>
            <div className="flj-in flex items-center gap-3 rounded-[24px] border border-primary bg-primary-container/60 p-3">
              <img
                src="/dishes/locro-papa.jpg"
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[15px] font-black">La Cuchara</p>
                <p className="text-[13px] font-bold text-primary">−10 % en el menú · 10 cupos</p>
              </div>
              <span className="relative rounded-full bg-primary px-4 py-2 text-[15px] font-extrabold text-primary-foreground">
                Ver
                <Tap />
              </span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between">
          <p className="text-[17px] font-black">Cerca de ti</p>
          <p className="text-[13px] font-semibold text-muted-foreground">5 locales</p>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-border bg-surface">
          <div className="relative h-32">
            <img src="/dishes/locro-papa.jpg" alt="" className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3">
              <Chip tone="ok" icon={CheckCircle2}>
                Libre
              </Chip>
            </span>
            <span className="absolute bottom-2 left-3 text-[19px] font-black text-image-foreground">
              {LOCAL}
            </span>
          </div>
          <p className="truncate px-4 py-3 text-[15px] font-bold">
            Hoy: Locro de papa · Seco de pollo con maduro
          </p>
        </div>
      </div>
      {children}
    </Screen>
  );
}

export function RestaurantesScreen({ v }: { v: "lista" | "oferta" }) {
  return <DondeComerBase oferta={v === "oferta"} />;
}

export function OfertaQrScreen() {
  return (
    <DondeComerBase oferta={false}>
      <Sheet title="Tu oferta">
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-border bg-primary-container/50 p-5">
          <Chip tone="brand" icon={Zap}>
            Oferta flash · −10 %
          </Chip>
          <p className="text-[19px] font-black">{LOCAL}</p>
          <QrBox value="BCD-OFER-0412" size={150} />
          <p className="text-[15px] font-extrabold">Menú de hoy · $2,70</p>
          <p className="text-[13px] font-semibold text-muted-foreground">Válida hasta las 14:00</p>
        </div>
      </Sheet>
    </DondeComerBase>
  );
}

function OptionRow({
  name,
  price,
  img,
  selected = false,
  soldOut = false,
  tag,
}: {
  name: string;
  price?: string;
  img?: string;
  selected?: boolean;
  soldOut?: boolean;
  tag?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-2",
        selected ? "border-primary bg-primary-container/60" : "border-border bg-surface",
      )}
    >
      {img && (
        <img
          src={img}
          alt=""
          className={cn("h-10 w-10 rounded-full object-cover", soldOut && "opacity-50 grayscale")}
        />
      )}
      <div className={cn("min-w-0 flex-1 leading-tight", soldOut && "opacity-60")}>
        <p className={cn("truncate text-[15px] font-bold", soldOut && "line-through")}>{name}</p>
        {price && <p className="text-[13px] font-bold text-primary">{price}</p>}
      </div>
      {soldOut && (
        <Chip tone="warn" className="flj-in">
          Se acabó
        </Chip>
      )}
      {tag && <Chip tone="ok">{tag}</Chip>}
      {selected && <Check className="h-5 w-5 text-primary" aria-hidden />}
    </div>
  );
}

export function FichaScreen({
  v,
}: {
  v: "vacio" | "menu" | "elige" | "publicado" | "agotado" | "pago";
}) {
  const picked = v === "elige" || v === "pago";
  return (
    <DondeComerBase oferta={false}>
      <Sheet title={LOCAL}>
        <div className="space-y-2.5">
          <div className="overflow-hidden rounded-[24px] border border-border">
            <div className="relative h-24">
              <img src="/dishes/locro-papa.jpg" alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-3">
                <Chip tone="ok">Fluido · Llegas y te sientas</Chip>
              </span>
            </div>
            <p className="bg-primary-container/50 px-4 py-2 text-[13px] font-bold">
              Desde $2,75 con plan · $3,00 suelto
            </p>
          </div>
          {v === "vacio" ? (
            <div className="rounded-[24px] border border-dashed border-border px-4 py-10 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-[17px] font-black">Aún sin menú de hoy</p>
              <p className="text-[13px] font-semibold text-muted-foreground">
                Vuelve en unos minutos.
              </p>
            </div>
          ) : (
            <>
              <SectionLabel>Sopa del día</SectionLabel>
              <OptionRow name="Locro de papa con queso" selected={picked} />
              <SectionLabel>Segundo a elegir</SectionLabel>
              <OptionRow name="Pollo a la plancha" price="$3,00" img="/dishes/pollo-plancha.jpg" />
              <OptionRow
                name="Seco de pollo con maduro"
                price="$3,00"
                img="/dishes/pollo-plancha.jpg"
                selected={picked}
                soldOut={v === "agotado"}
              />
              <OptionRow
                name="Bowl de quinoa"
                price="$3,25"
                img="/dishes/bowl-quinoa.jpg"
                tag="Veggie"
              />
              {v === "pago" ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-primary bg-primary-container/60 py-2 text-[15px] font-black">
                      <Zap className="h-4 w-4 text-primary" aria-hidden /> De Una
                    </span>
                    <span className="flex items-center justify-center gap-1.5 rounded-2xl border border-border py-2 text-[15px] font-bold text-muted-foreground">
                      <Banknote className="h-4 w-4" aria-hidden /> Efectivo
                    </span>
                  </div>
                  <Btn tap>Pagar $3,00 con De Una</Btn>
                </>
              ) : v === "elige" ? (
                <>
                  <Btn tap className="mt-1">
                    Preordenar · $3,00
                  </Btn>
                  <p className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-muted-foreground">
                    <Banknote className="h-4 w-4" aria-hidden /> Pagas en caja · Solo efectivo
                  </p>
                </>
              ) : v === "agotado" ? (
                <p className="rounded-2xl bg-background px-3 py-2 text-center text-[13px] font-bold text-muted-foreground">
                  El seco de pollo se acabó. Los demás platos siguen disponibles.
                </p>
              ) : (
                <Btn
                  tap={v === "menu"}
                  variant={v === "menu" ? "primary" : "soft"}
                  className="mt-1"
                >
                  {v === "publicado" ? "Menú recién publicado" : "Preordenar almuerzo"}
                </Btn>
              )}
            </>
          )}
        </div>
      </Sheet>
    </DondeComerBase>
  );
}

export function PedidoScreen({
  v,
  paid = false,
}: {
  v: "qr" | "entregado";
  /** Propuesta: preorden ya pagada con De Una (en caja solo se entrega). */
  paid?: boolean;
}) {
  return (
    <DondeComerBase oferta={false}>
      <Sheet title="Tu pedido">
        {v === "qr" ? (
          <div className="space-y-3">
            <div className="rounded-[24px] border border-border bg-primary-container/50 p-4">
              <div className="flex items-center justify-between">
                <Chip tone="brand">Orden #42</Chip>
                {paid ? (
                  <Chip tone="ok" icon={Check}>
                    Pagado
                  </Chip>
                ) : (
                  <Chip tone="muted" icon={Clock}>
                    Vence en 29:41
                  </Chip>
                )}
              </div>
              <p className="mt-2 text-[17px] font-black">{LOCAL}</p>
              <p className="text-[13px] font-semibold">
                <span className="font-black text-primary">Sopa:</span> Locro de papa con queso
              </p>
              <p className="text-[13px] font-semibold">
                <span className="font-black text-primary">Segundo:</span> Seco de pollo con maduro
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-[24px] border border-border p-4">
              <p className="text-[13px] font-black uppercase tracking-wider text-primary">
                Muestra este QR en caja al llegar
              </p>
              <QrBox value="BCD-ORD-42" size={130} />
              {paid ? (
                <div className="flex w-full items-center justify-between rounded-2xl bg-success-container px-4 py-2.5 text-success">
                  <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
                    <Zap className="h-4 w-4" aria-hidden /> Pagado con De Una
                  </span>
                  <span className="text-[17px] font-black">$3,00</span>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between rounded-2xl bg-secondary-container px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
                    <Banknote className="h-4 w-4" aria-hidden /> Pagas en caja · Solo efectivo
                  </span>
                  <span className="text-[17px] font-black">$3,00</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-10 w-10" aria-hidden />
            </span>
            <p className="text-[24px] font-black">Entregado</p>
            <p className="text-[15px] font-semibold text-muted-foreground">
              Buen provecho. Pagaste $3,00 {paid ? "con De Una" : "en efectivo"}.
            </p>
          </div>
        )}
      </Sheet>
    </DondeComerBase>
  );
}

export function MesaScreen({ v }: { v: "creada" | "validada" }) {
  return (
    <Screen role="comensal" tab="Pase">
      <PaseHero left={v === "validada" ? 13 : 14} mesa />
      <Sheet title="Mesa con amigos">
        <div className="space-y-3">
          <SectionLabel>Hora de encuentro</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {["12:30", "13:00", "13:30", "14:00"].map((h) => (
              <span
                key={h}
                className={cn(
                  "rounded-full py-2.5 text-center text-[15px] font-extrabold",
                  h === "13:00" ? "bg-primary text-primary-foreground" : "border border-border",
                )}
              >
                {h}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 rounded-[24px] border border-border bg-primary-container/50 p-4">
            <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-primary">
              <QrCode className="h-4 w-4" aria-hidden /> QR de la mesa #M1234
            </p>
            <QrBox value="BCD-MESA-1234" size={120} />
            <p className="text-[13px] font-bold">
              {v === "validada" ? "3 almuerzos validados" : "3 comensales"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border-2 border-primary bg-primary-container/60 p-3 leading-tight">
              <p className="text-[15px] font-black">Cada quien lo suyo</p>
              <p className="text-[13px] font-semibold text-muted-foreground">Cada plan descuenta</p>
            </div>
            <div className="rounded-2xl border border-border p-3 leading-tight">
              <p className="text-[15px] font-black">Yo invito</p>
              <p className="text-[13px] font-semibold text-muted-foreground">Sale de mi plan</p>
            </div>
          </div>
          <Btn tap={v === "creada"} variant={v === "creada" ? "primary" : "soft"}>
            {v === "creada" ? "Invitar por WhatsApp" : "Mesa validada"}
          </Btn>
        </div>
      </Sheet>
    </Screen>
  );
}

/* ───────────────────────── DUEÑO ───────────────────────── */

type CajaTap = "scan" | "sell" | "single" | "oferta" | "cuadre" | "enCamino";

export function CajaScreen({
  tap,
  offline = false,
  enCamino = 0,
  mesa = false,
  pending = 0,
  deUnaOff = false,
  toast,
  toastAction,
  children,
}: {
  tap?: CajaTap;
  offline?: boolean;
  enCamino?: number;
  mesa?: boolean;
  pending?: number;
  deUnaOff?: boolean;
  toast?: string;
  toastAction?: string;
  children?: ReactNode;
}) {
  return (
    <Screen role="dueno" tab="Caja" offline={offline}>
      {mesa && (
        <div className="flj-in mx-4 mt-2 flex items-center justify-between rounded-full border border-primary bg-primary-container px-4 py-2.5">
          <span className="text-[15px] font-black">Mesa #M1234 · 3 comensales · 13:00</span>
          <span className="text-[13px] font-extrabold text-primary">Cobrar</span>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-[24px] font-black">Caja</p>
          <Chip tone="ok">Libre</Chip>
        </div>
        {pending > 0 ? (
          <Chip tone="warn" icon={CloudUpload}>
            {pending} por enviar
          </Chip>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-container px-3.5 py-1.5 text-[13px] font-bold text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Marcar lleno
          </span>
        )}
      </div>
      <div className="relative flex items-center justify-between border-b border-border bg-primary-container px-4 py-2.5">
        <span className="flex items-center gap-2 text-[15px] font-bold text-primary">
          <Clock className="h-4 w-4" aria-hidden /> {enCamino} en camino
        </span>
        <span className="relative rounded-full bg-primary px-3 py-0.5 text-[13px] font-extrabold text-primary-foreground">
          Ver
          {tap === "enCamino" && <Tap />}
        </span>
      </div>
      <div className="space-y-3 p-4">
        {offline && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-danger-container py-1.5 text-[13px] font-bold text-on-danger-container">
            <WifiOff className="h-4 w-4" aria-hidden /> Sin conexión · Se guarda en este celular
          </div>
        )}
        <div className="relative flex min-h-[180px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-primary bg-background p-5">
          <span className="grid h-[72px] w-[72px] place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <QrCode className="h-10 w-10" aria-hidden />
          </span>
          <p className="mt-3 text-[19px] font-black">Escanear QR</p>
          <p className="text-[13px] font-semibold text-muted-foreground">
            Plan, preorden o mesa: se reconoce solo
          </p>
          {tap === "scan" && <Tap />}
        </div>
        <Btn icon={Receipt} tap={tap === "single"}>
          Cobro suelto (Almuerzos y Carta)
        </Btn>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["sell", Users, "Vender plan"],
              ["oferta", Zap, "Oferta flash"],
              ["cuadre", Receipt, "Cuadre caja"],
            ] as const
          ).map(([k, Icon, label]) => (
            <div
              key={k}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center",
                k === "oferta"
                  ? "border-primary-container bg-primary-container text-primary"
                  : "border-border bg-background",
              )}
            >
              <Icon className="h-4 w-4 text-primary" aria-hidden />
              <span className="text-[13px] font-bold leading-tight">{label}</span>
              {tap === k && <Tap />}
            </div>
          ))}
        </div>
        {deUnaOff ? (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-3 text-[13px] font-bold text-muted-foreground">
            <Zap className="h-4 w-4 shrink-0" aria-hidden /> De Una y transferencia necesitan
            internet. Efectivo sí.
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary-container p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-black">Panel de ventas</p>
                <p className="text-[13px] font-semibold text-muted-foreground">
                  $2.480,00 mes · 842 almuerzos
                </p>
              </div>
            </div>
            <span className="text-[13px] font-bold text-primary">Ver →</span>
          </div>
        )}
      </div>
      {toast && (
        <Toast icon={CheckCircle2} {...(toastAction ? { action: toastAction } : {})}>
          {toast}
        </Toast>
      )}
      {children}
    </Screen>
  );
}

export function EscanerScreen({ offline = false }: { offline?: boolean }) {
  return (
    <Screen role="dueno" tab="Caja" offline={offline}>
      <div className="relative h-full bg-footer-bg">
        <p className="pt-6 text-center text-[19px] font-black text-image-foreground">
          Apunta al código
        </p>
        <div className="absolute inset-x-12 top-24 aspect-square rounded-[32px] border-4 border-footer-accent">
          <div className="flj-scan-line absolute inset-x-4 h-1 rounded-full bg-footer-accent" />
        </div>
        <p className="absolute inset-x-0 bottom-8 text-center text-[15px] font-semibold text-image-foreground/80">
          Plan, preorden o mesa: se reconoce solo
        </p>
      </div>
    </Screen>
  );
}

/** Resultado del escaneo como en la app: tarjeta verde sobre la caja atenuada + Deshacer. */
export function ScanOkScreen({
  name,
  title,
  detail,
  offline = false,
  undo = "Almuerzo descontado",
}: {
  name: string;
  title: string;
  detail: string;
  offline?: boolean;
  undo?: string;
}) {
  return (
    <CajaScreen offline={offline} pending={offline ? 1 : 0}>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-scrim/40 p-4">
        <div className="flj-sheet w-full rounded-[32px] bg-surface p-4 shadow-lg">
          <div className="flex flex-col items-center gap-1 rounded-[24px] bg-success-container px-4 py-7 text-center text-success">
            <CheckCircle2 className="h-14 w-14" strokeWidth={2.2} aria-hidden />
            <p className="mt-2 text-[26px] font-black leading-tight">{name}</p>
            <p className="text-[19px] font-extrabold">{title}</p>
            <p className="text-[16px] font-bold">{detail}</p>
            {offline && (
              <span className="mt-2">
                <Chip tone="warn" icon={CloudUpload}>
                  Se enviará al volver el internet
                </Chip>
              </span>
            )}
          </div>
          <Btn variant="soft" className="mt-4">
            Listo
          </Btn>
        </div>
        <div className="flex w-full items-center gap-3 rounded-full bg-surface px-4 py-2.5 shadow-lg">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-success-container text-[13px] font-black text-success">
            10
          </span>
          <span className="flex-1 text-[15px] font-extrabold">{undo}</span>
          <span className="rounded-full bg-primary-container px-3 py-1.5 text-[13px] font-extrabold text-primary">
            Deshacer
          </span>
        </div>
      </div>
    </CajaScreen>
  );
}

export function VenderPlanScreen({ v }: { v: "elige" | "ok" }) {
  if (v === "ok") {
    return (
      <CajaScreen toast="Plan activado: Plan mensual para Luis Paredes" toastAction="Deshacer" />
    );
  }
  return (
    <CajaScreen>
      <Sheet title="Vender plan en caja">
        <div className="space-y-3">
          <SectionLabel>1. Comensal</SectionLabel>
          <div className="flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary-container p-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-[13px] font-black text-primary-foreground">
              LP
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-black">Luis Paredes</p>
              <p className="text-[13px] font-semibold text-primary">Cliente registrado</p>
            </div>
          </div>
          <SectionLabel>2. Seleccionar plan</SectionLabel>
          <div className="space-y-2">
            {PLANES.map((p, i) => (
              <div
                key={p.nombre}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-3",
                  i === 2
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                <span className="text-[15px] font-black">{p.nombre}</span>
                <span className="text-[15px] font-black">{p.precio}</span>
              </div>
            ))}
          </div>
          <SectionLabel>3. Método de pago</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <span className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-[15px] font-extrabold text-primary-foreground">
              <Banknote className="h-4 w-4" aria-hidden /> Efectivo
            </span>
            <span className="flex items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-[15px] font-extrabold">
              <Smartphone className="h-4 w-4" aria-hidden /> Transferencia
            </span>
          </div>
          <Btn tap icon={Sparkles}>
            Activar Plan mensual · $55,00
          </Btn>
        </div>
      </Sheet>
    </CajaScreen>
  );
}

/** Cobro suelto con De Una (propuesto): ticket del cobro suelto con un método más. */
export function CobroSueltoScreen({ v }: { v: "ticket" | "qr" | "pagado" }) {
  if (v === "pagado") {
    return <CajaScreen toast="Pago recibido · $3,00 por De Una" toastAction="Ticket" />;
  }
  return (
    <Screen role="dueno" tab="Caja">
      <Header title="Registrar consumo" eyebrow="Caja abierta" />
      <div className="space-y-3 p-4">
        <SectionLabel>Menú de hoy</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
            <p className="text-[15px] font-black leading-tight">Almuerzo del día</p>
            <p className="text-[13px] font-bold">$3,00 · 1 en el ticket</p>
          </div>
          <div className="rounded-2xl border border-border p-3">
            <p className="text-[15px] font-black leading-tight">Jugo natural</p>
            <p className="text-[13px] font-bold text-primary">$1,00</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-footer-bg p-4 text-image-foreground">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-black">TICKET N.º 149 · 1 almuerzo</span>
          <span className="text-[32px] font-black">$3,00</span>
        </div>
        {v === "ticket" ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <span className="rounded-full bg-image-foreground/15 py-2.5 text-center text-[13px] font-extrabold">
                Efectivo
              </span>
              <span className="rounded-full bg-image-foreground/15 py-2.5 text-center text-[13px] font-extrabold">
                Transfer.
              </span>
              <span className="flex items-center justify-center gap-1 rounded-full bg-primary py-2.5 text-[13px] font-extrabold">
                <Zap className="h-4 w-4" aria-hidden /> De Una
              </span>
            </div>
            <Btn tap className="mt-3">
              Cobrar $3,00 con De Una
            </Btn>
          </>
        ) : (
          <div className="mt-3 flex items-center gap-4 rounded-[24px] bg-surface p-3 text-foreground">
            <QrBox value="DEUNA-COBRO-149-300" size={96} />
            <div className="leading-tight">
              <p className="text-[17px] font-black">Escanea con De Una</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden /> Esperando pago…
              </p>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

export function PedidosScreen({
  v,
  paid = false,
}: {
  v: "lista" | "cobrar" | "entregado";
  /** Propuesta: la #42 llegó pagada con De Una, así que solo se entrega. */
  paid?: boolean;
}) {
  const rows = [
    ["#42", "Carlos Mejía", "Locro de papa con queso", "Seco de pollo con maduro", "Hace 6 min"],
    ["#43", "Andrea Morales", "Sopa de lenteja", "Trucha frita con ensalada", "Hace 12 min"],
  ] as const;
  return (
    <Screen role="dueno" tab="Caja">
      <Header
        title="Pedidos en camino"
        right={<Chip>{v === "entregado" ? "1 activo" : "2 activos"}</Chip>}
      />
      <div className="space-y-3 p-4">
        {rows.map(([id, name, sopa, segundo, ago], i) => {
          const first = i === 0;
          const done = first && v === "entregado";
          return (
            <div
              key={id}
              className={cn(
                "rounded-[24px] border border-border bg-surface p-4",
                done && "opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Chip>{id}</Chip>
                  <span className="text-[17px] font-black">{name}</span>
                </span>
                <span className="flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {ago}
                </span>
              </div>
              <div className="mt-2 rounded-2xl bg-primary-container/60 px-3 py-2 text-[13px] font-semibold">
                <p>
                  <span className="font-black text-primary">Sopa:</span> {sopa}
                </p>
                <p>
                  <span className="font-black text-primary">Segundo:</span> {segundo}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {first && paid ? (
                  <span className="flex items-center gap-1.5 text-[13px] font-black text-success">
                    <Zap className="h-4 w-4" aria-hidden /> Pagado con De Una
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Banknote className="h-4 w-4" aria-hidden /> $3,00 en efectivo
                  </span>
                )}
                {done ? (
                  <Chip tone="ok" icon={Check}>
                    Entregado
                  </Chip>
                ) : (
                  <span className="relative flex items-center gap-1.5 rounded-full bg-success px-4 py-2 text-[13px] font-extrabold text-success-foreground">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {first && paid ? "Entregar" : "Cobrar y entregar"}
                    {first && v === "lista" && <Tap />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {v === "cobrar" && (
        <Sheet title="Cobrar pedido #42">
          <div className="space-y-3">
            <div className="rounded-2xl bg-primary-container/60 p-3 text-[15px] font-bold">
              Carlos Mejía · Locro + Seco de pollo
            </div>
            <div className="flex items-center justify-between rounded-2xl border-2 border-primary p-3">
              <span className="flex items-center gap-2 text-[16px] font-black">
                <Banknote className="h-5 w-5 text-primary" aria-hidden /> Efectivo
              </span>
              <span className="text-[24px] font-black">$3,00</span>
            </div>
            <p className="text-center text-[13px] font-semibold text-muted-foreground">
              Las preórdenes se cobran solo en efectivo.
            </p>
            <Btn tap variant="success" icon={Check}>
              Cobré $3,00 · Entregar
            </Btn>
          </div>
        </Sheet>
      )}
      {v === "entregado" && (
        <Toast icon={CheckCircle2}>
          {paid ? "Pedido #42 entregado · ya estaba pagado" : "Pedido #42 entregado · $3,00"}
        </Toast>
      )}
    </Screen>
  );
}

/** Un plato del menú de hoy: cada uno se marca "Se acabó" por separado, como en la app. */
function DishToggle({ name, out, tap }: { name: string; out: boolean; tap: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border px-2.5 py-1.5",
        out ? "border-danger bg-danger-container" : "border-border bg-background",
      )}
    >
      <p
        className={cn(
          "truncate text-[13px] font-extrabold leading-tight",
          out && "text-muted-foreground line-through",
        )}
      >
        {name}
      </p>
      <p
        className={cn(
          "flex items-center gap-1 text-[13px] font-black",
          out ? "text-on-danger-container" : "text-success",
        )}
      >
        {out ? (
          <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
        )}
        {out ? "Se acabó" : "Hay"}
      </p>
      {tap && <Tap />}
    </div>
  );
}

export function MenuDiaScreen({ v }: { v: "borrador" | "publicado" | "seAcaba" | "agotado" }) {
  const dishes = [
    ["Sopa (2)", ["Locro de papa", "Sopa de lenteja"], "/dishes/locro-papa.jpg"],
    ["Segundo (2)", ["Pollo a la plancha", "Seco de pollo"], "/dishes/pollo-plancha.jpg"],
    ["Veggie (1)", ["Bowl de quinoa"], "/dishes/bowl-quinoa.jpg"],
    ["Bebida (1)", ["Jugo de naranjilla"], "/dishes/jugo-naranjilla.jpg"],
  ] as const;
  const live = v !== "borrador";
  return (
    <Screen role="dueno" tab="Menú">
      <Header
        title="Miércoles 30"
        eyebrow="Menú del día"
        right={
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[22px] font-black text-primary-foreground">
            +
          </span>
        }
      />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Chip tone={live ? "ok" : "muted"}>{live ? "Publicado" : "Borrador"}</Chip>
          <span className="flex rounded-full border border-border p-1 text-[13px] font-extrabold">
            <span className="rounded-full bg-primary-container px-3 py-1 text-primary">Hoy</span>
            <span className="px-3 py-1 text-muted-foreground">Mis platos</span>
          </span>
        </div>
        <p className="rounded-2xl bg-background px-3 py-2 text-[13px] font-semibold text-muted-foreground">
          ¿Se acabó un plato? Tócalo y solo ese deja de ofrecerse. Los demás siguen.
        </p>
        <div className="grid grid-cols-2 items-start gap-2.5">
          {dishes.map(([cat, items, img]) => (
            <div
              key={cat}
              className="overflow-hidden rounded-[22px] border border-border bg-surface"
            >
              <img src={img} alt="" className="h-16 w-full object-cover" />
              <div className="space-y-1.5 p-2.5">
                <p className="text-[13px] font-black uppercase text-primary">{cat}</p>
                {items.map((name) => {
                  const seco = name === "Seco de pollo";
                  return (
                    <DishToggle
                      key={name}
                      name={name}
                      out={seco && v === "agotado"}
                      tap={seco && v === "seAcaba"}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {v === "borrador" && <Btn tap>Publicar menú</Btn>}
      </div>
      {v === "publicado" && <Toast icon={Sparkles}>Menú publicado · ya lo ven tus clientes</Toast>}
      {v === "agotado" && (
        <Toast icon={CheckCircle2}>Seco de pollo: se acabó · los demás platos siguen</Toast>
      )}
    </Screen>
  );
}

function OptionGroup({ opts, sel }: { opts: string[]; sel: number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o, i) => (
        <span
          key={o}
          className={cn(
            "rounded-full py-2.5 text-center text-[15px] font-extrabold",
            i === sel ? "bg-primary text-primary-foreground" : "bg-primary-container text-primary",
          )}
        >
          {o}
        </span>
      ))}
    </div>
  );
}

export function OfertaDuenoScreen({ v }: { v: "form" | "activa" }) {
  if (v === "activa") {
    return <CajaScreen toast="Oferta flash publicada · 10 cupos hasta 14:00" toastAction="Ver" />;
  }
  return (
    <CajaScreen>
      <Sheet title="Oferta flash">
        <div className="space-y-2.5">
          <p className="text-[15px] font-bold">Qué ofreces</p>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-full bg-primary py-2.5 text-center text-[15px] font-extrabold text-primary-foreground">
              Menú de hoy
            </span>
            <span className="rounded-full bg-primary-container py-2.5 text-center text-[15px] font-extrabold text-primary">
              Plato suelto
            </span>
          </div>
          <p className="flex justify-between text-[15px] font-bold">
            Descuento <span className="text-primary">$2,70</span>
          </p>
          <OptionGroup opts={["−10 %", "−20 %", "Manual"]} sel={0} />
          <p className="rounded-full border border-border py-2 text-center text-[13px] font-bold">
            Recibes $2,51 por venta
          </p>
          <p className="text-[15px] font-bold">Cupos disponibles</p>
          <OptionGroup opts={["5 cupos", "10 cupos", "15 cupos"]} sel={1} />
          <p className="text-[15px] font-bold">Válida hasta</p>
          <OptionGroup opts={["13:30", "14:00", "14:30"]} sel={1} />
          <p className="flex items-center gap-1.5 rounded-2xl border border-border p-2.5 text-[13px] font-semibold text-muted-foreground">
            <Percent className="h-4 w-4 shrink-0" aria-hidden /> Publicar es gratis. Pagas el 7 %
            solo de lo que se valide.
          </p>
          <Btn tap>Publicar oferta</Btn>
        </div>
      </Sheet>
    </CajaScreen>
  );
}

export function CierreScreen({ v, deUna = false }: { v: "resumen" | "cerrado"; deUna?: boolean }) {
  const rows: Array<[typeof Banknote, string, string]> = [
    [Banknote, "Efectivo en caja", "$37,00"],
    ...(deUna ? ([[Zap, "De Una", "$55,00"]] as Array<[typeof Banknote, string, string]>) : []),
    [Smartphone, "Transferencias", deUna ? "$113,70" : "$168,70"],
    [Percent, "Comisión Bocadoo", "$0,19"],
  ];
  return (
    <Screen role="dueno" tab="Ajustes">
      <Header
        title="Cierre de caja"
        right={<span className="text-[13px] font-bold">Turno hoy</span>}
      />
      <div className="space-y-3 p-4">
        <div className="rounded-[28px] bg-hero-gradient p-5 text-center text-image-foreground shadow-lg">
          <p className="text-[13px] font-black uppercase tracking-wider text-image-foreground/85">
            Ventas del turno
          </p>
          <p className="text-[44px] font-black leading-tight">$205,70</p>
          <p className="text-[13px] font-bold">34 almuerzos servidos hoy</p>
        </div>
        <div className="divide-y divide-border rounded-[24px] border border-border bg-surface px-4">
          {rows.map(([Icon, label, amount]) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2.5 text-[15px] font-bold">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-xl",
                    label === "De Una"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-container text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {label}
              </span>
              <span className="text-[16px] font-black">{amount}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <SectionLabel>Cuadre de caja física</SectionLabel>
          <div className="mt-2 flex items-center justify-between rounded-full border border-success bg-success-container px-4 py-2 text-success">
            <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Caja cuadrada exacta
            </span>
            <span className="text-[15px] font-black">$0,00</span>
          </div>
        </div>
        {v === "resumen" ? (
          <Btn tap icon={CheckCircle2}>
            Cerrar turno
          </Btn>
        ) : (
          <Btn variant="success" icon={Check}>
            Turno cerrado
          </Btn>
        )}
      </div>
    </Screen>
  );
}

/** Cola del modo offline (diseñada, no construida): lo guardado en el celular del dueño. */
export function ColaScreen({ v }: { v: "cola" | "sync" | "listo" }) {
  const rows: Array<[string, string, "Pendiente" | "Enviando" | "Enviado"]> = [
    ["Almuerzo de Carlos", "12:41 · pase QR", v === "cola" ? "Pendiente" : "Enviado"],
    ["Cobro suelto $3,00", "12:44 · efectivo", v === "cola" ? "Pendiente" : "Enviado"],
    [
      "Pedido #42 · $3,00",
      "12:47 · efectivo",
      v === "cola" ? "Pendiente" : v === "sync" ? "Enviando" : "Enviado",
    ],
  ];
  const offline = v === "cola";
  return (
    <Screen role="dueno" tab="Caja" offline={offline}>
      <Header
        title={v === "listo" ? "Todo al día" : v === "sync" ? "Enviando…" : "Por enviar"}
        eyebrow={offline ? "Sin conexión" : "Volvió el internet"}
      />
      <div className="space-y-2.5 p-4">
        {offline && (
          <div className="flex items-center justify-center gap-1.5 rounded-full bg-danger-container py-1.5 text-[13px] font-bold text-on-danger-container">
            <WifiOff className="h-4 w-4" aria-hidden /> Guardado en este celular
          </div>
        )}
        {rows.map(([name, meta, st]) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-container text-primary">
              {meta.includes("QR") ? (
                <QrCode className="h-4 w-4" aria-hidden />
              ) : (
                <Banknote className="h-4 w-4" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[15px] font-extrabold">{name}</p>
              <p className="text-[13px] font-semibold text-muted-foreground">{meta}</p>
            </div>
            <Chip tone={st === "Enviado" ? "ok" : st === "Enviando" ? "brand" : "warn"}>{st}</Chip>
          </div>
        ))}
        {v === "sync" && (
          <div className="pt-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary-container">
              <div className="flj-progress h-full w-2/3 rounded-full bg-primary" />
            </div>
            <p className="mt-1.5 text-center text-[13px] font-bold text-muted-foreground">2 de 3</p>
          </div>
        )}
        {offline && (
          <p className="rounded-2xl bg-secondary-container px-3 py-2.5 text-[13px] font-bold leading-snug">
            De Una y transferencia esperan: necesitan internet.
          </p>
        )}
      </div>
      {v === "listo" && <Toast icon={CheckCircle2}>Todo al día · 3 enviados</Toast>}
    </Screen>
  );
}
