"use client";
import { create } from "zustand";
import { Carrera, Campus, Facultad, Modalidad, CampusMeta } from "@/data/schemas";

type EntityMap<T extends { id: string }> = Record<string, T>;

export type AppState = {
  // Selection state
  selectedCampus?: Campus;
  selectedModalidad?: Modalidad;
  selectedFacultad?: Facultad;
  selectedCarreras: Carrera[]; // max 3

  // Ingested data registries
  campusById: EntityMap<Campus>;
  campusIds: string[];
  facultadById: EntityMap<Facultad>;
  facultadIds: string[];
  carreraById: EntityMap<Carrera>;
  carreraIds: string[];
  campusMetaById: EntityMap<CampusMeta>;

  actions: {
    setCampus: (c: Campus) => void;
    setModalidad: (m: Modalidad) => void;
    setFacultad: (f: Facultad) => void;
    toggleCarrera: (c: Carrera) => void; // respects max 3
    clearComparador: () => void;
    // ingestion helpers
    upsertCampus: (items: Campus[]) => void;
    upsertFacultades: (items: Facultad[]) => void;
    upsertCarreras: (items: Carrera[]) => void;
    upsertCampusMeta: (items: CampusMeta[]) => void;
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedCarreras: [],

  campusById: {},
  campusIds: [],
  facultadById: {},
  facultadIds: [],
  carreraById: {},
  carreraIds: [],
  campusMetaById: {},

  actions: {
    setCampus: (c) => set({ selectedCampus: c }),
    setModalidad: (m) => set({ selectedModalidad: m }),
    setFacultad: (f) => set({ selectedFacultad: f }),
    toggleCarrera: (c) =>
      set((state) => {
        const exists = state.selectedCarreras.some((x) => x.id === c.id);
        if (exists) {
          return {
            selectedCarreras: state.selectedCarreras.filter((x) => x.id !== c.id),
          };
        }
        if (state.selectedCarreras.length >= 3) {
          return state; // ignore beyond 3
        }
        return { selectedCarreras: [...state.selectedCarreras, c] };
      }),
    clearComparador: () => set({ selectedCarreras: [] }),

    upsertCampus: (items) =>
      set((state) => {
        const next = { ...state.campusById } as EntityMap<Campus>;
        const ids = new Set(state.campusIds);
        for (const it of items) {
          next[it.id] = { ...next[it.id], ...it };
          ids.add(it.id);
        }
        return { campusById: next, campusIds: Array.from(ids) };
      }),
    upsertFacultades: (items) =>
      set((state) => {
        const next = { ...state.facultadById } as EntityMap<Facultad>;
        const ids = new Set(state.facultadIds);
        for (const it of items) {
          next[it.id] = { ...next[it.id], ...it };
          ids.add(it.id);
        }
        return { facultadById: next, facultadIds: Array.from(ids) };
      }),
    upsertCarreras: (items) =>
      set((state) => {
        const next = { ...state.carreraById } as EntityMap<Carrera>;
        const ids = new Set(state.carreraIds);
        for (const it of items) {
          next[it.id] = { ...next[it.id], ...it };
          ids.add(it.id);
        }
        return { carreraById: next, carreraIds: Array.from(ids) };
      }),
    upsertCampusMeta: (items) =>
      set((state) => {
        const next = { ...state.campusMetaById } as EntityMap<CampusMeta>;
        for (const it of items) {
          next[it.id] = { ...next[it.id], ...it };
        }
        return { campusMetaById: next };
      }),
  },
}));

export const getCampusList = (s: AppState) => s.campusIds.map((id) => s.campusById[id]);
export const getFacultadList = (s: AppState) => s.facultadIds.map((id) => s.facultadById[id]);
export const getCarreraList = (s: AppState) => s.carreraIds.map((id) => s.carreraById[id]);

