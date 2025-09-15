-- CExCIE - Esquema de Base de Datos
-- Sistema de gestión académica para campus, facultades, carreras y precios

CREATE SCHEMA IF NOT EXISTS cexcie;
SET search_path TO cexcie;

-- ============================================================================
-- CATÁLOGOS BASE
-- ============================================================================

-- Campus universitarios
CREATE TABLE campus (
    id        text PRIMARY KEY,
    nombre    text NOT NULL
);

-- Metadatos adicionales de campus
CREATE TABLE campus_meta (
    id        text PRIMARY KEY REFERENCES campus(id) ON DELETE CASCADE,
    imagen    text,
    direccion text,
    ciudad    text,
    map_url   text
);

-- Facultades
CREATE TABLE facultad (
    id      text PRIMARY KEY,
    nombre  text NOT NULL UNIQUE
);

-- Modalidades de estudio (catálogo controlado)
CREATE TABLE modalidad (
    id text PRIMARY KEY CHECK (id IN ('presencial','semipresencial','distancia'))
);

-- ============================================================================
-- CARRERAS Y DISPONIBILIDAD
-- ============================================================================

-- Carreras académicas
CREATE TABLE carrera (
    id                 text PRIMARY KEY,
    nombre             text NOT NULL,
    facultad_id        text NOT NULL REFERENCES facultad(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    duracion           text,
    malla_resumen_json jsonb,
    grado              text,
    titulo             text,
    imagen             text
);

-- Índice único para evitar carreras duplicadas por facultad
CREATE UNIQUE INDEX uq_carrera_facultad_nombre ON carrera(facultad_id, nombre);

-- Disponibilidad de carreras por campus
CREATE TABLE carrera_campus (
    carrera_id text NOT NULL REFERENCES carrera(id) ON DELETE CASCADE,
    campus_id  text NOT NULL REFERENCES campus(id)  ON DELETE CASCADE,
    PRIMARY KEY (carrera_id, campus_id)
);

-- Disponibilidad de carreras por modalidad
CREATE TABLE carrera_modalidad (
    carrera_id   text NOT NULL REFERENCES carrera(id)   ON DELETE CASCADE,
    modalidad_id text NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
    PRIMARY KEY (carrera_id, modalidad_id)
);

-- ============================================================================
-- OFERTAS ACADÉMICAS
-- ============================================================================

-- Oferta: combinación real carrera×campus×modalidad disponible
CREATE TABLE oferta (
    carrera_id   text NOT NULL REFERENCES carrera(id)   ON DELETE CASCADE,
    campus_id    text NOT NULL REFERENCES campus(id)    ON DELETE CASCADE,
    modalidad_id text NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
    estado       text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','pausada','cerrada')),
    extras       jsonb,
    PRIMARY KEY (carrera_id, campus_id, modalidad_id)
);

-- ============================================================================
-- SISTEMA DE PRECIOS
-- ============================================================================

-- Periodos académicos
CREATE TABLE periodo (
    id     text PRIMARY KEY,  -- ej. '2025-1'
    anio   int NOT NULL CHECK (anio >= 2000),
    ciclo  int NOT NULL CHECK (ciclo IN (1,2)),
    inicio date,
    fin    date
);

-- Monedas para precios
CREATE TABLE moneda (
    codigo  text PRIMARY KEY, -- 'PEN','USD'
    simbolo text
);

-- Precios por oferta, periodo y tipo de pago
CREATE TABLE precio (
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

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================================

-- Búsquedas por campus
CREATE INDEX ix_carrera_campus_by_campus ON carrera_campus(campus_id, carrera_id);

-- Búsquedas por modalidad
CREATE INDEX ix_carrera_modalidad_by_modalidad ON carrera_modalidad(modalidad_id, carrera_id);

-- Búsquedas de ofertas
CREATE INDEX ix_oferta_campus_modalidad_carrera ON oferta(campus_id, modalidad_id, carrera_id);

-- Búsquedas de precios
CREATE INDEX ix_precio_carrera_periodo ON precio(carrera_id, periodo_id);
CREATE INDEX ix_precio_campus_modalidad_periodo ON precio(campus_id, modalidad_id, periodo_id);

-- Índices para acelerar consultas por vigencia (evita funciones no inmutables en predicados)
CREATE INDEX ix_precio_vigencia_rng ON precio(carrera_id, periodo_id, vigente_desde, vigente_hasta);

-- Índices para búsqueda de texto (requiere extensión pg_trgm)
-- CREATE INDEX ix_trgm_carrera_nombre ON carrera USING gin (nombre gin_trgm_ops);
-- CREATE INDEX ix_trgm_facultad_nombre ON facultad USING gin (nombre gin_trgm_ops);

-- ============================================================================
-- DATOS SEMILLA
-- ============================================================================

-- Modalidades predefinidas
INSERT INTO modalidad(id) VALUES 
    ('presencial'),
    ('semipresencial'),
    ('distancia')
ON CONFLICT (id) DO NOTHING;

-- Monedas
INSERT INTO moneda(codigo, simbolo) VALUES 
    ('PEN','S/.'), 
    ('USD','$')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- VISTAS DE APOYO
-- ============================================================================

-- Vista para precios vigentes
CREATE OR REPLACE VIEW vw_precio_vigente AS
SELECT p.*
FROM precio p
WHERE (p.vigente_desde IS NULL OR p.vigente_desde <= now()::date)
  AND (p.vigente_hasta IS NULL OR p.vigente_hasta >= now()::date);

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON SCHEMA cexcie IS 'Sistema de gestión académica - Campus, carreras, facultades y precios';

COMMENT ON TABLE campus IS 'Sedes universitarias disponibles';
COMMENT ON TABLE campus_meta IS 'Información adicional de campus (imágenes, ubicación)';
COMMENT ON TABLE facultad IS 'Facultades académicas';
COMMENT ON TABLE modalidad IS 'Modalidades de estudio disponibles';
COMMENT ON TABLE carrera IS 'Programas académicos ofrecidos';
COMMENT ON TABLE carrera_campus IS 'Disponibilidad de carreras por campus';
COMMENT ON TABLE carrera_modalidad IS 'Modalidades disponibles por carrera';
COMMENT ON TABLE oferta IS 'Combinaciones reales carrera×campus×modalidad';
COMMENT ON TABLE periodo IS 'Periodos académicos';
COMMENT ON TABLE moneda IS 'Monedas para sistema de precios';
COMMENT ON TABLE precio IS 'Precios por oferta, periodo y concepto';

COMMENT ON COLUMN precio.item IS 'Tipo de concepto: matricula, pension_mensual, credito, cuota';
COMMENT ON COLUMN precio.vigente_desde IS 'Fecha desde cuando aplica el precio';
COMMENT ON COLUMN precio.vigente_hasta IS 'Fecha hasta cuando aplica el precio';

-- Comentarios para sistema de leads y telemetría
COMMENT ON TABLE user_leads IS 'Información de contacto de usuarios que enviaron formulario';
COMMENT ON TABLE user_navigation_tracking IS 'Tracking de navegación y eventos del usuario';
COMMENT ON TABLE user_program_selections IS 'Programas específicos seleccionados por el usuario';

COMMENT ON COLUMN user_leads.lead_id IS 'ID único generado por el frontend para identificar el lead';
COMMENT ON COLUMN user_leads.source IS 'Origen del lead: program, comparator, etc.';
COMMENT ON COLUMN user_leads.institution_type IS 'Tipo de institución: university, institute, college, etc.';
COMMENT ON COLUMN user_navigation_tracking.action_type IS 'Tipo de acción: page_visit, program_selected, comparison_viewed, etc.';
COMMENT ON COLUMN user_navigation_tracking.entity_type IS 'Tipo de entidad: program, campus, department, faculty, etc.';
COMMENT ON COLUMN user_program_selections.program_type IS 'Tipo de programa: career, course, specialization, degree, etc.';
COMMENT ON COLUMN user_program_selections.selection_order IS 'Orden de selección (1, 2, 3...) para indicar prioridad';

-- ============================================================================
-- SISTEMA DE LEADS Y TELEMETRÍA
-- ============================================================================

-- Tabla principal para leads/contactos
CREATE TABLE IF NOT EXISTS user_leads (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    -- Información de contacto
    nombre_completo text NOT NULL,
    dni text NOT NULL,
    telefono text NOT NULL,
    email text NOT NULL,
    metodo_contacto text NOT NULL CHECK (metodo_contacto IN ('whatsapp', 'correo')),
    -- Metadatos de la sesión
    session_id text NOT NULL,
    lead_id text NOT NULL UNIQUE, -- El ID que ya genera el modal
    source text NOT NULL DEFAULT 'program', -- De dónde vino el lead
    institution_type text NOT NULL DEFAULT 'university', -- 'university', 'institute', 'college', etc.
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabla para tracking de navegación del usuario
CREATE TABLE IF NOT EXISTS user_navigation_tracking (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id text NOT NULL REFERENCES user_leads(lead_id) ON DELETE CASCADE,
    session_id text NOT NULL,
    -- Datos de navegación
    page_path text NOT NULL,
    page_title text,
    action_type text NOT NULL, -- 'page_visit', 'program_selected', 'comparison_viewed', etc.
    entity_type text, -- 'program', 'campus', 'department', 'faculty', etc.
    entity_id text, -- ID de la entidad específica
    entity_name text, -- Nombre legible de la entidad
    -- Datos contextuales
    metadata jsonb DEFAULT '{}',
    timestamp timestamp with time zone DEFAULT now()
);

-- Tabla para programas/selecciones del usuario (término genérico)
CREATE TABLE IF NOT EXISTS user_program_selections (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_id text NOT NULL REFERENCES user_leads(lead_id) ON DELETE CASCADE,
    session_id text NOT NULL,
    -- Datos del programa (genérico para carreras, cursos, especializaciones, etc.)
    program_id text NOT NULL,
    program_name text NOT NULL,
    program_type text NOT NULL, -- 'career', 'course', 'specialization', 'degree', etc.
    department_id text, -- Puede ser facultad, escuela, departamento, etc.
    department_name text,
    -- Contexto de selección
    selection_source text, -- 'comparator', 'program_detail', 'department_page', etc.
    selection_order int, -- Orden en que fue seleccionado (1, 2, 3...)
    timestamp timestamp with time zone DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS ix_user_leads_session_id ON user_leads(session_id);
CREATE INDEX IF NOT EXISTS ix_user_leads_lead_id ON user_leads(lead_id);
CREATE INDEX IF NOT EXISTS ix_user_leads_created_at ON user_leads(created_at);
CREATE INDEX IF NOT EXISTS ix_user_navigation_tracking_lead_id ON user_navigation_tracking(lead_id);
CREATE INDEX IF NOT EXISTS ix_user_navigation_tracking_session_id ON user_navigation_tracking(session_id);
CREATE INDEX IF NOT EXISTS ix_user_navigation_tracking_timestamp ON user_navigation_tracking(timestamp);
CREATE INDEX IF NOT EXISTS ix_user_program_selections_lead_id ON user_program_selections(lead_id);
CREATE INDEX IF NOT EXISTS ix_user_program_selections_session_id ON user_program_selections(session_id);
CREATE INDEX IF NOT EXISTS ix_user_program_selections_program_id ON user_program_selections(program_id);

-- =========================================================================
-- CONTENIDO ENRIQUECIDO (DETALLE Y DIDÁCTICAS)
-- =========================================================================

-- Detalle por carrera (estructura flexible en JSON)
CREATE TABLE IF NOT EXISTS carrera_detalle (
    carrera_id  text PRIMARY KEY REFERENCES carrera(id) ON DELETE CASCADE,
    secciones   jsonb NOT NULL DEFAULT '{}'::jsonb,
    actualizado timestamptz NOT NULL DEFAULT now()
);

-- Didácticas y ayudas (globales)
CREATE TABLE IF NOT EXISTS didactics (
    id          text PRIMARY KEY,
    payload     jsonb NOT NULL,
    actualizado timestamptz NOT NULL DEFAULT now()
);

-- Comparación de modalidades (por carrera o default)
CREATE TABLE IF NOT EXISTS modalidad_comparison (
    career_id   text PRIMARY KEY, -- usar 'default' para genérico
    payload     jsonb NOT NULL,
    actualizado timestamptz NOT NULL DEFAULT now()
);

