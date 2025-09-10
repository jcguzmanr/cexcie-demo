// Clase base para todos los providers
import { DataProvider, CacheEntry } from '../types/dal';
import { 
  Facultad, Campus, Carrera, CarreraDetalle, PlanEstudios, 
  Curso, Certificacion, ModalidadComparison, Precio, Periodo, Moneda 
} from '../types/entities';

export abstract class BaseDataProvider implements DataProvider {
  protected cache = new Map<string, CacheEntry<unknown>>();
  protected defaultTTL = 5 * 60 * 1000; // 5 minutos

  abstract getFacultades(): Promise<Facultad[]>;
  abstract getCampus(): Promise<Campus[]>;
  abstract getCarreras(): Promise<Carrera[]>;
  abstract getCarreraById(id: string): Promise<CarreraDetalle | null>;
  abstract getCarrerasByCampus(campusId: string): Promise<Carrera[]>;
  abstract getCarrerasByFacultad(facultadId: string): Promise<Carrera[]>;
  abstract getPlanEstudios(carreraId: string): Promise<PlanEstudios[]>;
  abstract getCursos(carreraId: string): Promise<Curso[]>;
  abstract getCertificaciones(carreraId: string): Promise<Certificacion[]>;
  abstract getModalidadComparison(): Promise<ModalidadComparison[]>;
  abstract getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<Precio[]>;
  abstract getPeriodos(): Promise<Periodo[]>;
  abstract getMonedas(): Promise<Moneda[]>;

  protected getCachedData<T>(key: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    const cacheKey = `base_${key}`;
    const cached = this.cache.get(cacheKey);
    const cacheTTL = ttl || this.defaultTTL;

    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return Promise.resolve(cached.data as T);
    }

    return loader().then(data => {
      this.cache.set(cacheKey, { data, timestamp: Date.now(), ttl: cacheTTL });
      return data;
    });
  }

  protected clearCache(): void {
    this.cache.clear();
  }

  protected getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  protected logOperation(operation: string, duration: number, success: boolean): void {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${operation} completed in ${duration}ms`);
  }

  protected async measureOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.logOperation(operation, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logOperation(operation, duration, false);
      throw error;
    }
  }
}
