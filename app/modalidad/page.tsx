"use client";
import { Chip } from "@/components/Chip";
import { DataEmpty } from "@/components/DataEmpty";
import { ModalidadTags } from "@/components/ModalidadTags";
import { ModalidadCaracteristicas } from "@/components/ModalidadCaracteristicas";
import { useAppStore } from "@/store";
import Link from "next/link";
import modalidadesData from "@/data/modalidades.json";

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
        <div className="space-y-6">
          {/* Botones de modalidad */}
          <div className="flex gap-3 flex-wrap">
            {MODS.map((m) => (
              <Chip key={m} selected={selected === m} onClick={() => setModalidad(m)}>
                {m}
              </Chip>
            ))}
          </div>
          
          {/* Información detallada de la modalidad seleccionada */}
          {selected && (() => {
            const modalidadInfo = modalidadesData.find(m => m.id === selected);
            return modalidadInfo ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface),transparent_40%)] p-6">
                <div className="text-[var(--uc-purple)] font-semibold text-lg mb-4">
                  {modalidadInfo.nombre}
                </div>
                
                <p className="opacity-80 mb-6 text-[var(--foreground)]">
                  {modalidadInfo.descripcion}
                </p>
                
                {/* Nueva sección con texto conectivo y botón */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-[var(--foreground)]">¿Te interesa esta modalidad?</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[var(--foreground)] opacity-90 mb-2">
                        Conoce más detalles sobre esta modalidad y descubre si es la opción ideal para tu formación académica
                      </p>
                    </div>
                    <button className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--uc-purple)] text-white font-medium hover:bg-[var(--uc-purple)]/90 transition-all duration-200">
                      Ver más
                    </button>
                  </div>
                </div>
                
                {/* Características detalladas */}
                <div>
                  <h3 className="font-semibold mb-3 text-[var(--foreground)]">Información Detallada</h3>
                  <ModalidadCaracteristicas caracteristicas={modalidadInfo.caracteristicas} />
                </div>
              </div>
            ) : null;
          })()}
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

