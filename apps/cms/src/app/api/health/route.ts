import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 500 });

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 });
  try {
    const client = await pool.connect();
    try {
      await client.query('SET search_path TO cexcie, public');
      const ping = await client.query('SELECT 1 as ok');
      const fac = await client.query('SELECT COUNT(*)::int AS n FROM facultad');
      const cam = await client.query('SELECT COUNT(*)::int AS n FROM campus');
      const car = await client.query('SELECT COUNT(*)::int AS n FROM carrera');
      return NextResponse.json({ ok: true, ping: ping.rows[0].ok === 1, counts: { facultad: fac.rows[0].n, campus: cam.rows[0].n, carrera: car.rows[0].n } });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


