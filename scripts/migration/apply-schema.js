#!/usr/bin/env node

/**
 * Aplica el esquema SQL del proyecto a una base PostgreSQL y asegura search_path.
 * Usa DATABASE_URL para conectarse (se recomienda que apunte a la DB "postgres" para crear "cexcie").
 *
 * Uso:
 *   DATABASE_URL="postgresql://user:pass@host:5432/postgres?sslmode=require" node scripts/migration/apply-schema.js
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const ADMIN_URL = process.env.DATABASE_URL;

if (!ADMIN_URL) {
  console.error('❌ DATABASE_URL no definido. Ejemplo: postgresql://user:pass@host:5432/postgres?sslmode=require');
  process.exit(1);
}

function withDatabase(urlString, dbName) {
  const u = new URL(urlString);
  // Establecer el nombre de base de datos en la ruta
  u.pathname = `/${dbName}`;
  return u.toString();
}

async function applySchema() {
  const adminPool = new Pool({ connectionString: ADMIN_URL, ssl: { rejectUnauthorized: false } });
  try {
    console.log('🏗️  Conectando como administrador...');
    await adminPool.query('SELECT 1');
    console.log('✅ Conexión admin OK');

    // 1) Crear DB cexcie si no existe
    console.log('🗄️  Creando base de datos cexcie (si no existe)...');
    await adminPool.query("CREATE DATABASE cexcie").catch((err) => {
      if (err && /already exists/i.test(err.message)) {
        console.log('ℹ️  La base de datos cexcie ya existe');
      } else {
        throw err;
      }
    });

    // 2) Aplicar esquema
    const targetUrl = withDatabase(ADMIN_URL, 'cexcie');
    const targetPool = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });
    try {
      console.log('📄 Leyendo archivo database_schema.sql...');
      const sqlPath = path.resolve(process.cwd(), 'database_schema.sql');
      const sql = await fs.readFile(sqlPath, 'utf8');

      console.log('📥 Aplicando esquema completo en cexcie...');
      await targetPool.query(sql);
      console.log('✅ Esquema aplicado');

      console.log('🧭 Fijando search_path por defecto...');
      await adminPool.query("ALTER DATABASE cexcie SET search_path TO cexcie, public");
      console.log('✅ search_path configurado');
    } finally {
      await targetPool.end();
    }

    console.log('\n🎉 Base cexcie lista con esquema aplicado');
  } catch (error) {
    console.error('❌ Error aplicando esquema:', error);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

if (require.main === module) {
  applySchema().catch(console.error);
}

module.exports = { applySchema };



