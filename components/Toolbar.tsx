import Link from "next/link";
import { cx } from "@/lib/ui";

type Crumb = { href: string; label: string };

export function Toolbar({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Progreso" className="flex items-center gap-2 p-2 overflow-x-auto">
      {crumbs.map((c, idx) => (
        <div key={c.href} className="flex items-center gap-2 whitespace-nowrap">
          <Link className={cx("text-sm underline-offset-4 hover:underline") } href={c.href}>{c.label}</Link>
          {idx < crumbs.length - 1 && <span aria-hidden>→</span>}
        </div>
      ))}
    </nav>
  );
}

