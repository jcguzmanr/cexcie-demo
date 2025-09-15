"use client";
import { useAppStore, getFacultadList } from "@/store";
import { Chip } from "@/components/Chip";
import { Modal } from "@/components/Modal";
import Link from "next/link";
import React from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { motion } from "framer-motion";
import { ModalidadOverview } from "@/components/ModalidadOverview";



export default function CarrerasPage() {
  const campusSel = useAppStore((s) => s.selectedCampus);
  const modalidad = useAppStore((s) => s.selectedModalidad ?? "presencial");
  const setModalidad = useAppStore((s) => s.actions.setModalidad);
  const facultades = useAppStore((s) => getFacultadList(s));
  const carrerasMap = useAppStore((s) => s.carreraById);
  const carrerasFiltradas = Object.values(carrerasMap).filter((c) => {
    const byModalidad = c.modalidades.includes(modalidad as typeof modalidad);
    const byCampus = !campusSel || c.campus.includes(campusSel.id);
    return byModalidad && byCampus;
  });
  if (typeof window !== 'undefined') {
    // Debug en consola para validar conteos
    // eslint-disable-next-line no-console
    console.log('[CARRERAS]', {
      campusSel: campusSel?.id,
      modalidad,
      totalCarreras: Object.keys(carrerasMap).length,
      filtradas: carrerasFiltradas.length,
      facultades: facultades.length,
    });
  }
  const facultadIdsDisponibles = new Set(carrerasFiltradas.map((c) => c.facultadId));
  const filtered = facultades.filter((f) => facultadIdsDisponibles.has(f.id));
  // carrerasMap ya definido arriba
  const selectedCarreras = useAppStore((s) => s.selectedCarreras);
  const { toggleCarrera, clearComparador } = useAppStore((s) => s.actions);
  const [open, setOpen] = React.useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3); // 3 posiciones para mostrar 3 elementos por vez
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.04 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <motion.div className="p-6 grid gap-6" variants={containerVariants} initial="hidden" animate="show">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Campus", href: "/campus" }, { label: "Carreras" }]} />
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold">Explora nuestras carreras</h1>
        {campusSel && (
          <div className="text-sm opacity-70 mt-1">Campus: <span className="font-medium">{campusSel.nombre}</span></div>
        )}
        <p className="text-sm opacity-80 mt-2">Selecciona una modalidad de estudios para ver las facultades disponibles</p>
      </motion.div>

      <motion.div className="flex gap-3 flex-wrap" variants={itemVariants}>
        {(["presencial", "semipresencial", "distancia"] as const).map((m) => (
          <motion.div key={m} variants={itemVariants}>
            <Chip selected={modalidad === m} onClick={() => setModalidad(m)}>
              MODALIDAD {m.toUpperCase()}
            </Chip>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="space-y-8" variants={itemVariants}>
        <ModalidadOverview modalidad={modalidad as typeof modalidad} />

        {/* Listado de facultades */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
          {filtered.map((f) => (
            <motion.button
              key={f.id}
              variants={itemVariants}
              onClick={() => {
                clearComparador();
                setOpen(f.id);
              }}
              className="w-full text-center px-6 py-8 rounded-2xl border border-[var(--border)] hover:bg-[var(--uc-purple)] bg-[var(--surface)] text-[var(--foreground)] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 group"
            >
              <div className="font-semibold text-lg leading-tight mb-2">{f.nombre}</div>
              <div className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                Ver carreras disponibles
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {filtered.map((f) => (
        <Modal
          key={f.id}
          open={open === f.id}
          onClose={() => setOpen(null)}
          title={`Carreras de ${f.nombre}`}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {selectedCarreras.length > 0 && (
                  <button
                    onClick={() => clearComparador()}
                    className="inline-flex px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 font-medium text-sm transition-colors"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link href={selectedCarreras.length === 1 ? `/carrera/${selectedCarreras[0].id}` : "#"} className={selectedCarreras.length !== 1 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-6 py-3 rounded-full border bg-[var(--uc-sky)] text-black font-medium">Ver detalles</span>
                </Link>
                <Link href="/comparador" className={selectedCarreras.length < 2 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-6 py-3 rounded-full border bg-[var(--uc-purple)] text-white font-medium">Comparar carreras ({selectedCarreras.length}/3)</span>
                </Link>
              </div>
            </div>
          }
        >
          <div className="mb-6">
            <div className="text-left text-base opacity-80 mb-6 font-medium">
              Selecciona las carreras que te interesan (máximo 3). Con una seleccionada puedes ver los detalles, con dos o más puedes compararlas.
            </div>
          </div>
          
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" variants={containerVariants} initial="hidden" animate="show">
            {Object.values(carrerasMap)
              .filter((c) => c.facultadId === f.id && c.modalidades.includes(modalidad as typeof modalidad) && (!campusSel || c.campus.includes(campusSel.id)))
              .map((c) => {
                const isChecked = selectedCarreras.some((s) => s.id === c.id);
                return (
                  <motion.button
                    key={c.id}
                    variants={itemVariants}
                    onClick={() => toggleCarrera(c)}
                    className={`w-full text-center px-4 py-6 sm:px-6 sm:py-8 rounded-2xl border transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${
                      isChecked 
                        ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)] shadow-lg" 
                        : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 border-[var(--border)]"
                    }`}
                  >
                    <div className="font-semibold text-base sm:text-lg leading-tight">{c.nombre}</div>
                  </motion.button>
                );
              })}
            {Object.values(carrerasMap).filter((c) => c.facultadId === f.id).length === 0 && (
              <div className="col-span-2 p-8 text-center text-sm opacity-70">Sin carreras para esta facultad.</div>
            )}
          </motion.div>
        </Modal>
      ))}
    </motion.div>
  );
}

