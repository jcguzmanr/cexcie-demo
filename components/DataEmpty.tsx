import { ReactNode } from "react";

export function DataEmpty({ title, cta }: { title: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 p-12 border rounded-2xl bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]">
      <div className="text-lg font-medium">{title}</div>
      {cta}
    </div>
  );
}

