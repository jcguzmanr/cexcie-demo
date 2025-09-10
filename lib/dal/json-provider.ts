// Provider que usa los archivos JSON actuales
import { BaseDataProvider } from './base-provider';
import { 
  Facultad, Campus, Carrera, CarreraDetalle, PlanEstudios, 
  Curso, Certificacion, ModalidadComparison, Precio, Periodo, Moneda 
} from '../types/entities';

export class JSONDataProvider extends BaseDataProvider {
  async getFacultades(): Promise<Facultad[]> {
    return this.measureOperation('getFacultades (JSON)', async () => {
      return this.getCachedData('facultades', async () => {
        const data = await import('../../public/data/facultades.json');
        return data.default || data;
      });
    });
  }

  async getCampus(): Promise<Campus[]> {
    return this.measureOperation('getCampus (JSON)', async () => {
      return this.getCachedData('campus', async () => {
        const data = await import('../../public/data/campus.json');
        return data.default || data;
      });
    });
  }

  async getCarreras(): Promise<Carrera[]> {
    return this.measureOperation('getCarreras (JSON)', async () => {
      return this.getCachedData('carreras', async () => {
        const data = await import('../../public/data/carreras.json');
        return data.default || data;
      });
    });
  }

  async getCarreraById(id: string): Promise<CarreraDetalle | null> {
    return this.measureOperation(`getCarreraById ${id} (JSON)`, async () => {
      try {
        const data = await import('../../public/data/detalle-carrera.json');
        const carrera = data.default || data;
        
        // Buscar por ID en el detalle
        if (carrera.id === id) {
          // Mapear la estructura del JSON a la interfaz CarreraDetalle
          return {
            id: carrera.id,
            nombre: carrera.nombre,
            facultadId: carrera.facultad || 'unknown',
            modalidades: carrera.modalidades || [],
            campus: carrera.campus || [],
            imagen: carrera.secciones?.sobre?.media?.src || '',
            secciones: carrera.secciones
          } as CarreraDetalle;
        }
        
        return null;
      } catch (error) {
        console.error('Error loading carrera detail:', error);
        return null;
      }
    });
  }

  async getCarrerasByCampus(campusId: string): Promise<Carrera[]> {
    return this.measureOperation(`getCarrerasByCampus ${campusId} (JSON)`, async () => {
      const carreras = await this.getCarreras();
      return carreras.filter(carrera => 
        carrera.campus.includes(campusId)
      );
    });
  }

  async getCarrerasByFacultad(facultadId: string): Promise<Carrera[]> {
    return this.measureOperation(`getCarrerasByFacultad ${facultadId} (JSON)`, async () => {
      const carreras = await this.getCarreras();
      return carreras.filter(carrera => 
        carrera.facultadId === facultadId
      );
    });
  }

  async getPlanEstudios(carreraId: string): Promise<PlanEstudios[]> {
    return this.measureOperation(`getPlanEstudios ${carreraId} (JSON)`, async () => {
      const carrera = await this.getCarreraById(carreraId);
      if (!carrera?.secciones?.planEstudios?.ciclos) {
        return [];
      }

      return carrera.secciones.planEstudios.ciclos.map(ciclo => ({
        carreraId,
        cicloNumero: ciclo.numero,
        creditos: ciclo.creditos,
        etapa: ciclo.etapa,
        etapaDescripcion: carrera.secciones.planEstudios?.legendEtapas?.[ciclo.etapa]?.label || '',
        etapaColor: carrera.secciones.planEstudios?.legendEtapas?.[ciclo.etapa]?.color || '',
        cursos: ciclo.cursos,
        notas: ciclo.notas
      }));
    });
  }

  async getCursos(carreraId: string): Promise<Curso[]> {
    return this.measureOperation(`getCursos ${carreraId} (JSON)`, async () => {
      const planEstudios = await this.getPlanEstudios(carreraId);
      const cursos: Curso[] = [];
      let cursoId = 1;

      planEstudios.forEach(ciclo => {
        ciclo.cursos.forEach(nombreCurso => {
          cursos.push({
            id: cursoId++,
            carreraId,
            cicloNumero: ciclo.cicloNumero,
            nombre: nombreCurso,
            creditos: 0, // No disponible en JSON actual
            tipo: 'obligatorio' as const,
            prerequisitos: []
          });
        });
      });

      return cursos;
    });
  }

  async getCertificaciones(carreraId: string): Promise<Certificacion[]> {
    return this.measureOperation(`getCertificaciones ${carreraId} (JSON)`, async () => {
      const carrera = await this.getCarreraById(carreraId);
      if (!carrera?.secciones?.sobre?.infoCards) {
        return [];
      }

      const certificacionCard = carrera.secciones.sobre.infoCards.find(
        card => card.id === 'certificaciones'
      );

      if (!certificacionCard || !Array.isArray(certificacionCard.contenido)) {
        return [];
      }

      return (certificacionCard.contenido as string[]).map((nombre, index) => ({
        id: index + 1,
        carreraId,
        nombre,
        descripcion: `Certificación en ${nombre}`,
        nivel: 'intermedio' as const
      }));
    });
  }

  async getModalidadComparison(): Promise<ModalidadComparison[]> {
    return this.measureOperation('getModalidadComparison (JSON)', async () => {
      return this.getCachedData('modalidad-comparison', async () => {
        const data = await import('../../public/data/modalidad-comparison.json');
        const rawData = data.default || data;
        
        // Mapear la estructura del JSON a la interfaz ModalidadComparison
        return rawData.map((item: Record<string, unknown>) => ({
          careerId: item.career_id as string,
          careerName: item.career_name as string,
          comparisonCategories: item.comparison_categories as Array<{
            category: string;
            presencial: string;
            semipresencial: string;
            distancia: string;
          }>
        }));
      });
    });
  }

  async getPrecios(carreraId: string, campusId: string, modalidadId: string): Promise<Precio[]> {
    // Los precios no están disponibles en los JSON actuales
    return [];
  }

  async getPeriodos(): Promise<Periodo[]> {
    // Los periodos no están disponibles en los JSON actuales
    return [];
  }

  async getMonedas(): Promise<Moneda[]> {
    // Las monedas no están disponibles en los JSON actuales
    return [];
  }

  // Métodos específicos del JSON Provider
  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    return this.getCacheStats();
  }

  async clearCache(): Promise<void> {
    this.clearCache();
  }
}
