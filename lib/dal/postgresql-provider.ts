// Provider para PostgreSQL
import { Pool, PoolClient } from 'pg';
import { BaseDataProvider } from './base-provider';
import { 
  Facultad, Campus, Carrera, CarreraDetalle, PlanEstudios, 
  Curso, Certificacion, ModalidadComparison, Precio, Periodo, Moneda 
} from '../types/entities';

export class PostgreSQLDataProvider extends BaseDataProvider {
  private pool: Pool;

  constructor(databaseUrl: string) {
    super();
    this.pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getFacultades(): Promise<Facultad[]> {
    return this.measureOperation('getFacultades (PostgreSQL)', async () => {
      const result = await this.pool.query(
        'SELECT id, nombre FROM facultad ORDER BY nombre'
      );
      return result.rows;
    });
  }

  async getCampus(): Promise<Campus[]> {
    return this.measureOperation('getCampus (PostgreSQL)', async () => {
      const result = await this.pool.query(`
        SELECT c.id, c.nombre, cm.ciudad, cm.region
        FROM campus c
        LEFT JOIN campus_meta cm ON c.id = cm.id
        ORDER BY c.nombre
      `);
      return result.rows;
    });
  }

  async getCarreras(): Promise<Carrera[]> {
    return this.measureOperation('getCarreras (PostgreSQL)', async () => {
      const result = await this.pool.query(`
        SELECT 
          c.id, c.nombre, c.facultad_id as "facultadId", c.imagen,
          c.duracion as "duracionAnios", c.grado as "gradoAcademico", c.titulo as "tituloProfesional",
          f.nombre as facultad_nombre,
          array_agg(DISTINCT cm.campus_id) as campus,
          array_agg(DISTINCT md.modalidad_id) as modalidades
        FROM carrera c
        JOIN facultad f ON c.facultad_id = f.id
        LEFT JOIN carrera_campus cm ON c.id = cm.carrera_id
        LEFT JOIN carrera_modalidad md ON c.id = md.carrera_id
        GROUP BY c.id, c.nombre, c.facultad_id, c.imagen, c.duracion, c.grado, c.titulo, f.nombre
        ORDER BY c.nombre
      `);
      
      return result.rows.map(row => ({
        ...row,
        campus: row.campus.filter(Boolean),
        modalidades: row.modalidades.filter(Boolean)
      }));
    });
  }

  async getCarreraById(id: string): Promise<CarreraDetalle | null> {
    return this.measureOperation(`getCarreraById ${id} (PostgreSQL)`, async () => {
      const result = await this.pool.query(`
        SELECT 
          c.*,
          f.nombre as facultad_nombre,
          json_agg(DISTINCT jsonb_build_object(
            'id', camp.id,
            'nombre', camp.nombre
          )) as campus,
          array_agg(DISTINCT md.modalidad_id) as modalidades
        FROM carrera c
        JOIN facultad f ON c.facultad_id = f.id
        LEFT JOIN carrera_campus cm ON c.id = cm.carrera_id
        LEFT JOIN campus camp ON cm.campus_id = camp.id
        LEFT JOIN carrera_modalidad md ON c.id = md.carrera_id
        WHERE c.id = $1
        GROUP BY c.id, c.nombre, c.facultad_id, c.imagen, c.duracion, c.grado, c.titulo, f.nombre
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      // Construir la estructura de CarreraDetalle
      return {
        id: row.id,
        nombre: row.nombre,
        facultadId: row.facultad_id,
        modalidades: row.modalidades.filter(Boolean),
        campus: row.campus.map((c: { id: string }) => c.id),
        imagen: row.imagen,
        duracionAnios: row.duracion ? parseInt(row.duracion) : undefined,
        gradoAcademico: row.grado,
        tituloProfesional: row.titulo,
        secciones: {
          sobre: {
            titulo: `Sobre ${row.nombre}`,
            descripcion: `Información sobre la carrera de ${row.nombre}`,
            media: {
              type: 'image',
              alt: `Imagen de ${row.nombre}`,
              src: row.imagen
            },
            infoCards: []
          }
        }
      };
    });
  }

  async getCarrerasByCampus(campusId: string): Promise<Carrera[]> {
    return this.measureOperation(`getCarrerasByCampus ${campusId} (PostgreSQL)`, async () => {
      const result = await this.pool.query(`
        SELECT DISTINCT c.*, f.nombre as facultad_nombre
        FROM carrera c
        JOIN facultad f ON c.facultad_id = f.id
        JOIN carrera_campus cm ON c.id = cm.carrera_id
        WHERE cm.campus_id = $1
        ORDER BY c.nombre
      `, [campusId]);
      
      return result.rows;
    });
  }

  async getCarrerasByFacultad(facultadId: string): Promise<Carrera[]> {
    return this.measureOperation(`getCarrerasByFacultad ${facultadId} (PostgreSQL)`, async () => {
      const result = await this.pool.query(`
        SELECT c.*, f.nombre as facultad_nombre
        FROM carrera c
        JOIN facultad f ON c.facultad_id = f.id
        WHERE c.facultad_id = $1
        ORDER BY c.nombre
      `, [facultadId]);
      
      return result.rows;
    });
  }

  async getPlanEstudios(carreraId: string): Promise<PlanEstudios[]> {
    // Esta tabla no existe en el esquema actual, retornar vacío
    return [];
  }

  async getCursos(carreraId: string): Promise<Curso[]> {
    // Esta tabla no existe en el esquema actual, retornar vacío
    return [];
  }

  async getCertificaciones(carreraId: string): Promise<Certificacion[]> {
    // Esta tabla no existe en el esquema actual, retornar vacío
    return [];
  }

  async getModalidadComparison(): Promise<ModalidadComparison[]> {
    // Esta tabla no existe en el esquema actual, retornar vacío
    return [];
  }

  async getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<Precio[]> {
    return this.measureOperation(`getPrecios ${carreraId} (PostgreSQL)`, async () => {
      const result = await this.pool.query(`
        SELECT 
          carrera_id as "carreraId",
          campus_id as "campusId",
          modalidad_id as "modalidadId",
          periodo_id as "periodoId",
          item,
          monto,
          moneda_codigo as "monedaCodigo",
          vigente_desde as "vigenteDesde",
          vigente_hasta as "vigenteHasta"
        FROM precio
        WHERE carrera_id = $1 AND campus_id = $2 AND modalidad_id = $3
        ORDER BY periodo_id, item
      `, [carreraId, campusId, modalidadId]);
      
      return result.rows;
    });
  }

  async getPeriodos(): Promise<Periodo[]> {
    return this.measureOperation('getPeriodos (PostgreSQL)', async () => {
      const result = await this.pool.query(`
        SELECT id, anio, ciclo, inicio, fin
        FROM periodo
        ORDER BY anio DESC, ciclo DESC
      `);
      
      return result.rows;
    });
  }

  async getMonedas(): Promise<Moneda[]> {
    return this.measureOperation('getMonedas (PostgreSQL)', async () => {
      const result = await this.pool.query(`
        SELECT codigo, simbolo
        FROM moneda
        ORDER BY codigo
      `);
      
      return result.rows;
    });
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getConnectionStats(): Promise<{ total: number; idle: number; waiting: number }> {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount
    };
  }
}
