import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BocadooProvider } from "@/components/bocadoo/store";
import { Toaster } from "@/components/ui/sonner";
import { DevPanel } from "@/dev/DevPanel";
import { useTheme } from "@/hooks/use-theme";
import { THEME_SCRIPT } from "@/lib/theme";

function NotFoundComponent() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/app") {
      router.navigate({ to: "/app" as any, replace: true });
    } else if (pathname === "/app/dueno/caja" || pathname === "/caja") {
      router.navigate({ to: "/app/dueno", replace: true });
    } else if (pathname === "/dueno") {
      router.navigate({ to: "/app/dueno", replace: true });
    } else if (pathname === "/comensal") {
      router.navigate({ to: "/app/comensal", replace: true });
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/app/dueno"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir a Panel Dueño
          </Link>
          <Link
            to="/app/comensal"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
          >
            Ir a Comensal
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-accent"
          >
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light dark" },
      { title: "Bocadoo · Tus planes de almuerzo, con QR" },
      {
        name: "description",
        content:
          "Bocadoo digitaliza los planes de almuerzo prepagados de los restaurantes en Quito. Valida cada almuerzo con un QR en segundos.",
      },
      { name: "author", content: "Bocadoo" },
      { property: "og:title", content: "Bocadoo" },
      {
        property: "og:description",
        content:
          "Bocadoo digitaliza los planes de almuerzo prepagados de los restaurantes en Quito. Valida cada almuerzo con un QR en segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Marca <html class="embedded"> cuando el prototipo corre dentro de un iframe (la landing)
 * o con ?embed=1. Va inline en el <head> para que el marco no alcance a pintarse.
 */
const EMBED_SCRIPT =
  "try{if(window.self!==window.top||/[?&]embed=1(&|$)/.test(location.search))document.documentElement.classList.add('embedded')}catch(e){document.documentElement.classList.add('embedded')}";

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EMBED_SCRIPT }} />
        {/* Fija <html class="dark"> antes del primer render para que no haya parpadeo. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Mantiene escuchando los cambios de tema en toda la app: así también el prototipo embebido
  // en la landing (iframe) sigue los cambios de tema hechos en la página padre.
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <BocadooProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-center" />
        <DevPanel />
      </BocadooProvider>
    </QueryClientProvider>
  );
}
