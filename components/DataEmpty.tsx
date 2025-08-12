import { ReactNode } from "react";

export function DataEmpty({ title, cta }: { title: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 p-12 border rounded-2xl bg-gray-50">
      <div className="text-lg font-medium">{title}</div>
      {cta}
    </div>
  );
}

