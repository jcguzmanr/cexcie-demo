"use client";
import { ReactNode, useEffect } from "react";
import { cx, HIT_MIN } from "@/lib/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, subtitle, children, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-stretch md:items-center justify-center p-4" onClick={(e)=>e.stopPropagation()}>
        <div className="w-full max-w-5xl h-[90vh] md:h-auto rounded-2xl bg-[var(--surface)] text-[var(--foreground)] shadow-xl border border-[var(--border)] flex flex-col">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-3 sticky top-0 bg-[var(--surface)] z-10">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              {subtitle && <p className="text-sm opacity-70 mt-0.5">{subtitle}</p>}
            </div>
            <button aria-label="Cerrar" className={cx(HIT_MIN, "p-2 -m-2")} onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="p-4 overflow-auto flex-1">{children}</div>
          {footer && <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] sticky bottom-0">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

