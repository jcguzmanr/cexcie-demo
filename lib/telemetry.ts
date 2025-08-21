import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const TelemetryEventSchema = z.object({
  id: z.string().uuid(),
  ts: z.string().datetime(),
  type: z.enum(['click', 'change', 'submit', 'keypress', 'route', 'custom']),
  sessionId: z.string(),
  page: z.object({
    url: z.string().url(),
    path: z.string(),
    title: z.string().optional(),
  }),
  // Enhanced semantic labeling for human-readable analytics
  semantic: z.object({
    label: z.string(), // Human-readable description of what was interacted with
    entityType: z.string().optional(), // Type of entity (e.g., "campus", "career", "faculty", "button", "form")
    entityId: z.string().optional(), // Unique identifier for the entity (e.g., "cusco", "engineering", "continue")
    context: z.string().optional(), // Additional context (e.g., "hero_section", "comparison_view")
    action: z.string().optional(), // What action was performed (e.g., "selected", "clicked", "submitted")
  }),
  details: z.object({
    valueSummary: z.string().optional(),
    key: z.string().optional(),
    route: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).optional(),
    custom: z.record(z.unknown()).optional(),
  }).optional(),
});

export const LeadDataSchema = z.object({
  id: z.string().uuid(),
  ts: z.string().datetime(),
  sessionId: z.string(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  medium: z.string().min(1, 'Medium is required'),
  interests: z.array(z.string()).optional(),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
export type LeadData = z.infer<typeof LeadDataSchema>;

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(): string {
  return crypto.randomUUID();
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

function getCurrentPageInfo() {
  if (typeof window === 'undefined') {
    return { url: '', path: '', title: '' };
  }
  
  return {
    url: window.location.href,
    path: window.location.pathname,
    title: document.title,
  };
}

// getTargetInfo function removed - we only capture semantic business data now

/**
 * Generate semantic information from an element for telemetry
 * This creates human-readable labels and entity information
 */
function generateSemanticInfo(element: EventTarget | null, action: string = 'interacted'): TelemetryEvent['semantic'] {
  if (!element || !(element instanceof Element)) {
    return {
      label: 'Unknown element',
      action,
    };
  }
  
  const el = element as Element;
  let label = 'Unknown element';
  let entityType: string | undefined;
  let entityId: string | undefined;
  let context: string | undefined;
  
  // Try to get the most meaningful text content
  if (el.tagName === 'BUTTON' || el.tagName === 'A') {
    // For buttons and links, get the text content
    label = el.textContent?.trim() || el.getAttribute('aria-label') || 'Button';
    entityType = 'button';
    
    // Try to extract entity info from data attributes
    const dataEntity = el.getAttribute('data-entity');
    if (dataEntity) {
      entityId = dataEntity;
    }
    
      // Try to get context from parent containers
  const parentCard = el.closest('[data-context]');
  if (parentCard) {
    context = parentCard.getAttribute('data-context') || undefined;
  }
  
  // Only log buttons with meaningful content
  if (el.textContent && el.textContent.trim().length < 2) {
    return {
      label: 'Unknown element',
      action,
    };
  }
} else if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
    // For form elements, get the label
    const labelElement = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
    if (labelElement) {
      label = labelElement.textContent?.trim() || 'Form field';
    } else if (el.getAttribute('placeholder')) {
      label = el.getAttribute('placeholder') || 'Form field';
    } else {
      label = 'Form field';
    }
    entityType = 'form_field';
    
    // For selects, get the selected option text
    if (el.tagName === 'SELECT' && (el as HTMLSelectElement).selectedOptions.length > 0) {
      const selectedOption = (el as HTMLSelectElement).selectedOptions[0];
      label = `${label}: ${selectedOption.text}`;
      entityId = selectedOption.value;
    }
  } else if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
    // For containers, try to get meaningful content
    const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      label = heading.textContent?.trim() || 'Container';
      entityType = 'section';
    } else if (el.getAttribute('data-label')) {
      label = el.getAttribute('data-label') || 'Container';
      entityType = 'container';
    } else if (el.getAttribute('data-track')) {
      // If it has tracking data, it's meaningful
      label = el.textContent?.trim().substring(0, 50) || 'Tracked Container';
      entityType = 'container';
    } else if (el.textContent && el.textContent.trim().length > 10) {
      // If container has substantial text content, it might be meaningful
      const textContent = el.textContent.trim();
      // Look for common patterns in study plans
      if (textContent.includes('Etapa') || 
          textContent.includes('Stage') || 
          textContent.includes('Plan') ||
          textContent.includes('Carrera') ||
          textContent.includes('Profesional')) {
        label = textContent.substring(0, 50);
        entityType = 'study_plan';
        context = 'academic';
      } else {
        // Generic container with text
        label = textContent.substring(0, 50);
        entityType = 'container';
      }
    } else {
      // Skip generic containers without meaningful content
      return {
        label: 'Unknown element',
        action,
      };
    }
  }
  
  // Try to extract entity type and ID from data attributes
  if (!entityType) {
    entityType = el.getAttribute('data-entity-type') || undefined;
  }
  if (!entityId) {
    entityId = el.getAttribute('data-entity-id') || el.id || undefined;
  }
  if (!context) {
    context = el.getAttribute('data-context') || undefined;
  }
  
  // Clean up the label
  label = label.replace(/\s+/g, ' ').trim();
  if (label.length > 100) {
    label = label.substring(0, 97) + '...';
  }
  
  return {
    label,
    entityType,
    entityId,
    context,
    action,
  };
}

function validatePhone(phone: string): boolean {
  // Basic phone validation - can be enhanced
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ============================================================================
// STORAGE MANAGER
// ============================================================================

class StorageManager {
  private telemetryKey = 'cexcie_telemetry_events';
  private leadsKey = 'cexcie_leads_data';
  
  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  saveTelemetryEvents(events: TelemetryEvent[]): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      localStorage.setItem(this.telemetryKey, JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to save telemetry events to localStorage:', error);
    }
  }
  
  loadTelemetryEvents(): TelemetryEvent[] {
    if (!this.isLocalStorageAvailable()) return [];
    try {
      const stored = localStorage.getItem(this.telemetryKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load telemetry events from localStorage:', error);
      return [];
    }
  }
  
  saveLeadsData(leads: LeadData[]): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      localStorage.setItem(this.leadsKey, JSON.stringify(leads));
    } catch (error) {
      console.warn('Failed to save leads data to localStorage:', error);
    }
  }
  
  loadLeadsData(): LeadData[] {
    if (!this.isLocalStorageAvailable()) return [];
    try {
      const stored = localStorage.getItem(this.leadsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load leads data from localStorage:', error);
      return [];
    }
  }
  
  clearTelemetryEvents(): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      localStorage.removeItem(this.telemetryKey);
    } catch (error) {
      console.warn('Failed to clear telemetry events from localStorage:', error);
    }
  }
  
  clearLeadsData(): void {
    if (!this.isLocalStorageAvailable()) return;
    try {
      localStorage.removeItem(this.leadsKey);
    } catch (error) {
      console.warn('Failed to clear leads data from localStorage:', error);
    }
  }
}

// ============================================================================
// MAIN TELEMETRY CLASS
// ============================================================================

class TelemetryClass {
  private _events: TelemetryEvent[] = [];
  private _leads: LeadData[] = [];
  private sessionId: string;
  private _isEnabled: boolean = true;
  private storage: StorageManager;
  private listeners: Set<(event: TelemetryEvent) => void> = new Set();
  
  constructor() {
    this.sessionId = generateSessionId();
    this.storage = new StorageManager();
    
    // Load existing data from storage
    this._events = this.storage.loadTelemetryEvents();
    this._leads = this.storage.loadLeadsData();
    
    // Set up global event listeners
    this.setupGlobalListeners();
  }
  
  private setupGlobalListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Click events
    document.addEventListener('click', (e) => {
      if (!this._isEnabled) return;
      this.captureClick(e);
    }, { passive: true });
    
    // Form submissions
    document.addEventListener('submit', (e) => {
      if (!this._isEnabled) return;
      this.captureSubmit(e);
    }, { passive: true });
    
    // Input changes (only metadata, no values)
    document.addEventListener('change', (e) => {
      if (!this._isEnabled) return;
      this.captureChange(e);
    }, { passive: true });
    
    // Key presses (only safe keys)
    document.addEventListener('keydown', (e) => {
      if (!this._isEnabled) return;
      this.captureKeypress(e);
    }, { passive: true });
  }
  
  private captureClick(e: MouseEvent): void {
    // Only capture clicks on meaningful elements
    const semanticInfo = generateSemanticInfo(e.target, 'clicked');
    
    // Skip clicks on unknown/unmeaningful elements
    if (semanticInfo.label === 'Unknown element' || 
        semanticInfo.label === 'Container' ||
        semanticInfo.label.length < 3 || // Skip very short labels
        !semanticInfo.entityType ||
        (semanticInfo.entityType === 'container' && !semanticInfo.context)) { // Skip generic containers without context
      
      // Optional: Log filtered clicks in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Click filtered out:', {
          label: semanticInfo.label,
          entityType: semanticInfo.entityType,
          context: semanticInfo.context
        });
      }
      
      return; // Don't log this click
    }
    
    // Create clean event with only business-relevant data
    const event: TelemetryEvent = {
      id: generateId(),
      ts: getCurrentTimestamp(),
      type: 'click',
      sessionId: this.sessionId,
      page: {
        url: getCurrentPageInfo().url,
        path: getCurrentPageInfo().path,
        title: getCurrentPageInfo().title,
      },
      // Only include semantic data - no technical target info
      semantic: semanticInfo,
    };
    
    this._events.push(event);
    this.storage.saveTelemetryEvents(this._events);
    this.notifyListeners(event);
  }
  
  private captureSubmit(e: Event): void {
    const semanticInfo = generateSemanticInfo(e.target, 'submitted');
    
    const event: TelemetryEvent = {
      id: generateId(),
      ts: getCurrentTimestamp(),
      type: 'submit',
      sessionId: this.sessionId,
      page: {
        url: getCurrentPageInfo().url,
        path: getCurrentPageInfo().path,
        title: getCurrentPageInfo().title,
      },
      semantic: semanticInfo,
    };
    
    this._events.push(event);
    this.storage.saveTelemetryEvents(this._events);
    this.notifyListeners(event);
  }
  
  private captureChange(e: Event): void {
    const semanticInfo = generateSemanticInfo(e.target, 'changed');
    
    const event: TelemetryEvent = {
      id: generateId(),
      ts: getCurrentTimestamp(),
      type: 'change',
      sessionId: this.sessionId,
      page: {
        url: getCurrentPageInfo().url,
        path: getCurrentPageInfo().path,
        title: getCurrentPageInfo().title,
      },
      semantic: semanticInfo,
      details: {
        valueSummary: 'field_changed', // Never the actual value
      },
    };
    
    this._events.push(event);
    this.storage.saveTelemetryEvents(this._events);
    this.notifyListeners(event);
  }
  
  private captureKeypress(e: KeyboardEvent): void {
    // Only capture safe keys
    const safeKeys = ['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!safeKeys.includes(e.key)) return;
    
    const semanticInfo = generateSemanticInfo(e.target, 'keypressed');
    
    const event: TelemetryEvent = {
      id: generateId(),
      ts: getCurrentTimestamp(),
      type: 'keypress',
      sessionId: this.sessionId,
      page: {
        url: getCurrentPageInfo().url,
        path: getCurrentPageInfo().path,
        title: getCurrentPageInfo().title,
      },
      semantic: semanticInfo,
      details: {
        key: e.key,
      },
    };
    
    this._events.push(event);
    this.storage.saveTelemetryEvents(this._events);
    this.notifyListeners(event);
  }
  
  private notifyListeners(event: TelemetryEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Telemetry listener error:', error);
      }
    });
  }
  
  // ========================================================================
  // PUBLIC API - EVENTS
  // ========================================================================
  
  get events() {
    return {
      // Get all events
      getAll: (): TelemetryEvent[] => [...this._events],
      
      // Get events by type
      getByType: (type: TelemetryEvent['type']): TelemetryEvent[] => 
        this._events.filter(e => e.type === type),
      
      // Get events by session
      getBySession: (sessionId: string): TelemetryEvent[] => 
        this._events.filter(e => e.sessionId === sessionId),
      
      // Push custom event
      push: (customEvent: Omit<TelemetryEvent, 'id' | 'ts' | 'sessionId' | 'page'>): void => {
        const event: TelemetryEvent = {
          ...customEvent,
          id: generateId(),
          ts: getCurrentTimestamp(),
          sessionId: this.sessionId,
          page: getCurrentPageInfo(),
          // Ensure semantic field is provided or generate default
          semantic: customEvent.semantic || {
            label: 'Custom event',
            action: 'triggered',
          },
        };
        
        this._events.push(event);
        this.storage.saveTelemetryEvents(this._events);
        this.notifyListeners(event);
      },
      
      // Clear all events
      clear: (): void => {
        this._events.length = 0;
        this.storage.clearTelemetryEvents();
      },
      
      // Download events as JSON
      download: (): void => {
        const dataStr = JSON.stringify(this._events, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `telemetry-events-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      
      // Subscribe to new events
      subscribe: (listener: (event: TelemetryEvent) => void): () => void => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      },
      
      // Get count
      count: (): number => this._events.length,
      
      // Get session ID
      getSessionId: (): string => this.sessionId,
    };
  }
  
  // ========================================================================
  // PUBLIC API - LEADS
  // ========================================================================
  
  get leads() {
    return {
      // Get all leads
      getAll: (): LeadData[] => [...this._leads],
      
      // Push new lead
      push: (leadData: Omit<LeadData, 'id' | 'ts' | 'sessionId'>): { success: boolean; errors?: string[] } => {
        try {
          // Validate the data
          const validationResult = LeadDataSchema.safeParse({
            ...leadData,
            id: generateId(),
            ts: getCurrentTimestamp(),
            sessionId: this.sessionId,
          });
          
          if (!validationResult.success) {
            return {
              success: false,
              errors: validationResult.error.errors.map(e => e.message),
            };
          }
          
          // Additional phone validation if provided
          if (leadData.phone && !validatePhone(leadData.phone)) {
            return {
              success: false,
              errors: ['Invalid phone number format'],
            };
          }
          
          const lead = validationResult.data;
          this._leads.push(lead);
          this.storage.saveLeadsData(this._leads);
          
          return { success: true };
        } catch (error) {
          return {
            success: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          };
        }
      },
      
      // Clear all leads
      clear: (): void => {
        this._leads.length = 0;
        this.storage.clearLeadsData();
      },
      
      // Download leads as JSON
      download: (): void => {
        const dataStr = JSON.stringify(this._leads, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      
      // Get count
      count: (): number => this._leads.length,
    };
  }
  
  // ========================================================================
  // GLOBAL CONTROLS
  // ========================================================================
  
  enable(): void {
    this._isEnabled = true;
  }
  
  disable(): void {
    this._isEnabled = false;
  }
  
  isEnabled(): boolean {
    return this._isEnabled;
  }
  
  // Route change tracking (to be called by the app)
  trackRouteChange(from: string, to: string): void {
    if (!this._isEnabled) return;
    
    const event: TelemetryEvent = {
      id: generateId(),
      ts: getCurrentTimestamp(),
      type: 'route',
      sessionId: this.sessionId,
      page: {
        url: getCurrentPageInfo().url,
        path: getCurrentPageInfo().path,
        title: getCurrentPageInfo().title,
      },
      semantic: {
        label: `Navigation: ${from} → ${to}`,
        entityType: 'navigation',
        entityId: `${from}_to_${to}`,
        action: 'navigated',
      },
      details: {
        route: { from, to },
      },
    };
    
    this._events.push(event);
    this.storage.saveTelemetryEvents(this._events);
    this.notifyListeners(event);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const Telemetry = new TelemetryClass();

// Add to global window for helper functions
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).Telemetry = Telemetry;
}
