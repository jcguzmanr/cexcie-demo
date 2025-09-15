#!/usr/bin/env node

/**
 * Script para agregar las tablas de leads y telemetría a la base de datos existente
 * 
 * Uso:
 *   node scripts/migration/add-leads-tables.js
 * 
 * Variables de entorno requeridas:
 *   - DATABASE_URL: URL de conexión a PostgreSQL
 *   - NODE_ENV: development/production
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL no está configurada');
  console.log('Por favor configura la variable de entorno DATABASE_URL');
  process.exit(1);
}

console.log('🚀 Iniciando migración de tablas de leads y telemetría...');
console.log(`📊 Base de datos: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📝 Ejecutando migración...');
    
    // Leer el archivo SQL con las nuevas tablas
    const sqlFilePath = path.join(__dirname, '../../database_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Extraer solo la sección de leads y telemetría
    const leadsSectionStart = sqlContent.indexOf('-- ============================================================================');
    const leadsSectionEnd = sqlContent.indexOf('-- =========================================================================', leadsSectionStart + 1);
    
    if (leadsSectionStart === -1 || leadsSectionEnd === -1) {
      throw new Error('No se encontró la sección de leads en el archivo SQL');
    }
    
    const leadsSection = sqlContent.substring(leadsSectionStart, leadsSectionEnd);
    
    // Ejecutar la migración
    await client.query('BEGIN');
    
    // Establecer el esquema correcto
    await client.query('SET search_path TO cexcie');
    
    // Verificar si las tablas ya existen
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'cexcie' 
      AND table_name IN ('user_leads', 'user_navigation_tracking', 'user_program_selections')
    `);
    
    const existingTables = checkTables.rows.map(row => row.table_name);
    
    if (existingTables.length > 0) {
      console.log(`⚠️  Las siguientes tablas ya existen: ${existingTables.join(', ')}`);
      console.log('¿Deseas continuar? Esto podría fallar si hay conflictos.');
      
      // En modo no interactivo, continuar
      if (process.env.NODE_ENV === 'production' || process.env.FORCE_MIGRATION === 'true') {
        console.log('🔄 Continuando con la migración...');
      } else {
        console.log('❌ Migración cancelada. Usa FORCE_MIGRATION=true para forzar.');
        await client.query('ROLLBACK');
        return;
      }
    }
    
    // Ejecutar las declaraciones SQL
    const statements = leadsSection
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Ejecutado: ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Ya existe: ${statement.substring(0, 50)}...`);
          } else {
            throw error;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Verificar que las tablas se crearon correctamente
    const verifyTables = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'cexcie') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'cexcie' 
      AND table_name IN ('user_leads', 'user_navigation_tracking', 'user_program_selections')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tablas creadas:');
    verifyTables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name} (${row.column_count} columnas)`);
    });
    
    // Verificar índices
    const verifyIndexes = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'cexcie'
      AND tablename IN ('user_leads', 'user_navigation_tracking', 'user_program_selections')
      ORDER BY tablename, indexname
    `);
    
    console.log('\n🔍 Índices creados:');
    verifyIndexes.rows.forEach(row => {
      console.log(`   ✅ ${row.indexname} en ${row.tablename}`);
    });
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Verificar que la API /api/leads funciona correctamente');
    console.log('   2. Probar el envío de un lead desde el frontend');
    console.log('   3. Revisar los datos en la base de datos');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la migración:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la migración
runMigration().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
