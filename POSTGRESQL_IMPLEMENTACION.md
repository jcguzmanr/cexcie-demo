### Implementación de modelo de datos en PostgreSQL

Este documento define cómo implementar el modelo relacional en PostgreSQL para campus, facultades, carreras, modalidades, ofertas y precios, junto con índices, reglas de integridad, vistas de apoyo, y un pipeline de ingestión desde los JSON actuales del proyecto.

---

## Objetivos

- Crear base de datos y esquema `cexcie` con DDL completo e índices.
- Asegurar integridad referencial y validaciones de negocio.
- Preparar usuario de aplicación con privilegios mínimos.
- Definir pipeline para validar e ingerir los JSON existentes (`public/data/*.json`).
- Entregar consultas de referencia (campus/facultad/carrera y comparador).

---

## Prerrequisitos

- Acceso a una instancia PostgreSQL 14+ (ideal 16+).
- Cliente `psql` disponible (o GUI equivalente).

Variables de entorno de ejemplo (ajusta credenciales y host):

```bash
export PGHOST="<host>"
export PGPORT=5432
export PGUSER="postgres"         # usuario administrador o equivalente
export PGPASSWORD="***"           # contraseña
export DB_NAME="cexcie"
```

---

## Paso 1. Creación de base de datos, extensiones y esquema

```bash
# Crear base de datos (si no existe)
psql -v ON_ERROR_STOP=1 <<'SQL'
CREATE DATABASE cexcie;
SQL

# Conectarse a la base creada y preparar extensiones + esquema
psql "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS cexcie AUTHORIZATION CURRENT_USER;
SET search_path TO cexcie;
SQL
```

---

## Paso 2. Definición del modelo (DDL)

```sql
SET search_path TO cexcie;

-- Catálogos base
CREATE TABLE IF NOT EXISTS campus (
  id        text PRIMARY KEY,
  nombre    text NOT NULL
);

CREATE TABLE IF NOT EXISTS campus_meta (
  id        text PRIMARY KEY REFERENCES campus(id) ON DELETE CASCADE,
  imagen    text,
  direccion text,
  ciudad    text,
  map_url   text
);

CREATE TABLE IF NOT EXISTS facultad (
  id      text PRIMARY KEY,
  nombre  text NOT NULL UNIQUE
);

-- Modalidad como catálogo
CREATE TABLE IF NOT EXISTS modalidad (
  id text PRIMARY KEY CHECK (id IN ('presencial','semipresencial','distancia'))
);

-- Carreras y atributos adicionales
CREATE TABLE IF NOT EXISTS carrera (
  id                 text PRIMARY KEY,
  nombre             text NOT NULL,
  facultad_id        text NOT NULL REFERENCES facultad(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  duracion           text,
  malla_resumen_json jsonb,
  grado              text,
  titulo             text,
  imagen             text
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_carrera_facultad_nombre ON carrera(facultad_id, nombre);

-- Puentes de disponibilidad
CREATE TABLE IF NOT EXISTS carrera_campus (
  carrera_id text NOT NULL REFERENCES carrera(id) ON DELETE CASCADE,
  campus_id  text NOT NULL REFERENCES campus(id)  ON DELETE CASCADE,
  PRIMARY KEY (carrera_id, campus_id)
);
CREATE INDEX IF NOT EXISTS ix_carrera_campus_by_campus ON carrera_campus(campus_id, carrera_id);

CREATE TABLE IF NOT EXISTS carrera_modalidad (
  carrera_id   text NOT NULL REFERENCES carrera(id)   ON DELETE CASCADE,
  modalidad_id text NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
  PRIMARY KEY (carrera_id, modalidad_id)
);
CREATE INDEX IF NOT EXISTS ix_carrera_modalidad_by_modalidad ON carrera_modalidad(modalidad_id, carrera_id);

-- Oferta: combinación real carrera×campus×modalidad
CREATE TABLE IF NOT EXISTS oferta (
  carrera_id   text NOT NULL REFERENCES carrera(id)   ON DELETE CASCADE,
  campus_id    text NOT NULL REFERENCES campus(id)    ON DELETE CASCADE,
  modalidad_id text NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
  estado       text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','pausada','cerrada')),
  extras       jsonb,
  PRIMARY KEY (carrera_id, campus_id, modalidad_id)
);
CREATE INDEX IF NOT EXISTS ix_oferta_campus_modalidad_carrera ON oferta(campus_id, modalidad_id, carrera_id);

-- Periodos y moneda para precios
CREATE TABLE IF NOT EXISTS periodo (
  id     text PRIMARY KEY,  -- ej. '2025-1'
  anio   int NOT NULL CHECK (anio >= 2000),
  ciclo  int NOT NULL CHECK (ciclo IN (1,2)),
  inicio date,
  fin    date
);

CREATE TABLE IF NOT EXISTS moneda (
  codigo  text PRIMARY KEY, -- 'PEN','USD'
  simbolo text
);

-- Precios
CREATE TABLE IF NOT EXISTS precio (
  carrera_id    text NOT NULL,
  campus_id     text NOT NULL,
  modalidad_id  text NOT NULL,
  periodo_id    text NOT NULL,
  item          text NOT NULL CHECK (item IN ('matricula','pension_mensual','credito','cuota')),
  monto         numeric(12,2) NOT NULL CHECK (monto > 0),
  moneda_codigo text NOT NULL REFERENCES moneda(codigo) ON UPDATE CASCADE,
  vigente_desde date,
  vigente_hasta date,
  PRIMARY KEY (carrera_id, campus_id, modalidad_id, periodo_id, item),
  FOREIGN KEY (carrera_id, campus_id, modalidad_id) REFERENCES oferta(carrera_id, campus_id, modalidad_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (periodo_id) REFERENCES periodo(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Índices de soporte
CREATE INDEX IF NOT EXISTS ix_precio_carrera_periodo ON precio(carrera_id, periodo_id);
CREATE INDEX IF NOT EXISTS ix_precio_campus_modalidad_periodo ON precio(campus_id, modalidad_id, periodo_id);
CREATE INDEX IF NOT EXISTS ix_precio_vigente_partial ON precio(carrera_id, periodo_id)
  WHERE (vigente_desde IS NULL OR vigente_desde <= now()::date)
    AND (vigente_hasta IS NULL OR vigente_hasta >= now()::date);
```

---

## Paso 3. Usuario de aplicación (mínimos privilegios)

```sql
SET search_path TO cexcie;

-- Ajusta nombres y contraseñas en entorno seguro
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'cexcie_app') THEN
    CREATE ROLE cexcie_app LOGIN PASSWORD 'StrongAppPass#ChangeMe';
  END IF;
END$$;

GRANT USAGE ON SCHEMA cexcie TO cexcie_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA cexcie TO cexcie_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA cexcie GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cexcie_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA cexcie TO cexcie_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA cexcie GRANT USAGE, SELECT ON SEQUENCES TO cexcie_app;
```

---

## Paso 4. Semillas iniciales

```sql
SET search_path TO cexcie;

-- Modalidades
INSERT INTO modalidad(id) VALUES ('presencial'),('semipresencial'),('distancia')
ON CONFLICT (id) DO NOTHING;

-- Monedas
INSERT INTO moneda(codigo, simbolo) VALUES ('PEN','S/.'), ('USD','$')
ON CONFLICT (codigo) DO NOTHING;
```

---

## Paso 5. Pipeline de ingestión desde JSON

1) Validación (recomendada):
- Validar archivos fuente con JSON Schema (AJV) o con Zod (ya existen esquemas en `data/schemas.ts`).
- Validaciones cruzadas:
  - `carreras[].facultadId` ∈ `facultad.id`.
  - `carreras[].campus[]` ⊆ `campus.id`.
  - `carreras[].modalidades[]` ⊆ catálogo `modalidad`.

2) Orden de carga (idempotente):
- `campus` → `campus_meta` → `facultad` → `carrera` → `carrera_campus` → `carrera_modalidad` → `oferta` → `periodo` → `precio`.

3) Estrategia de carga:
- Usar un script Node que lea `public/data/*.json` y ejecute UPSERTs (`INSERT ... ON CONFLICT DO UPDATE`).
- Reportar conteos por tabla y combinaciones inválidas.

Comando de orquestación sugerido (cuando el script exista):

```bash
node scripts/load-data.mjs \
  --database-url "postgresql://cexcie_app:***@<host>:5432/cexcie?sslmode=require" \
  --data-dir "./public/data" \
  --periodo "2025-1"
```

Notas:
- Derivar `carrera_campus` y `carrera_modalidad` desde los arrays de `carreras.json`.
- Construir `oferta` como producto válido de (carrera×campus×modalidad) existentes.
- `precio` se insertará cuando exista su fuente (estructura prevista en la tabla `precio`).

---

## Paso 6. Consultas de referencia

```sql
-- 1) Listar carreras por campus
SELECT ca.id, ca.nombre, ca.facultad_id
FROM cexcie.carrera ca
JOIN cexcie.carrera_campus cc ON cc.carrera_id = ca.id
WHERE cc.campus_id = $1
ORDER BY ca.nombre;

-- 2) Listar carreras por facultad
SELECT id, nombre FROM cexcie.carrera
WHERE facultad_id = $1
ORDER BY nombre;

-- 3) Detalle de una carrera (incluye campus y modalidades)
SELECT ca.*, 
       ARRAY(SELECT campus_id FROM cexcie.carrera_campus cc WHERE cc.carrera_id = ca.id) AS campus,
       ARRAY(SELECT modalidad_id FROM cexcie.carrera_modalidad cm WHERE cm.carrera_id = ca.id) AS modalidades
FROM cexcie.carrera ca
WHERE ca.id = $1;

-- 4) Comparador: precios vigentes para N carreras en un campus y modalidad dados
WITH vigente AS (
  SELECT p.*
  FROM cexcie.precio p
  WHERE (p.vigente_desde IS NULL OR p.vigente_desde <= now()::date)
    AND (p.vigente_hasta IS NULL OR p.vigente_hasta >= now()::date)
)
SELECT v.carrera_id, v.item, v.monto, v.moneda_codigo, v.periodo_id
FROM vigente v
WHERE v.carrera_id = ANY($1::text[])
  AND v.campus_id = $2
  AND v.modalidad_id = $3
ORDER BY v.carrera_id, v.item;
```

---

## Paso 7. Optimización y mantenimiento

- Índices trigram para búsqueda por nombre:

```sql
CREATE INDEX IF NOT EXISTS ix_trgm_carrera_nombre ON cexcie.carrera USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS ix_trgm_facultad_nombre ON cexcie.facultad USING gin (nombre gin_trgm_ops);
```

- Vista de apoyo para precios vigentes:

```sql
CREATE OR REPLACE VIEW cexcie.vw_precio_vigente AS
SELECT p.*
FROM cexcie.precio p
WHERE (p.vigente_desde IS NULL OR p.vigente_desde <= now()::date)
  AND (p.vigente_hasta IS NULL OR p.vigente_hasta >= now()::date);
```

- (Opcional) Particionamiento de `precio` cuando crezca:

```sql
-- Ejemplo por LIST de periodo_id
ALTER TABLE cexcie.precio DETACH PARTITION IF EXISTS precio_2025_1; -- si existe previo

CREATE TABLE IF NOT EXISTS cexcie.precio_2025_1 (LIKE cexcie.precio INCLUDING ALL);
ALTER TABLE cexcie.precio ATTACH PARTITION cexcie.precio_2025_1 FOR VALUES IN ('2025-1');
```

---

## Checklist de verificación

- Esquema `cexcie` creado con todas las tablas e índices.
- Usuario `cexcie_app` con permisos mínimos.
- Modalidades y monedas sembradas.
- Carga inicial de `campus`, `campus_meta`, `facultad`, `carrera`.
- Derivación de `carrera_campus`, `carrera_modalidad` y `oferta` aplicada.
- Consultas básicas retornan datos esperados.

---

## Notas finales

- El modelo es compatible con los JSON actuales del repo (`public/data/*`).
- La entidad `precio` está preparada para cuando exista su fuente oficial.
- Si se requieren cambios de modalidades, es más flexible mantenerlas como catálogo (no enum nativo).


