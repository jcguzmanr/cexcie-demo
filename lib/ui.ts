import { clsx } from "clsx";

export function cx(...args: Parameters<typeof clsx>) {
  return clsx(...args);
}

export const HIT_MIN = "min-h-[44px] min-w-[44px]";

