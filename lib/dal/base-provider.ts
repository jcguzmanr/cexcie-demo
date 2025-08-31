// Clase base para todos los providers
import { DataProvider, CacheEntry } from '../types/dal';

export abstract class BaseDataProvider implements DataProvider {
  protected cache = new Map<string, CacheEntry<any>>();
  protected defaultTTL = 5 * 60 * 1000; // 5 minutos

  abstract getFacultades(): Promise<any[]>;
  abstract getCampus(): Promise<any[]>;
  abstract getCarreras(): Promise<any[]>;
  abstract getCarreraById(id: string): Promise<any | null>;
  abstract getCarrerasByCampus(campusId: string): Promise<any[]>;
  abstract getCarrerasByFacultad(facultadId: string): Promise<any[]>;
  abstract getPlanEstudios(carreraId: string): Promise<any[]>;
  abstract getCursos(carreraId: string): Promise<any[]>;
  abstract getCertificaciones(carreraId: string): Promise<any[]>;
  abstract getModalidadComparison(): Promise<any[]>;
  abstract getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<any[]>;
  abstract getPeriodos(): Promise<any[]>;
  abstract getMonedas(): Promise<any[]>;

  protected getCachedData<T>(key: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    const cacheKey = `base_${key}`;
    const cached = this.cache.get(cacheKey);
    const cacheTTL = ttl || this.defaultTTL;

    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
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
