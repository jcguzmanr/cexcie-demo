import { ReactNode } from "react";
import { cx } from "@/lib/ui";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

export function Card({ children, onClick, selected, className }: Props) {
  return (
    <div
      role={onClick ? "button" : undefined}
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        selected && "ring-2 ring-black",
        className
      )}
    >
      {children}
    </div>
  );
}

