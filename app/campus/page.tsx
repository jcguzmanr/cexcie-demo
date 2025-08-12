"use client";
import { DataEmpty } from "@/components/DataEmpty";
import { Button } from "@/components/Button";
import { useAppStore, getCampusList } from "@/store";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";
// Fallback local JSON (bundled) in case public fetch fails
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusJson from "@/data/campus.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusMetaJson from "@/data/campusMeta.json";
import { useEffect } from "react";
import { ingestScreenData } from "@/lib/ingest";

export default function CampusPage() {
  const campus = useAppStore((s) => getCampusList(s));
  const selected = useAppStore((s) => s.selectedCampus);
  const campusMeta = useAppStore((s) => s.campusMetaById);
  const { setCampus } = useAppStore((s) => s.actions);
  // Ensure data is available if user lands directly here and global ingest failed
  useEffect(() => {
    if (campus.length === 0) {
      // Try bundled JSON first
      try { ingestScreenData("/campus", campusJson as unknown); } catch {}
      try { ingestScreenData("/campus-meta", campusMetaJson as unknown); } catch {}
      // Then fetch from public as a secondary fallback
      fetch("/data/campus.json").then(r=>r.json()).then(j=>ingestScreenData("/campus", j)).catch(()=>{});
      fetch("/data/campusMeta.json").then(r=>r.json()).then(j=>ingestScreenData("/campus-meta", j)).catch(()=>{});
    }
  }, [campus.length]);

  // Auto-select Huancayo by default once data is loaded and nothing is selected
  useEffect(() => {
    if (!selected && campus.length > 0) {
      const preferred = campus.find((c) => c.id === "huancayo") ?? campus[0];
      if (preferred) setCampus(preferred);
    }
  }, [selected, campus, setCampus]);

  return (
    <div className="p-6 grid gap-6">
      <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Campus" }]} />
      <div>
        <h1 className="text-xl font-semibold">Selecciona un campus</h1>
        <p className="text-sm opacity-70 mt-1">Elige tu campus para ver las modalidades y facultades disponibles y, luego, seleccionar tu carrera.</p>
      </div>
      {campus.length === 0 ? (
        <>
          <DataEmpty
            title="No hay campus."
            cta={<div className="text-sm opacity-80">Usa window.cexcieIngest(&apos;/campus&apos;, json)</div>}
          />
          <div className="flex justify-end">
            <Link href="/modalidad">
              <Button variant="secondary">Saltar sin datos</Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="grid gap-3">
            {campus.map((c) => {
              const isSel = selected?.id === c.id;
              return (
                <Button
                  key={c.id}
                  variant={isSel ? "primary" : "secondary"}
                  shape="pill"
                  className="justify-center"
                  onClick={() => setCampus(c)}
                >
                  <span className={isSel ? "text-white" : "text-[var(--uc-purple)]"}>{c.nombre.toUpperCase()}</span>
                </Button>
              );
            })}
          </div>
          <div className="rounded-2xl bg-white/60 border p-4 min-h-[360px] flex items-center justify-center">
            {selected ? (
              <div className="w-full grid gap-3">
                {campusMeta[selected.id]?.imagen ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl">
                    <Image src={campusMeta[selected.id].imagen!} alt={selected.nombre} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-[240px] rounded-2xl bg-[var(--uc-lilac)]/20 flex items-center justify-center text-sm">Imagen del campus</div>
                )}
                <div className="text-sm opacity-80">Dirección: {campusMeta[selected.id]?.direccion ?? "—"}</div>
              </div>
            ) : (
              <div className="opacity-70">Selecciona un campus para ver detalles</div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Link href="/carreras">
          <Button disabled={!selected}>Continuar</Button>
        </Link>
      </div>
    </div>
  );
}

