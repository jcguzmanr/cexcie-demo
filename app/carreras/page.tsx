"use client";
import { useAppStore, getFacultadList } from "@/store";
import { Chip } from "@/components/Chip";
import { Modal } from "@/components/Modal";
import Link from "next/link";
import React from "react";
import { Breadcrumb } from "@/components/Breadcrumb";

const DESCS: Record<string, string> = {
  presencial:
    "Sumérgete en un entorno moderno, cuidadosamente elaborado para que vivas una experiencia educativa excepcional.",
  semipresencial:
    "Te ofrecemos una educación que se adapta a tu ritmo de vida, donde la flexibilidad es la clave.",
  distancia:
    "Nuestra modalidad a distancia se adapta a tus necesidades y derriba los límites de tiempo y espacio.",
};

export default function CarrerasPage() {
  const campusSel = useAppStore((s) => s.selectedCampus);
  const modalidad = useAppStore((s) => s.selectedModalidad ?? "presencial");
  const setModalidad = useAppStore((s) => s.actions.setModalidad);
  const facultades = useAppStore((s) => getFacultadList(s));
  const filtered = facultades.filter((f) => f.modalidades.includes(modalidad as typeof modalidad));
  const carrerasMap = useAppStore((s) => s.carreraById);
  const selectedCarreras = useAppStore((s) => s.selectedCarreras);
  const { toggleCarrera, clearComparador } = useAppStore((s) => s.actions);
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <div className="p-6 grid gap-6">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Campus", href: "/campus" }, { label: "Carreras" }]} />
      <div>
        <h1 className="text-2xl font-semibold">Conoce nuestras carreras</h1>
        {campusSel && (
          <div className="text-sm opacity-70 mt-1">Campus seleccionado: <span className="font-medium">{campusSel.nombre}</span></div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {(["presencial", "semipresencial", "distancia"] as const).map((m) => (
          <Chip key={m} selected={modalidad === m} onClick={() => setModalidad(m)}>
            MODALIDAD {m.toUpperCase()}
          </Chip>
        ))}
      </div>

      <div className="rounded-3xl border bg-white/60 p-6">
        <div className="text-[var(--uc-purple)] font-semibold mb-2">MODALIDAD {String(modalidad).toUpperCase()}</div>
        <p className="opacity-80 mb-4 max-w-3xl">{DESCS[modalidad as keyof typeof DESCS]}</p>

        <div className="rounded-2xl overflow-hidden border divide-y">
          {filtered.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                clearComparador();
                setOpen(f.id);
              }}
              className="w-full text-left px-4 py-4 hover:bg-[var(--uc-lilac)]/10"
            >
              {f.nombre}
            </button>
          ))}
        </div>
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
                  <span className="inline-flex px-4 py-2 rounded-full border bg-white">Ver carrera</span>
                </Link>
                <Link href="/comparador" className={selectedCarreras.length < 2 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-4 py-2 rounded-full border bg-[var(--uc-purple)] text-white">Comparar ({selectedCarreras.length}/3)</span>
                </Link>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(carrerasMap)
              .filter((c) => c.facultadId === f.id && c.modalidades.includes(modalidad as typeof modalidad))
              .map((c) => {
                const isChecked = selectedCarreras.some((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCarrera(c)}
                    className={`flex items-center gap-3 text-left rounded-full px-4 py-3 border ${isChecked ? "bg-[var(--uc-purple)] text-white" : "bg-white hover:bg-[var(--uc-lilac)]/10"}`}
                  >
                    {/* Imagen desactivada en el listado */}
                    <span className="font-medium leading-tight">{c.nombre}</span>
                  </button>
                );
              })}
            {Object.values(carrerasMap).filter((c) => c.facultadId === f.id).length === 0 && (
              <div className="p-4 text-sm opacity-70">Sin carreras para esta facultad.</div>
            )}
          </div>
        </Modal>
      ))}
    </div>
  );
}

