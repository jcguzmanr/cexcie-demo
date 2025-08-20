/**
 * Configuración de eventos de telemetría para la vista de agradecimiento
 * Basado en el prompt de implementación
 */

export const THANKYOU_EVENTS = {
  // Eventos principales
  THANKYOU_VIEWED: "thankyou_viewed",
  HIGHLIGHTS_DISPLAYED: "highlights_displayed",
  PDF_GENERATION_PENDING: "pdf_generation_pending",
  PDF_READY: "pdf_ready",
  PDF_DOWNLOAD_CLICKED: "pdf_download_clicked",
  PDF_GENERATION_ERROR: "pdf_generation_error",
  SEND_VIA_CHANNEL_CLICKED: "send_via_channel_clicked",
  LEGAL_NOTE_INTERACTED: "legal_note_interacted",
  
  // Eventos específicos por origen
  CAREER_THANKYOU: "career_thankyou",
  COMPARATOR_THANKYOU: "comparator_thankyou",
  
  // Eventos adicionales
  LEAD_SUBMITTED: "lead_submitted"
} as const;

export type ThankYouEventType = typeof THANKYOU_EVENTS[keyof typeof THANKYOU_EVENTS];

export interface ThankYouEventPayload {
  source: "career" | "comparator";
  leadId?: string;
  careerCount?: number;
  items?: string[];
  pdfUrl?: string;
  channel?: "whatsapp" | "email" | "sms";
  errorType?: string;
  careerId?: string;
  modality?: string;
  campus?: string;
  careerIds?: string[];
  attributes?: string[];
  action?: string;
  contactMethod?: string;
}

/**
 * Helper para crear eventos de telemetría consistentes
 */
export function createThankYouEvent(
  eventType: ThankYouEventType,
  payload: ThankYouEventPayload
) {
  return {
    type: 'custom' as const,
    semantic: {
      label: `Thank You Event: ${eventType}`,
      entityType: 'thankyou_modal',
      entityId: eventType,
      action: 'triggered',
      context: 'thankyou_flow'
    },
    details: {
      custom: {
        action: eventType,
        ...payload,
        timestamp: Date.now()
      }
    }
  };
}

/**
 * Configuración de highlights por origen
 */
export const HIGHLIGHTS_CONFIG = {
  career: [
    "Plan de estudios completo y actualizado",
    "Modalidades disponibles en tu campus",
    "Información de admisión y becas"
  ],
  comparator: [
    "Comparación detallada de carreras",
    "Análisis de modalidades y campus",
    "Guía para tomar la mejor decisión"
  ]
} as const;

/**
 * Configuración de canales de comunicación
 */
export const CHANNEL_CONFIG = {
  whatsapp: {
    label: "WhatsApp",
    icon: "📱",
    description: "Contacto inmediato",
    color: "bg-green-500 hover:bg-green-600",
    action: "open_whatsapp"
  },
  email: {
    label: "Email",
    icon: "📧",
    description: "Información detallada",
    color: "bg-blue-500 hover:bg-blue-600",
    action: "open_email"
  },
  sms: {
    label: "SMS",
    icon: "💬",
    description: "Mensaje rápido",
    color: "bg-purple-500 hover:bg-purple-600",
    action: "send_sms"
  }
} as const;

/**
 * Estados del PDF
 */
export const PDF_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error"
} as const;

export type PDFState = typeof PDF_STATES[keyof typeof PDF_STATES];

/**
 * Configuración de mensajes de error
 */
export const ERROR_MESSAGES = {
  PDF_GENERATION_FAILED: "Error al generar el PDF. Inténtalo de nuevo.",
  NETWORK_ERROR: "Error de conexión. Verifica tu internet.",
  UNKNOWN_ERROR: "Error inesperado. Contacta soporte."
} as const;
