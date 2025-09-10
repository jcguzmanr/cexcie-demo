import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    try {
      const filePath = path.resolve(process.cwd(), 'public/data/facultades.json');
      const content = await fs.readFile(filePath, 'utf8');
      const items = JSON.parse(content);
      return NextResponse.json(items);
    } catch (e) {
      return NextResponse.json({ error: 'Fallback JSON not found' }, { status: 500 });
    }
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(`
      SELECT 
        f.id, 
        f.nombre,
        COALESCE(
          (
            SELECT array_agg(DISTINCT md.modalidad_id)
            FROM carrera c
            LEFT JOIN carrera_modalidad md ON c.id = md.carrera_id
            WHERE c.facultad_id = f.id
          ), ARRAY[]::text[]
        ) AS modalidades
      FROM facultad f
      ORDER BY f.nombre
    `);
    return NextResponse.json(result.rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      modalidades: (r.modalidades || []).filter(Boolean)
    })));
  } catch (error) {
    console.error('GET /api/facultades error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}


