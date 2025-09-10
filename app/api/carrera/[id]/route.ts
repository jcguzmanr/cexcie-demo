import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const databaseUrl = getDatabaseConnectionString();

  async function readFallbackDetalle() {
    try {
      const filePath = path.resolve(process.cwd(), 'public/data/detalle-carrera.json');
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  if (!databaseUrl) {
    const fallback = await readFallbackDetalle();
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: 'No database configured and no fallback available' }, { status: 500 });
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(
      `SELECT 
         c.id,
         c.nombre,
         c.facultad_id as "facultadId",
         c.imagen,
         c.duracion,
         c.grado,
         c.titulo,
         COALESCE(cd.secciones, '{}'::jsonb) as secciones,
         array_agg(DISTINCT cm.campus_id) as campus,
         array_agg(DISTINCT md.modalidad_id) as modalidades
       FROM carrera c
       LEFT JOIN carrera_detalle cd ON cd.carrera_id = c.id
       LEFT JOIN carrera_campus cm ON c.id = cm.carrera_id
       LEFT JOIN carrera_modalidad md ON c.id = md.carrera_id
       WHERE c.id = $1
       GROUP BY c.id, c.nombre, c.facultad_id, c.imagen, c.duracion, c.grado, c.titulo, cd.secciones`,
      [id]
    );

    if (result.rows.length === 0) {
      // Fallback a JSON si no existe en BD
      const fallback = await readFallbackDetalle();
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: 'Carrera no encontrada' }, { status: 404 });
    }

    const row = result.rows[0];
    // Normalizar estructura esperada por la UI
    const detalle = {
      id: row.id,
      nombre: row.nombre,
      facultad: row.facultadId,
      campus: (row.campus || []).filter(Boolean),
      modalidades: (row.modalidades || []).filter(Boolean),
      secciones: row.secciones && Object.keys(row.secciones).length > 0
        ? row.secciones
        : {
            sobre: {
              titulo: `Sobre ${row.nombre}`,
              descripcion: `Información sobre la carrera de ${row.nombre}.`,
              media: row.imagen ? { type: 'image', alt: row.nombre, src: row.imagen } : undefined,
              infoCards: []
            },
          }
    };

    return NextResponse.json(detalle);
  } catch (error) {
    console.error('GET /api/carrera/[id] error:', error);
    // Fallback final a JSON
    const fallback = await readFallbackDetalle();
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}


