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
  duracion: z.string().optional(),
  mallaResumen: z.array(z.string()).optional(),
  grado: z.string().optional(),
  titulo: z.string().optional(),
  imagen: z.string().optional(),
});

export type Campus = z.infer<typeof CampusSchema>;
export type Modalidad = z.infer<typeof ModalidadSchema>;
export type Facultad = z.infer<typeof FacultadSchema>;
export type Carrera = z.infer<typeof CarreraSchema>;
export type CampusMeta = z.infer<typeof CampusMetaSchema>;

