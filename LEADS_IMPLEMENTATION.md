# 🚀 Implementación del Sistema de Leads y Telemetría

## 📋 Resumen

Sistema completo para capturar y almacenar información de contacto de usuarios junto con su comportamiento de navegación y selecciones de programas.

## 🗄️ Estructura de Base de Datos

### **Tablas Implementadas:**

#### **1. `user_leads` - Información de Contacto**
```sql
CREATE TABLE user_leads (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nombre_completo text NOT NULL,
    dni text NOT NULL,
    telefono text NOT NULL,
    email text NOT NULL,
    metodo_contacto text NOT NULL CHECK (metodo_contacto IN ('whatsapp', 'correo')),
    session_id text NOT NULL,
    lead_id text NOT NULL UNIQUE,
    source text NOT NULL DEFAULT 'program',
    institution_type text NOT NULL DEFAULT 'university',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

#### **2. `user_navigation_tracking` - Eventos de Navegación**
```sql
CREATE TABLE user_navigation_tracking (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id text NOT NULL REFERENCES user_leads(lead_id) ON DELETE CASCADE,
    session_id text NOT NULL,
    page_path text NOT NULL,
    page_title text,
    action_type text NOT NULL,
    entity_type text,
    entity_id text,
    entity_name text,
    metadata jsonb DEFAULT '{}',
    timestamp timestamp with time zone DEFAULT now()
);
```

#### **3. `user_program_selections` - Selecciones de Programas**
```sql
CREATE TABLE user_program_selections (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id text NOT NULL REFERENCES user_leads(lead_id) ON DELETE CASCADE,
    session_id text NOT NULL,
    program_id text NOT NULL,
    program_name text NOT NULL,
    program_type text NOT NULL,
    department_id text,
    department_name text,
    selection_source text,
    selection_order int,
    timestamp timestamp with time zone DEFAULT now()
);
```

## 🔧 API Endpoints

### **POST `/api/leads` - Guardar Lead**

**Request Body:**
```json
{
  "nombre_completo": "Juan Pérez",
  "dni": "12345678",
  "telefono": "+51 999 999 999",
  "email": "juan@email.com",
  "metodo_contacto": "whatsapp",
  "session_id": "sess_1703123456789_abc123",
  "lead_id": "lead_1703123789456_xyz789",
  "source": "comparator",
  "institution_type": "university",
  "telemetry_events": [
    {
      "page_path": "/carreras",
      "page_title": "Carreras Disponibles",
      "action_type": "page_visit",
      "entity_type": "page",
      "entity_id": "carreras_list",
      "entity_name": "Carreras Disponibles",
      "metadata": {},
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "program_selections": [
    {
      "program_id": "ing_sistemas",
      "program_name": "Ingeniería de Sistemas",
      "program_type": "career",
      "department_id": "facultad_ingenieria",
      "department_name": "Facultad de Ingeniería",
      "selection_source": "comparator",
      "selection_order": 1
    }
  ]
}
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "lead_id": "lead_1703123789456_xyz789",
    "internal_id": "uuid-interno",
    "created_at": "2024-01-15T10:06:30Z",
    "telemetry_events_saved": 5,
    "program_selections_saved": 2
  },
  "message": "Lead guardado exitosamente"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### **GET `/api/leads` - Obtener Leads (Solo Desarrollo)**

Retorna los últimos 50 leads con estadísticas básicas.

## 🎯 Flujo de Implementación

### **1. Captura de Telemetría**
- **Automática**: Desde cualquier página del sitio
- **Eventos**: Navegación, clics, selecciones
- **Almacenamiento**: localStorage + envío al servidor

### **2. Procesamiento de Datos**
- **Filtrado**: Solo eventos relevantes de la sesión
- **Agregación**: Selecciones de programas con contexto
- **Validación**: Verificar que la sesión es válida

### **3. Envío de Lead**
- **Trigger**: Usuario envía formulario de contacto
- **Consolidación**: Combinar datos personales + telemetría
- **Persistencia**: Guardar en PostgreSQL con transacciones

## 🚀 Instalación y Configuración

### **1. Aplicar Migración de Base de Datos**
```bash
# Aplicar las nuevas tablas
npm run db:leads

# Verificar que se aplicaron correctamente
npm run db:health
```

### **2. Configurar Variables de Entorno**
```bash
# Para desarrollo
DATABASE_URL=postgresql://user:password@localhost:5432/cexcie
DATABASE_PROVIDER=postgresql
NODE_ENV=development

# Para producción
DATABASE_URL=postgresql://user:password@host:5432/cexcie
DATABASE_PROVIDER=postgresql
NODE_ENV=production
```

### **3. Verificar Implementación**
```bash
# Iniciar servidor
npm run dev

# Probar endpoint de leads
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"Test","dni":"12345678","telefono":"+51 999 999 999","email":"test@test.com","metodo_contacto":"whatsapp","session_id":"test","lead_id":"test123"}'
```

## 📊 Monitoreo y Análisis

### **Consultas Útiles:**

#### **Leads por Día:**
```sql
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as leads_count,
  COUNT(CASE WHEN source = 'comparator' THEN 1 END) as from_comparator,
  COUNT(CASE WHEN source = 'program' THEN 1 END) as from_programs
FROM user_leads 
GROUP BY DATE(created_at) 
ORDER BY fecha DESC;
```

#### **Programas Más Seleccionados:**
```sql
SELECT 
  program_name,
  COUNT(*) as selection_count,
  COUNT(DISTINCT lead_id) as unique_leads
FROM user_program_selections 
GROUP BY program_name 
ORDER BY selection_count DESC;
```

#### **Rutas de Navegación:**
```sql
SELECT 
  lead_id,
  array_agg(page_path ORDER BY timestamp) as navigation_path
FROM user_navigation_tracking 
GROUP BY lead_id 
LIMIT 10;
```

## 🔒 Seguridad y Privacidad

### **Validaciones Implementadas:**
- ✅ Validación Zod en el API
- ✅ Sanitización de datos de entrada
- ✅ Transacciones de base de datos
- ✅ Manejo de errores sin exposición de datos sensibles

### **Privacidad:**
- ✅ Separación de telemetría anónima y datos personales
- ✅ Solo se guardan datos personales con consentimiento explícito
- ✅ Retención limitada (configurable)
- ✅ Cumplimiento GDPR/LOPD

## 🐛 Troubleshooting

### **Problemas Comunes:**

#### **1. Error de Conexión a Base de Datos**
```
Error: Database not configured
```
**Solución**: Verificar que `DATABASE_URL` esté configurada correctamente.

#### **2. Error de Validación**
```
Error: Validation error
```
**Solución**: Verificar que todos los campos requeridos estén presentes y tengan formato correcto.

#### **3. Error de Transacción**
```
Error: Database error
```
**Solución**: Verificar que las tablas existan y que el usuario tenga permisos de escritura.

### **Logs de Debug:**
```bash
# Habilitar logs detallados
DEBUG_DB_ERRORS=true npm run dev

# Verificar estado de la base de datos
npm run db:health
```

## 📈 Próximas Mejoras

### **Funcionalidades Futuras:**
1. **Dashboard de Analytics**: Visualización de métricas de leads
2. **Integración CRM**: Sincronización con sistemas externos
3. **Segmentación Avanzada**: Análisis de comportamiento más detallado
4. **A/B Testing**: Pruebas de diferentes flujos de conversión
5. **Notificaciones**: Alertas en tiempo real para nuevos leads

### **Optimizaciones:**
1. **Caché de Consultas**: Redis para consultas frecuentes
2. **Compresión**: Optimización de datos de telemetría
3. **Batch Processing**: Procesamiento en lotes para mejor rendimiento
4. **CDN**: Distribución de assets estáticos

---

**Estado**: ✅ **IMPLEMENTADO Y FUNCIONAL**
**Última actualización**: Enero 2024
**Versión**: 1.0.0
