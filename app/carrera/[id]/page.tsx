"use client";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { Button } from "@/components/Button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Modal } from "@/components/Modal";
import { SendResultsModal } from "@/components/SendResultsModal";
import { Breadcrumb } from "@/components/Breadcrumb";

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
    };
    planEstudios: {
      legendEtapas: Record<string, { label: string; color: string }>;
      ciclos: { numero: number; creditos: number; etapa: string; cursos: string[]; notas?: string[] }[];
    };
    internacional: {
      cards: { titulo: string; texto: string; cta?: { label: string; action: string; payload?: string }; videoUrl?: string }[];
    };
    beneficios: {
      bloques: { titulo: string; items: string[] }[];
    };
  };
};

export default function CarreraDetallePage() {
  const params = useParams<{ id: string }>();
  const carrera = useAppStore((s) => s.carreraById[params.id]);
  const selected = useAppStore((s) => s.selectedCarreras);
  const carrerasMap = useAppStore((s) => s.carreraById);
  const { toggleCarrera, clearComparador } = useAppStore((s) => s.actions);
  const [detalle, setDetalle] = React.useState<DetalleCarrera | null>(null);
  const [tab, setTab] = React.useState<"sobre" | "planEstudios" | "internacional" | "beneficios">("sobre");
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [sendOpen, setSendOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    fetch("/data/detalle-carrera.json")
      .then((r) => r.json())
      .then((j: DetalleCarrera) => setDetalle(j))
      .catch(() => setDetalle(null));
  }, []);

  if (!carrera) {
    return (
      <div className="p-6">
        <div className="text-sm opacity-70">No hay datos de la carrera. Inyecta con window.cexcieIngest(&apos;/carrera/[id]&apos;, {'{'}...{'}'})</div>
      </div>
    );
  }

  const inComp = selected.some((c) => c.id === carrera.id);

  return (
    <div className="p-6 grid gap-6">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Campus", href: "/campus" }, { label: "Carreras", href: "/carreras" }, { label: carrera.nombre }]} />
      <div className="grid gap-1">
        <div className="text-xl opacity-70">Carrera de</div>
        <h1 className="text-2xl md:text-3xl font-semibold">{carrera.nombre}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        <div className="grid gap-3">
          {["sobre", "planEstudios", "internacional", "beneficios"].map((k) => (
            <Button key={k} variant={tab === k ? "primary" : "secondary"} shape="pill" className="justify-center" onClick={() => setTab(k as typeof tab)}>
              <span className={tab === k ? "text-white" : "text-[var(--uc-purple)]"}>
                {k === "sobre" && "Sobre la carrera"}
                {k === "planEstudios" && "Plan de estudios"}
                {k === "internacional" && "Internacional"}
                {k === "beneficios" && "Beneficios"}
              </span>
            </Button>
          ))}
        </div>

        <div className="rounded-2xl bg-white/60 border p-4 min-h-[360px] overflow-hidden">
          {tab === "sobre" && (
            <div className="grid gap-4">
              <div className="text-lg font-semibold">{detalle?.secciones.sobre.titulo ?? "Sobre la carrera"}</div>
              {detalle?.secciones.sobre.media?.type === "image" && detalle.secciones.sobre.media.src && (
                <div className="relative w-full max-w-[560px] aspect-[16/9] rounded-xl overflow-hidden">
                  <Image src={detalle.secciones.sobre.media.src} alt={detalle.secciones.sobre.media.alt ?? ""} fill className="object-cover" />
                </div>
              )}
              <p className="max-w-3xl opacity-85">{detalle?.secciones.sobre.descripcion}</p>
            </div>
          )}

          {tab === "planEstudios" && (
            <div className="grid gap-4">
              <div className="text-lg font-semibold">PLAN DE ESTUDIOS</div>
              {/* Leyenda fija */}
              <div className="sticky top-2 z-[1] bg-transparent">
                <div className="flex flex-wrap gap-3">
                  {Object.values(detalle?.secciones.planEstudios.legendEtapas ?? {}).map((l, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm bg-white/80 backdrop-blur">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.color }} /> {l.label}
                    </span>
                  ))}
                </div>
              </div>
              {/* Scroll vertical solo para la malla */}
              <div className="max-h-[520px] overflow-y-auto pr-2 rounded-xl">
                <div className="grid grid-cols-1 gap-4">
                  {detalle?.secciones.planEstudios.ciclos.map((c) => {
                    const etapaColor = detalle?.secciones.planEstudios.legendEtapas?.[c.etapa]?.color ?? "#EEE";
                    return (
                      <div key={c.numero} className="rounded-2xl border bg-white p-3">
                        <div className="text-sm font-semibold mb-3">{String(c.numero).padStart(2, "0")} · Total de créditos {c.creditos}</div>
                        {/* Scroll horizontal de cursos por fila */}
                        <div className="w-full flex gap-3 overflow-x-auto pb-2">
                          {c.cursos.map((cu, i) => (
                            <div
                              key={i}
                              className="shrink-0 rounded-xl px-3 py-2 text-sm border"
                              style={{ background: etapaColor }}
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
          )}

          {tab === "internacional" && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detalle?.secciones.internacional.cards.map((card, i) => (
                  <div key={i} className="rounded-2xl bg-white p-4 border">
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
                <div key={i} className="shrink-0 w-[380px] rounded-2xl bg-white p-4 border">
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
        <SendResultsModal open={sendOpen} onClose={() => setSendOpen(false)} careerNames={[carrera.nombre]} />
      )}
      {selectOpen && (
        <Modal
          open={selectOpen}
          onClose={() => setSelectOpen(false)}
          title="Selecciona carreras para comparar"
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm opacity-70">Selecciona 3 carreras de la misma facultad para comparar</div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => { clearComparador(); toggleCarrera(carrera); }}>Limpiar</Button>
                <Button onClick={() => { setSelectOpen(false); router.push('/comparador'); }} disabled={selected.length < 3}>
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
                    className={`flex items-center gap-3 text-left rounded-full px-4 py-3 border ${isChecked ? "bg-[var(--uc-purple)] text-white" : "bg-white hover:bg-[var(--uc-lilac)]/10"}`}
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

