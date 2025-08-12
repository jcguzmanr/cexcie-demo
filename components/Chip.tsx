"use client";
import { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/ui";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({ selected, className, ...props }: Props) {
  return (
    <button
      className={cx(
        "px-3 py-2 rounded-full border text-sm",
        selected
          ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)]"
          : "bg-[var(--surface)] hover:bg-[var(--uc-lilac)]/10 border-[var(--border)] text-[var(--foreground)]",
        className
      )}
      aria-pressed={!!selected}
      {...props}
    />
  );
}

