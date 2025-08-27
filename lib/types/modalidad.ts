export interface Tag {
  texto: string;
  emoji: string;
  descripcion: string;
}

export interface Caracteristicas {
  horarios: string;
  interaccion: string;
  ubicacion: string;
  tecnologia: string;
  flexibilidad: string;
}

export interface Modalidad {
  id: "presencial" | "semipresencial" | "distancia";
  nombre: string;
  descripcion: string;
  tags: Tag[];
  caracteristicas: Caracteristicas;
}

export type ModalidadId = Modalidad["id"];
