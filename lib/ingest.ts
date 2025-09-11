"use client";
import {
  CampusSchema,
  CarreraSchema,
  FacultadSchema,
  CampusMetaSchema,
  type Campus,
  type Facultad,
  type Carrera,
} from "@/data/schemas";
// Local JSON (bundled)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusJson from "@/data/campus.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import campusMetaJson from "@/data/campusMeta.json";
import { safeParseArray } from "@/lib/validators";
import { useAppStore } from "@/store";

export type ScreenId =
  | "/campus"
  | "/facultades"
  | "/carreras-popup"
  | "/carreras"
  | "/modalidad"
  | "/carrera/[id]"
  | "/campus-meta";

type Proposal = { schemaId: string; zodRef: string };

export function proposeScreenSchema(screenId: ScreenId): Proposal {
  switch (screenId) {
    case "/campus":
      return { schemaId: "Campus[]", zodRef: "CampusSchema.array()" };
    case "/facultades":
      return { schemaId: "Facultad[]", zodRef: "FacultadSchema.array()" };
    case "/carreras-popup":
    case "/carreras":
      return { schemaId: "Carrera[]", zodRef: "CarreraSchema.array()" };
    case "/modalidad":
      return { schemaId: "Modalidad enum", zodRef: "ModalidadSchema" };
    case "/carrera/[id]":
      return { schemaId: "Carrera", zodRef: "CarreraSchema" };
    case "/campus-meta":
      return { schemaId: "CampusMeta[]", zodRef: "CampusMetaSchema.array()" };
    default:
      return { schemaId: "unknown", zodRef: "unknown" };
  }
}

export function ingestScreenData(screenId: ScreenId, json: unknown) {
  const { actions } = useAppStore.getState();
  const appliedTo: string[] = [];
  const warnings: string[] = [];

  if (screenId === "/campus") {
    const { items, warnings: w } = safeParseArray<Campus>(CampusSchema, json);
    warnings.push(...w);
    actions.upsertCampus(items);
    appliedTo.push("campus");
  }

  if (screenId === "/facultades") {
    const { items, warnings: w } = safeParseArray<Facultad>(FacultadSchema, json);
    warnings.push(...w);
    actions.upsertFacultades(items);
    appliedTo.push("facultades");
  }

  if (screenId === "/carreras" || screenId === "/carreras-popup" || screenId === "/carrera/[id]") {
    const schema = screenId === "/carrera/[id]" ? CarreraSchema : CarreraSchema;
    if (Array.isArray(json)) {
      const { items, warnings: w } = safeParseArray<Carrera>(schema, json);
      warnings.push(...w);
      actions.upsertCarreras(items);
    } else {
      const single = schema.safeParse(json);
      if (single.success) {
        actions.upsertCarreras([single.data]);
      } else {
        warnings.push(single.error.message);
      }
    }
    appliedTo.push("carreras");
  }

  if (screenId === "/campus-meta") {
    const { items, warnings: w } = safeParseArray<{ id: string; imagen?: string; direccion?: string; ciudad?: string; mapUrl?: string }>(CampusMetaSchema, json);
    warnings.push(...w);
    actions.upsertCampusMeta(items as { id: string; imagen?: string; direccion?: string; ciudad?: string; mapUrl?: string }[]);
    appliedTo.push("campusMeta");
  }

  return { appliedTo, warnings: warnings.length ? warnings : undefined };
}

export function createIngestGlobal() {
  if (typeof window === "undefined") return;
  const dbg = (...args: unknown[]) => console.log('[INGEST]', ...args);
  (window as unknown as { cexcieIngest?: (screenId: ScreenId, json: unknown) => { appliedTo: string[]; warnings?: string[] } }).cexcieIngest = (
    screenId: ScreenId,
    json: unknown,
  ) => ingestScreenData(screenId, json);

  // Ensure essential JSON is present. Do it idempotently: only when store is empty.
  const state = useAppStore.getState();
  const hasCampus = Object.keys(state.campusById).length > 0;
  const hasCampusMeta = Object.keys(state.campusMetaById).length > 0;
  const hasFacultades = state.facultadIds.length > 0;
  const hasCarreras = state.carreraIds.length > 0;
  dbg('bootstrap', { hasCampus, hasCampusMeta, hasFacultades, hasCarreras });

  if (!hasCampus) {
    // Preferir API (BD) con fallback a /data y, como último recurso, JSON embebido
    fetch("/api/campus")
      .then(r=>r.json())
      .then(j=>{ const res = ingestScreenData("/campus", j); dbg('/api/campus loaded', Array.isArray(j)?j.length:undefined, res); })
      .catch(()=>{
        fetch("/data/campus.json").then(r=>r.json()).then(j=>{ const res = ingestScreenData("/campus", j); dbg('/data/campus.json loaded', Array.isArray(j)?j.length:undefined, res); }).catch((e)=>{
          dbg('campus public fallback error', e);
          try { const res = ingestScreenData("/campus", campusJson as unknown); dbg('bundled campus.json applied', res); } catch {}
        });
      });
  }
  if (!hasCampusMeta) {
    try { ingestScreenData("/campus-meta", campusMetaJson as unknown); } catch {}
    fetch("/data/campusMeta.json").then(r=>r.json()).then(j=>{ const res = ingestScreenData("/campus-meta", j); dbg('/data/campusMeta.json loaded', Array.isArray(j)?j.length:undefined, res); }).catch((e)=>{ dbg('campusMeta fallback error', e); });
  }
  if (!hasFacultades) {
    fetch("/api/facultades")
      .then(r=>r.json())
      .then(j=>{ const res = ingestScreenData("/facultades", j); dbg('/api/facultades loaded', Array.isArray(j)?j.length:undefined, res); })
      .catch(()=>{
        fetch("/data/facultades.json").then(r=>r.json()).then(j=>{ const res = ingestScreenData("/facultades", j); dbg('/data/facultades.json loaded', Array.isArray(j)?j.length:undefined, res); }).catch((e)=>{ dbg('facultades fallback error', e); });
      });
  }
  if (!hasCarreras) {
    fetch("/api/carreras")
      .then(r=>r.json())
      .then(j=>{ const res = ingestScreenData("/carreras", j); dbg('/api/carreras loaded', Array.isArray(j)?j.length:undefined, res); })
      .catch(()=>{
        fetch("/data/carreras.json").then(r=>r.json()).then(j=>{ const res = ingestScreenData("/carreras", j); dbg('/data/carreras.json loaded', Array.isArray(j)?j.length:undefined, res); }).catch((e)=>{ dbg('carreras fallback error', e); });
      });
  }
}

