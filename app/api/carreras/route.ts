import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    try {
      const filePath = path.resolve(process.cwd(), 'public/data/carreras.json');
      const content = await fs.readFile(filePath, 'utf8');
      return NextResponse.json(JSON.parse(content));
    } catch (e) {
      return NextResponse.json({ error: 'Fallback JSON not found' }, { status: 500 });
    }
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.nombre, c.facultad_id as "facultadId", c.imagen,
        c.duracion as duracion,
        c.grado as grado,
        c.titulo as titulo,
        array_agg(DISTINCT cm.campus_id) as campus,
        array_agg(DISTINCT md.modalidad_id) as modalidades
      FROM carrera c
      LEFT JOIN carrera_campus cm ON c.id = cm.carrera_id
      LEFT JOIN carrera_modalidad md ON c.id = md.carrera_id
      GROUP BY c.id, c.nombre, c.facultad_id, c.imagen, c.duracion, c.grado, c.titulo
      ORDER BY c.nombre
    `);
    return NextResponse.json(result.rows.map(r => ({
      ...r,
      campus: (r.campus || []).filter(Boolean),
      modalidades: (r.modalidades || []).filter(Boolean)
    })));
  } catch (error) {
    console.error('GET /api/carreras error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}


