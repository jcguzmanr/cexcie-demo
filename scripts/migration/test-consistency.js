#!/usr/bin/env node

/**
 * Script de testing de consistencia entre JSON y PostgreSQL
 * Uso: node scripts/migration/test-consistency.js
 */

const { Pool } = require('pg');
const fs = require('fs').promises;

// Configuración de la base de datos
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cexcie';

async function testConsistency() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔍 Iniciando test de consistencia entre JSON y PostgreSQL...');
    
    // Verificar conexión
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida');
    
    const results = [];
    
    // 1. Test de facultades
    console.log('\n📚 Testando facultades...');
    const jsonFacultades = JSON.parse(await fs.readFile('./public/data/facultades.json', 'utf8'));
    const pgFacultades = await pool.query('SELECT id, nombre FROM facultad ORDER BY id');
    
    const facultadesDiff = compareArrays(jsonFacultades, pgFacultades.rows, 'id');
    results.push({
      table: 'facultades',
      jsonCount: jsonFacultades.length,
      postgresCount: pgFacultades.rows.length,
      differences: facultadesDiff,
      consistent: facultadesDiff.length === 0
    });
    
    console.log(`   JSON: ${jsonFacultades.length}, PostgreSQL: ${pgFacultades.rows.length}`);
    console.log(`   Consistente: ${facultadesDiff.length === 0 ? '✅' : '❌'}`);
    
    // 2. Test de campus
    console.log('\n🏢 Testando campus...');
    const jsonCampus = JSON.parse(await fs.readFile('./public/data/campus.json', 'utf8'));
    const pgCampus = await pool.query('SELECT id, nombre FROM campus ORDER BY id');
    
    const campusDiff = compareArrays(jsonCampus, pgCampus.rows, 'id');
    results.push({
      table: 'campus',
      jsonCount: jsonCampus.length,
      postgresCount: pgCampus.rows.length,
      differences: campusDiff,
      consistent: campusDiff.length === 0
    });
    
    console.log(`   JSON: ${jsonCampus.length}, PostgreSQL: ${pgCampus.rows.length}`);
    console.log(`   Consistente: ${campusDiff.length === 0 ? '✅' : '❌'}`);
    
    // 3. Test de carreras
    console.log('\n🎓 Testando carreras...');
    const jsonCarreras = JSON.parse(await fs.readFile('./public/data/carreras.json', 'utf8'));
    const pgCarreras = await pool.query(`
      SELECT c.id, c.nombre, c.facultad_id, c.imagen
      FROM carrera c
      ORDER BY c.id
    `);
    
    const carrerasDiff = compareArrays(jsonCarreras, pgCarreras.rows, 'id');
    results.push({
      table: 'carreras',
      jsonCount: jsonCarreras.length,
      postgresCount: pgCarreras.rows.length,
      differences: carrerasDiff,
      consistent: carrerasDiff.length === 0
    });
    
    console.log(`   JSON: ${jsonCarreras.length}, PostgreSQL: ${pgCarreras.rows.length}`);
    console.log(`   Consistente: ${carrerasDiff.length === 0 ? '✅' : '❌'}`);
    
    // 4. Test de relaciones carrera-campus
    console.log('\n🔗 Testando relaciones carrera-campus...');
    const jsonCarreraCampus = [];
    for (const carrera of jsonCarreras) {
      for (const campusId of carrera.campus) {
        jsonCarreraCampus.push({ carrera_id: carrera.id, campus_id: campusId });
      }
    }
    
    const pgCarreraCampus = await pool.query('SELECT carrera_id, campus_id FROM carrera_campus ORDER BY carrera_id, campus_id');
    
    const carreraCampusDiff = compareArrays(jsonCarreraCampus, pgCarreraCampus.rows, ['carrera_id', 'campus_id']);
    results.push({
      table: 'carrera_campus',
      jsonCount: jsonCarreraCampus.length,
      postgresCount: pgCarreraCampus.rows.length,
      differences: carreraCampusDiff,
      consistent: carreraCampusDiff.length === 0
    });
    
    console.log(`   JSON: ${jsonCarreraCampus.length}, PostgreSQL: ${pgCarreraCampus.rows.length}`);
    console.log(`   Consistente: ${carreraCampusDiff.length === 0 ? '✅' : '❌'}`);
    
    // 5. Test de relaciones carrera-modalidad
    console.log('\n🎯 Testando relaciones carrera-modalidad...');
    const jsonCarreraModalidad = [];
    for (const carrera of jsonCarreras) {
      for (const modalidadId of carrera.modalidades) {
        jsonCarreraModalidad.push({ carrera_id: carrera.id, modalidad_id: modalidadId });
      }
    }
    
    const pgCarreraModalidad = await pool.query('SELECT carrera_id, modalidad_id FROM carrera_modalidad ORDER BY carrera_id, modalidad_id');
    
    const carreraModalidadDiff = compareArrays(jsonCarreraModalidad, pgCarreraModalidad.rows, ['carrera_id', 'modalidad_id']);
    results.push({
      table: 'carrera_modalidad',
      jsonCount: jsonCarreraModalidad.length,
      postgresCount: pgCarreraModalidad.rows.length,
      differences: carreraModalidadDiff,
      consistent: carreraModalidadDiff.length === 0
    });
    
    console.log(`   JSON: ${jsonCarreraModalidad.length}, PostgreSQL: ${pgCarreraModalidad.rows.length}`);
    console.log(`   Consistente: ${carreraModalidadDiff.length === 0 ? '✅' : '❌'}`);
    
    // 6. Resumen final
    console.log('\n📊 RESUMEN FINAL DE CONSISTENCIA:');
    console.log('=' .repeat(50));
    
    let totalConsistent = 0;
    let totalInconsistent = 0;
    
    for (const result of results) {
      const status = result.consistent ? '✅' : '❌';
      console.log(`${status} ${result.table.padEnd(20)} | JSON: ${result.jsonCount.toString().padStart(3)}, PG: ${result.postgresCount.toString().padStart(3)}`);
      
      if (result.consistent) {
        totalConsistent++;
      } else {
        totalInconsistent++;
        console.log(`   ⚠️  Diferencias encontradas: ${result.differences.length}`);
      }
    }
    
    console.log('=' .repeat(50));
    console.log(`Total consistente: ${totalConsistent}/${results.length}`);
    console.log(`Total inconsistente: ${totalInconsistent}/${results.length}`);
    
    if (totalInconsistent === 0) {
      console.log('\n🎉 ¡Todos los datos son consistentes! La migración fue exitosa.');
    } else {
      console.log('\n⚠️  Se encontraron inconsistencias. Revisa los detalles arriba.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error durante el test de consistencia:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

function compareArrays(arr1, arr2, key) {
  const differences = [];
  
  if (Array.isArray(key)) {
    // Clave compuesta
    const map1 = new Map(arr1.map(item => [key.map(k => item[k]).join('|'), item]));
    const map2 = new Map(arr2.map(item => [key.map(k => item[k]).join('|'), item]));
    
    // Verificar elementos en JSON pero no en PostgreSQL
    for (const [keyValue, item1] of map1) {
      if (!map2.has(keyValue)) {
        differences.push({
          type: 'missing_in_postgresql',
          key: keyValue,
          jsonData: item1
        });
      }
    }
    
    // Verificar elementos en PostgreSQL pero no en JSON
    for (const [keyValue, item2] of map2) {
      if (!map1.has(keyValue)) {
        differences.push({
          type: 'missing_in_json',
          key: keyValue,
          postgresData: item2
        });
      }
    }
  } else {
    // Clave simple
    const map1 = new Map(arr1.map(item => [item[key], item]));
    const map2 = new Map(arr2.map(item => [item[key], item]));
    
    // Verificar elementos en JSON pero no en PostgreSQL
    for (const [keyValue, item1] of map1) {
      if (!map2.has(keyValue)) {
        differences.push({
          type: 'missing_in_postgresql',
          key: keyValue,
          jsonData: item1
        });
      }
    }
    
    // Verificar elementos en PostgreSQL pero no en JSON
    for (const [keyValue, item2] of map2) {
      if (!map1.has(keyValue)) {
        differences.push({
          type: 'missing_in_json',
          key: keyValue,
          postgresData: item2
        });
      }
    }
  }
  
  return differences;
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testConsistency().catch(console.error);
}

module.exports = { testConsistency };
