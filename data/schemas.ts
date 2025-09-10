import { z } from "zod";

export const CampusSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
});

export const CampusMetaSchema = z.object({
  id: z.string().min(1), // matches Campus.id
  imagen: z.string().min(1).optional(), // path under /public/campus/<id>.jpg
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  mapUrl: z.string().url().optional(),
});

export const ModalidadSchema = z.enum(["presencial", "semipresencial", "distancia"]);

export const FacultadSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  modalidades: z.array(ModalidadSchema).default([]),
});

export const CarreraSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  facultadId: z.string().min(1),
  modalidades: z.array(ModalidadSchema).default([]),
  campus: z.array(z.string()).default([]),
  // Permitir null/undefined provenientes de la BD
  duracion: z.string().nullish(),
  mallaResumen: z.array(z.string()).default([]),
  grado: z.string().nullish(),
  titulo: z.string().nullish(),
  imagen: z.string().nullish(),
});

// Esquemas para comparación de modalidades
export const ModalidadComparisonCategorySchema = z.object({
  category: z.string().min(1),
  presencial: z.string().min(1),
  semipresencial: z.string().min(1),
  distancia: z.string().min(1),
});

export const ModalidadComparisonSchema = z.object({
  career_id: z.string().min(1),
  career_name: z.string().min(1),
  comparison_categories: z.array(ModalidadComparisonCategorySchema),
});

export type Campus = z.infer<typeof CampusSchema>;
export type Modalidad = z.infer<typeof ModalidadSchema>;
export type Facultad = z.infer<typeof FacultadSchema>;
export type Carrera = z.infer<typeof CarreraSchema>;
export type CampusMeta = z.infer<typeof CampusMetaSchema>;
export type ModalidadComparison = z.infer<typeof ModalidadComparisonSchema>;
export type ModalidadComparisonCategory = z.infer<typeof ModalidadComparisonCategorySchema>;

