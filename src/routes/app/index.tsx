import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginScreen, type AuthRole, type AuthView } from "@/components/bocadoo/auth";
import { AppShell } from "@/components/bocadoo/ui";

const searchSchema = z.object({
  role: z.enum(["diner", "owner"]).optional(),
  view: z
    .enum(["login", "register-diner", "register-owner", "onboarding-diner", "onboarding-owner"])
    .optional(),
});

export const Route = createFileRoute("/app/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Bocadoo — Tu almuerzo, sin cartulinas" },
      {
        name: "description",
        content: "Inicia sesión o regístrate como comensal o como dueño de restaurante en Bocadoo.",
      },
      { property: "og:title", content: "Bocadoo" },
      { property: "og:description", content: "Planes de almuerzo prepagados en Quito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { role, view } = Route.useSearch();
  return (
    <AppShell>
      <LoginScreen
        initialRole={role as AuthRole | undefined}
        initialView={view as AuthView | undefined}
      />
    </AppShell>
  );
}
