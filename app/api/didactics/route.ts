import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    try {
      const filePath = path.resolve(process.cwd(), 'public/data/didactics.json');
      const content = await fs.readFile(filePath, 'utf8');
      return NextResponse.json(JSON.parse(content));
    } catch (e) {
      return NextResponse.json({ error: 'Fallback JSON not found' }, { status: 500 });
    }
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const result = await pool.query(`SELECT payload FROM didactics WHERE id = 'default'`);
    if (result.rows.length === 0) {
      return NextResponse.json({ anchors: [], didactics: {}, explicacionCalculo: {}, fuentes: [] });
    }
    return NextResponse.json(result.rows[0].payload);
  } catch (error) {
    console.error('GET /api/didactics error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await pool.end();
  }
}



