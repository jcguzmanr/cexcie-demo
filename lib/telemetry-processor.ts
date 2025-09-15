import { Telemetry } from './telemetry';

/**
 * Procesa los eventos de telemetría para extraer datos relevantes para el lead
 */
export function processTelemetryForLead(sessionId: string): {
  telemetry_events: Array<{
    page_path: string;
    page_title?: string;
    action_type: string;
    entity_type?: string;
    entity_id?: string;
    entity_name?: string;
    metadata: Record<string, unknown>;
    timestamp: string;
  }>;
  program_selections: Array<{
    program_id: string;
    program_name: string;
    program_type: string;
    department_id?: string;
    department_name?: string;
    selection_source: string;
    selection_order: number;
  }>;
} {
  const events = Telemetry.events.getAll();
  const sessionEvents = events.filter(event => event.sessionId === sessionId);
  
  // Procesar eventos de telemetría
  const telemetry_events = sessionEvents.map(event => ({
    page_path: event.page?.path || '',
    page_title: event.page?.title,
    action_type: event.semantic?.action || event.type,
    entity_type: event.semantic?.entityType,
    entity_id: event.semantic?.entityId,
    entity_name: event.semantic?.label,
    metadata: (event.details?.custom as Record<string, unknown>) || {},
    timestamp: event.ts
  }));

  // Extraer selecciones de programas de los eventos
  const programSelections: Array<{
    program_id: string;
    program_name: string;
    program_type: string;
    department_id?: string;
    department_name?: string;
    selection_source: string;
    selection_order: number;
  }> = [];

  // Buscar eventos de selección de carreras/programas
  const selectionEvents = sessionEvents.filter(event => 
    event.semantic?.action === 'selected' && 
    event.semantic?.entityType === 'career'
  );

  // Obtener datos de carreras seleccionadas del localStorage o parámetros
  type CarreraStore = { id: string; nombre: string; facultadId?: string };
  type FacultadStore = { id: string; nombre: string };
  let carrerasMap: Record<string, CarreraStore> = {};
  let facultadesMap: Record<string, FacultadStore> = {};
  
  // Intentar obtener datos del localStorage si estamos en el cliente
  if (typeof window !== 'undefined') {
    try {
      const storeData = localStorage.getItem('cexcie-store');
      if (storeData) {
        const parsed = JSON.parse(storeData);
        selectedCarreras = parsed.selectedCarreras || [];
        carrerasMap = parsed.carreraById || {};
        facultadesMap = parsed.facultadById || {};
      }
    } catch (error) {
      console.warn('Error reading store from localStorage:', error);
    }
  }

  selectedCarreras.forEach((carrera, index) => {
    const carreraData = carrerasMap[carrera.id];
    const facultadData = carreraData ? facultadesMap[carreraData.facultadId] : null;
    
    // Determinar la fuente de selección basada en los eventos
    let selectionSource = 'unknown';
    const relatedEvent = selectionEvents.find(event => 
      event.semantic?.entityId === carrera.id || 
      (event.semantic?.label && carrera.nombre && event.semantic.label.includes(carrera.nombre))
    );
    
    if (relatedEvent) {
      if (relatedEvent.page.path.includes('/comparador')) {
        selectionSource = 'comparator';
      } else if (relatedEvent.page.path.includes('/carrera/')) {
        selectionSource = 'program_detail';
      } else if (relatedEvent.page.path.includes('/carreras')) {
        selectionSource = 'programs_list';
      } else {
        selectionSource = 'navigation';
      }
    }

    programSelections.push({
      program_id: carrera.id,
      program_name: carrera.nombre,
      program_type: 'career',
      department_id: carreraData?.facultadId,
      department_name: facultadData?.nombre,
      selection_source: selectionSource,
      selection_order: index + 1
    });
  });

  return {
    telemetry_events,
    program_selections: programSelections
  };
}

/**
 * Genera un resumen de la sesión del usuario para logging
 */
export function generateSessionSummary(sessionId: string): {
  total_events: number;
  pages_visited: string[];
  programs_selected: string[];
  comparison_views: number;
  session_duration?: number;
} {
  const events = Telemetry.events.getAll();
  const sessionEvents = events.filter(event => event.sessionId === sessionId);
  
  const pagesVisited = [...new Set(sessionEvents.map(event => event.page.path))];
  const programsSelected = sessionEvents
    .filter(event => event.semantic.action === 'selected' && event.semantic.entityType === 'career')
    .map(event => event.semantic.entityId || event.semantic.label)
    .filter(Boolean);
  
  const comparisonViews = sessionEvents.filter(event => 
    event.semantic.entityType === 'comparison' || 
    event.page.path.includes('/comparador')
  ).length;

  // Calcular duración de sesión si es posible
  let sessionDuration: number | undefined;
  if (sessionEvents.length > 0) {
    const firstEvent = sessionEvents[0];
    const lastEvent = sessionEvents[sessionEvents.length - 1];
    const startTime = new Date(firstEvent.ts).getTime();
    const endTime = new Date(lastEvent.ts).getTime();
    sessionDuration = Math.round((endTime - startTime) / 1000); // en segundos
  }

  return {
    total_events: sessionEvents.length,
    pages_visited: pagesVisited,
    programs_selected: [...new Set(programsSelected)],
    comparison_views: comparisonViews,
    session_duration: sessionDuration
  };
}

/**
 * Valida si la sesión tiene suficiente actividad para justificar un lead
 */
export function validateSessionForLead(sessionId: string): {
  is_valid: boolean;
  reasons: string[];
} {
  const summary = generateSessionSummary(sessionId);
  const reasons: string[] = [];
  let isValid = true;

  if (summary.total_events < 3) {
    isValid = false;
    reasons.push('Sesión muy corta (menos de 3 eventos)');
  }

  if (summary.pages_visited.length < 2) {
    isValid = false;
    reasons.push('Usuario visitó menos de 2 páginas');
  }

  if (summary.programs_selected.length === 0) {
    isValid = false;
    reasons.push('Usuario no seleccionó ningún programa');
  }

  if (summary.session_duration && summary.session_duration < 30) {
    isValid = false;
    reasons.push('Sesión muy corta (menos de 30 segundos)');
  }

  return {
    is_valid: isValid,
    reasons
  };
}
