# 🚀 CExCIE - Migración a Base de Datos

Este branch implementa la migración completa del sistema CExCIE desde archivos JSON estáticos a una base de datos PostgreSQL, con capacidad de fallback automático.

## 📋 Características Implementadas

### ✅ **Data Access Layer (DAL)**
- **BaseDataProvider**: Clase abstracta base con funcionalidades comunes
- **JSONDataProvider**: Provider que usa los archivos JSON actuales
- **PostgreSQLDataProvider**: Provider para base de datos PostgreSQL
- **HybridDataProvider**: Provider híbrido con fallback automático

### ✅ **Sistema de Migración Gradual**
- Migración automática sin interrupciones del servicio
- Fallback automático a JSON si PostgreSQL falla
- Recuperación automática de PostgreSQL
- Health checks periódicos

### ✅ **Configuración Dinámica**
- Configuración basada en variables de entorno
- Cambio de provider sin reiniciar la aplicación
- Validación automática de configuración
- Modo desarrollo vs producción

### ✅ **Scripts de Migración**
- Migración automática de JSON a PostgreSQL
- Testing de consistencia de datos
- Health check de base de datos
- Rollback y recuperación

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                        │
├─────────────────────────────────────────────────────────────┤
│                 useDataProvider Hook                       │
├─────────────────────────────────────────────────────────────┤
│                DataProviderFactory                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    JSON     │  │PostgreSQL   │  │   Hybrid    │        │
│  │  Provider   │  │ Provider    │  │  Provider   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                        │
│  │   JSON      │  │PostgreSQL   │                        │
│  │  Files      │  │  Database   │                        │
│  └─────────────┘  └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación y Configuración

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Configurar Variables de Entorno**
Crear archivo `.env.local`:
```bash
# Modo de operación
DATABASE_PROVIDER=json  # json, postgresql, hybrid

# Para PostgreSQL local
# DATABASE_URL=postgresql://username:password@localhost:5432/cexcie

# Para AWS RDS
# DATABASE_URL=postgresql://admin:password@cexcie-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/cexcie
```

### 3. **Ejecutar la Aplicación**
```bash
npm run dev
```

## 🔧 Scripts Disponibles

### **Desarrollo y Testing**
```bash
# Ejecutar aplicación en modo desarrollo
npm run dev

# Health check de base de datos
npm run db:health

# Test de consistencia de datos
npm run db:test

# Test completo de base de datos
npm run test:database
```

### **Migración de Datos**
```bash
# Migrar datos de JSON a PostgreSQL
npm run db:migrate

# Verificar consistencia después de migración
npm run db:test
```

## 📊 Modos de Operación

### **1. Modo JSON (Actual)**
```bash
DATABASE_PROVIDER=json
```
- ✅ Usa archivos JSON estáticos
- ✅ Sin dependencias externas
- ✅ Inicio rápido
- ❌ Sin persistencia
- ❌ Sin concurrencia

### **2. Modo PostgreSQL**
```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://...
```
- ✅ Base de datos persistente
- ✅ Soporte para concurrencia
- ✅ Transacciones ACID
- ❌ Requiere PostgreSQL
- ❌ Configuración más compleja

### **3. Modo Híbrido (Recomendado para migración)**
```bash
DATABASE_PROVIDER=hybrid
DATABASE_URL=postgresql://...
```
- ✅ PostgreSQL como fuente principal
- ✅ Fallback automático a JSON
- ✅ Migración gradual sin interrupciones
- ✅ Alta disponibilidad
- ❌ Configuración más compleja

## 🗄️ Estructura de Base de Datos

### **Tablas Principales**
- `facultad`: Facultades académicas
- `campus`: Sedes universitarias
- `carrera`: Programas académicos
- `carrera_campus`: Relación carrera-campus
- `carrera_modalidad`: Relación carrera-modalidad
- `oferta`: Combinaciones carrera×campus×modalidad
- `periodo`: Periodos académicos
- `precio`: Sistema de precios

### **Relaciones Clave**
```
Facultad (1) ←→ (N) Carrera
Carrera (N) ←→ (N) Campus
Carrera (N) ←→ (N) Modalidad
Oferta = Carrera × Campus × Modalidad
```

## 🔄 Flujo de Migración

### **Fase 1: Preparación**
1. ✅ Implementar Data Access Layer
2. ✅ Crear providers JSON y PostgreSQL
3. ✅ Configurar factory pattern
4. ✅ Implementar provider híbrido

### **Fase 2: Testing Local**
1. 🔄 Configurar PostgreSQL local
2. 🔄 Ejecutar esquema de BD
3. 🔄 Migrar datos desde JSON
4. 🔄 Testing de consistencia

### **Fase 3: AWS RDS**
1. 🔄 Configurar RDS PostgreSQL
2. 🔄 Migrar a producción
3. 🔄 Monitoreo y optimización

## 🧪 Testing

### **Test de Consistencia**
```bash
npm run db:test
```
Verifica que los datos en PostgreSQL coincidan con los archivos JSON originales.

### **Health Check**
```bash
npm run db:health
```
Verifica el estado de la base de datos y su rendimiento.

### **Benchmark**
```typescript
import { DataProviderFactory } from '../lib/dal/provider-factory';

const provider = DataProviderFactory.createProvider({ source: 'hybrid' });
const results = await DataProviderFactory.benchmarkProvider(provider);
```

## 📈 Monitoreo y Métricas

### **Métricas Disponibles**
- Tiempo de respuesta por operación
- Estado de salud de PostgreSQL
- Contador de fallbacks
- Estadísticas de caché
- Uso de conexiones de BD

### **Logs del Sistema**
```bash
# En consola del navegador
✅ Data from PostgreSQL
⚠️ PostgreSQL failed, falling back to JSON
❌ Too many PostgreSQL failures, switching to JSON-only mode
✅ PostgreSQL recovered, switching back
```

## 🚨 Troubleshooting

### **Problemas Comunes**

#### **1. Error de Conexión a PostgreSQL**
```bash
# Verificar que PostgreSQL esté corriendo
npm run db:health

# Verificar variables de entorno
echo $DATABASE_URL
```

#### **2. Datos Inconsistentes**
```bash
# Ejecutar test de consistencia
npm run db:test

# Re-migrar datos si es necesario
npm run db:migrate
```

#### **3. Fallback Frecuente a JSON**
- Verificar estabilidad de PostgreSQL
- Revisar logs de errores
- Verificar configuración de conexión

## 🔮 Próximos Pasos

### **Corto Plazo**
- [ ] Configurar PostgreSQL local
- [ ] Ejecutar esquema de BD
- [ ] Migrar datos desde JSON
- [ ] Testing completo

### **Mediano Plazo**
- [ ] Configurar AWS RDS
- [ ] Migrar a producción
- [ ] Implementar monitoreo
- [ ] Optimización de queries

### **Largo Plazo**
- [ ] Implementar cache distribuido
- [ ] Escalado horizontal
- [ ] Backup automático
- [ ] Disaster recovery

## 📚 Recursos Adicionales

- [Esquema de Base de Datos](./database_schema.sql)
- [Documentación PostgreSQL](./POSTGRESQL_IMPLEMENTACION.md)
- [Arquitectura del Sistema](./IMPLEMENTATION_SUMMARY.md)

## 🤝 Contribución

Para contribuir a este branch:

1. Crear issue describiendo el problema/mejora
2. Fork del repositorio
3. Crear branch feature desde `feature/database-migration`
4. Implementar cambios
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la misma licencia que el proyecto principal CExCIE.

---

**Estado del Branch**: 🟡 En Desarrollo  
**Última Actualización**: $(date)  
**Versión**: 1.0.0-beta
