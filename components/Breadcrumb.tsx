import Link from "next/link";
import { cx } from "@/lib/ui";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const last = items.length - 1;
  return (
    <nav aria-label="breadcrumb" className="text-sm mb-2">
      <ol className="flex flex-wrap items-center gap-2" style={{ color: "var(--muted)" }}>
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {it.href && idx !== last ? (
              <Link href={it.href} className={cx("hover:underline underline-offset-4")}> 
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--foreground)]">{it.label}</span>
            )}
            {idx !== last && <span aria-hidden>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

