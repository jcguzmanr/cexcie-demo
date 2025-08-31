// Tipos base para todas las entidades del sistema
export interface Facultad {
  id: string;
  nombre: string;
  modalidades: string[];
}

export interface Campus {
  id: string;
  nombre: string;
  ciudad?: string;
  region?: string;
}

export interface Carrera {
  id: string;
  nombre: string;
  facultadId: string;
  modalidades: string[];
  campus: string[];
  imagen: string;
  duracionAnios?: number;
  duracionPeriodos?: number;
  gradoAcademico?: string;
  tituloProfesional?: string;
}

export interface CarreraDetalle extends Carrera {
  secciones: {
    sobre: {
      titulo: string;
      descripcion: string;
      media: {
        type: string;
        alt: string;
        src: string;
      };
      infoCards: Array<{
        id: string;
        icon: string;
        titulo: string;
        contenido: string | string[];
        descripcion: string;
      }>;
    };
    planEstudios?: {
      legendEtapas: Record<string, {
        label: string;
        color: string;
        descripcion: string;
      }>;
      ciclos: Array<{
        numero: number;
        creditos: number;
        etapa: string;
        cursos: string[];
        notas: string[];
      }>;
    };
    internacional?: any;
    empleabilidad?: any;
    costos?: any;
  };
}

export interface PlanEstudios {
  carreraId: string;
  cicloNumero: number;
  creditos: number;
  etapa: string;
  etapaDescripcion: string;
  etapaColor: string;
  cursos: string[];
  notas: string[];
}

export interface Curso {
  id: number;
  carreraId: string;
  cicloNumero: number;
  nombre: string;
  creditos: number;
  tipo: 'obligatorio' | 'electivo' | 'libre';
  prerequisitos?: string[];
}

export interface Certificacion {
  id: number;
  carreraId: string;
  nombre: string;
  descripcion: string;
  nivel: 'basico' | 'intermedio' | 'avanzado';
}

export interface ModalidadComparison {
  careerId: string;
  careerName: string;
  comparisonCategories: Array<{
    category: string;
    presencial: string;
    semipresencial: string;
    distancia: string;
  }>;
}

export interface Precio {
  carreraId: string;
  campusId: string;
  modalidadId: string;
  periodoId: string;
  item: 'matricula' | 'pension_mensual' | 'credito' | 'cuota';
  monto: number;
  monedaCodigo: string;
  vigenteDesde?: string;
  vigenteHasta?: string;
}

export interface Periodo {
  id: string;
  anio: number;
  ciclo: number;
  inicio?: string;
  fin?: string;
}

export interface Moneda {
  codigo: string;
  simbolo: string;
}
