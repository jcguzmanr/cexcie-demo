import { useEffect, useCallback } from 'react';
import { Telemetry } from './telemetry';
import { trackCareerComparison, trackComparisonAspectChange } from './telemetry-helpers';

/**
 * Hook for tracking career comparison interactions
 * @param selectedCareers - Array of currently selected career names
 * @param maxCareers - Maximum number of careers that can be selected
 * @param activeAspect - Currently active comparison aspect
 */
export function useCareerComparison(
  selectedCareers: string[],
  maxCareers: number = 3,
  activeAspect?: string
) {
  
  // Track when careers are selected/deselected
  const trackCareerSelection = useCallback((careerName: string, isSelected: boolean) => {
    Telemetry.events.push({
      type: 'custom',
      semantic: {
        label: `Career ${isSelected ? 'Selected' : 'Deselected'}: ${careerName}`,
        entityType: 'career',
        entityId: careerName.toLowerCase().replace(/\s+/g, '_'),
        context: 'career_comparison',
        action: isSelected ? 'selected' : 'deselected',
      },
      details: {
        custom: {
          action: isSelected ? 'career_selected' : 'career_deselected',
          careerName,
          selectedCareers: selectedCareers,
          careerCount: selectedCareers.length,
          maxCareers,
          timestamp: Date.now(),
        },
      },
    });
  }, [selectedCareers, maxCareers]);

  // Track comparison aspect changes
  const trackAspectChange = useCallback((aspect: string) => {
    trackComparisonAspectChange(aspect, selectedCareers);
  }, [selectedCareers]);

  // Track when comparison is viewed
  const trackComparisonView = useCallback(() => {
    trackCareerComparison(selectedCareers, maxCareers, activeAspect);
  }, [selectedCareers, maxCareers, activeAspect]);

  // Auto-track when careers or aspects change
  useEffect(() => {
    if (selectedCareers.length > 0) {
      trackComparisonView();
    }
  }, [selectedCareers, activeAspect, trackComparisonView]);

  return {
    trackCareerSelection,
    trackAspectChange,
    trackComparisonView,
  };
}

/**
 * Hook for tracking comparison aspect button clicks
 * @param careers - Currently selected careers
 */
export function useComparisonAspects(careers: string[]) {
  
  const trackAspectClick = useCallback((aspect: string) => {
    Telemetry.events.push({
      type: 'custom',
      semantic: {
        label: `Comparison Aspect Clicked: ${aspect}`,
        entityType: 'comparison_aspect',
        entityId: aspect.toLowerCase().replace(/\s+/g, '_'),
        context: 'comparison_interface',
        action: 'clicked',
      },
      details: {
        custom: {
          action: 'comparison_aspect_clicked',
          aspect,
          selectedCareers: careers,
          timestamp: Date.now(),
        },
      },
    });
  }, [careers]);

  return { trackAspectClick };
}
