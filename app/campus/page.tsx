"use client";
import { DataEmpty } from "@/components/DataEmpty";
import { Button } from "@/components/Button";
import { useAppStore, getCampusList } from "@/store";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
// Fallback local JSON (bundled) in case public fetch fails
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusJson from "@/data/campus.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusMetaJson from "@/data/campusMeta.json";
import { useEffect } from "react";
import { ingestScreenData } from "@/lib/ingest";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function CampusPage() {
  const campus = useAppStore((s) => getCampusList(s));
  const selected = useAppStore((s) => s.selectedCampus);
  const campusMeta = useAppStore((s) => s.campusMetaById);
  const { setCampus } = useAppStore((s) => s.actions);
  // Ensure data is available; priorizar API para campus
  useEffect(() => {
    // Siempre intentar API primero para campus
    fetch("/api/campus")
      .then((r) => r.json())
      .then((j) => ingestScreenData("/campus", j))
      .catch(() => {
        // Fallback: JSON local y luego público
        try { ingestScreenData("/campus", campusJson as unknown); } catch {}
        fetch("/data/campus.json").then(r=>r.json()).then(j=>ingestScreenData("/campus", j)).catch(()=>{});
      });

    // Campus meta como antes (local + público)
    fetch("/data/campusMeta.json").then(r=>r.json()).then(j=>ingestScreenData("/campus-meta", j)).catch(() => {
      try { ingestScreenData("/campus-meta", campusMetaJson as unknown); } catch {}
    });
  }, []);

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
        <p className="text-sm opacity-70 mt-1">En la Universidad Continental contamos con distintos campus en todo el país. Seleccionar tu campus primero nos permite mostrarte la información académica, modalidades y beneficios disponibles específicamente en esa sede. Así, tu recorrido será más claro, personalizado y cercano a tu realidad.</p>
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
                <motion.div key={c.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }}>
                  <Button
                    variant={isSel ? "primary" : "glassPurple"}
                    shape="pill"
                    className="justify-center w-full"
                    onClick={() => setCampus(c)}
                  >
                    <span className={isSel ? "text-white" : "text-white"}>{c.nombre.toUpperCase()}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
          <div className="rounded-2xl bg-white/60 border p-4 min-h-[360px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full grid gap-3"
                >
                  {campusMeta[selected.id]?.imagen ? (
                    <motion.div
                      key={`${selected.id}-img`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl"
                    >
                      <Image src={campusMeta[selected.id].imagen!} alt={selected.nombre} fill className="object-cover" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${selected?.id ?? 'none'}-ph`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-[240px] rounded-2xl bg-[var(--uc-lilac)]/20 flex items-center justify-center text-sm"
                    >
                      Imagen del campus
                    </motion.div>
                  )}
                  <motion.div
                    key={`${selected.id}-meta`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm opacity-80"
                  >
                    Dirección: {campusMeta[selected.id]?.direccion ?? "—"}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="opacity-70"
                >
                  Selecciona un campus para ver detalles
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Link href="/carreras">
          <Button disabled={!selected} className="group">
            <span>Continuar</span>
            <ArrowRightIcon className="ml-2 inline-block w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

