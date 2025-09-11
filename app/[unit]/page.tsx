import Link from "next/link";
import institutionsData from "@/data/institutions.json";

type Params = { unit: string };

export default async function UnitPlaceholder({ params }: { params: Promise<Params> }) {
  const { unit } = await params;
  const known = new Set((institutionsData as { institutions: { id: string }[] }).institutions.map(i => i.id));
  // Si es UC, redirigir a /uc (para evitar duplicidad)
  if (unit === "uc") {
    return (
      <div className="p-6">
        <div className="text-sm opacity-70">Redireccionando…</div>
        <meta httpEquiv="refresh" content="0; url=/uc" />
      </div>
    );
  }
  // Si no es una unidad conocida, 404 suave
  if (!known.has(unit)) {
    return (
      <div className="p-6">
        <div className="text-xl font-semibold mb-2">Unidad no encontrada</div>
        <p className="opacity-70 mb-4">La unidad &quot;{unit}&quot; no existe en el catálogo.</p>
        <Link href="/" className="underline">Volver al inicio</Link>
      </div>
    );
  }
  return (
    <div className="p-6 grid gap-4 max-w-2xl">
      <div>
        <div className="text-sm opacity-70">Work in progress</div>
        <h1 className="text-2xl font-semibold">{unit.toUpperCase()}</h1>
      </div>
      <p className="opacity-80">
        Esta unidad aún no tiene implementada su experiencia. Estamos trabajando para habilitarla. Por ahora, puedes explorar la demo completa en la unidad UC.
      </p>
      <div>
        <Link href="/uc" className="inline-flex items-center justify-center px-4 py-3 rounded-xl border bg-black text-white">Ir a UC</Link>
      </div>
    </div>
  );
}


