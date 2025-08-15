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
            {section.careers.slice(0, selected.length).map((card, idx) => (
              <div key={card.id} className="rounded-3xl p-6 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-sm">
                <div className="text-lg font-semibold text-center mb-3">
                  {interpolate(card.name, careerNames) || selected[idx]?.nombre || `Carrera ${idx + 1}`}
                </div>
                <p className="text-sm opacity-80 leading-relaxed mb-4">
                  {interpolate(card.summary, careerNames)}
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  {card.bullets.map((b, i) => (
                    <li key={i} className="text-sm">{interpolate(b, careerNames)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="opacity-70">Cargando contenido…</div>
      )}

      {/* CTA inferior */}
      {cfg && (
        <div className="sticky bottom-4 inset-x-0">
          <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-[var(--uc-lilac)]/30 to-[var(--uc-sky)]/30 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Button variant="primary" size="lg" shape="pill" onClick={() => { clearComparador(); setOpenFacs(true); }}>Elegir carreras</Button>
            </div>
            <div className="flex items-center justify-center">
              <Button onClick={() => setSendOpen(true)} size="lg" shape="pill">{cfg.ui.cta.label}</Button>
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
      <SendResultsModal open={sendOpen} onClose={() => setSendOpen(false)} careerNames={careerNames} />
    </div>
  );
}

function validateEmail(value: string) {
  return /.+@.+\..+/.test(value);
}
function validatePhone(value: string) {
  return /^\+?\d[\d\s-]{6,}$/.test(value);
}

function Field({ label, value, onChange, type = "text", placeholder, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={cx("px-4 py-3 rounded-xl border bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]", error ? "border-red-500 focus-visible:ring-red-500/40" : undefined)}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
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

 