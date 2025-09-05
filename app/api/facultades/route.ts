import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    const data = await import('@/data/facultades.json');
    return NextResponse.json(data.default || data);
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(`
      SELECT id, nombre
      FROM facultad
      ORDER BY nombre
    `);
    // Agregar modalidades si procede (vacío por ahora)
    return NextResponse.json(result.rows.map(r => ({ ...r, modalidades: [] })));
  } catch (error) {
    console.error('GET /api/facultades error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}


