import { cx } from "@/lib/ui";
import Link from "next/link";

const steps = [
  { path: "/", label: "Inicio" },
  { path: "/campus", label: "Campus" },
  { path: "/carreras", label: "Carreras" },
  { path: "/comparador", label: "Comparador" },
  // { path: "/enviar", label: "Envío" }, // removido: flujo ahora se cierra en modal del comparador
];

function indexFor(path: string) {
  // Normaliza rutas que conceptualmente pertenecen a "Carreras"
  if (
    path === "/modalidad" ||
    path.startsWith("/facultades") ||
    path.startsWith("/carrera/")
  ) {
    path = "/carreras";
  }
  const i = steps.findIndex((s) => path === s.path || path.startsWith(s.path + "/"));
  return i < 0 ? 0 : i;
}

export function Progress({ currentPath }: { currentPath: string }) {
  const currentIndex = indexFor(currentPath);
  return (
    <div className="w-full">
      <div className="max-w-[1024px] mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.path} className="flex items-center gap-2">
            <Link href={s.path} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 rounded-full">
              <div
                className={cx(
                  "px-3 py-1 rounded-full text-sm border",
                  i <= currentIndex
                    ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)]"
                    : "bg-white hover:bg-[var(--uc-lilac)]/10 border-black/10"
                )}
                aria-current={i === currentIndex ? "step" : undefined}
              >
                {s.label}
              </div>
            </Link>
            {i < steps.length - 1 && <div className="w-8 h-[2px] bg-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

