// Provider híbrido para migración gradual
import { BaseDataProvider } from './base-provider';
import { JSONDataProvider } from './json-provider';
import { PostgreSQLDataProvider } from './postgresql-provider';
import { 
  Facultad, Campus, Carrera, CarreraDetalle, PlanEstudios, 
  Curso, Certificacion, ModalidadComparison, Precio, Periodo, Moneda 
} from '../types/entities';
import { HealthStatus } from '../types/dal';

export class HybridDataProvider extends BaseDataProvider {
  private postgresHealthy = true;
  private fallbackCount = 0;
  private readonly MAX_FALLBACKS = 5;
  private lastHealthCheck = Date.now();
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 segundos

  constructor(
    private jsonProvider: JSONDataProvider,
    private postgresProvider: PostgreSQLDataProvider
  ) {
    super();
  }

  async getFacultades(): Promise<Facultad[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getFacultades();
        console.log('✅ Data from PostgreSQL');
        this.fallbackCount = 0;
        this.updateHealthCheck();
        return data;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    // Fallback a JSON
    return this.jsonProvider.getFacultades();
  }

  async getCampus(): Promise<Campus[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCampus();
        console.log('✅ Data from PostgreSQL');
        this.fallbackCount = 0;
        this.updateHealthCheck();
        return data;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCampus();
  }

  async getCarreras(): Promise<Carrera[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCarreras();
        console.log('✅ Data from PostgreSQL');
        this.fallbackCount = 0;
        this.updateHealthCheck();
        return data;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCarreras();
  }

  async getCarreraById(id: string): Promise<CarreraDetalle | null> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCarreraById(id);
        if (data) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCarreraById(id);
  }

  async getCarrerasByCampus(campusId: string): Promise<Carrera[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCarrerasByCampus(campusId);
        console.log('✅ Data from PostgreSQL');
        this.fallbackCount = 0;
        this.updateHealthCheck();
        return data;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCarrerasByCampus(campusId);
  }

  async getCarrerasByFacultad(facultadId: string): Promise<Carrera[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCarrerasByFacultad(facultadId);
        console.log('✅ Data from PostgreSQL');
        this.fallbackCount = 0;
        this.updateHealthCheck();
        return data;
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCarrerasByFacultad(facultadId);
  }

  async getPlanEstudios(carreraId: string): Promise<PlanEstudios[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getPlanEstudios(carreraId);
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getPlanEstudios(carreraId);
  }

  async getCursos(carreraId: string): Promise<Curso[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCursos(carreraId);
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCursos(carreraId);
  }

  async getCertificaciones(carreraId: string): Promise<Certificacion[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getCertificaciones(carreraId);
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getCertificaciones(carreraId);
  }

  async getModalidadComparison(): Promise<ModalidadComparison[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getModalidadComparison();
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getModalidadComparison();
  }

  async getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<Precio[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getPrecios(carreraId, campusId, modalidadId);
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getPrecios(carreraId, campusId, modalidadId);
  }

  async getPeriodos(): Promise<Periodo[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getPeriodos();
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getPeriodos();
  }

  async getMonedas(): Promise<Moneda[]> {
    try {
      if (this.postgresHealthy && this.shouldTryPostgres()) {
        const data = await this.postgresProvider.getMonedas();
        if (data.length > 0) {
          console.log('✅ Data from PostgreSQL');
          this.fallbackCount = 0;
          this.updateHealthCheck();
          return data;
        }
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL failed, falling back to JSON:', error);
      this.handlePostgresFailure();
    }

    return this.jsonProvider.getMonedas();
  }

  private shouldTryPostgres(): boolean {
    // Solo intentar PostgreSQL si no hemos fallado demasiado recientemente
    return this.fallbackCount < this.MAX_FALLBACKS;
  }

  private updateHealthCheck(): void {
    this.lastHealthCheck = Date.now();
  }

  private handlePostgresFailure(): void {
    this.fallbackCount++;
    
    if (this.fallbackCount >= this.MAX_FALLBACKS) {
      console.error('❌ Too many PostgreSQL failures, switching to JSON-only mode');
      this.postgresHealthy = false;
      
      // Intentar recuperar PostgreSQL después de un tiempo
      setTimeout(() => {
        this.attemptPostgresRecovery();
      }, 30000); // 30 segundos
    }
  }

  private async attemptPostgresRecovery(): Promise<void> {
    try {
      const healthy = await this.postgresProvider.healthCheck();
      if (healthy) {
        console.log('✅ PostgreSQL recovered, switching back');
        this.postgresHealthy = true;
        this.fallbackCount = 0;
        this.lastHealthCheck = Date.now();
      } else {
        // Programar otro intento
        setTimeout(() => {
          this.attemptPostgresRecovery();
        }, 60000); // 1 minuto
      }
    } catch (error) {
      console.warn('⚠️ PostgreSQL recovery attempt failed:', error);
      // Programar otro intento
      setTimeout(() => {
        this.attemptPostgresRecovery();
      }, 60000); // 1 minuto
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const now = Date.now();
    let postgresHealth = false;
    let postgresError: string | undefined;

    try {
      postgresHealth = await this.postgresProvider.healthCheck();
    } catch (error) {
      postgresError = error instanceof Error ? error.message : 'Unknown error';
    }

    return {
      postgres: postgresHealth,
      json: true, // JSON siempre está disponible
      timestamp: new Date(now),
      details: {
        postgresError
      }
    };
  }

  getStats(): { 
    postgresHealthy: boolean; 
    fallbackCount: number; 
    lastHealthCheck: Date;
    uptime: number;
  } {
    return {
      postgresHealthy: this.postgresHealthy,
      fallbackCount: this.fallbackCount,
      lastHealthCheck: new Date(this.lastHealthCheck),
      uptime: Date.now() - this.lastHealthCheck
    };
  }

  async forcePostgresRecovery(): Promise<boolean> {
    try {
      const healthy = await this.postgresProvider.healthCheck();
      if (healthy) {
        this.postgresHealthy = true;
        this.fallbackCount = 0;
        this.lastHealthCheck = Date.now();
        console.log('✅ PostgreSQL recovery forced successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Forced PostgreSQL recovery failed:', error);
      return false;
    }
  }
}
