import type { ComponentState } from "@/design-system";

export type { ComponentState };

export interface ComensalBaseProps {
  state?: ComponentState | undefined;
  className?: string | undefined;
}
