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


