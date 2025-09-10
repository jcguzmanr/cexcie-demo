import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getDatabaseConnectionString } from '@/lib/config/database';

export async function GET() {
  const databaseUrl = getDatabaseConnectionString();
  if (!databaseUrl) {
    return NextResponse.json({ ok: false, reason: 'NO_DATABASE_URL' }, { status: 500 });
  }

  const startedAt = Date.now();
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query('select version(), now(), current_database()');
    const durationMs = Date.now() - startedAt;
    return NextResponse.json({
      ok: true,
      durationMs,
      version: res.rows?.[0]?.version ?? null,
      now: res.rows?.[0]?.now ?? null,
      database: res.rows?.[0]?.current_database ?? null,
    });
  } catch (err) {
    const e = err as (Error & { code?: string; detail?: string; severity?: string; hint?: string }) | undefined;
    const durationMs = Date.now() - startedAt;
    return NextResponse.json({
      ok: false,
      durationMs,
      message: e?.message ?? null,
      code: e?.code ?? null,
      detail: e?.detail ?? null,
      severity: e?.severity ?? null,
      hint: e?.hint ?? null,
    }, { status: 500 });
  } finally {
    await pool.end();
  }
}


