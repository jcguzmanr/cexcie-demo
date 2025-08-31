#!/usr/bin/env node

/**
 * Script de migración de datos JSON a PostgreSQL
 * Uso: node scripts/migration/migrate-json-to-postgres.js
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la base de datos
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cexcie';

async function migrateData() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log('🚀 Iniciando migración de datos JSON a PostgreSQL...');
    console.log(`📊 Conectando a: ${DATABASE_URL.replace(/\/\/.*@/, '//***@')}`);
    
    // Verificar conexión
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // 1. Migrar facultades
    console.log('\n📚 Migrando facultades...');
    const facultades = JSON.parse(await fs.readFile('./public/data/facultades.json', 'utf8'));
    for (const facultad of facultades) {
      await pool.query(
        'INSERT INTO facultad (id, nombre) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [facultad.id, facultad.nombre]
      );
    }
    console.log(`✅ ${facultades.length} facultades migradas`);
    
    // 2. Migrar campus
    console.log('\n🏢 Migrando campus...');
    const campus = JSON.parse(await fs.readFile('./public/data/campus.json', 'utf8'));
    for (const camp of campus) {
      await pool.query(
        'INSERT INTO campus (id, nombre) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [camp.id, camp.nombre]
      );
    }
    console.log(`✅ ${campus.length} campus migrados`);
    
    // 3. Migrar carreras
    console.log('\n🎓 Migrando carreras...');
    const carreras = JSON.parse(await fs.readFile('./public/data/carreras.json', 'utf8'));
    for (const carrera of carreras) {
      // Insertar carrera
      await pool.query(`
        INSERT INTO carrera (id, nombre, facultad_id, imagen) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (id) DO UPDATE SET 
          nombre = EXCLUDED.nombre,
          facultad_id = EXCLUDED.facultad_id,
          imagen = EXCLUDED.imagen
      `, [carrera.id, carrera.nombre, carrera.facultadId, carrera.imagen]);
      
      // Insertar relación carrera-campus
      for (const campusId of carrera.campus) {
        await pool.query(`
          INSERT INTO carrera_campus (carrera_id, campus_id) 
          VALUES ($1, $2) 
          ON CONFLICT (carrera_id, campus_id) DO NOTHING
        `, [carrera.id, campusId]);
      }
      
      // Insertar relación carrera-modalidad
      for (const modalidadId of carrera.modalidades) {
        await pool.query(`
          INSERT INTO carrera_modalidad (carrera_id, modalidad_id) 
          VALUES ($1, $2) 
          ON CONFLICT (carrera_id, modalidad_id) DO NOTHING
        `, [carrera.id, modalidadId]);
      }
    }
    console.log(`✅ ${carreras.length} carreras migradas`);
    
    // 4. Crear ofertas
    console.log('\n🔄 Creando ofertas académicas...');
    for (const carrera of carreras) {
      for (const campusId of carrera.campus) {
        for (const modalidadId of carrera.modalidades) {
          await pool.query(`
            INSERT INTO oferta (carrera_id, campus_id, modalidad_id, estado) 
            VALUES ($1, $2, $3, 'activa') 
            ON CONFLICT (carrera_id, campus_id, modalidad_id) DO NOTHING
          `, [carrera.id, campusId, modalidadId]);
        }
      }
    }
    console.log('✅ Ofertas académicas creadas');
    
    // 5. Verificar datos migrados
    console.log('\n🔍 Verificando datos migrados...');
    const facultadesCount = await pool.query('SELECT COUNT(*) FROM facultad');
    const campusCount = await pool.query('SELECT COUNT(*) FROM campus');
    const carrerasCount = await pool.query('SELECT COUNT(*) FROM carrera');
    const ofertasCount = await pool.query('SELECT COUNT(*) FROM oferta');
    
    console.log(`📊 Resumen de migración:`);
    console.log(`   - Facultades: ${facultadesCount.rows[0].count}`);
    console.log(`   - Campus: ${campusCount.rows[0].count}`);
    console.log(`   - Carreras: ${carrerasCount.rows[0].count}`);
    console.log(`   - Ofertas: ${ofertasCount.rows[0].count}`);
    
    console.log('\n🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };
