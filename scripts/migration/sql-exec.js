#!/usr/bin/env node

const { Pool } = require('pg');

async function main() {
  const sql = process.argv.slice(2).join(' ').trim();
  if (!sql) {
    console.error('Usage: node scripts/migration/sql-exec.js "<SQL>"');
    process.exit(1);
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query(sql);
    console.log('OK:', { rowCount: res.rowCount });
    if (res.rows && res.rows.length) {
      console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (e) {
    console.error('SQL error:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


