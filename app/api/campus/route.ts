import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();

  // Fallback: servir JSON público si no hay DB
  if (!databaseUrl) {
    const data = await import('@/data/campus.json');
    return NextResponse.json(data.default || data);
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(`
      SELECT id, nombre
      FROM campus
      ORDER BY nombre
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET /api/campus error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}


