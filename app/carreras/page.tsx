"use client";
import { useAppStore, getFacultadList } from "@/store";
import { Chip } from "@/components/Chip";
import { Modal } from "@/components/Modal";
import Link from "next/link";
import React from "react";
import { Breadcrumb } from "@/components/Breadcrumb";



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
  const [showInfoModal, setShowInfoModal] = React.useState(false);

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

      <div className="space-y-8">

        {/* Banner de información adicional */}
        <div className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface),transparent_20%)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[var(--uc-purple)] font-semibold mb-2">¿QUIERES CONOCER MÁS?</div>
              <div className="text-[var(--foreground)] opacity-80 leading-relaxed">
                <p className="text-lg font-medium mb-1">Descubre todo sobre esta carrera</p>
                <p className="text-sm opacity-70">Conoce los detalles, modalidades y oportunidades que te esperan</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="bg-[var(--uc-purple)] hover:bg-[var(--uc-purple)]/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Ver más
            </button>
          </div>
        </div>

        {/* Listado de facultades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                clearComparador();
                setOpen(f.id);
              }}
              className="w-full text-center px-6 py-8 rounded-2xl border border-[var(--border)] hover:bg-[var(--uc-purple)] bg-[var(--surface)] text-[var(--foreground)] hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 group"
            >
              <div className="font-semibold text-lg leading-tight mb-2">{f.nombre}</div>
              <div className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                Haz clic para ver carreras
              </div>
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
              <div className="flex items-center gap-3">
                {selectedCarreras.length > 2 && (
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
                  <span className="inline-flex px-6 py-3 rounded-full border bg-[var(--uc-sky)] text-black font-medium">Ver carrera</span>
                </Link>
                <Link href="/comparador" className={selectedCarreras.length < 2 ? "pointer-events-none opacity-50" : undefined}>
                  <span className="inline-flex px-6 py-3 rounded-full border bg-[var(--uc-purple)] text-white font-medium">Comparar ({selectedCarreras.length}/3)</span>
                </Link>
              </div>
            </div>
          }
        >
          <div className="mb-6">
            <div className="text-left text-base opacity-80 mb-6 font-medium">Toca para seleccionar (hasta 3). Con 1 activo, puedes ver la carrera.</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {Object.values(carrerasMap)
              .filter((c) => c.facultadId === f.id && c.modalidades.includes(modalidad as typeof modalidad))
              .map((c) => {
                const isChecked = selectedCarreras.some((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCarrera(c)}
                    className={`w-full text-center px-4 py-6 sm:px-6 sm:py-8 rounded-2xl border transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 ${
                      isChecked 
                        ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)] shadow-lg" 
                        : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 border-[var(--border)]"
                    }`}
                  >
                    <div className="font-semibold text-base sm:text-lg leading-tight">{c.nombre}</div>
                  </button>
                );
              })}
            {Object.values(carrerasMap).filter((c) => c.facultadId === f.id).length === 0 && (
              <div className="col-span-2 p-8 text-center text-sm opacity-70">Sin carreras para esta facultad.</div>
            )}
          </div>
        </Modal>
      ))}

      {/* Modal de información adicional */}
      <Modal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Información de la Modalidad"
        subtitle={`Modalidad ${modalidad.charAt(0).toUpperCase() + modalidad.slice(1)}`}
      >
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎓</div>
            <p className="text-lg font-medium">Conoce todos los detalles de esta modalidad</p>
          </div>
          
          {/* Scroll horizontal con las 5 opciones */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {/* Qué es */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-orange-200 text-black p-4 rounded-xl mb-3 text-center font-semibold">
                  ¿Qué es?
                </div>
                <div className="bg-orange-200 text-black p-4 rounded-xl text-sm leading-relaxed">
                  {modalidad === "presencial" && "Modalidad tradicional donde asistes físicamente a clases en el campus, con interacción directa con profesores y compañeros."}
                  {modalidad === "semipresencial" && "Combinación de clases presenciales y virtuales, ofreciendo flexibilidad manteniendo la conexión personal."}
                  {modalidad === "distancia" && "Educación completamente en línea con plataformas digitales avanzadas, permitiendo estudiar desde cualquier lugar."}
                </div>
              </div>

              {/* Beneficios */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-orange-200 text-black p-4 rounded-xl mb-3 text-center font-semibold">
                  Beneficios
                </div>
                <div className="bg-orange-200 text-black p-4 rounded-xl text-sm leading-relaxed">
                  {modalidad === "presencial" && "• Experiencia inmersiva completa\n• Networking directo\n• Acceso inmediato a recursos físicos\n• Horarios estructurados"}
                  {modalidad === "semipresencial" && "• Flexibilidad de horarios\n• Ahorro en transporte\n• Combinación de lo mejor de ambos mundos\n• Autonomía controlada"}
                  {modalidad === "distancia" && "• Máxima flexibilidad\n• Ahorro en tiempo y transporte\n• Acceso global a la educación\n• Aprendizaje autodirigido"}
                </div>
              </div>

              {/* Duración */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-orange-200 text-black p-4 rounded-xl mb-3 text-center font-semibold">
                  Duración
                </div>
                <div className="bg-orange-200 text-black p-4 rounded-xl text-sm leading-relaxed">
                  {modalidad === "presencial" && "Carreras de 5 años con horarios fijos de lunes a viernes, incluyendo prácticas presenciales obligatorias."}
                  {modalidad === "semipresencial" && "Carreras de 5 años con clases presenciales 2-3 veces por semana y actividades virtuales complementarias."}
                  {modalidad === "distancia" && "Carreras de 5 años con ritmo personalizado, permitiendo completar en menos tiempo según tu dedicación."}
                </div>
              </div>

              {/* Ventajas */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-orange-200 text-black p-4 rounded-xl mb-3 text-center font-semibold">
                  Ventajas
                </div>
                <div className="bg-orange-200 text-black p-4 rounded-xl text-sm leading-relaxed">
                  {modalidad === "presencial" && "• Ambiente universitario tradicional\n• Acceso directo a laboratorios\n• Participación en actividades extracurriculares\n• Seguimiento personalizado"}
                  {modalidad === "semipresencial" && "• Balance entre flexibilidad y estructura\n• Ahorro en costos de transporte\n• Mantiene conexión social\n• Adaptable a diferentes estilos de vida"}
                  {modalidad === "distancia" && "• Sin limitaciones geográficas\n• Ahorro significativo en costos\n• Compatible con trabajo y familia\n• Tecnología de vanguardia"}
                </div>
              </div>

              {/* Máximo tiempo virtual */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-orange-200 text-black p-4 rounded-xl mb-3 text-center font-semibold">
                  Máximo tiempo virtual
                </div>
                <div className="bg-orange-200 text-black p-4 rounded-xl text-sm leading-relaxed">
                  {modalidad === "presencial" && "20% del tiempo total, principalmente para tareas, consultas y material complementario."}
                  {modalidad === "semipresencial" && "60% del tiempo total, combinando clases virtuales con sesiones presenciales estratégicas."}
                  {modalidad === "distancia" && "100% del tiempo total, con plataformas digitales y herramientas virtuales como base principal."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

