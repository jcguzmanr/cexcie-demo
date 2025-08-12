import { ReactNode } from "react";
import { cx } from "@/lib/ui";

type Props = {
  title: string;
  subtitle?: string;
  end?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

export function ListItem({ title, subtitle, end, selected, onClick }: Props) {
  return (
    <div
      role={onClick ? "button" : undefined}
      aria-selected={selected}
      onClick={onClick}
      className={cx(
        "flex items-center justify-between gap-3 p-4 border-b",
        onClick && "cursor-pointer hover:bg-gray-50",
        selected && "bg-gray-100"
      )}
    >
      <div>
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-sm opacity-70">{subtitle}</div>}
      </div>
      {end}
    </div>
  );
}

