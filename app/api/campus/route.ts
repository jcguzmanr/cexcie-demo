import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();

  // Fallback: servir JSON público si no hay DB
  if (!databaseUrl) {
    try {
      const filePath = path.resolve(process.cwd(), 'public/data/campus.json');
      const content = await fs.readFile(filePath, 'utf8');
      return NextResponse.json(JSON.parse(content));
    } catch (e) {
      return NextResponse.json({ error: 'Fallback JSON not found' }, { status: 500 });
    }
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


