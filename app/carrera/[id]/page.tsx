"use client";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Button } from "@/components/Button";
// import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Modal } from "@/components/Modal";
import { SendResultsModal } from "@/components/SendResultsModal";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ModalidadComparison } from "@/components/ModalidadComparison";
import { ModalidadComparison as ModalidadComparisonType } from "@/data/schemas";

type DetalleCarrera = {
  id: string;
  nombre: string;
  facultad: string;
  campus: string[];
  modalidades: string[];
  secciones: {
    sobre: {
      titulo: string;
      descripcion: string;
      media?: { type: "image" | "video"; alt?: string; src?: string };
      infoCards?: Array<{
        id: string;
        icon: string;
        titulo: string;
        contenido: string | string[];
        descripcion: string;
      }>;
    };
    planEstudios: {
      legendEtapas: Record<string, { label: string; color: string; descripcion: string }>;
      ciclos: { numero: number; creditos: number; etapa: string; cursos: string[]; notas?: string[] }[];
    };
    internacional: {
      cards: { titulo: string; texto: string; cta?: { label: string; action: string; payload?: string }; videoUrl?: string }[];
    };
    beneficios: {
      bloques: { titulo: string; items: string[] }[];
    };
    testimonios?: {
      estudiantes?: Array<{
        id: string;
        nombre: string;
        foto: string;
        campus: string;
        ciclo: string;
        testimonio: string;
        destacado?: string;
      }>;
      egresados?: Array<{
        id: string;
        nombre: string;
        foto: string;
        cargo: string;
        empresa: string;
        egreso: string;
        testimonio: string;
        destacado?: string;
      }>;
    };
  };
};



// Función para verificar si una carrera tiene suficientes cursos para comparar
function carreraTieneSuficientesCursos(): boolean {
  // TODO: Implementar lógica para verificar número de cursos por carrera
  // Por ahora retorna true para todas las carreras
  // En el futuro, verificar si la carrera tiene más de 1 curso
  return true;
}

export default function CarreraDetallePage() {
  const params = useParams<{ id: string }>();
  const carrera = useAppStore((s) => s.carreraById[params.id]);
  const selected = useAppStore((s) => s.selectedCarreras);
  const carrerasMap = useAppStore((s) => s.carreraById);
  const { toggleCarrera, clearComparador } = useAppStore((s) => s.actions);
  const [detalle, setDetalle] = React.useState<DetalleCarrera | null>(null);
  const [tab, setTab] = React.useState<"sobre" | "planEstudios" | "internacional" | "beneficios" | "costos" | "testimonios" | "modalidades">("sobre");
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [didactics, setDidactics] = React.useState<{
    anchors?: Array<{ id: string; label: string; icon: string; description: string }>;
    didactics: Record<string, { id: string; titulo: string; bullets: string[] }>;
    explicacionCalculo: { id: string; pasos: string[]; nota: string };
    fuentes: Array<{ label: string; url: string }>;
  } | null>(null);
  const [modalidadComparison, setModalidadComparison] = React.useState<ModalidadComparisonType | null>(null);
  const [tipoTestimonio, setTipoTestimonio] = React.useState<"estudiantes" | "egresados">("estudiantes");
  const router = useRouter();
  
  // Verificar si la carrera actual puede ser comparada
  const puedeComparar = carreraTieneSuficientesCursos();

  React.useEffect(() => {
    fetch("/data/detalle-carrera.json")
      .then((r) => r.json())
      .then((j: DetalleCarrera) => setDetalle(j))
      .catch(() => setDetalle(null));
    
    fetch("/data/didactics.json")
      .then((r) => r.json())
      .then((j) => setDidactics(j))
      .catch(() => setDidactics(null));
    
    // Cargar comparación de modalidades
    fetch("/data/modalidad-comparison.json")
      .then((r) => r.json())
      .then((comparisons: ModalidadComparisonType[]) => {
        console.log("📊 Comparaciones cargadas:", comparisons);
        const comparison = comparisons.find(c => c.career_id === "default");
        console.log("🎯 Comparación encontrada:", comparison);
        if (comparison) {
          const personalizedComparison = {
            ...comparison,
            career_name: carrera.nombre
          };
          console.log("✨ Comparación personalizada:", personalizedComparison);
          setModalidadComparison(personalizedComparison);
        } else {
          setModalidadComparison(null);
        }
      })
      .catch((error) => {
        console.error("💥 Error:", error);
        setModalidadComparison(null);
      });
  }, [params.id]);

  if (!carrera) {
    return (
      <div className="p-6">
        <div className="text-sm opacity-70">No hay datos de la carrera. Inyecta con window.cexcieIngest(&apos;/carrera/[id]&apos;, {'{'}...{'}'})</div>
      </div>
    );
  }

  // const inComp = selected.some((c) => c.id === carrera.id);

  return (
    <div className="p-6 grid gap-6">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Campus", href: "/campus" }, { label: "Carreras", href: "/carreras" }, { label: carrera.nombre }]} />
      <div className="grid gap-1">
        <div className="text-xl opacity-70">Carrera de</div>
        <h1 className="text-2xl md:text-3xl font-semibold">{carrera.nombre}</h1>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        <div className="grid gap-3">
          {["sobre", "planEstudios", "internacional", "beneficios", "costos", "testimonios", "modalidades"].map((k) => (
            <Button key={k} variant={tab === k ? "primary" : "secondary"} shape="pill" className="justify-center" onClick={() => setTab(k as typeof tab)}>
              <span className={tab === k ? "text-white" : "text-[var(--uc-purple)]"}>
                {k === "sobre" && "Sobre la carrera"}
                {k === "planEstudios" && "Plan de estudios"}
                {k === "internacional" && "Internacional"}
                {k === "beneficios" && "Beneficios"}
                {k === "costos" && "Costos"}
                {k === "testimonios" && "Testimonios"}
                {k === "modalidades" && "Modalidades"}
              </span>
            </Button>
          ))}
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 min-h-[360px] overflow-hidden text-[var(--foreground)]">
          {tab === "sobre" && (
            <div className="grid gap-6">
              <div className="text-lg font-semibold">{detalle?.secciones.sobre.titulo ?? "Sobre la carrera"}</div>
              
              {/* Imagen y descripción */}
              <div className="grid gap-4">
                {detalle?.secciones.sobre.media?.type === "image" && detalle.secciones.sobre.media.src && (
                  <div className="relative w-full max-w-[560px] aspect-[16/9] rounded-xl overflow-hidden">
                    <Image src={detalle.secciones.sobre.media.src} alt={detalle.secciones.sobre.media.alt ?? ""} fill className="object-cover" />
                  </div>
                )}
                <p className="max-w-3xl opacity-85">{detalle?.secciones.sobre.descripcion}</p>
              </div>

              {/* Anclas informativas */}
              {detalle?.secciones.sobre.infoCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detalle.secciones.sobre.infoCards.map((card) => (
                    <div
                      key={card.id}
                      id={card.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => {
                        // Aquí podrías implementar un modal o expandir la información
                        console.log(`Card clicked: ${card.titulo}`);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl text-[var(--uc-purple)] group-hover:scale-110 transition-transform duration-200">
                          {card.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--foreground)] mb-2 text-sm">
                            {card.titulo}
                          </h3>
                          <div className="space-y-1">
                            {Array.isArray(card.contenido) ? (
                              card.contenido.map((item, index) => (
                                <div key={index} className="text-xs opacity-80 leading-relaxed">
                                  • {item}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs opacity-80 leading-relaxed">
                                {card.contenido}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-xs opacity-60 italic">
                            {card.descripcion}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "planEstudios" && (
            <div className="grid gap-4">
              <div className="text-lg font-semibold">PLAN DE ESTUDIOS</div>
              {/* Ciclos agrupados por etapas */}
              <div className="grid grid-cols-1 gap-6 p-2 pt-3">
                {/* Navegación sticky de etapas */}
                <div className="sticky top-0 z-[1] bg-[var(--surface)]/95 backdrop-blur p-2 rounded-xl border border-[var(--border)] mb-4">
                  <div className="flex gap-3 overflow-x-auto">
                    <button
                      onClick={() => {
                        const element = document.getElementById("etapa-adaptacion");
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--uc-purple)] hover:text-white hover:border-[var(--uc-purple)] transition-all duration-200 text-sm font-medium flex-shrink-0"
                      title="Etapa de adaptación - Desarrolla las bases sólidas"
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full" 
                        style={{ background: detalle?.secciones.planEstudios.legendEtapas?.adaptacion?.color ?? "#B9E1FF" }}
                      />
                      <span>Etapa de Adaptación</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = document.getElementById("etapa-profundizacion");
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--uc-purple)] hover:text-white hover:border-[var(--uc-purple)] transition-all duration-200 text-sm font-medium flex-shrink-0"
                      title="Etapa de profundización - Adquiere conocimientos especializados"
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full" 
                        style={{ background: detalle?.secciones.planEstudios.legendEtapas?.profundizacion?.color ?? "#9169FF" }}
                      />
                      <span>Etapa de Profundización</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = document.getElementById("etapa-consolidacion");
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--uc-purple)] hover:text-white hover:border-[var(--uc-purple)] transition-all duration-200 text-sm font-medium flex-shrink-0"
                      title="Etapa de consolidación - Integra todo tu aprendizaje"
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full" 
                        style={{ background: detalle?.secciones.planEstudios.legendEtapas?.consolidacion?.color ?? "#FAAAFA" }}
                      />
                      <span>Etapa de Consolidación</span>
                    </button>
                  </div>
                </div>

                {/* Contenedor con scroll vertical para las etapas */}
                <div className="max-h-[600px] overflow-y-auto pr-2 rounded-xl">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Etapa de Adaptación */}
                    <div id="etapa-adaptacion" className="scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="inline-block w-4 h-4 rounded-sm" 
                          style={{ background: detalle?.secciones.planEstudios.legendEtapas?.adaptacion?.color ?? "#B9E1FF" }}
                        />
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Etapa de Adaptación</h3>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed mb-4">
                        {detalle?.secciones.planEstudios.legendEtapas?.adaptacion?.descripcion || "Desarrolla las bases sólidas que necesitas para construir tu carrera profesional con confianza."}
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {detalle?.secciones.planEstudios.ciclos
                          .filter(c => c.etapa === "adaptacion")
                          .map((c) => {
                            const etapaColor = detalle?.secciones.planEstudios.legendEtapas?.[c.etapa]?.color ?? "#EEE";
                            return (
                              <div key={c.numero} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                                <div className="text-sm font-semibold mb-3 text-[var(--foreground)] text-right">Ciclo {String(c.numero).padStart(2, "0")} · Total de créditos {c.creditos}</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {c.cursos.map((cu, i) => (
                                    <div
                                      key={i}
                                      className="rounded-xl px-3 py-2 text-sm border text-black"
                                      style={{ background: etapaColor, borderColor: "var(--border)" }}
                                    >
                                      {cu}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Etapa de Profundización */}
                    <div id="etapa-profundizacion" className="scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="inline-block w-4 h-4 rounded-sm" 
                          style={{ background: detalle?.secciones.planEstudios.legendEtapas?.profundizacion?.color ?? "#9169FF" }}
                        />
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Etapa de Profundización</h3>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed mb-4">
                        {detalle?.secciones.planEstudios.legendEtapas?.profundizacion?.descripcion || "Adquiere conocimientos especializados que te permitirán destacar en el mercado laboral."}
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {detalle?.secciones.planEstudios.ciclos
                          .filter(c => c.etapa === "profundizacion")
                          .map((c) => {
                            const etapaColor = detalle?.secciones.planEstudios.legendEtapas?.[c.etapa]?.color ?? "#EEE";
                            return (
                              <div key={c.numero} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                                <div className="text-sm font-semibold mb-3 text-[var(--foreground)] text-right">Ciclo {String(c.numero).padStart(2, "0")} · Total de créditos {c.creditos}</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {c.cursos.map((cu, i) => (
                                    <div
                                      key={i}
                                      className="rounded-xl px-3 py-2 text-sm border text-black"
                                      style={{ background: etapaColor, borderColor: "var(--border)" }}
                                    >
                                      {cu}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Etapa de Consolidación */}
                    <div id="etapa-consolidacion" className="scroll-mt-20">
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="inline-block w-4 h-4 rounded-sm" 
                          style={{ background: detalle?.secciones.planEstudios.legendEtapas?.consolidacion?.color ?? "#FAAAFA" }}
                        />
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">Etapa de Consolidación</h3>
                      </div>
                      <p className="text-sm opacity-80 leading-relaxed mb-4">
                        {detalle?.secciones.planEstudios.legendEtapas?.consolidacion?.descripcion || "Integra todo tu aprendizaje en proyectos reales que definirán tu futuro profesional."}
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {detalle?.secciones.planEstudios.ciclos
                          .filter(c => c.etapa === "consolidacion")
                          .map((c) => {
                            const etapaColor = detalle?.secciones.planEstudios.legendEtapas?.[c.etapa]?.color ?? "#EEE";
                            return (
                              <div key={c.numero} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                                <div className="text-sm font-semibold mb-3 text-[var(--foreground)] text-right">Ciclo {String(c.numero).padStart(2, "0")} · Total de créditos {c.creditos}</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {c.cursos.map((cu, i) => (
                                    <div
                                      key={i}
                                      className="rounded-xl px-3 py-2 text-sm border text-black"
                                      style={{ background: etapaColor, borderColor: "var(--border)" }}
                                    >
                                      {cu}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "internacional" && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detalle?.secciones.internacional.cards.map((card, i) => (
                  <div key={i} className="rounded-2xl bg-[var(--surface)] text-[var(--foreground)] p-4 border border-[var(--border)]">
                    <div className="text-lg font-semibold mb-2">{card.titulo}</div>
                    <p className="opacity-80 mb-4">{card.texto}</p>
                    {card.videoUrl && (
                      <button onClick={() => setVideoUrl(card.videoUrl!)} className="inline-flex px-4 py-2 rounded-full border bg-[var(--uc-purple)] text-white">
                        {card.cta?.label ?? "Ver video"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "beneficios" && (
            <div className="w-full flex gap-4 overflow-x-auto pb-2">
              {detalle?.secciones.beneficios.bloques.map((b, i) => (
                <div key={i} className="shrink-0 w-[380px] rounded-2xl bg-[var(--surface)] text-[var(--foreground)] p-4 border border-[var(--border)]">
                  <div className="text-lg font-semibold mb-2">{b.titulo}</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {b.items.map((it, j) => (
                      <li key={j} className="opacity-90">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

                    {tab === "costos" && (
            <div className="grid gap-4">
              <div className="text-lg font-semibold">Información sobre costos y escalas</div>
              
              {didactics && (
                <>
                  {/* Anclas de navegación */}
                  {didactics.anchors && (
                    <div className="sticky top-0 z-[1] bg-[var(--surface)]/95 backdrop-blur p-2 rounded-xl border border-[var(--border)] mb-4">
                      <div className="flex flex-wrap gap-3">
                        {didactics.anchors.map((anchor: { id: string; label: string; icon: string; description: string }) => (
                          <button
                            key={anchor.id}
                            onClick={() => {
                              const element = document.getElementById(anchor.id);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--uc-purple)] hover:text-white hover:border-[var(--uc-purple)] transition-all duration-200 text-sm font-medium"
                            title={anchor.description}
                          >
                            <span className="text-lg">{anchor.icon}</span>
                            <span>{anchor.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenedor con scroll vertical */}
                  <div className="max-h-[560px] overflow-y-auto pr-2 rounded-xl">
                    <div className="grid gap-6 p-2">
                      {/* Sección de didácticas */}
                      {Object.entries(didactics.didactics).map(([key, section]: [string, { id: string; titulo: string; bullets: string[] }]) => (
                        <div key={key} id={section.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 scroll-mt-4">
                          <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">{section.titulo}</h3>
                          <ul className="space-y-3">
                            {section.bullets.map((bullet: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="inline-block w-2 h-2 rounded-full bg-[var(--uc-purple)] mt-2 flex-shrink-0"></span>
                                <span className="opacity-90 leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Sección de explicación de cálculo */}
                      <div id="calculo" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 scroll-mt-4">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">¿Cómo calcular mis pagos?</h3>
                        <div className="grid gap-4">
                          <div className="grid gap-3">
                            {didactics.explicacionCalculo.pasos.map((paso: string, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--uc-purple)] text-white text-sm font-medium flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className="opacity-90 leading-relaxed">{paso}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-4 rounded-xl bg-[var(--uc-lilac)]/10 border border-[var(--uc-lilac)]/20">
                            <p className="text-sm font-medium text-[var(--uc-purple)]">{didactics.explicacionCalculo.nota}</p>
                          </div>
                        </div>
                      </div>

                      {/* Sección de fuentes */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Fuentes oficiales</h3>
                        <div className="grid gap-3">
                          {didactics.fuentes.map((fuente: { label: string; url: string }, index: number) => (
                            <a
                              key={index}
                              href={fuente.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[var(--uc-purple)] hover:underline transition-colors"
                            >
                              <span>{fuente.label}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!didactics && (
                <div className="text-center py-12">
                  <div className="text-lg opacity-70">Cargando información de costos...</div>
                </div>
              )}
            </div>
          )}

          {tab === "testimonios" && (
            <div className="grid gap-6">
              <div className="text-lg font-semibold">Testimonios</div>
              
              {/* Selector de tipo de testimonio */}
              <div className="flex gap-3 p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
                <button
                  onClick={() => setTipoTestimonio("estudiantes")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoTestimonio === "estudiantes"
                      ? "bg-[var(--uc-purple)] text-white shadow-lg shadow-[var(--uc-purple)]/25"
                      : "text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 border border-transparent hover:border-[var(--uc-lilac)]/20"
                  }`}
                >
                  👨‍🎓 Estudiantes ({detalle?.secciones.testimonios?.estudiantes?.length || 0})
                </button>
                <button
                  onClick={() => setTipoTestimonio("egresados")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoTestimonio === "egresados"
                      ? "bg-[var(--uc-purple)] text-white shadow-lg shadow-[var(--uc-purple)]/25"
                      : "text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 border border-transparent hover:border-[var(--uc-lilac)]/20"
                  }`}
                >
                  🎓 Egresados ({detalle?.secciones.testimonios?.egresados?.length || 0})
                </button>
              </div>

              {/* Grid de testimonios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tipoTestimonio === "estudiantes" && detalle?.secciones.testimonios?.estudiantes?.map((testimonio) => (
                  <div
                    key={testimonio.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:shadow-xl hover:shadow-[var(--uc-purple)]/10 transition-all duration-300 group hover:border-[var(--uc-purple)]/30"
                  >
                    {/* Header del testimonio */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--uc-purple)] via-[var(--uc-lilac)] to-[var(--uc-purple)] flex items-center justify-center text-2xl text-white flex-shrink-0 shadow-lg shadow-[var(--uc-purple)]/25 border-2 border-white/20">
                        {testimonio.foto}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] text-lg mb-1 group-hover:text-[var(--uc-purple)] transition-colors">
                          {testimonio.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-sm opacity-70 mb-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--uc-purple)]/20 text-[var(--uc-purple)] text-xs font-medium border border-[var(--uc-purple)]/30">
                            📍 {testimonio.campus}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--uc-sky)]/20 text-[var(--uc-sky)] text-xs font-medium border border-[var(--uc-sky)]/30">
                            🎯 {testimonio.ciclo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonio */}
                    <blockquote className="text-[var(--foreground)] opacity-85 leading-relaxed mb-4 italic">
                      &ldquo;{testimonio.testimonio}&rdquo;
                    </blockquote>

                    {/* Destacado */}
                    {testimonio.destacado && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--uc-purple)]">⭐</span>
                        <span className="opacity-80 font-medium">{testimonio.destacado}</span>
                      </div>
                    )}
                  </div>
                ))}

                {tipoTestimonio === "egresados" && detalle?.secciones.testimonios?.egresados?.map((testimonio) => (
                  <div
                    key={testimonio.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:shadow-xl hover:shadow-[var(--uc-purple)]/10 transition-all duration-300 group hover:border-[var(--uc-purple)]/30"
                  >
                    {/* Header del testimonio */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--uc-purple)] via-[var(--uc-lilac)] to-[var(--uc-purple)] flex items-center justify-center text-2xl text-white flex-shrink-0 shadow-lg shadow-[var(--uc-purple)]/25 border-2 border-white/20">
                        {testimonio.foto}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] text-lg mb-1 group-hover:text-[var(--uc-purple)] transition-colors">
                          {testimonio.nombre}
                        </h3>
                        <div className="text-sm opacity-70 mb-2">
                          <div className="font-medium text-[var(--uc-purple)]">{testimonio.cargo}</div>
                          <div className="opacity-80">{testimonio.empresa}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--uc-lilac)]/20 text-[var(--uc-lilac)] text-xs font-medium border border-[var(--uc-lilac)]/30">
                            🎓 Egresado {testimonio.egreso}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonio */}
                    <blockquote className="text-[var(--foreground)] opacity-85 leading-relaxed mb-4 italic">
                      &ldquo;{testimonio.testimonio}&rdquo;
                    </blockquote>

                    {/* Destacado */}
                    {testimonio.destacado && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--uc-purple)]">🏆</span>
                        <span className="opacity-80 font-medium">{testimonio.destacado}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mensaje cuando no hay testimonios */}
              {(!detalle?.secciones.testimonios?.[tipoTestimonio] || detalle.secciones.testimonios[tipoTestimonio].length === 0) && (
                <div className="text-center py-12">
                  <div className="text-lg opacity-70">No hay testimonios disponibles para {tipoTestimonio === "estudiantes" ? "estudiantes" : "egresados"} en este momento.</div>
                </div>
              )}
            </div>
          )}

          {tab === "modalidades" && (
            <div className="grid gap-4">
              {modalidadComparison ? (
                <div className="overflow-x-auto">
                  <ModalidadComparison comparison={modalidadComparison} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-lg opacity-70">Comparación de modalidades no disponible para esta carrera.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 inset-x-0">
        <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-[var(--uc-lilac)]/30 to-[var(--uc-sky)]/30 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                // Reinicia selección con la carrera actual, siempre preseleccionada
                clearComparador();
                toggleCarrera(carrera);
                setSelectOpen(true);
              }}
              size="lg"
              shape="pill"
              disabled={!puedeComparar}
              title={!puedeComparar ? "Esta carrera no tiene suficientes cursos para comparar" : undefined}
            >
              Comparar carreras
            </Button>
          </div>
          <div>
            <Button size="lg" shape="pill" onClick={() => setSendOpen(true)}>Quiero la información</Button>
          </div>
        </div>
      </div>

      {videoUrl && <VideoModal url={videoUrl} onClose={() => setVideoUrl(null)} />}
      {sendOpen && (
        <SendResultsModal 
          open={sendOpen} 
          onClose={() => setSendOpen(false)} 
          careerNames={[carrera.nombre]}
          source="career"
          selectedCarreras={[carrera]}
        />
      )}
      {selectOpen && (
        <Modal
          open={selectOpen}
          onClose={() => setSelectOpen(false)}
          title="Selecciona carreras para comparar"
          subtitle="Selecciona 2-3 carreras de la misma facultad para comparar"
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm opacity-70">Selecciona 2-3 carreras de la misma facultad para comparar</div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => { clearComparador(); toggleCarrera(carrera); }}>Limpiar</Button>
                <Button onClick={() => { setSelectOpen(false); router.push('/comparador'); }} disabled={selected.length < 2}>
                  Continuar ({selected.length}/3)
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(carrerasMap)
              .filter((c) => c.facultadId === carrera.facultadId)
              .map((c) => {
                const isChecked = selected.some((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCarrera(c)}
                    className={`flex items-center gap-3 text-left rounded-full px-4 py-3 border ${isChecked ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)]" : "bg-[var(--surface)] hover:bg-[var(--uc-lilac)]/10 text-[var(--foreground)] border-[var(--border)]"}`}
                  >
                    <span className="font-medium leading-tight">{c.nombre}</span>
                  </button>
                );
              })}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Video modal inline
function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} title="Video">
      <div className="relative w-full aspect-video">
        <iframe
          src={url}
          className="w-full h-full rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Modal>
  );
}

