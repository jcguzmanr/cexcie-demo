"use client";
import { Card } from "@/components/Card";
import { DataEmpty } from "@/components/DataEmpty";
import { Modal } from "@/components/Modal";
// import { Button } from "@/components/Button";
// import { ListItem } from "@/components/ListItem";
import { useState } from "react";
import { useAppStore, getFacultadList } from "@/store";
import Link from "next/link";
import Image from "next/image";

export default function FacultadesPage() {
  const modalidad = useAppStore((s) => s.selectedModalidad);
  const facultades = useAppStore((s) => getFacultadList(s));
  const carreras = useAppStore((s) => s.carreraById);
  const selectedCarreras = useAppStore((s) => s.selectedCarreras);
  const { toggleCarrera } = useAppStore((s) => s.actions);

  const [open, setOpen] = useState<string | null>(null);

  const filtered = facultades
    .filter((f) => (modalidad ? f.modalidades.includes(modalidad) : true))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-xl font-semibold">Facultades</h1>
      {!modalidad ? (
        <>
          <DataEmpty title="Selecciona una modalidad" cta={<Link className="underline" href="/modalidad">Ir a modalidad</Link>} />
          <div className="flex justify-end mt-2">
            <Link href="/carreras" className="">
              <span className="inline-flex items-center justify-center px-4 py-3 rounded-xl border bg-white">Saltar sin datos</span>
            </Link>
          </div>
        </>
      ) : filtered.length === 0 ? (
        <DataEmpty
          title="No hay facultades."
          cta={<div className="text-sm opacity-80">Usa window.cexcieIngest(&apos;/facultades&apos;, json)</div>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {filtered.map((f) => (
            <Card key={f.id} onClick={() => setOpen(f.id)}>
              <div className="text-lg font-medium">{f.nombre}</div>
              <div className="text-sm opacity-70 mt-1">Modalidades: {f.modalidades.join(", ")}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm opacity-70">Seleccionadas: {selectedCarreras.length}/3</div>
        <Link href="/comparador" className={selectedCarreras.length < 2 ? "pointer-events-none opacity-50" : undefined}>
          <span className="inline-flex items-center justify-center px-4 py-3 rounded-xl border bg-black text-white">Comparar ({selectedCarreras.length}/3)</span>
        </Link>
      </div>

      {filtered.map((f) => (
        <Modal
          key={f.id}
          open={open === f.id}
          onClose={() => setOpen(null)}
          title={`Carreras: ${f.nombre}`}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm opacity-70">Toca para seleccionar (hasta 3). Con 1 activo, puedes ver la carrera.</div>
              <div className="flex gap-3">
                <Link href={selectedCarreras.length === 1 ? `/carrera/${selectedCarreras[0].id}` : "#"} className={selectedCarreras.length !== 1 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-4 py-2 rounded-full border bg-[var(--uc-sky)] text-black">Ver carrera</span>
                </Link>
                <Link href="/comparador" className={selectedCarreras.length < 2 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-4 py-2 rounded-full border bg-[var(--uc-purple)] text-white">Comparar ({selectedCarreras.length}/3)</span>
                </Link>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(carreras)
              .filter((c) => c.facultadId === f.id && (!modalidad || c.modalidades.includes(modalidad)))
              .map((c) => {
                const isChecked = selectedCarreras.some((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCarrera(c)}
                    className={`flex items-center gap-3 text-left rounded-full px-4 py-3 border ${isChecked ? "bg-[var(--uc-purple)] text-white" : "bg-white hover:bg-[var(--uc-lilac)]/10"}`}
                  >
                    {c.imagen && (
                      <span className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <Image src={c.imagen} alt="" width={32} height={32} className="object-cover w-full h-full" />
                      </span>
                    )}
                    <span className="font-medium leading-tight">{c.nombre}</span>
                  </button>
                );
              })}
            {Object.values(carreras).filter((c) => c.facultadId === f.id).length === 0 && (
              <div className="p-4 text-sm opacity-70">Sin carreras para esta facultad.</div>
            )}
          </div>
        </Modal>
      ))}
    </div>
  );
}

