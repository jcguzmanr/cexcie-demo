"use client";
import { Chip } from "@/components/Chip";
import { DataEmpty } from "@/components/DataEmpty";
import { useAppStore } from "@/store";
import Link from "next/link";

const MODS = ["presencial", "semipresencial", "distancia"] as const;

export default function ModalidadPage() {
  const campus = useAppStore((s) => s.selectedCampus);
  const selected = useAppStore((s) => s.selectedModalidad);
  const { setModalidad } = useAppStore((s) => s.actions);
  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-xl font-semibold">Selecciona modalidad</h1>
      {!campus ? (
        <>
          <DataEmpty title="Selecciona un campus primero" cta={<Link className="underline" href="/campus">Ir a campus</Link>} />
          <div className="flex justify-end">
            <Link href="/facultades" className="">
              <span className="inline-flex items-center justify-center px-4 py-3 rounded-xl border bg-white">Saltar sin datos</span>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {MODS.map((m) => (
            <Chip key={m} selected={selected === m} onClick={() => setModalidad(m)}>
              {m}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Link href="/facultades" className={!selected ? "pointer-events-none opacity-50" : undefined}>
          <span className="inline-flex items-center justify-center px-4 py-3 rounded-xl border bg-black text-white">Continuar</span>
        </Link>
      </div>
    </div>
  );
}

