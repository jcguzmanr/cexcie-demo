"use client";
import { useEffect, useState } from "react";
import { cx, HIT_MIN } from "@/lib/ui";

const STORAGE_KEY = "cexcie-theme"; // "light" | "dark"

function getInitialTheme(): "light" | "dark" | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // undefined = follow system
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  return media.matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(undefined);

  // Initialize from storage/system
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
  }, []);

  // Reflect to document and persist
  useEffect(() => {
    if (typeof document === "undefined" || theme === undefined) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  if (theme === undefined) {
    return (
      <button aria-label="Cargando tema" className={`${HIT_MIN} w-[60px] h-[32px] rounded-full border opacity-60`} />
    );
  }

  const isDark = theme === "dark";

  // Toggle estilo switch con iconos 🌞 / 🌙
  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cx(
        HIT_MIN,
        "relative inline-flex items-center justify-between gap-2 w-[74px] h-[36px] rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 transition-colors",
      )}
    >
      <span aria-hidden className="text-base">🌞</span>
      <span aria-hidden className="text-base">🌙</span>
      <span
        aria-hidden
        className={cx(
          "absolute top-1 left-1 w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm transition-transform",
          isDark ? "translate-x-[36px]" : "translate-x-0"
        )}
      />
    </button>
  );
}


