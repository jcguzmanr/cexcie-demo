// Tipos para el sistema de acceso a datos
import { 
  Facultad, Campus, Carrera, CarreraDetalle, PlanEstudios, 
  Curso, Certificacion, ModalidadComparison, Precio, Periodo, Moneda 
} from './entities';

export interface DataProvider {
  getFacultades(): Promise<Facultad[]>;
  getCampus(): Promise<Campus[]>;
  getCarreras(): Promise<Carrera[]>;
  getCarreraById(id: string): Promise<CarreraDetalle | null>;
  getCarrerasByCampus(campusId: string): Promise<Carrera[]>;
  getCarrerasByFacultad(facultadId: string): Promise<Carrera[]>;
  getPlanEstudios(carreraId: string): Promise<PlanEstudios[]>;
  getCursos(carreraId: string): Promise<Curso[]>;
  getCertificaciones(carreraId: string): Promise<Certificacion[]>;
  getModalidadComparison(): Promise<ModalidadComparison[]>;
  getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<Precio[]>;
  getPeriodos(): Promise<Periodo[]>;
  getMonedas(): Promise<Moneda[]>;
}

export interface DataProviderConfig {
  source: 'json' | 'postgresql' | 'hybrid';
  jsonPath?: string;
  databaseUrl?: string;
  enableCache?: boolean;
  cacheTTL?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ConsistencyReport {
  table: string;
  jsonCount: number;
  postgresCount: number;
  differences: Difference[];
  consistent: boolean;
}

export interface Difference {
  type: 'missing_in_postgresql' | 'missing_in_json' | 'data_mismatch';
  key: string | number;
  jsonData?: Record<string, unknown>;
  postgresData?: Record<string, unknown>;
  field?: string;
  jsonValue?: unknown;
  postgresValue?: unknown;
}

export interface HealthStatus {
  postgres: boolean;
  json: boolean;
  timestamp: Date;
  details?: {
    postgresError?: string;
    jsonError?: string;
  };
}
