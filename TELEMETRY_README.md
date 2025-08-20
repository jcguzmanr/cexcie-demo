# 📊 Telemetry & Lead Capture System

Este sistema proporciona captura automática de eventos de telemetría y captura de leads de forma segura y privada para la aplicación CExCIE.

## 🎯 Características Principales

### 1. **Telemetría Automática (Anónima)**
- ✅ Captura automática de clics, cambios, envíos y teclas seguras
- ✅ Nunca almacena valores de texto ingresados por el usuario
- ✅ Solo captura metadatos (IDs, clases, roles, atributos data-* permitidos)
- ✅ Eventos en tiempo real con persistencia en localStorage
- ✅ Logger visual tipo terminal con controles de pausa/descarga

### 2. **Captura de Leads (Con Consentimiento)**
- ✅ Formulario completo con validación Zod
- ✅ Campos: nombre, email, teléfono, medio, intereses, consentimiento
- ✅ Almacenamiento separado de la telemetría
- ✅ Exportación a JSON para análisis posterior
- ✅ Validación de email y formato de teléfono

### 3. **Privacidad y Seguridad**
- ✅ Separación estricta entre telemetría y datos personales
- ✅ Telemetría completamente anónima
- ✅ Leads solo cuando el usuario da consentimiento explícito
- ✅ No captura de contraseñas o información sensible
- ✅ Atributos data-* limitados a los permitidos

## 🚀 Instalación y Configuración

### 1. **Importar el Sistema**
```tsx
import { Telemetry } from '@/lib/telemetry';
import { trackButton, trackLink, ENTITY_TYPES, CONTEXTS } from '@/lib/telemetry-helpers';
```

### 2. **Agregar el Logger al Layout**
```tsx
// En components/AppShell.tsx
import { TelemetryLogger } from '@/components/TelemetryLogger';

// Solo mostrar en desarrollo
{process.env.NODE_ENV === 'development' && <TelemetryLogger />}
```

### 3. **Habilitar Tracking de Rutas**
```tsx
// En el layout principal
import { useTelemetryRouteTracking } from '@/lib/useTelemetry';

export function AppShell({ children }) {
  useTelemetryRouteTracking();
  // ... resto del código
}
```

## 📖 API de Uso

### **Telemetry.events** - Gestión de Eventos

```tsx
// Eventos automáticos (ya implementados)
// - Clics en cualquier elemento
// - Cambios en formularios (sin valores)
// - Envíos de formularios
// - Teclas seguras (Enter, Escape, Tab, flechas)

// Eventos personalizados
Telemetry.events.push({
  type: 'custom',
  details: {
    custom: {
      action: 'user_action',
      step: 'completed_onboarding',
      metadata: { userId: '123' }
    }
  }
});

// Obtener eventos
const allEvents = Telemetry.events.getAll();
const clickEvents = Telemetry.events.getByType('click');
const eventCount = Telemetry.events.count();

// Descargar eventos
Telemetry.events.download();

// Limpiar eventos
Telemetry.events.clear();

// Suscribirse a nuevos eventos
const unsubscribe = Telemetry.events.subscribe((event) => {
  console.log('Nuevo evento:', event);
});
```

### **Telemetry.leads** - Gestión de Leads

```tsx
// Enviar nuevo lead
const result = Telemetry.leads.push({
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+51 999 888 777',
  medium: 'web',
  interests: ['Ingeniería de Sistemas'],
  consent: true
});

if (result.success) {
  console.log('Lead capturado exitosamente');
} else {
  console.error('Errores de validación:', result.errors);
}

// Obtener leads
const allLeads = Telemetry.leads.getAll();
const leadCount = Telemetry.leads.count();

// Descargar leads
Telemetry.leads.download();

// Limpiar leads
Telemetry.leads.clear();
```

### **Controles Globales**

```tsx
// Habilitar/deshabilitar telemetría
Telemetry.enable();
Telemetry.disable();

// Verificar estado
const isEnabled = Telemetry.isEnabled();

// Tracking manual de cambios de ruta
Telemetry.trackRouteChange('/from-page', '/to-page');
```

## 🎨 Hooks de React

### **useTelemetryRouteTracking()**
```tsx
import { useTelemetryRouteTracking } from '@/lib/useTelemetry';

export function MyPage() {
  useTelemetryRouteTracking(); // Tracking automático de página
  return <div>...</div>;
}
```

### **useTelemetryEvents()**
```tsx
import { useTelemetryEvents } from '@/lib/useTelemetry';

export function MyComponent() {
  const { trackCustomEvent, trackUserAction } = useTelemetryEvents();
  
  const handleClick = () => {
    trackUserAction('button_click', 'cta_button', { 
      buttonType: 'primary' 
    });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### **useTelemetryLeads()**
```tsx
import { useTelemetryLeads } from '@/lib/useTelemetry';

export function LeadForm() {
  const { submitLead, getLeadCount } = useTelemetryLeads();
  
  const handleSubmit = async (formData) => {
    const result = await submitLead(formData);
    // ... manejar resultado
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔧 Componentes Disponibles

### **TelemetryLogger**
```tsx
import { TelemetryLogger } from '@/components/TelemetryLogger';

// Logger completo con controles
<TelemetryLogger />

// Logger colapsado (solo muestra contadores)
// Se expande al hacer clic
```

## 🆕 **Semantic Tracking Helpers**

### **Agregar Tracking Semántico a Elementos**
```tsx
import { trackButton, trackLink, ENTITY_TYPES, CONTEXTS } from '@/lib/telemetry-helpers';

// Para botones
trackButton(
  buttonRef.current,
  'Campus Cusco Selected',
  ENTITY_TYPES.CAMPUS,
  'cusco',
  CONTEXTS.CARD_GRID
);

// Para enlaces
trackLink(
  linkRef.current,
  'Engineering Career Details',
  ENTITY_TYPES.CAREER,
  'engineering',
  CONTEXTS.SEARCH_RESULTS
);

// Para campos de formulario
trackFormField(
  inputRef.current,
  'Email Input Field',
  ENTITY_TYPES.FORM_FIELD,
  'email',
  CONTEXTS.FORM_SECTION
);
```

### **Atributos Data Semánticos**
```tsx
// Agregar manualmente a elementos HTML
<button
  data-track="true"
  data-label="Campus Arequipa"
  data-entity-type="campus"
  data-entity-id="arequipa"
  data-context="campus_selection"
>
  Campus Arequipa
</button>

// O usar el helper para crear la cadena de atributos
import { createSemanticAttributes } from '@/lib/telemetry-helpers';

const attrs = createSemanticAttributes({
  label: 'Campus Arequipa',
  entityType: 'campus',
  entityId: 'arequipa',
  context: 'campus_selection'
});

// Resultado: data-track="true" data-label="Campus Arequipa" data-entity-type="campus" data-entity-id="arequipa" data-context="campus_selection"
```

### **LeadCaptureForm**
```tsx
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

<LeadCaptureForm 
  onSuccess={() => console.log('Lead enviado')}
  onError={(errors) => console.error('Errores:', errors)}
/>
```

## 📊 Estructura de Datos

### **TelemetryEvent**
```tsx
interface TelemetryEvent {
  id: string;                    // UUID único
  ts: string;                    // Timestamp ISO
  type: 'click' | 'change' | 'submit' | 'keypress' | 'route' | 'custom';
  sessionId: string;             // ID de sesión del usuario
  page: {
    url: string;                 // URL completa
    path: string;                // Ruta de la página
    title?: string;              // Título de la página
  };
  target?: {                     // Información del elemento objetivo
    tag?: string;                // Tag HTML (div, button, etc.)
    id?: string;                 // ID del elemento
    classes?: string[];          // Clases CSS
    role?: string;               // Atributo role
    dataAttrs?: Record<string, string>; // Atributos data-* permitidos
  };
  // 🆕 SEMANTIC LABELING - Human-readable analytics
  semantic: {
    label: string;               // Descripción legible de lo que se interactuó
    entityType?: string;         // Tipo de entidad (campus, career, faculty, button, etc.)
    entityId?: string;           // ID único de la entidad
    context?: string;            // Contexto adicional (hero_section, comparison_view, etc.)
    action?: string;             // Acción realizada (clicked, selected, submitted, etc.)
  };
  details?: {                    // Detalles adicionales
    valueSummary?: string;       // Resumen del valor (nunca el valor real)
    key?: string;                // Tecla presionada
    route?: {                    // Información de cambio de ruta
      from?: string;
      to?: string;
    };
    custom?: Record<string, unknown>; // Datos personalizados
  };
}
```

### **LeadData**
```tsx
interface LeadData {
  id: string;                    // UUID único
  ts: string;                    // Timestamp ISO
  sessionId: string;             // ID de sesión (vinculado a telemetría)
  fullName: string;              // Nombre completo (requerido)
  email: string;                 // Email válido (requerido)
  phone?: string;                // Teléfono (opcional, con validación)
  medium: string;                // Medio de contacto (requerido)
  interests?: string[];          // Carreras de interés (opcional)
  consent: boolean;              // Consentimiento explícito (requerido)
}
```

## 🎯 Casos de Uso

### **1. Tracking de Usuario en Funnel**
```tsx
// En cada paso del funnel
Telemetry.events.push({
  type: 'custom',
  semantic: {
    label: 'Funnel Step: Career Selection',
    entityType: 'step',
    entityId: 'career_selection',
    action: 'viewed',
    context: 'funnel',
  },
  details: {
    custom: {
      action: 'funnel_step',
      step: 'career_selection',
      stepNumber: 2,
      totalSteps: 4
    }
  }
});
```

### **2. Análisis de Interacciones**
```tsx
// Al hacer clic en elementos importantes
Telemetry.events.push({
  type: 'custom',
  semantic: {
    label: 'Compare Careers CTA Clicked',
    entityType: 'button',
    entityId: 'compare_careers',
    action: 'clicked',
    context: 'hero_section',
  },
  details: {
    custom: {
      action: 'cta_click',
      ctaType: 'compare_careers',
      position: 'hero_section'
    }
  }
});
```

### **3. Captura de Leads con Contexto**
```tsx
// Antes de enviar el lead, capturar contexto
Telemetry.events.push({
  type: 'custom',
  semantic: {
    label: 'Lead Form Started from Career Comparison',
    entityType: 'form',
    entityId: 'lead_capture',
    action: 'started',
    context: 'career_comparison',
  },
  details: {
    custom: {
      action: 'lead_form_started',
      source: 'career_comparison',
      careersViewed: ['engineering', 'business']
    }
  }
});
```

## 🔒 Consideraciones de Privacidad

### **Lo que SÍ se captura:**
- ✅ Metadatos de elementos (IDs, clases, roles)
- ✅ Acciones del usuario (clics, cambios, navegación)
- ✅ Información de la página (URL, título)
- ✅ Atributos data-* permitidos
- ✅ Timestamps y IDs de sesión

### **Lo que NUNCA se captura:**
- ❌ Valores de texto ingresados
- ❌ Contenido de campos de email/password
- ❌ Números de teléfono
- ❌ Información personal sin consentimiento
- ❌ Contenido de textareas o inputs de texto

### **Separación de Datos:**
- **Telemetría**: Completamente anónima, se almacena automáticamente
- **Leads**: Solo con consentimiento explícito, almacenamiento separado
- **Nunca se mezclan** los dos tipos de datos

## 🚀 Próximos Pasos

### **Integración con PostgreSQL**
```tsx
// Futura implementación
class PostgresTelemetryService {
  async sendEvents(events: TelemetryEvent[]) {
    // Enviar eventos a PostgreSQL via HTTPS
  }
  
  async sendLeads(leads: LeadData[]) {
    // Enviar leads a PostgreSQL via HTTPS
  }
}
```

### **Analytics Avanzados**
- Dashboard de eventos en tiempo real
- Análisis de funnel y conversión
- Segmentación de usuarios por comportamiento
- A/B testing de elementos de UI

### **Integración con Herramientas Externas**
- Google Analytics 4
- Mixpanel
- Amplitude
- Hotjar

## 🧪 Testing y Desarrollo

### **Página de Demo**
Visita `/telemetry-demo` para probar todas las funcionalidades:
- Eventos automáticos en tiempo real
- Formulario de captura de leads
- Controles del logger
- Ejemplos de API

### **Modo Desarrollo**
El logger solo se muestra en `NODE_ENV === 'development'` para no interferir con usuarios de producción.

### **Debugging**
```tsx
// Habilitar logs detallados en consola
Telemetry.events.subscribe((event) => {
  console.log('🔍 Telemetry Event:', event);
});
```

## 📝 Licencia

Este sistema de telemetría es parte del proyecto CExCIE y está diseñado para uso interno y de desarrollo.
