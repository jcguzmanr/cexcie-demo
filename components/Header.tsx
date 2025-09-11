"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import institutionsData from "@/data/institutions.json";

type Institution = {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const institutions = (institutionsData as { institutions: Institution[] }).institutions;

  // Detect current unit from first path segment
  const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
  const knownUnitIds = new Set(institutions.map((i) => i.id));
  const currentUnit = knownUnitIds.has(firstSegment) ? firstSegment : "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const targetUnit = e.target.value;
    if (!targetUnit) {
      router.push("/");
      return;
    }
    // Preserve context only for UC (where routes existen actualmente). Para otras unidades, ir al root de la unidad
    if (targetUnit === "uc") {
      const segments = pathname.split("/").filter(Boolean);
      const rest = currentUnit ? segments.slice(1) : segments;
      const restPath = rest.length ? `/${rest.join("/")}` : "";
      router.push(`/${targetUnit}${restPath}`);
    } else {
      router.push(`/${targetUnit}`);
    }
  }

  return (
    <div className="w-full flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide">
        <span className="inline-block rounded bg-white text-black px-2 py-0.5 text-sm">CExCIE</span>
      </Link>
      <div className="flex items-center gap-2">
        <label htmlFor="unit-select" className="text-sm text-foreground/70">Unidad:</label>
        <select
          id="unit-select"
          onChange={handleChange}
          value={currentUnit}
          className="bg-transparent border rounded px-2 py-1 text-sm"
        >
          <option value="">Selecciona...</option>
          {institutions
            .filter((i) => i.id !== "cie")
            .map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}


