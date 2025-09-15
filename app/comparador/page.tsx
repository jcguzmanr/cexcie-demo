"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, getFacultadList } from "@/store";
import { Button } from "@/components/Button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Modal } from "@/components/Modal";
import { cx } from "@/lib/ui";
import { SendResultsModal } from "@/components/SendResultsModal";

type ComparadorContent = {
  meta?: { component?: string; version?: string };
  state?: { activeSection?: string };
  ui: {
    sections: { key: string; label: string; emoji?: string }[];
    cta: { helper: string; label: string };
  };
  content: Record<
    string,
    {
      title: string;
      subtitle?: string;
      careers: { id: string; name: string; summary: string; bullets: string[] }[];
    }
  >;
};

function interpolate(template: string, names: string[]) {
  let out = template;
  names.forEach((n, idx) => {
    out = out.replaceAll(`{{selectedCareers[${idx}].name}}`, n);
  });
  return out;
}

export default function ComparadorPage() {
  const router = useRouter();
  const facultades = useAppStore((s) => getFacultadList(s));
  const carrerasMap = useAppStore((s) => s.carreraById);
  const selected = useAppStore((s) => s.selectedCarreras);
  const { toggleCarrera, clearComparador } = useAppStore((s) => s.actions);

  // Cargar JSON de contenido
  const [cfg, setCfg] = useState<ComparadorContent | null>(null);
  const [active, setActive] = useState<string>("aprender");
  const [sendOpen, setSendOpen] = useState(false);
  useEffect(() => {
    fetch("/data/comparador-data.json")
      .then((r) => r.json())
      .then((j: ComparadorContent) => {
        setCfg(j);
        if (j.state?.activeSection) setActive(j.state.activeSection);
      })
      .catch(() => {});
  }, []);

  const careerNames = useMemo(() => selected.map((c) => c.nombre), [selected]);

  // Cargar detalles desde la API/BD para las carreras seleccionadas
  type CarreraDetalleMin = {
    id: string;
    nombre?: string;
    secciones?: { sobre?: { descripcion?: string } };
  };
  const [detailsById, setDetailsById] = useState<Record<string, CarreraDetalleMin | null>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (selected.length === 0) {
        setDetailsById({});
        return;
      }
      setLoadingDetails(true);
      try {
        const results = await Promise.all(
          selected.map(async (c) => {
            try {
              const res = await fetch(`/api/carrera/${c.id}`);
              if (!res.ok) return [c.id, null] as const;
              const data = (await res.json()) as CarreraDetalleMin;
              return [c.id, data] as const;
            } catch {
              return [c.id, null] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, CarreraDetalleMin | null> = {};
          for (const [id, d] of results) map[id] = d;
          setDetailsById(map);
        }
      } finally {
        if (!cancelled) setLoadingDetails(false);
      }
    }
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // Control de selección inicial
  const [openFacs, setOpenFacs] = useState(selected.length < 2);
  const [openCarrerasOf, setOpenCarrerasOf] = useState<string | null>(null);

  // Si no hay suficientes carreras seleccionadas, mostrar selección de facultades
  useEffect(() => {
    if (selected.length < 2 && !openFacs && !openCarrerasOf) {
      setOpenFacs(true);
    }
  }, [selected.length, openFacs, openCarrerasOf]);

  const section = cfg?.content?.[active];

  return (
    <div className="p-6 grid gap-6 max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Carreras", href: "/carreras" }, { label: "Comparador" }]} />

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Comparador de Carreras</h1>
          <div className="text-sm opacity-70">Selecciona 2-3 carreras de la misma facultad para comparar. Actualmente: {selected.length}/3</div>
        </div>
      </div>

      {/* Pestañas de secciones */}
      {cfg && (
        <div className="flex flex-wrap items-center justify-center gap-3 pb-1">
          {cfg.ui.sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cx(
                "px-4 py-2 rounded-full border whitespace-nowrap",
                active === s.key
                  ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)]"
                  : "bg-[var(--surface)] hover:bg-[var(--uc-lilac)]/10 border-[var(--border)] text-[var(--foreground)]"
              )}
            >
              <span className="mr-2" aria-hidden>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Contenido de sección en grilla adaptable (3 columnas en desktop) */}
      {section ? (
        <div className="grid gap-4">
          <div>
            <div className="text-xl font-semibold mb-1">{interpolate(section.title, careerNames)}</div>
            {section.subtitle && <p className="opacity-70">{interpolate(section.subtitle, careerNames)}</p>}
          </div>

          <div className={`grid gap-6 ${selected.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {selected.map((c, idx) => {
              const det = detailsById[c.id];
              const description = det?.secciones?.sobre?.descripcion;
              return (
                <div key={c.id} className="rounded-3xl p-6 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-sm">
                  <div className="text-lg font-semibold text-center mb-3">
                    {c.nombre}
                  </div>
                  <p className="text-sm opacity-80 leading-relaxed mb-4">
                    {loadingDetails && !det ? 'Cargando…' : (description || 'Data aún a ser ingresada vía CMS')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="opacity-70">Cargando contenido…</div>
      )}

      {/* CTA inferior */}
      {cfg && (
        <div className="sticky bottom-4 inset-x-0">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Button
                variant="secondary"
                size="lg"
                shape="pill"
                className="flex items-center gap-2"
                onClick={() => { clearComparador(); setOpenFacs(true); }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Elegir carreras
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Button
                onClick={() => setSendOpen(true)}
                variant="primary"
                size="lg"
                shape="pill"
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--uc-purple)] to-[var(--uc-lilac)] hover:from-[var(--uc-purple)]/90 hover:to-[var(--uc-lilac)]/90 shadow-lg shadow-[var(--uc-purple)]/25 hover:shadow-xl hover:shadow-[var(--uc-purple)]/40 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {cfg.ui.cta.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: selección de facultades */}
      <Modal open={openFacs} onClose={() => { router.push("/campus"); }} title="Comparador de Carreras">
        <div className="text-center mb-4">
          <div className="text-2xl font-semibold mb-2">Comparador de Carreras</div>
          <div className="opacity-70">Selecciona una facultad para ver las carreras disponibles</div>
        </div>
        <div className="grid gap-3">
          {facultades.map((f) => (
            <button key={f.id} className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10" onClick={() => setOpenCarrerasOf(f.id)}>
              {f.nombre}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm opacity-70 text-center">Seleccionadas: {selected.length}/3 (mínimo 2, misma facultad)</div>
      </Modal>

      {/* Modal: carreras de una facultad */}
      {facultades.map((f) => (
        <Modal
          key={f.id}
          open={openCarrerasOf === f.id}
          onClose={() => { setOpenCarrerasOf(null); router.push("/campus"); }}
          title={`Carreras: ${f.nombre}`}
          footer={
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm opacity-70">Selecciona 2-3 carreras de la misma facultad para continuar</div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => clearComparador()}>Limpiar</Button>
                <Button onClick={() => { setOpenCarrerasOf(null); setOpenFacs(selected.length < 2); }} disabled={selected.length < 2}>
                  Continuar ({selected.length}/3)
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(carrerasMap)
              .filter((c) => c.facultadId === f.id)
              .map((c) => {
                const isChecked = selected.some((s) => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCarrera(c)}
                    className={cx(
                      "flex items-center gap-3 text-left rounded-full px-4 py-3 border",
                      isChecked ? "bg-[var(--uc-purple)] text-white border-[var(--uc-purple)]" : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--uc-lilac)]/10 border-[var(--border)]"
                    )}
                  >
                    <span className="font-medium leading-tight">{c.nombre}</span>
                  </button>
                );
              })}
          </div>
        </Modal>
      ))}

      {/* Modal: enviar resultados */}
      <SendResultsModal 
        open={sendOpen} 
        onClose={() => setSendOpen(false)} 
        careerNames={careerNames}
        source="comparator"
        selectedCarreras={selected}
      />
    </div>
  );
}

// function SuccessBanner({ onClose }: { onClose: () => void }) {
//   return (
//     <div className="rounded-xl border bg-green-50 text-green-900 p-4">
//       <div className="font-semibold">¡Enviado con éxito!</div>
//       <div className="text-sm opacity-80">Te hemos enviado una copia de tus resultados. Pronto nos pondremos en contacto contigo.</div>
//       <div className="mt-3">
//         <Button onClick={onClose}>Cerrar</Button>
//       </div>
//     </div>
//   );
// }

 