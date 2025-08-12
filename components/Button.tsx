"use client";
import { ButtonHTMLAttributes } from "react";
import { cx, HIT_MIN } from "@/lib/ui";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  shape = "rounded",
  ...props
}: Props) {
  const base = "rounded-xl font-medium select-none active:scale-[0.99] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--uc-purple)]/40";
  const variants = {
    primary: "bg-[var(--uc-purple)] text-white hover:brightness-110",
    secondary: "bg-[var(--uc-sky)] text-black hover:brightness-95",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10",
  } as const;
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  } as const;
  const shapes = {
    rounded: "rounded-xl",
    pill: "rounded-full",
  } as const;
  return (
    <button
      className={cx(base, variants[variant], sizes[size], shapes[shape], HIT_MIN, className)}
      {...props}
    />
  );
}

