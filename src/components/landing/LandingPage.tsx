import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";

import "./landing.css";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { QR_BACKGROUND, QR_FOREGROUND } from "@/lib/qr-colors";
import { buildLeadWhatsAppUrl, saveLead, type CapturedLead } from "./leads";

type View = "dueno" | "comensal";

/** Landing de Bocadoo (diseño de Claude Design). Los estilos viven en landing.css bajo `.landing`. */
export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [jsReady, setJsReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<View>("dueno");
  const [frameKey, setFrameKey] = useState(0);
  const [sent, setSent] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);

  // Aparecer suave al hacer scroll
  useEffect(() => {
    setJsReady(true);
    const els = rootRef.current?.querySelectorAll(".reveal") ?? [];
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Menú móvil: se cierra al elegir un enlace
  const closeMenuOnLink = (ev: MouseEvent<HTMLUListElement>) => {
    if ((ev.target as HTMLElement).closest("a")) setMenuOpen(false);
  };

  // Pestañas del prototipo: cambian de rol y reinician el iframe
  const selectView = (next: View) => {
    setView(next);
    setFrameKey((k) => k + 1);
  };

  // Formulario: respaldo local de cada lead (para las entrevistas en la calle) + atajo a WhatsApp
  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    let ok = true;
    form.querySelectorAll<HTMLInputElement>("input[required]").forEach((i) => {
      const empty = !i.value.trim();
      i.style.borderColor = empty ? "var(--danger)" : "";
      if (empty && ok) {
        i.focus();
        ok = false;
      }
    });
    if (!ok) return;

    const data = new FormData(form);
    const lead: CapturedLead = {
      nombre: String(data.get("nombre") ?? "").trim(),
      restaurante: String(data.get("restaurante") ?? "").trim(),
      whatsapp: String(data.get("whatsapp") ?? "").trim(),
      timestamp: new Date().toISOString(),
    };
    saveLead(lead);
    setWaUrl(buildLeadWhatsAppUrl(lead));
    setSent(true);
  };

  return (
    <div ref={rootRef} className={jsReady ? "landing" : "landing no-js"}>
      {/* Ícono reutilizable del logo */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="logo" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8.5" style={{ fill: "var(--primary-foreground)" }} />
            <circle cx="12" cy="12" r="5" style={{ fill: "var(--primary)" }} />
            <path
              d="M17.5 4.2a3 3 0 0 1 2.4 2.4 1.5 1.5 0 0 1-2.9.6 1.5 1.5 0 0 1 .5-3z"
              style={{ fill: "var(--footer-accent)" }}
            />
          </symbol>
        </defs>
      </svg>

      {/* 1. NAVBAR */}
      <header className="nav-wrap">
        <nav className="nav" aria-label="Principal">
          <a href="#inicio" className="brand" aria-label="Bocadoo, inicio">
            <img
              className="brand-long"
              src="/landing/bocadoo-logo.webp"
              alt="Bocadoo"
              width="155"
              height="50"
            />
            <img
              className="brand-short"
              src="/landing/bocadoo-isotipo.webp"
              alt="Bocadoo"
              width="33"
              height="46"
            />
          </a>
          <ul
            className={menuOpen ? "nav-links open" : "nav-links"}
            id="navLinks"
            onClick={closeMenuOnLink}
          >
            <li>
              <a href="#como-funciona">Cómo funciona</a>
            </li>
            <li>
              <a href="#restaurantes">Restaurantes</a>
            </li>
            <li>
              <a href="#comensales">Comensales</a>
            </li>
            <li>
              <a href="#prototipo">Prototipo</a>
            </li>
            <li>
              <Link to="/flujos">Flujos</Link>
            </li>
            <li>
              <a href="#precios">Precios</a>
            </li>
          </ul>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ThemeToggle variant="icon" className="theme-btn" />
            <a href="#prototipo" className="btn btn-primary btn-desktop">
              Probar el prototipo
            </a>
            <button
              className="nav-toggle"
              id="navToggle"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="navLinks"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* 2. HERO */}
        <section className="hero" id="inicio">
          <div className="container hero-inner">
            <span className="badge reveal">
              <i>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 11h16M6 11a6 6 0 0 0 12 0M12 5v2" />
                </svg>
              </i>
              Para restaurantes de almuerzos
            </span>

            <span className="tag-float tag-a">
              Dueño
              <svg viewBox="0 0 24 24">
                <path d="M3 3l18 7-8 3-3 8z" />
              </svg>
            </span>
            <span className="tag-float tag-b">
              <svg viewBox="0 0 24 24">
                <path d="M3 3l18 7-8 3-3 8z" />
              </svg>
              Comensal
            </span>

            <h1 className="reveal d1">
              ¿Cuántos almuerzos se te escapan entre <span className="pill">cuadernos</span> y
              archivos tachados y desordenados?
            </h1>
            <p className="lead reveal d2">
              Bocadoo digitaliza los planes de almuerzo que ya vendes. Valida cada almuerzo con un
              QR en segundos, sin descuadres ni filas en hora pico.
            </p>
            <div className="hero-ctas reveal d3">
              <a href="#prototipo" className="btn btn-primary">
                Probar el prototipo
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a href="#comensales" className="btn btn-secondary">
                Soy comensal
              </a>
            </div>

            <div className="hero-visual reveal d2">
              {/* Celular con la pantalla del dueño */}
              <div
                className="phone"
                aria-label="Pantalla de ejemplo de Bocadoo para el dueño del restaurante"
              >
                <div className="phone-screen">
                  <div className="island"></div>
                  <div className="scr">
                    <div className="scr-top">
                      <div className="scr-hello">
                        <small>Buenos días</small>
                        <b>Mi restaurante</b>
                      </div>
                      <div className="avatar">MR</div>
                    </div>
                    <div className="scr-stats">
                      <div className="scr-stat">
                        <small>Clientes activos</small>
                        <b>48</b>
                      </div>
                      <div className="scr-stat">
                        <small>Almuerzos hoy</small>
                        <b>31</b>
                      </div>
                    </div>
                    <div className="scan-btn">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" />
                      </svg>
                      Escanear QR
                    </div>
                    <div className="scr-list-title">
                      Últimos validados <span>Ver todo</span>
                    </div>
                    <div className="scr-row">
                      <span className="mini-av">AP</span>
                      <div>
                        Ana P.<small>Quedan 13 · 12:41</small>
                      </div>
                      <em>✓</em>
                    </div>
                    <div className="scr-row">
                      <span className="mini-av">JM</span>
                      <div>
                        Jorge M.<small>Quedan 7 · 12:38</small>
                      </div>
                      <em>✓</em>
                    </div>
                    <div className="scr-row">
                      <span className="mini-av">LC</span>
                      <div>
                        Lucía C.<small>Quedan 18 · 12:35</small>
                      </div>
                      <em>✓</em>
                    </div>
                    <div className="scr-row">
                      <span className="mini-av">DR</span>
                      <div>
                        Diego R.<small>Quedan 2 · 12:30</small>
                      </div>
                      <em>✓</em>
                    </div>
                  </div>
                </div>
              </div>

              <div className="float-cards-mobile">
                <div className="float-card fc-1">
                  <div className="fc-head">
                    <span className="ic">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="8" r="3.5" />
                        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
                      </svg>
                    </span>
                    <div>
                      <b>Clientes</b>
                      <small>Este mes</small>
                    </div>
                  </div>
                  <div className="fc-big">
                    48 <small>clientes activos</small>
                  </div>
                  <div className="bar">
                    <span style={{ width: "78%" }}></span>
                  </div>
                </div>
                <div className="float-card fc-2">
                  <div className="fc-head">
                    <span className="ic soft">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
                      </svg>
                    </span>
                    <div>
                      <b>Almuerzo validado</b>
                      <small>Ana P. · 12:41</small>
                    </div>
                    <span className="check" style={{ marginLeft: "auto" }}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    </span>
                  </div>
                  <div className="bar">
                    <span style={{ width: "35%" }}></span>
                  </div>
                  <small
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    Le quedan 13 de 20 almuerzos
                  </small>
                </div>
                <div className="float-card fc-3">
                  <div className="fc-head">
                    <span className="ic">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    </span>
                    <div>
                      <b>Plan mensual vendido</b>
                      <small>20 almuerzos</small>
                    </div>
                  </div>
                  <div className="money">+$55</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CREDIBILIDAD */}
        <section className="cred">
          <div className="container">
            <p className="kicker reveal">Lo que aprendimos en la calle, no en una oficina</p>
            <div className="cred-row">
              <div className="cred-item reveal">
                <span className="num">16</span>Hablamos con 16 dueños de restaurantes en Quito
              </div>
              <div className="cred-item reveal d1">
                <span className="num">11/16</span>ya venden planes prepagados
              </div>
              <div className="cred-item reveal d2">
                <span className="num">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
                  </svg>
                </span>
                y los controlan a mano, con cartulinas y cuadernos
              </div>
            </div>
          </div>
        </section>

        {/* 4. EL PROBLEMA */}
        <section className="section" id="restaurantes">
          <div className="container">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 7v6M12 17h.01" />
                  </svg>
                </i>
                El problema
              </span>
              <h2 className="h2 reveal d1">
                Tu plan de almuerzos funciona. <span className="hl">Tu control, no.</span>
              </h2>
            </div>
            <div className="grid-3">
              <article className="card problem-card reveal">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5M9 13l6 4M15 13l-6 4" />
                  </svg>
                </span>
                <h3>Descuadres</h3>
                <p>Cartulinas perdidas y cuadernos que no cuadran con la caja.</p>
                <div className="problem-visual" aria-hidden="true">
                  <div className="paper">
                    <i className="x"></i>
                    <i className="x"></i>
                    <i className="x"></i>
                    <i></i>
                    <i className="x"></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <div className="paper">
                    <i className="x"></i>
                    <i className="x"></i>
                    <i></i>
                    <i className="x"></i>
                    <i></i>
                    <i></i>
                    <i className="x"></i>
                    <i></i>
                  </div>
                  <div className="paper">
                    <i className="x"></i>
                    <i></i>
                    <i className="x"></i>
                    <i></i>
                    <i></i>
                    <i className="x"></i>
                    <i></i>
                    <i></i>
                  </div>
                </div>
              </article>
              <article className="card problem-card reveal d1">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <h3>Fugas de dinero</h3>
                <p>Clientes que comen sin que nadie pueda comprobar si les quedan almuerzos.</p>
                <div className="problem-visual" aria-hidden="true">
                  <div className="leak">
                    <span className="q">?</span>
                    <div>
                      ¿Le quedan almuerzos?
                      <br />
                      <span style={{ color: "var(--muted-foreground)", fontWeight: "500" }}>
                        Nadie lo sabe con certeza
                      </span>
                    </div>
                  </div>
                </div>
              </article>
              <article className="card problem-card reveal d2">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <h3>Filas lentas</h3>
                <p>Buscar la tarjeta de cada cliente en hora pico hace que otros se vayan.</p>
                <div className="problem-visual" aria-hidden="true">
                  <div className="queue">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="queue-clock">13:00</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 5. CÓMO FUNCIONA */}
        <section className="section" id="como-funciona" style={{ paddingTop: "0" }}>
          <div className="container">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </i>
                Cómo funciona
              </span>
              <h2 className="h2 reveal d1">
                Del papel al QR en <span className="hl">3 pasos</span>
              </h2>
              <p className="lead reveal d2">
                Sin equipos nuevos ni capacitaciones largas. Solo tu celular.
              </p>
            </div>
            <div className="grid-3">
              {/* Paso 1 */}
              <article className="how-card reveal">
                <div className="step-n">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="10" cy="8" r="4" />
                      <path d="M3 21a7 7 0 0 1 14 0M19 8v6M16 11h6" />
                    </svg>
                  </span>
                  <span>Paso 1</span>
                </div>
                <h3>Registra a tus clientes</h3>
                <p>Agrega a cada cliente con su nombre y su número. Listo en un minuto.</p>
                <div className="mini" aria-hidden="true">
                  <div className="mini-title">
                    Mis clientes <small>48 activos</small>
                  </div>
                  <div className="m-row">
                    <span className="mini-av">AP</span>
                    <b>Ana P.</b>
                    <span className="tag ok">Registrado</span>
                  </div>
                  <div className="m-row">
                    <span className="mini-av">JM</span>
                    <b>Jorge M.</b>
                    <span className="tag ok">Registrado</span>
                  </div>
                  <div className="m-row">
                    <span className="mini-av">SV</span>
                    <b>Sofía V.</b>
                    <span className="tag no">Sin plan</span>
                  </div>
                  <div className="m-add">+ Agregar cliente</div>
                </div>
              </article>
              {/* Paso 2 */}
              <article className="how-card reveal d1">
                <div className="step-n">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="3" />
                      <path d="M2 10h20M6 15h4" />
                    </svg>
                  </span>
                  <span>Paso 2</span>
                </div>
                <h3>Cobra el plan</h3>
                <p>
                  Vende el plan como siempre y actívalo en la app. El cliente lo ve al instante.
                </p>
                <div className="mini" aria-hidden="true">
                  <div className="plan">
                    <small>Plan mensual · Sofía V.</small>
                    <div className="p-big">20 almuerzos</div>
                    <div className="plan-meta">
                      <div>
                        <small>Precio</small>
                        <b>$55</b>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <small>Vence</small>
                        <b>30/10</b>
                      </div>
                    </div>
                  </div>
                  <div className="pay-row">
                    <span className="on">Efectivo</span>
                    <span>Transferencia</span>
                  </div>
                  <div
                    className="m-add"
                    style={{
                      marginTop: "10px",
                      borderStyle: "solid",
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderColor: "var(--primary)",
                    }}
                  >
                    Activar plan
                  </div>
                </div>
              </article>
              {/* Paso 3 */}
              <article className="how-card reveal d2">
                <div className="step-n">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" />
                    </svg>
                  </span>
                  <span>Paso 3</span>
                </div>
                <h3>Escanea y descuenta</h3>
                <p>El cliente muestra su QR, tú lo escaneas y el almuerzo se descuenta solo.</p>
                <div className="mini" aria-hidden="true">
                  <div className="qr-wrap">
                    <div className="qr-box">
                      <svg viewBox="0 0 21 21" shapeRendering="crispEdges">
                        <rect width="21" height="21" fill={QR_BACKGROUND} />
                        <g fill={QR_FOREGROUND}>
                          <path d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0z" />
                        </g>
                        <g fill={QR_BACKGROUND}>
                          <path d="M1 1h5v5H1zM15 1h5v5h-5zM1 15h5v5H1z" />
                        </g>
                        <g fill={QR_FOREGROUND}>
                          <path d="M2 2h3v3H2zM16 2h3v3h-3zM2 16h3v3H2z" />
                          <path d="M8 0h1v1H8zM10 1h2v1h-2zM9 3h1v2H9zM11 4h2v1h-2zM8 6h1v1H8zM12 6h1v2h-1zM8 8h3v1H8zM0 8h2v1H0zM3 9h2v1H3zM5 8h1v2H5zM14 8h2v1h-2zM17 9h2v1h-2zM20 8h1v2h-1zM9 10h1v2H9zM11 10h2v1h-2zM14 11h1v2h-1zM16 11h3v1h-3zM0 11h1v2H0zM2 12h3v1H2zM6 11h1v2H6zM8 13h2v1H8zM11 12h1v3h-1zM13 14h2v1h-2zM16 13h1v2h-1zM18 14h3v1h-3zM8 16h1v2H8zM10 17h2v1h-2zM13 16h3v1h-3zM17 17h1v2h-1zM19 16h1v1h-1zM9 19h3v1H9zM13 19h1v2h-1zM15 18h1v2h-1zM19 19h2v1h-2zM8 20h1v1H8zM17 20h1v1h-1z" />
                        </g>
                      </svg>
                    </div>
                    <div className="validated">
                      <span className="check">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      </span>
                      <div>
                        Almuerzo validado<small>Sofía V. · le quedan 19</small>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 6. COMENSAL */}
        <section className="section diner" id="comensales">
          <div className="container split">
            <div>
              <div className="section-head">
                <span className="badge reveal">
                  <i>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  </i>
                  Para comensales
                </span>
                <h2 className="h2 reveal d1">
                  ¿Seguro sabes cuántos <span className="pill">almuerzos</span> te quedan?
                </h2>
                <p className="lead reveal d2">
                  Se acabó perder la cartulina o discutir en caja. Tu plan vive en tu celular.
                </p>
              </div>
              <ul className="benefits">
                <li className="reveal">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </span>
                  <div>
                    <b>Tus almuerzos y su valor en dinero</b>
                    <span>Sabes cuántos te quedan y cuánto valen.</span>
                  </div>
                </li>
                <li className="reveal d1">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />
                    </svg>
                  </span>
                  <div>
                    <b>Historial de cada almuerzo</b>
                    <span>Fecha, hora y restaurante. Sin discusiones.</span>
                  </div>
                </li>
                <li className="reveal d2">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />
                    </svg>
                  </span>
                  <div>
                    <b>Mantienes tu descuento mensual</b>
                    <span>El mismo plan de siempre, ahora digital.</span>
                  </div>
                </li>
                <li className="reveal d3">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                    </svg>
                  </span>
                  <div>
                    <b>Ofertas flash cerca de tu U</b>
                    <span>Descubre restaurantes cerca de tu universidad.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div
              className="cards-stack reveal d1"
              aria-label="Ejemplos de planes de almuerzo en la app"
            >
              <div className="ccard c1">
                <div className="c-top">
                  <div className="c-name">
                    La Huequita<small>Plan mensual</small>
                  </div>
                  <span className="chip"></span>
                </div>
                <div className="c-amt">
                  6 <small>almuerzos ≈ $16,80</small>
                </div>
                <div className="c-bot">
                  <div>
                    <small>Vence</small>
                    <b>15/10</b>
                  </div>
                  <b>BOCADOO</b>
                </div>
              </div>
              <div className="ccard c2">
                <div className="c-top">
                  <div className="c-name">
                    Sazón de Casa<small>Plan mensual</small>
                  </div>
                  <span className="chip"></span>
                </div>
                <div className="c-amt">
                  9 <small>almuerzos ≈ $25,20</small>
                </div>
                <div className="c-bot">
                  <div>
                    <small>Vence</small>
                    <b>22/10</b>
                  </div>
                  <b>BOCADOO</b>
                </div>
              </div>
              <div className="ccard c3">
                <div className="c-top">
                  <div className="c-name">
                    El Rincón Universitario<small>Plan mensual · 20 almuerzos</small>
                  </div>
                  <span className="qr-mini">
                    <svg viewBox="0 0 7 7" shapeRendering="crispEdges">
                      <path
                        fill={QR_FOREGROUND}
                        d="M0 0h3v3H0zM4 0h3v3H4zM0 4h3v3H0zM4 4h1v1H4zM6 4h1v1H6zM5 5h1v1H5zM4 6h1v1H4zM6 6h1v1H6z"
                      />
                      <path
                        fill={QR_BACKGROUND}
                        d="M.75.75h1.5v1.5H.75zM4.75.75h1.5v1.5h-1.5zM.75 4.75h1.5v1.5H.75z"
                      />
                    </svg>
                  </span>
                </div>
                <div className="c-amt">
                  14 <small>almuerzos ≈ $39,20</small>
                </div>
                <div className="c-bot">
                  <div>
                    <small>Vence</small>
                    <b>30/10</b>
                  </div>
                  <b>BOCADOO</b>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. BENEFICIOS RESTAURANTE */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21h18M5 21V10l7-6 7 6v11" />
                  </svg>
                </i>
                Para tu restaurante
              </span>
              <h2 className="h2 reveal d1">
                Más orden, más caja y <span className="hl">menos estrés</span>
              </h2>
            </div>
            <div className="grid-4">
              <article className="card benefit reveal">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                    <path d="M6 12h.01M18 12h.01" />
                  </svg>
                </span>
                <h3>Liquidez al inicio del mes</h3>
                <p>Cobras los planes por adelantado y tienes caja desde el día uno.</p>
              </article>
              <article className="card benefit reveal d1">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
                  </svg>
                </span>
                <h3>Orden contable</h3>
                <p>Cada almuerzo queda registrado. Tus cuentas cuadran solas.</p>
              </article>
              <article className="card benefit reveal d2">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                  </svg>
                </span>
                <h3>Caja rápida en hora pico</h3>
                <p>Un escaneo y listo. La fila avanza y nadie se va.</p>
              </article>
              <article className="card benefit reveal d3">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18M7 15l4-4 3 3 6-6" />
                  </svg>
                </span>
                <h3>Reportes de lo que más se vende</h3>
                <p>Sabes qué días y qué platos funcionan mejor.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 8. PROTOTIPO */}
        <section className="section proto" id="prototipo">
          <div className="container">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11V5a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.6-1.5L9 14" />
                  </svg>
                </i>
                Prototipo interactivo
              </span>
              <h2 className="h2 reveal d1">
                Toca, explora y <span className="pill">prueba</span> Bocadoo
              </h2>
              <p className="lead reveal d2">Navega la app como si la tuvieras en la mano.</p>
            </div>

            <div className="proto-grid">
              <div className="proto-side left reveal">
                <div className="tabs" role="tablist" aria-label="Elegir vista del prototipo">
                  <button
                    className="tab"
                    role="tab"
                    aria-selected={view === "dueno"}
                    data-view="dueno"
                    onClick={() => selectView("dueno")}
                  >
                    <span className="ic">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" />
                      </svg>
                    </span>
                    <span>
                      Ver como dueño<small>Escanea y gestiona</small>
                    </span>
                  </button>
                  <button
                    className="tab"
                    role="tab"
                    aria-selected={view === "comensal"}
                    data-view="comensal"
                    onClick={() => selectView("comensal")}
                  >
                    <span className="ic">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                    </span>
                    <span>
                      Ver como comensal<small>Tu plan y tu QR</small>
                    </span>
                  </button>
                </div>
                <p className="proto-note">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                  </svg>
                  Es un prototipo: los datos son de ejemplo.
                </p>
                <Link to="/flujos" className="btn btn-secondary">
                  Ver todos los flujos
                </Link>
              </div>

              <div className="device reveal d1">
                <div className="device-screen">
                  <div className="island"></div>
                  {/* Cada cambio de pestaña monta un iframe nuevo en la pantalla principal del rol */}
                  <iframe
                    key={frameKey}
                    src={`/app/${view}?embed=1`}
                    title="Prototipo Bocadoo"
                    loading="lazy"
                    allow="camera"
                  ></iframe>
                </div>
              </div>

              <div className="proto-side right reveal d2">
                <div className="tip">
                  <b>1. Elige una vista</b>
                  <p>Dueño para escanear, comensal para ver tu plan.</p>
                </div>
                <div className="tip">
                  <b>2. Toca todo</b>
                  <p>Botones, pestañas y el QR funcionan como en la app.</p>
                </div>
                <div className="tip">
                  <b>3. Cuéntanos qué piensas</b>
                  <p>Tu opinión nos ayuda a mejorar Bocadoo.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. MODELO DE INGRESOS */}
        <section className="section revenue" id="precios">
          <div className="container">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </i>
                Cómo ganamos
              </span>
              <h2 className="h2 reveal d1">
                Gratis para el pequeño. <span className="hl">Ganamos cuando tú ganas.</span>
              </h2>
              <p className="lead reveal d2">
                Publicar es gratis. Solo cobramos un porcentaje cuando un comensal canjea una oferta
                y la validas con el QR.
              </p>
            </div>
            <div className="grid-4">
              <article className="card benefit phase now reveal">
                <div className="phase-top">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" />
                    </svg>
                  </span>
                  <span className="phase-n">Hoy</span>
                </div>
                <div className="phase-price">$0</div>
                <h3>Restaurantes pequeños</h3>
                <p>Gratis para ti y tus comensales mientras validamos.</p>
              </article>
              <article className="card benefit phase reveal d1">
                <div className="phase-top">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                    </svg>
                  </span>
                  <span className="phase-n">Al canjear</span>
                </div>
                <div className="phase-price">
                  5–10 % <small>del precio de la oferta</small>
                </div>
                <h3>Pago por resultado</h3>
                <p>Solo cuando se canjea y validas con el QR. Si no llegan clientes, no pagas.</p>
              </article>
              <article className="card benefit phase reveal d2">
                <div className="phase-top">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18M7 15l4-4 3 3 6-6" />
                    </svg>
                  </span>
                  <span className="phase-n">Siempre</span>
                </div>
                <div className="phase-price">
                  $0 <small>de mensualidad</small>
                </div>
                <h3>Sin suscripción</h3>
                <p>Aplica a platos, ofertas flash y planes en promoción.</p>
              </article>
              <article className="card benefit phase reveal d3">
                <div className="phase-top">
                  <span className="ic">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="6" width="18" height="14" rx="3" />
                      <path d="M3 10h18M16 15h2" />
                    </svg>
                  </span>
                  <span className="phase-n">Futuro</span>
                </div>
                <div className="phase-price">
                  % <small>por pago en la app</small>
                </div>
                <h3>Wallet de alimentación</h3>
                <p>Pagas tu comida desde Bocadoo, como en las apps de pago.</p>
              </article>
            </div>
            <p className="phase-note reveal">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              Cifras referenciales, en validación con dueños de restaurantes.
            </p>
          </div>
        </section>

        {/* 10. CTA FINAL */}
        <section className="section cta" id="contacto">
          <div className="container cta-inner">
            <div className="section-head">
              <span className="badge reveal">
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5L5.5 21l2-7.5L2 9h7z" />
                  </svg>
                </i>
                Cupos limitados
              </span>
              <h2 className="h2 reveal d1">
                Digitaliza tus planes de almuerzo <span className="hl">este mes</span>
              </h2>
              <p className="lead reveal d2">
                Estamos buscando los primeros restaurantes en Quito. Gratis para publicar: Bocadoo
                cobra un porcentaje solo cuando se canjea la oferta.
              </p>
            </div>
            <form
              className={sent ? "form reveal d1 in sent" : "form reveal d1"}
              id="leadForm"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="fields">
                <div className="field">
                  <label htmlFor="f-nombre">Tu nombre</label>
                  <input
                    id="f-nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    placeholder="Ej. María Torres"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-rest">Nombre del restaurante</label>
                  <input
                    id="f-rest"
                    name="restaurante"
                    type="text"
                    placeholder="Ej. Sazón de Casa"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-wa">WhatsApp</label>
                  <input
                    id="f-wa"
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="09X XXX XXXX"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Quiero ser de los primeros
                </button>
                <small className="legal">Solo te escribiremos para hablar de Bocadoo.</small>
              </div>
              <div className="thanks" role="status" aria-live="polite">
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </span>
                <h3>¡Gracias! Te escribimos pronto.</h3>
                <p>Revisa tu WhatsApp en los próximos días.</p>
                {waUrl && (
                  <a
                    className="btn btn-secondary"
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: "16px" }}
                  >
                    Confirmar por WhatsApp
                  </a>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* 11. FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-top">
            <div>
              <a href="#inicio" className="logo">
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8.5" style={{ fill: "var(--hero-2)" }} />
                    <circle cx="12" cy="12" r="5" style={{ fill: "var(--image-foreground)" }} />
                    <path
                      d="M17.5 4.2a3 3 0 0 1 2.4 2.4 1.5 1.5 0 0 1-2.9.6 1.5 1.5 0 0 1 .5-3z"
                      style={{ fill: "var(--footer-accent)" }}
                    />
                  </svg>
                </span>
                Bocadoo
              </a>
              <p className="foot-tag">Tu almuerzo, sin cartulinas.</p>
            </div>
            <div className="foot-links">
              <div>
                <h4>Producto</h4>
                <ul>
                  <li>
                    <a href="#como-funciona">Cómo funciona</a>
                  </li>
                  <li>
                    <a href="#prototipo">Prototipo</a>
                  </li>
                  <li>
                    <a href="#precios">Precios</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Para ti</h4>
                <ul>
                  <li>
                    <a href="#restaurantes">Restaurantes</a>
                  </li>
                  <li>
                    <a href="#comensales">Comensales</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Contacto</h4>
                <ul>
                  <li>
                    <a href="#contacto">Quiero ser de los primeros</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="foot-bot">
            <span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              Hecho en Quito, Ecuador
            </span>
            <span>© 2026 Bocadoo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
