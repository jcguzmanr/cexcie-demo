import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import { z } from 'zod';

// Schema de validación para el lead
const LeadSubmissionSchema = z.object({
  // Información de contacto
  nombre_completo: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  dni: z.string().min(8, 'DNI debe tener al menos 8 dígitos'),
  telefono: z.string().min(8, 'Teléfono debe tener al menos 8 dígitos').regex(/^[\+]?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido'),
  email: z.string().email('Email inválido'),
  metodo_contacto: z.enum(['whatsapp', 'correo'], { 
    errorMap: () => ({ message: 'Método de contacto debe ser whatsapp o correo' })
  }),
  
  // Metadatos de la sesión
  session_id: z.string().min(1, 'Session ID es requerido'),
  lead_id: z.string().min(1, 'Lead ID es requerido'),
  source: z.string().default('program'),
  institution_type: z.string().default('university'),
  
  // Datos de telemetría (opcionales)
  telemetry_events: z.array(z.object({
    page_path: z.string(),
    page_title: z.string().optional(),
    action_type: z.string(),
    entity_type: z.string().optional(),
    entity_id: z.string().optional(),
    entity_name: z.string().optional(),
    metadata: z.record(z.unknown()).default({}),
    timestamp: z.string()
  })).default([]),
  
  // Selecciones de programas (opcionales)
  program_selections: z.array(z.object({
    program_id: z.string(),
    program_name: z.string(),
    program_type: z.string().default('career'),
    department_id: z.string().optional(),
    department_name: z.string().optional(),
    selection_source: z.string(),
    selection_order: z.number().int().positive()
  })).default([])
});

export async function POST(req: Request) {
  const databaseUrl = getDatabaseConnectionString();
  
  if (!databaseUrl) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database not configured',
        message: 'Sistema de base de datos no configurado'
      }, 
      { status: 500 }
    );
  }

  try {
    // Parsear y validar el body
    const body = await req.json();
    const validatedData = LeadSubmissionSchema.parse(body);

    const pool = new Pool({ 
      connectionString: databaseUrl, 
      ssl: { rejectUnauthorized: false },
      // Optimizaciones de rendimiento
      max: 20, // máximo de conexiones
      idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30s
      connectionTimeoutMillis: 2000, // timeout de conexión 2s
      statement_timeout: 10000, // timeout de statements 10s
    });

    await pool.query('BEGIN');
    await pool.query('SET search_path TO cexcie');

    try {
      // 1. Insertar el lead principal
      const leadResult = await pool.query(`
        INSERT INTO user_leads (
          nombre_completo, dni, telefono, email, metodo_contacto,
          session_id, lead_id, source, institution_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [
        validatedData.nombre_completo,
        validatedData.dni,
        validatedData.telefono,
        validatedData.email,
        validatedData.metodo_contacto,
        validatedData.session_id,
        validatedData.lead_id,
        validatedData.source,
        validatedData.institution_type
      ]);

      const leadRecord = leadResult.rows[0];

      // 2. Insertar eventos de telemetría si existen (BATCH INSERT - OPTIMIZADO)
      let telemetryEventsSaved = 0;
      if (validatedData.telemetry_events.length > 0) {
        // Crear query de inserción en lote para telemetría
        const telemetryValues = validatedData.telemetry_events.map((_, index) => {
          const offset = index * 10;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`;
        }).join(', ');
        
        const telemetryParams = validatedData.telemetry_events.flatMap(event => [
          validatedData.lead_id,
          validatedData.session_id,
          event.page_path,
          event.page_title || null,
          event.action_type,
          event.entity_type || null,
          event.entity_id || null,
          event.entity_name || null,
          JSON.stringify(event.metadata),
          event.timestamp
        ]);
        
        await pool.query(`
          INSERT INTO user_navigation_tracking (
            lead_id, session_id, page_path, page_title, action_type,
            entity_type, entity_id, entity_name, metadata, timestamp
          ) VALUES ${telemetryValues}
        `, telemetryParams);
        
        telemetryEventsSaved = validatedData.telemetry_events.length;
      }

      // 3. Insertar selecciones de programas si existen (BATCH INSERT - OPTIMIZADO)
      let programSelectionsSaved = 0;
      if (validatedData.program_selections.length > 0) {
        // Crear query de inserción en lote para selecciones
        const selectionValues = validatedData.program_selections.map((_, index) => {
          const offset = index * 9;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
        }).join(', ');
        
        const selectionParams = validatedData.program_selections.flatMap(selection => [
          validatedData.lead_id,
          validatedData.session_id,
          selection.program_id,
          selection.program_name,
          selection.program_type,
          selection.department_id || null,
          selection.department_name || null,
          selection.selection_source,
          selection.selection_order
        ]);
        
        await pool.query(`
          INSERT INTO user_program_selections (
            lead_id, session_id, program_id, program_name, program_type,
            department_id, department_name, selection_source, selection_order
          ) VALUES ${selectionValues}
        `, selectionParams);
        
        programSelectionsSaved = validatedData.program_selections.length;
      }

      await pool.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: {
          lead_id: validatedData.lead_id,
          internal_id: leadRecord.id,
          created_at: leadRecord.created_at,
          telemetry_events_saved: telemetryEventsSaved,
          program_selections_saved: programSelectionsSaved
        },
        message: 'Lead guardado exitosamente'
      });

    } catch (dbError) {
      await pool.query('ROLLBACK');
      throw dbError;
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('Error saving lead:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const e = error as (Error & { code?: string; detail?: string });
    
    return NextResponse.json({
      success: false,
      error: 'Database error',
      message: e.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && {
        code: e.code,
        detail: e.detail
      })
    }, { status: 500 });
  }
}

// GET endpoint para obtener leads (solo para desarrollo/admin)
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' }, 
      { status: 403 }
    );
  }

  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    return NextResponse.json(
      { error: 'Database not configured' }, 
      { status: 500 }
    );
  }

  try {
    const pool = new Pool({ 
      connectionString: databaseUrl, 
      ssl: { rejectUnauthorized: false } 
    });

    await pool.query('SET search_path TO cexcie');

    const result = await pool.query(`
      SELECT 
        ul.id,
        ul.lead_id,
        ul.nombre_completo,
        ul.email,
        ul.metodo_contacto,
        ul.source,
        ul.created_at,
        COUNT(unt.id) as telemetry_events_count,
        COUNT(ups.id) as program_selections_count
      FROM user_leads ul
      LEFT JOIN user_navigation_tracking unt ON ul.lead_id = unt.lead_id
      LEFT JOIN user_program_selections ups ON ul.lead_id = ups.lead_id
      GROUP BY ul.id, ul.lead_id, ul.nombre_completo, ul.email, ul.metodo_contacto, ul.source, ul.created_at
      ORDER BY ul.created_at DESC
      LIMIT 50
    `);

    await pool.end();

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Database error' }, 
      { status: 500 }
    );
  }
}
