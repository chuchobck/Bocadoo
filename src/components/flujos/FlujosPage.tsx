import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bell,
  CloudUpload,
  Pause,
  Play,
  QrCode,
  RotateCcw,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

import "./flujos.css";
import {
  FLOWS,
  STATUS_LABEL,
  type Flow,
  type FlowNote,
  type FlowStatus,
  type Signal,
} from "./flows";
import { PhoneFrame } from "./kit";
import { ROLE_LABEL, type Role } from "./roles";

const AUTOPLAY_MS = 4200;

const STATUS_ORDER: FlowStatus[] = ["hoy", "propuesto", "disenado"];

const STATUS_HINT: Record<FlowStatus, string> = {
  hoy: "Ya funciona en el prototipo",
  propuesto: "Pagos con De Una, por validar",
  disenado: "Comportamiento objetivo",
};

const STATUS_TONE: Record<FlowStatus, string> = {
  hoy: "bg-success-container text-success",
  propuesto: "bg-primary text-primary-foreground",
  disenado: "bg-secondary-container text-on-secondary-container",
};

const NOTE_TONE: Record<FlowNote["tone"], string> = {
  ok: "border-success/40 bg-success-container/50",
  wait: "border-border bg-surface",
  info: "border-primary/40 bg-primary-container/60",
};

const ROLE_WHO: Record<Role, string> = { comensal: "Carlos", dueno: "La Cuchara" };

function StatusPill({ status }: { status: FlowStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-bold leading-none",
        STATUS_TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Ícono del puente según lo que viaja entre los celulares. */
function signalIcon(label: string, tone: Signal["tone"]): LucideIcon {
  if (tone === "off")
    return label.includes("enviar") || label.includes("Guardado") ? CloudUpload : WifiOff;
  if (/QR|Mesa/.test(label)) return QrCode;
  if (/\$|Comisión/.test(label)) return Banknote;
  if (/De Una/.test(label)) return Zap;
  return Bell;
}

function Bridge({ signal }: { signal: Signal | undefined }) {
  const Icon = signal ? signalIcon(signal.label, signal.tone) : null;
  return (
    <div
      className="flex w-[120px] shrink-0 flex-col items-center justify-center"
      data-dir={signal?.dir}
    >
      {signal && Icon ? (
        <div
          key={signal.label}
          className="flj-in flex w-full flex-col items-center gap-2 text-center"
        >
          <span
            className={cn(
              "grid h-12 w-12 place-items-center rounded-full shadow-md",
              signal.tone === "off"
                ? "bg-danger-container text-on-danger-container"
                : "bg-primary text-primary-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-[13px] font-extrabold leading-tight">{signal.label}</span>
          <div className="flj-bridge-line" data-tone={signal.tone ?? "ok"}>
            {signal.tone !== "off" && <span className="flj-bridge-dot" />}
          </div>
        </div>
      ) : (
        <div className="h-0.5 w-16 rounded-full bg-border" />
      )}
    </div>
  );
}

function RoleLabel({ role, active }: { role: Role; active: boolean }) {
  return (
    <div className="mb-2 flex h-8 items-center justify-center gap-2">
      <span className="text-[15px] font-extrabold">{ROLE_LABEL[role]}</span>
      <span className="text-[13px] font-semibold text-muted-foreground">{ROLE_WHO[role]}</span>
      {active && (
        <span className="flj-in rounded-full bg-primary px-2.5 py-1 text-[13px] font-bold leading-none text-primary-foreground">
          Actúa
        </span>
      )}
    </div>
  );
}

export function FlujosPage() {
  const [flowIdx, setFlowIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mobileRole, setMobileRole] = useState<Role>("dueno");

  const flow: Flow = FLOWS[flowIdx] ?? (FLOWS[0] as Flow);
  const step = flow.steps[stepIdx] ?? (flow.steps[0] as Flow["steps"][number]);
  const isLastStep = stepIdx >= flow.steps.length - 1;
  const isLastFlow = flowIdx >= FLOWS.length - 1;

  const goToFlow = useCallback((idx: number) => {
    setFlowIdx(idx);
    setStepIdx(0);
    setPlaying(false);
    const id = FLOWS[idx]?.id;
    if (id) window.history.replaceState(null, "", `#${id}`);
  }, []);

  // Enlace directo: /flujos#offline abre ese flujo
  useEffect(() => {
    const idx = FLOWS.findIndex((f) => f.id === window.location.hash.slice(1));
    if (idx > 0) {
      setFlowIdx(idx);
      setStepIdx(0);
    }
  }, []);

  // En pantallas angostas solo cabe un celular: se muestra el que actúa
  useEffect(() => {
    setMobileRole(step.focus);
  }, [step]);

  const next = useCallback(() => {
    if (!isLastStep) setStepIdx((s) => s + 1);
    else if (!isLastFlow) goToFlow(flowIdx + 1);
    else goToFlow(0);
  }, [isLastStep, isLastFlow, flowIdx, goToFlow]);

  const prev = useCallback(() => {
    if (stepIdx > 0) setStepIdx((s) => s - 1);
    else if (flowIdx > 0) {
      const before = FLOWS[flowIdx - 1];
      if (before) {
        setFlowIdx(flowIdx - 1);
        setStepIdx(before.steps.length - 1);
        setPlaying(false);
        window.history.replaceState(null, "", `#${before.id}`);
      }
    }
  }, [stepIdx, flowIdx]);

  // Enter y flechas avanzan; si el foco está en un botón o enlace, ellos mismos manejan Enter
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      if (el?.closest("button, a, input, textarea, select")) {
        if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") return;
        if (el.closest("input, textarea, select")) return;
      }
      if (ev.key === "Enter" || ev.key === "ArrowRight") {
        ev.preventDefault();
        next();
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Reproducción automática: avanza dentro del flujo y se detiene al final
  useEffect(() => {
    if (!playing) return;
    if (isLastStep) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStepIdx((s) => s + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, stepIdx, isLastStep]);

  const nextLabel = useMemo(() => {
    if (!isLastStep) return "Siguiente";
    if (!isLastFlow) return "Siguiente flujo";
    return "Volver al inicio";
  }, [isLastStep, isLastFlow]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[15px] font-bold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Inicio
          </Link>
          <span className="text-[17px] font-extrabold tracking-tight">Flujos MVP</span>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <Link
              to="/app"
              className="hidden min-h-11 items-center rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground shadow-brand hover:bg-primary-hover sm:inline-flex"
            >
              Probar la app
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 py-4 lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* Lista de flujos: barra lateral en escritorio */}
        <nav aria-label="Flujos" className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-5">
            {STATUS_ORDER.map((status) => (
              <div key={status}>
                <div className="mb-2 px-2">
                  <StatusPill status={status} />
                  <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                    {STATUS_HINT[status]}
                  </p>
                </div>
                <ul className="flex flex-col gap-1">
                  {FLOWS.map((f, i) => {
                    if (f.status !== status) return null;
                    const Icon = f.icon;
                    const selected = i === flowIdx;
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          aria-current={selected ? "true" : undefined}
                          onClick={() => goToFlow(i)}
                          className={cn(
                            "flex min-h-12 w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors",
                            selected
                              ? "bg-primary-container text-on-primary-container"
                              : "hover:bg-secondary-container",
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface text-primary",
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 text-[15px] font-bold leading-tight">
                            {f.title}
                          </span>
                          <span className="text-[13px] font-semibold text-muted-foreground">
                            {f.steps.length}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0">
          {/* Lista de flujos: fila deslizable en móvil y tableta */}
          <nav aria-label="Flujos" className="-mx-4 mb-4 overflow-x-auto px-4 lg:hidden">
            <ul className="flex w-max gap-2">
              {FLOWS.map((f, i) => (
                <li key={f.id}>
                  <button
                    type="button"
                    aria-current={i === flowIdx ? "true" : undefined}
                    onClick={() => goToFlow(i)}
                    className={cn(
                      "min-h-11 whitespace-nowrap rounded-full border px-4 text-[15px] font-bold",
                      i === flowIdx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface",
                    )}
                  >
                    {f.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Escenario */}
          <section
            aria-labelledby="flujo-titulo"
            className="overflow-hidden rounded-[32px] border border-border bg-surface shadow-sm"
          >
            {/* Encabezado del flujo */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 md:px-7">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusPill status={flow.status} />
                  <span className="text-[13px] font-bold text-muted-foreground">
                    Flujo {flowIdx + 1} de {FLOWS.length}
                  </span>
                </div>
                <h1
                  id="flujo-titulo"
                  className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight"
                >
                  {flow.title}
                </h1>
                <p className="text-[15px] text-muted-foreground">{flow.blurb}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isLastStep) setStepIdx(0);
                    setPlaying((p) => !p);
                  }}
                  aria-pressed={playing}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[15px] font-bold text-primary hover:bg-primary-container"
                >
                  {playing ? (
                    <Pause className="h-4 w-4" aria-hidden />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden />
                  )}
                  {playing ? "Pausar" : "Reproducir"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStepIdx(0);
                    setPlaying(false);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[15px] font-bold text-muted-foreground hover:bg-secondary-container"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden /> Reiniciar
                </button>
              </div>
            </div>

            {/* Celulares */}
            <div className="bg-background px-4 py-5 md:px-6 md:py-4">
              <div
                className="mx-auto mb-4 flex w-fit gap-1 rounded-full bg-secondary-container p-1 md:hidden"
                role="group"
                aria-label="Elegir celular"
              >
                {(["comensal", "dueno"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={mobileRole === r}
                    onClick={() => setMobileRole(r)}
                    className={cn(
                      "min-h-11 rounded-full px-5 text-[15px] font-bold",
                      mobileRole === r
                        ? "bg-primary text-primary-foreground"
                        : "text-on-secondary-container",
                    )}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>

              <div className="flex items-stretch justify-center">
                {(["comensal", "dueno"] as const).map((r, i) => (
                  <div key={r} className="contents">
                    {i === 1 && (
                      <div className="hidden md:flex">
                        <Bridge signal={step.signal} />
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex-col items-center",
                        mobileRole === r ? "flex" : "hidden md:flex",
                      )}
                    >
                      <RoleLabel role={r} active={step.focus === r} />
                      {/* aria-hidden: los celulares son ilustración; el texto del paso cuenta lo mismo */}
                      <div aria-hidden="true">
                        <PhoneFrame active={step.focus === r}>
                          <div key={`${flow.id}-${stepIdx}-${r}`} className="h-full">
                            {step[r]}
                          </div>
                        </PhoneFrame>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paso actual + controles */}
            <div className="border-t border-border px-5 py-4 md:px-7">
              <div className="mb-3 flex gap-1.5" aria-label="Pasos del flujo">
                {flow.steps.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => {
                      setStepIdx(i);
                      setPlaying(false);
                    }}
                    aria-label={`Ir al paso ${i + 1}: ${s.title}`}
                    aria-current={i === stepIdx ? "step" : undefined}
                    className="group flex h-6 flex-1 items-center"
                  >
                    <span
                      className={cn(
                        "block h-1.5 w-full rounded-full transition-colors",
                        i <= stepIdx ? "bg-primary" : "bg-border group-hover:bg-primary/40",
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0" aria-live="polite">
                  <p className="text-[13px] font-bold text-primary">
                    Paso {stepIdx + 1} de {flow.steps.length} · {ROLE_LABEL[step.focus]}
                  </p>
                  <p className="text-[20px] font-extrabold leading-tight tracking-tight">
                    {step.title}
                  </p>
                  <p className="text-[15px] text-muted-foreground">{step.caption}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={flowIdx === 0 && stepIdx === 0}
                    aria-label="Paso anterior"
                    className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface disabled:opacity-40"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[16px] font-extrabold text-primary-foreground shadow-brand hover:bg-primary-hover active:scale-[0.98] md:min-w-[200px] md:flex-none"
                  >
                    {nextLabel} <ArrowRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
              <p className="mt-3 hidden text-[13px] font-semibold text-muted-foreground md:block">
                Atajos: Enter o → avanza · ← vuelve
              </p>
            </div>
          </section>

          {/* Notas del flujo */}
          {flow.notes && (
            <section className="mt-6" aria-labelledby="notas-titulo">
              <h2 id="notas-titulo" className="mb-3 px-1 text-[17px] font-extrabold">
                Reglas de este flujo
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {flow.notes.map((n) => (
                  <article
                    key={n.heading}
                    className={cn("rounded-[24px] border p-5", NOTE_TONE[n.tone])}
                  >
                    <h3 className="text-[15px] font-extrabold">{n.heading}</h3>
                    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-snug">
                      {n.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          )}

          <p className="mt-6 px-1 text-[13px] font-semibold text-muted-foreground">
            Maquetas con datos de ejemplo, copiadas de las pantallas del prototipo. “Propuesto” y
            “Diseñado” todavía no están construidos.
          </p>
        </main>
      </div>
    </div>
  );
}
