'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Telemetry } from './telemetry';

/**
 * Hook to automatically track route changes for telemetry
 * Use this in your layout or pages to track navigation
 */
export function useTelemetryRouteTracking() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Track initial page load
    Telemetry.events.push({
      type: 'custom',
      semantic: {
        label: `Page loaded: ${pathname}`,
        entityType: 'page',
        entityId: pathname,
        action: 'loaded',
        context: 'navigation',
      },
      details: {
        custom: {
          action: 'page_load',
          path: pathname,
          timestamp: Date.now()
        }
      }
    });

    // Special tracking for career comparison page
    if (pathname === '/comparador') {
      // Track career comparison page visit
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: 'Career Comparison Page Visited',
          entityType: 'page',
          entityId: 'career_comparison',
          action: 'visited',
          context: 'career_comparison',
        },
        details: {
          custom: {
            action: 'career_comparison_page_visited',
            path: pathname,
            timestamp: Date.now()
          }
        }
      });
    }
  }, [pathname]);
}

/**
 * Hook to track custom events easily
 */
export function useTelemetryEvents() {
  return {
    trackCustomEvent: (action: string, metadata?: Record<string, unknown>) => {
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: `Custom event: ${action}`,
          entityType: 'custom_event',
          entityId: action,
          action: 'triggered',
        },
        details: {
          custom: {
            action,
            ...metadata,
            timestamp: Date.now()
          }
        }
      });
    },
    
    trackUserAction: (action: string, element?: string, metadata?: Record<string, unknown>) => {
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: `User action: ${action}${element ? ` on ${element}` : ''}`,
          entityType: 'user_action',
          entityId: action,
          action: 'performed',
          context: element,
        },
        details: {
          custom: {
            action,
            element,
            ...metadata,
            timestamp: Date.now()
          }
        }
      });
    },
    
    trackFormInteraction: (formId: string, action: string, metadata?: Record<string, unknown>) => {
      Telemetry.events.push({
        type: 'custom',
        semantic: {
          label: `Form interaction: ${action} on ${formId}`,
          entityType: 'form',
          entityId: formId,
          action: action,
          context: 'form_interaction',
        },
        details: {
          custom: {
            action,
            formId,
            ...metadata,
            timestamp: Date.now()
          }
        }
      });
    }
  };
}

/**
 * Hook to manage leads data
 */
export function useTelemetryLeads() {
  return {
    submitLead: Telemetry.leads.push,
    getLeads: Telemetry.leads.getAll,
    getLeadCount: Telemetry.leads.count,
    downloadLeads: Telemetry.leads.download,
    clearLeads: Telemetry.leads.clear,
  };
}

/**
 * Hook to get telemetry status and controls
 */
export function useTelemetryStatus() {
  return {
    isEnabled: Telemetry.isEnabled(),
    enable: Telemetry.enable,
    disable: Telemetry.disable,
    getEventCount: Telemetry.events.count,
    getSessionId: Telemetry.events.getSessionId,
    downloadEvents: Telemetry.events.download,
    clearEvents: Telemetry.events.clear,
  };
}
