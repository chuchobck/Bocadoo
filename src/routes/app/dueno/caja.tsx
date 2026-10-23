import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/dueno/caja")({
  beforeLoad: () => {
    throw redirect({ to: "/app/dueno" });
  },
});
