import React from 'react';
import { Telemetry } from './telemetry';

/**
 * Common entity types for consistent tracking
 */
export const ENTITY_TYPES = {
  CAMPUS: 'campus',
  CAREER: 'career',
  FACULTY: 'faculty',
  BUTTON: 'button',
  LINK: 'link',
  FORM: 'form',
  FORM_FIELD: 'form_field',
  CONTAINER: 'container',
  CARD: 'card',
  MODAL: 'modal',
  TAB: 'tab',
  STEP: 'step',
  FILTER: 'filter',
  SORT: 'sort',
  SEARCH: 'search',
  COMPARISON: 'comparison',
  NAVIGATION: 'navigation',
  PAGE: 'page',
  STUDY_PLAN: 'study_plan',
  ACADEMIC_SECTION: 'academic_section',
  CAREER_COMPARISON: 'career_comparison',
  COMPARISON_ASPECT: 'comparison_aspect',
} as const;

/**
 * Common contexts for consistent tracking
 */
export const CONTEXTS = {
  HERO: 'hero_section',
  NAVIGATION: 'navigation',
  FOOTER: 'footer',
  SIDEBAR: 'sidebar',
  MAIN_CONTENT: 'main_content',
  COMPARISON_VIEW: 'comparison_view',
  SEARCH_RESULTS: 'search_results',
  FILTER_PANEL: 'filter_panel',
  FORM_SECTION: 'form_section',
  CARD_GRID: 'card_grid',
  MODAL_OVERLAY: 'modal_overlay',
  TAB_CONTENT: 'tab_content',
  STEP_WIZARD: 'step_wizard',
  ACADEMIC: 'academic',
  STUDY_PLAN: 'study_plan',
  CAREER_COMPARISON: 'career_comparison',
  COMPARISON_INTERFACE: 'comparison_interface',
} as const;

/**
 * Common actions for consistent tracking
 */
export const ACTIONS = {
  CLICKED: 'clicked',
  SELECTED: 'selected',
  SUBMITTED: 'submitted',
  CHANGED: 'changed',
  VIEWED: 'viewed',
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  OPENED: 'opened',
  CLOSED: 'closed',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SEARCHED: 'searched',
  FILTERED: 'filtered',
  SORTED: 'sorted',
  COMPARED: 'compared',
  NAVIGATED: 'navigated',
  LOADED: 'loaded',
} as const;

/**
 * Add semantic tracking attributes to an element
 * @param element - The HTML element to enhance
 * @param options - Semantic tracking options
 */
export function addSemanticTracking(
  element: HTMLElement,
  options: {
    label: string;
    entityType?: string;
    entityId?: string;
    context?: string;
  }
) {
  element.setAttribute('data-track', 'true');
  element.setAttribute('data-label', options.label);
  
  if (options.entityType) {
    element.setAttribute('data-entity-type', options.entityType);
  }
  
  if (options.entityId) {
    element.setAttribute('data-entity-id', options.entityId);
  }
  
  if (options.context) {
    element.setAttribute('data-context', options.context);
  }
}

/**
 * Add semantic tracking to a button element
 * @param button - The button element
 * @param label - Human-readable label
 * @param entityType - Type of entity (e.g., "campus", "career")
 * @param entityId - Unique identifier
 * @param context - Additional context
 */
export function trackButton(
  button: HTMLButtonElement,
  label: string,
  entityType?: string,
  entityId?: string,
  context?: string
) {
  addSemanticTracking(button, { label, entityType, entityId, context });
}

/**
 * Add semantic tracking to a link element
 * @param link - The anchor element
 * @param label - Human-readable label
 * @param entityType - Type of entity
 * @param entityId - Unique identifier
 * @param context - Additional context
 */
export function trackLink(
  link: HTMLAnchorElement,
  label: string,
  entityType?: string,
  entityId?: string,
  context?: string
) {
  addSemanticTracking(link, { label, entityType, entityId, context });
}

/**
 * Add semantic tracking to a form field
 * @param field - The form field element
 * @param label - Human-readable label
 * @param entityType - Type of field (e.g., "input", "select")
 * @param entityId - Unique identifier
 * @param context - Additional context
 */
export function trackFormField(
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  label: string,
  entityType?: string,
  entityId?: string,
  context?: string
) {
  addSemanticTracking(field, { label, entityType, entityId, context });
}

/**
 * Add semantic tracking to a container element
 * @param container - The container element
 * @param label - Human-readable label
 * @param entityType - Type of container
 * @param entityId - Unique identifier
 * @param context - Additional context
 */
export function trackContainer(
  container: HTMLElement,
  label: string,
  entityType?: string,
  entityId?: string,
  context?: string
) {
  addSemanticTracking(container, { label, entityType, entityId, context });
}

/**
 * Add semantic tracking to study plan elements
 * @param element - The study plan element
 * @param stage - The stage name (e.g., "Etapa de adaptación")
 */
export function trackStudyPlanElement(
  element: HTMLElement,
  stage: string
) {
  addSemanticTracking(element, {
    label: stage,
    entityType: ENTITY_TYPES.STUDY_PLAN,
    entityId: stage.toLowerCase().replace(/\s+/g, '_'),
    context: 'academic',
  });
  
  // Also add a more specific data attribute for better tracking
  element.setAttribute('data-study-stage', stage);
}

/**
 * Track career comparison selection
 * @param careers - Array of selected career names
 * @param maxCareers - Maximum number of careers that can be selected
 * @param activeAspect - Currently active comparison aspect (e.g., "Experiencia", "Aprender")
 */
export function trackCareerComparison(
  careers: string[],
  maxCareers: number = 3,
  activeAspect?: string
) {
  // Create a custom event for career comparison
  Telemetry.events.push({
    type: 'custom',
    semantic: {
      label: `Career Comparison: ${careers.length}/${maxCareers} careers selected`,
      entityType: ENTITY_TYPES.CAREER_COMPARISON,
      entityId: `comparison_${careers.length}_${maxCareers}`,
      context: CONTEXTS.CAREER_COMPARISON,
      action: 'viewed',
    },
    details: {
      custom: {
        action: 'career_comparison_viewed',
        selectedCareers: careers,
        careerCount: careers.length,
        maxCareers,
        activeAspect,
        timestamp: Date.now(),
      },
    },
  });
}

/**
 * Track comparison aspect changes
 * @param aspect - The comparison aspect (e.g., "Experiencia", "Aprender", "Futuro")
 * @param careers - Currently selected careers
 */
export function trackComparisonAspectChange(
  aspect: string,
  careers: string[]
) {
  Telemetry.events.push({
    type: 'custom',
    semantic: {
      label: `Comparison Aspect Changed: ${aspect}`,
      entityType: ENTITY_TYPES.COMPARISON_ASPECT,
      entityId: aspect.toLowerCase().replace(/\s+/g, '_'),
      context: CONTEXTS.COMPARISON_INTERFACE,
      action: 'changed',
    },
    details: {
      custom: {
        action: 'comparison_aspect_changed',
        aspect,
        selectedCareers: careers,
        timestamp: Date.now(),
      },
    },
  });
}

/**
 * Create a data attribute string for inline HTML
 * @param options - Semantic tracking options
 * @returns HTML attribute string
 */
export function createSemanticAttributes(options: {
  label: string;
  entityType?: string;
  entityId?: string;
  context?: string;
}): string {
  const attrs = [`data-track="true"`, `data-label="${options.label}"`];
  
  if (options.entityType) {
    attrs.push(`data-entity-type="${options.entityType}"`);
  }
  
  if (options.entityId) {
    attrs.push(`data-entity-id="${options.entityId}"`);
  }
  
  if (options.context) {
    attrs.push(`data-context="${options.context}"`);
  }
  
  return attrs.join(' ');
}

/**
 * React hook for adding semantic tracking to refs
 * @param ref - React ref to the element
 * @param options - Semantic tracking options
 */
export function useSemanticTracking(
  ref: React.RefObject<HTMLElement>,
  options: {
    label: string;
    entityType?: string;
    entityId?: string;
    context?: string;
  }
) {
  React.useEffect(() => {
    if (ref.current) {
      addSemanticTracking(ref.current, options);
    }
  }, [ref, options]);
}
