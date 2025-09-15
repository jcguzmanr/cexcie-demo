# 📊 Sistema de Almacenamiento de Telemetría y Leads

## 🎯 Descripción General

Este documento explica cómo el sistema CExCIE captura, procesa y almacena la telemetría del usuario junto con la información de contacto para generar leads cualificados.

## 🚀 Inicio de la Captura de Datos

### **Punto de Inicio:**
La captura de telemetría comienza **desde el momento que el usuario carga cualquier página del sitio**, específicamente:

1. **Home de Carreras** (`/carreras`) - Punto de entrada principal
2. **Home General** (`/`) - Punto de entrada alternativo  
3. **Cualquier página del sitio** - Captura automática al cargar

### **Sesión del Usuario:**
- Cada usuario recibe un `session_id` único al cargar la primera página
- La sesión persiste hasta que el usuario cierre el navegador o expire (24 horas)
- Todos los eventos se asocian a esta sesión

## 📝 Tipos de Datos Capturados

### **1. Navegación Automática**
```json
{
  "action_type": "page_visit",
  "page_path": "/carreras",
  "page_title": "Carreras Disponibles",
  "entity_type": "page",
  "entity_id": "carreras_list",
  "metadata": {
    "referrer": "https://google.com",
    "load_time_ms": 1250
  }
}
```

### **2. Selecciones de Programas (Solo las que el usuario selecciona activamente)**
```json
{
  "action_type": "program_selected",
  "entity_type": "program",
  "entity_id": "ing_sistemas",
  "entity_name": "Ingeniería de Sistemas",
  "metadata": {
    "selection_source": "comparator",
    "selection_order": 1,
    "program_type": "career"
  }
}
```

### **3. Interacciones con el Comparador**
```json
{
  "action_type": "comparison_viewed",
  "entity_type": "comparison",
  "entity_id": "program_comparison",
  "metadata": {
    "selected_programs": ["ing_sistemas", "ing_industrial"],
    "comparison_aspect": "costos"
  }
}
```

### **4. Navegación a Detalles**
```json
{
  "action_type": "program_detail_viewed",
  "entity_type": "program",
  "entity_id": "ing_sistemas",
  "entity_name": "Ingeniería de Sistemas",
  "metadata": {
    "from_page": "carreras_list",
    "section_viewed": "plan_estudios"
  }
}
```

## 🎯 Qué NO se Captura (Solo Navegación, No Selecciones)

### **❌ Datos NO Capturados:**
- Páginas visitadas solo por navegación (sin interacción)
- Hover sobre elementos
- Scroll pasivo
- Tiempo en página sin acción

### **✅ Datos SÍ Capturados:**
- **Clics en programas específicos** (selección activa)
- **Uso del comparador** (selección de programas para comparar)
- **Navegación a detalles** de programas seleccionados
- **Envío del formulario de contacto**

## 📊 Ejemplo Completo de Sesión de Usuario

### **Escenario:** Usuario busca carrera de ingeniería

```json
{
  "session_id": "sess_1703123456789_abc123",
  "lead_id": "lead_1703123789456_xyz789",
  "timeline": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "action": "page_visit",
      "page": "/carreras",
      "description": "Usuario llega al home de carreras"
    },
    {
      "timestamp": "2024-01-15T10:01:30Z", 
      "action": "program_selected",
      "entity": "Ingeniería de Sistemas",
      "source": "carreras_list",
      "description": "Usuario hace clic en Ingeniería de Sistemas"
    },
    {
      "timestamp": "2024-01-15T10:02:15Z",
      "action": "program_detail_viewed", 
      "entity": "Ingeniería de Sistemas",
      "page": "/carrera/ing_sistemas",
      "description": "Usuario ve detalles de la carrera"
    },
    {
      "timestamp": "2024-01-15T10:03:45Z",
      "action": "page_visit",
      "page": "/comparador", 
      "description": "Usuario va al comparador"
    },
    {
      "timestamp": "2024-01-15T10:04:20Z",
      "action": "program_selected",
      "entity": "Ingeniería Industrial", 
      "source": "comparator",
      "selection_order": 2,
      "description": "Usuario selecciona segunda carrera para comparar"
    },
    {
      "timestamp": "2024-01-15T10:05:10Z",
      "action": "comparison_viewed",
      "entity": "program_comparison",
      "metadata": {
        "selected_programs": ["Ingeniería de Sistemas", "Ingeniería Industrial"],
        "comparison_aspect": "costos"
      },
      "description": "Usuario compara las dos carreras seleccionadas"
    },
    {
      "timestamp": "2024-01-15T10:06:30Z",
      "action": "lead_submitted",
      "entity": "contact_form",
      "metadata": {
        "contact_method": "whatsapp",
        "programs_selected": 2
      },
      "description": "Usuario envía formulario de contacto"
    }
  ]
}
```

## 🔄 Flujo de Almacenamiento

### **1. Captura en Tiempo Real**
- Los eventos se capturan inmediatamente en `localStorage`
- Se envían al servidor cuando hay conexión
- Fallback: se mantienen en local hasta reconexión

### **2. Procesamiento al Enviar Lead**
- Al enviar el formulario de contacto, se consolidan todos los eventos
- Se crean los registros en las tablas de la base de datos
- Se asocia toda la telemetría con el `lead_id`

### **3. Estructura Final en BD**
```sql
-- Registro principal del lead
INSERT INTO user_leads (
  lead_id, session_id, nombre_completo, dni, telefono, email, 
  metodo_contacto, source, institution_type
) VALUES (
  'lead_1703123789456_xyz789',
  'sess_1703123456789_abc123', 
  'Juan Pérez',
  '12345678',
  '+51 999 999 999',
  'juan@email.com',
  'whatsapp',
  'program',
  'university'
);

-- Eventos de navegación
INSERT INTO user_navigation_tracking (lead_id, session_id, page_path, action_type, entity_type, entity_id, entity_name, metadata)
VALUES 
  ('lead_1703123789456_xyz789', 'sess_1703123456789_abc123', '/carreras', 'page_visit', 'page', 'carreras_list', 'Carreras Disponibles', '{}'),
  ('lead_1703123789456_xyz789', 'sess_1703123456789_abc123', '/comparador', 'page_visit', 'page', 'comparador', 'Comparador de Carreras', '{}');

-- Selecciones de programas (solo las que seleccionó activamente)
INSERT INTO user_program_selections (lead_id, session_id, program_id, program_name, program_type, selection_source, selection_order)
VALUES 
  ('lead_1703123789456_xyz789', 'sess_1703123456789_abc123', 'ing_sistemas', 'Ingeniería de Sistemas', 'career', 'carreras_list', 1),
  ('lead_1703123789456_xyz789', 'sess_1703123456789_abc123', 'ing_industrial', 'Ingeniería Industrial', 'career', 'comparator', 2);
```

## 🎯 Beneficios de Este Enfoque

### **Para Marketing:**
- Leads cualificados con historial completo de interés
- Segmentación por tipo de programa y comportamiento
- Análisis de rutas de conversión

### **Para Ventas:**
- Contexto completo de las decisiones del prospecto
- Programas específicos que le interesan
- Puntos de dolor identificados en la navegación

### **Para Producto:**
- Optimización de flujos de navegación
- Identificación de programas más populares
- Mejora de la experiencia del comparador

## 🔒 Privacidad y Consentimiento

- **Telemetría anónima**: Se captura automáticamente sin datos personales
- **Datos personales**: Solo se guardan cuando el usuario envía el formulario explícitamente
- **Retención**: Datos se mantienen por 2 años para análisis
- **GDPR/LOPD**: Cumple con regulaciones de protección de datos

---

*Este sistema permite un seguimiento completo y ético del comportamiento del usuario, proporcionando insights valiosos mientras respeta la privacidad.*
