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
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3); // 3 posiciones para mostrar 3 elementos por vez
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

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

      <div className="w-full h-32 relative overflow-hidden rounded-xl bg-gradient-to-r from-[var(--uc-purple)]/10 to-[var(--uc-lilac)]/20 border border-[var(--uc-purple)]/30">
            <div className="absolute inset-0 flex transition-transform duration-1000 ease-in-out" 
                 style={{ transform: `translateX(-${(currentSlide * 100)}%)` }}>
              
              {/* Posición 1: ¿Qué es? + Beneficios + Duración */}
              <div className="w-full flex-shrink-0 flex gap-2 p-3">
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">¿Qué es?</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed text-center">
                    {modalidad === "presencial" && "Modalidad tradicional donde asistes físicamente a clases en el campus, con interacción directa con profesores y compañeros."}
                    {modalidad === "semipresencial" && "Combinación de clases presenciales y virtuales, ofreciendo flexibilidad manteniendo la conexión personal."}
                    {modalidad === "distancia" && "Educación completamente en línea con plataformas digitales avanzadas, permitiendo estudiar desde cualquier lugar."}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Beneficios</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed">
                    {modalidad === "presencial" && "• Experiencia inmersiva completa\n• Networking directo\n• Acceso inmediato a recursos físicos"}
                    {modalidad === "semipresencial" && "• Flexibilidad de horarios\n• Ahorro en transporte\n• Combinación de lo mejor de ambos mundos"}
                    {modalidad === "distancia" && "• Máxima flexibilidad\n• Ahorro en tiempo y transporte\n• Acceso global a la educación"}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Duración</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed text-center">
                    {modalidad === "presencial" && "Carreras de 5 años con horarios fijos de lunes a viernes, incluyendo prácticas presenciales obligatorias."}
                    {modalidad === "semipresencial" && "Carreras de 5 años con clases presenciales 2-3 veces por semana y actividades virtuales complementarias."}
                    {modalidad === "distancia" && "Carreras de 5 años con ritmo personalizado, permitiendo completar en menos tiempo según tu dedicación."}
                  </div>
                </div>
              </div>

              {/* Posición 2: Ventajas + Máximo tiempo virtual + ¿Qué es? */}
              <div className="w-full flex-shrink-0 flex gap-2 p-3">
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Ventajas</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed">
                    {modalidad === "presencial" && "• Ambiente universitario tradicional\n• Acceso directo a laboratorios\n• Participación en actividades extracurriculares"}
                    {modalidad === "semipresencial" && "• Balance entre flexibilidad y estructura\n• Ahorro en costos de transporte\n• Mantiene conexión social"}
                    {modalidad === "distancia" && "• Sin limitaciones geográficas\n• Ahorro significativo en costos\n• Compatible con trabajo y familia"}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Máximo tiempo virtual</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed text-center">
                    {modalidad === "presencial" && "20% del tiempo total, principalmente para tareas, consultas y material complementario."}
                    {modalidad === "semipresencial" && "60% del tiempo total, combinando clases virtuales con sesiones presenciales estratégicas."}
                    {modalidad === "distancia" && "100% del tiempo total, con plataformas digitales y herramientas virtuales como base principal."}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">¿Qué es?</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed text-center">
                    {modalidad === "presencial" && "Modalidad tradicional donde asistes físicamente a clases en el campus, con interacción directa con profesores y compañeros."}
                    {modalidad === "semipresencial" && "Combinación de clases presenciales y virtuales, ofreciendo flexibilidad manteniendo la conexión personal."}
                    {modalidad === "distancia" && "Educación completamente en línea con plataformas digitales avanzadas, permitiendo estudiar desde cualquier lugar."}
                  </div>
                </div>
              </div>

              {/* Posición 3: Beneficios + Duración + Ventajas */}
              <div className="w-full flex-shrink-0 flex gap-2 p-3">
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Beneficios</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed">
                    {modalidad === "presencial" && "• Experiencia inmersiva completa\n• Networking directo\n• Acceso inmediato a recursos físicos"}
                    {modalidad === "semipresencial" && "• Flexibilidad de horarios\n• Ahorro en transporte\n• Combinación de lo mejor de ambos mundos"}
                    {modalidad === "distancia" && "• Máxima flexibilidad\n• Ahorro en tiempo y transporte\n• Acceso global a la educación"}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Duración</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed text-center">
                    {modalidad === "presencial" && "Carreras de 5 años con horarios fijos de lunes a viernes, incluyendo prácticas presenciales obligatorias."}
                    {modalidad === "semipresencial" && "Carreras de 5 años con clases presenciales 2-3 veces por semana y actividades virtuales complementarias."}
                    {modalidad === "distancia" && "Carreras de 5 años con ritmo personalizado, permitiendo completar en menos tiempo según tu dedicación."}
                  </div>
                </div>
                <div className="flex-1 bg-[var(--uc-purple)]/5 rounded-lg p-2 border border-[var(--uc-purple)]/20">
                  <div className="text-[var(--uc-purple)] font-semibold text-xs mb-1 text-center">Ventajas</div>
                  <div className="text-[var(--foreground)] text-xs leading-relaxed">
                    {modalidad === "presencial" && "• Ambiente universitario tradicional\n• Acceso directo a laboratorios\n• Participación en actividades extracurriculares"}
                    {modalidad === "semipresencial" && "• Balance entre flexibilidad y estructura\n• Ahorro en costos de transporte\n• Mantiene conexión social"}
                    {modalidad === "distancia" && "• Sin limitaciones geográficas\n• Ahorro significativo en costos\n• Compatible con trabajo y familia"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Indicadores de posición */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-[var(--uc-purple)] scale-125' : 'bg-[var(--uc-purple)]/30'
                  }`}
                />
              ))}
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


    </div>
  );
}

