"use client";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store";
import { Card } from "@/components/Card";
import Link from "next/link";

export default function CarrerasPorCampusPage() {
  const params = useParams<{ slug: string }>();
  const campus = params.slug;
  const carreras = useAppStore((s) => Object.values(s.carreraById).filter((c) => c.campus.includes(campus)));
  if (carreras.length === 0) {
    return (
      <div className="p-6">
        No hay carreras para este campus. Inyecta con window.cexcieIngest(&apos;/carreras&apos;, json)
      </div>
    );
  }
  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-xl font-semibold">Carreras en {campus}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carreras.map((c) => (
          <Link key={c.id} href={`/carrera/${c.id}`}>
            <Card>
              <div className="font-medium">{c.nombre}</div>
              <div className="text-sm opacity-70">Facultad: {c.facultadId}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

