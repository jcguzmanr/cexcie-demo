import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forceJson = url.searchParams.get('source') === 'json' || process.env.DATABASE_PROVIDER === 'json';
  const databaseUrl = forceJson ? null : getDatabaseConnectionString();
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
    const e = error as (Error & { code?: string; detail?: string; severity?: string }) | undefined;
    const body: Record<string, unknown> = { error: 'Database error' };
    if (process.env.DEBUG_DB_ERRORS === 'true') {
      body.message = e?.message;
      body.code = e?.code;
      body.detail = e?.detail;
      body.severity = e?.severity;
    }
    console.error('GET /api/facultades error:', e?.message || e);
    return NextResponse.json(body, { status: 500 });
  } finally {
    await pool.end();
  }
}


