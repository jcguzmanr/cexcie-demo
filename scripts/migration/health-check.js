#!/usr/bin/env node

/**
 * Script de health check para PostgreSQL
 * Uso: node scripts/migration/health-check.js
 */

const { Pool } = require('pg');

// Configuración de la base de datos
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cexcie';

async function healthCheck() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('🏥 Iniciando health check de PostgreSQL...');
    console.log(`📊 Conectando a: ${DATABASE_URL.replace(/\/\/.*@/, '//***@')}`);
    
    // 1. Test de conexión básica
    console.log('\n🔌 Test de conexión...');
    const startTime = Date.now();
    const result = await pool.query('SELECT 1 as test');
    const connectionTime = Date.now() - startTime;
    
    if (result.rows[0].test === 1) {
      console.log(`✅ Conexión exitosa (${connectionTime}ms)`);
    } else {
      throw new Error('Test query failed');
    }
    
    // 2. Test de tablas existentes
    console.log('\n📋 Verificando estructura de tablas...');
    const tables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const expectedTables = [
      'campus', 'campus_meta', 'facultad', 'modalidad',
      'carrera', 'carrera_campus', 'carrera_modalidad',
      'oferta', 'periodo', 'moneda', 'precio'
    ];
    
    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    const extraTables = existingTables.filter(table => !expectedTables.includes(table));
    
    console.log(`   Tablas encontradas: ${existingTables.length}`);
    console.log(`   Tablas esperadas: ${expectedTables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`   ⚠️  Tablas faltantes: ${missingTables.join(', ')}`);
    }
    
    if (extraTables.length > 0) {
      console.log(`   ℹ️  Tablas adicionales: ${extraTables.join(', ')}`);
    }
    
    // 3. Test de datos en tablas principales
    console.log('\n📊 Verificando datos en tablas principales...');
    
    const tableChecks = [
      { name: 'facultad', query: 'SELECT COUNT(*) FROM facultad' },
      { name: 'campus', query: 'SELECT COUNT(*) FROM campus' },
      { name: 'carrera', query: 'SELECT COUNT(*) FROM carrera' },
      { name: 'modalidad', query: 'SELECT COUNT(*) FROM modalidad' }
    ];
    
    for (const check of tableChecks) {
      try {
        const countResult = await pool.query(check.query);
        const count = parseInt(countResult.rows[0].count);
        console.log(`   ${check.name.padEnd(12)}: ${count.toString().padStart(3)} registros`);
      } catch (error) {
        console.log(`   ${check.name.padEnd(12)}: ❌ Error - ${error.message}`);
      }
    }
    
    // 4. Test de relaciones
    console.log('\n🔗 Verificando integridad referencial...');
    
    try {
      const carreraFacultadCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM carrera c
        LEFT JOIN facultad f ON c.facultad_id = f.id
        WHERE f.id IS NULL
      `);
      
      const orphanCarreras = parseInt(carreraFacultadCheck.rows[0].count);
      if (orphanCarreras === 0) {
        console.log('   ✅ Carreras-Facultades: Integridad referencial correcta');
      } else {
        console.log(`   ⚠️  Carreras-Facultades: ${orphanCarreras} carreras sin facultad válida`);
      }
    } catch (error) {
      console.log(`   ❌ Error verificando relaciones: ${error.message}`);
    }
    
    // 5. Test de performance
    console.log('\n⚡ Test de performance...');
    
    const performanceTests = [
      { name: 'Consulta simple', query: 'SELECT COUNT(*) FROM facultad' },
      { name: 'JOIN básico', query: 'SELECT COUNT(*) FROM carrera c JOIN facultad f ON c.facultad_id = f.id' },
      { name: 'Consulta con array_agg', query: 'SELECT COUNT(*) FROM carrera c LEFT JOIN carrera_campus cc ON c.id = cc.carrera_id' }
    ];
    
    for (const test of performanceTests) {
      const startTime = Date.now();
      try {
        await pool.query(test.query);
        const duration = Date.now() - startTime;
        console.log(`   ${test.name.padEnd(20)}: ${duration}ms`);
      } catch (error) {
        console.log(`   ${test.name.padEnd(20)}: ❌ Error`);
      }
    }
    
    // 6. Resumen del health check
    console.log('\n📊 RESUMEN DEL HEALTH CHECK:');
    console.log('=' .repeat(50));
    
    const hasErrors = missingTables.length > 0;
    const status = hasErrors ? '⚠️  ADVERTENCIAS' : '✅ SALUDABLE';
    
    console.log(`Estado general: ${status}`);
    console.log(`Conexión: ✅ Activa`);
    console.log(`Tablas: ${existingTables.length}/${expectedTables.length} encontradas`);
    console.log(`Tiempo de respuesta: ${connectionTime}ms`);
    
    if (hasErrors) {
      console.log('\n⚠️  Recomendaciones:');
      if (missingTables.length > 0) {
        console.log('   - Ejecutar el esquema de base de datos completo');
        console.log('   - Verificar que todas las tablas estén creadas');
      }
    } else {
      console.log('\n🎉 ¡La base de datos está funcionando correctamente!');
    }
    
  } catch (error) {
    console.error('❌ Health check falló:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar health check si se llama directamente
if (require.main === module) {
  healthCheck().catch(console.error);
}

module.exports = { healthCheck };
