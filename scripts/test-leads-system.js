#!/usr/bin/env node

/**
 * Script de prueba para validar el sistema de leads y telemetría
 * 
 * Uso:
 *   node scripts/test-leads-system.js
 * 
 * Variables de entorno requeridas:
 *   - DATABASE_URL: URL de conexión a PostgreSQL
 *   - API_BASE_URL: URL base de la API (default: http://localhost:3000)
 */

const { Pool } = require('pg');

// Configuración
const databaseUrl = process.env.DATABASE_URL;
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL no está configurada');
  process.exit(1);
}

console.log('🧪 Iniciando pruebas del sistema de leads...');
console.log(`📊 Base de datos: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);
console.log(`🌐 API: ${apiBaseUrl}`);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Datos de prueba
const testLeadData = {
  nombre_completo: 'Juan Pérez Test',
  dni: '12345678',
  telefono: '+51 999 999 999',
  email: 'test@example.com',
  metodo_contacto: 'whatsapp',
  session_id: `test_session_${Date.now()}`,
  lead_id: `test_lead_${Date.now()}`,
  source: 'test',
  institution_type: 'university',
  telemetry_events: [
    {
      page_path: '/carreras',
      page_title: 'Carreras Disponibles',
      action_type: 'page_visit',
      entity_type: 'page',
      entity_id: 'carreras_list',
      entity_name: 'Carreras Disponibles',
      metadata: { test: true },
      timestamp: new Date().toISOString()
    },
    {
      page_path: '/comparador',
      page_title: 'Comparador de Carreras',
      action_type: 'page_visit',
      entity_type: 'page',
      entity_id: 'comparador',
      entity_name: 'Comparador de Carreras',
      metadata: { test: true },
      timestamp: new Date().toISOString()
    }
  ],
  program_selections: [
    {
      program_id: 'ing_sistemas_test',
      program_name: 'Ingeniería de Sistemas (Test)',
      program_type: 'career',
      department_id: 'facultad_ingenieria',
      department_name: 'Facultad de Ingeniería',
      selection_source: 'test',
      selection_order: 1
    }
  ]
};

async function testDatabaseConnection() {
  console.log('\n🔍 1. Probando conexión a base de datos...');
  
  try {
    const client = await pool.connect();
    
    // Verificar que las tablas existen
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_leads', 'user_navigation_tracking', 'user_program_selections')
      ORDER BY table_name
    `);
    
    const expectedTables = ['user_leads', 'user_navigation_tracking', 'user_program_selections'];
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    
    if (existingTables.length === expectedTables.length) {
      console.log('   ✅ Todas las tablas existen:', existingTables.join(', '));
    } else {
      console.log('   ❌ Faltan tablas. Existentes:', existingTables.join(', '));
      console.log('   ❌ Esperadas:', expectedTables.join(', '));
      return false;
    }
    
    // Verificar estructura de user_leads
    const leadsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_leads' 
      ORDER BY ordinal_position
    `);
    
    console.log('   ✅ Estructura de user_leads:', leadsColumns.rows.length, 'columnas');
    
    client.release();
    return true;
    
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('\n🌐 2. Probando endpoint de API...');
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLeadData),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('   ✅ API endpoint funcionando correctamente');
      console.log(`   📊 Lead ID: ${result.data.lead_id}`);
      console.log(`   📈 Eventos guardados: ${result.data.telemetry_events_saved}`);
      console.log(`   🎯 Selecciones guardadas: ${result.data.program_selections_saved}`);
      return result.data;
    } else {
      console.log('   ❌ Error en API:', result.error || result.message);
      if (result.details) {
        console.log('   📝 Detalles:', result.details);
      }
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ Error de conexión API:', error.message);
    return false;
  }
}

async function testDatabaseData(leadData) {
  console.log('\n💾 3. Verificando datos en base de datos...');
  
  try {
    const client = await pool.connect();
    
    // Verificar lead principal
    const leadCheck = await client.query(`
      SELECT id, nombre_completo, email, created_at
      FROM user_leads 
      WHERE lead_id = $1
    `, [leadData.lead_id]);
    
    if (leadCheck.rows.length > 0) {
      const lead = leadCheck.rows[0];
      console.log('   ✅ Lead principal guardado:', lead.nombre_completo);
      console.log(`   📅 Creado: ${lead.created_at}`);
    } else {
      console.log('   ❌ Lead principal no encontrado');
      return false;
    }
    
    // Verificar eventos de telemetría
    const telemetryCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM user_navigation_tracking 
      WHERE lead_id = $1
    `, [leadData.lead_id]);
    
    const telemetryCount = parseInt(telemetryCheck.rows[0].count);
    console.log(`   ✅ Eventos de telemetría guardados: ${telemetryCount}`);
    
    // Verificar selecciones de programas
    const programsCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM user_program_selections 
      WHERE lead_id = $1
    `, [leadData.lead_id]);
    
    const programsCount = parseInt(programsCheck.rows[0].count);
    console.log(`   ✅ Selecciones de programas guardadas: ${programsCount}`);
    
    // Verificar integridad referencial
    const integrityCheck = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM user_leads WHERE lead_id = $1) as leads_count,
        (SELECT COUNT(*) FROM user_navigation_tracking WHERE lead_id = $1) as telemetry_count,
        (SELECT COUNT(*) FROM user_program_selections WHERE lead_id = $1) as programs_count
    `, [leadData.lead_id]);
    
    const integrity = integrityCheck.rows[0];
    if (integrity.leads_count > 0 && integrity.telemetry_count > 0 && integrity.programs_count > 0) {
      console.log('   ✅ Integridad referencial verificada');
    } else {
      console.log('   ❌ Problema de integridad referencial');
      return false;
    }
    
    client.release();
    return true;
    
  } catch (error) {
    console.log('   ❌ Error verificando datos:', error.message);
    return false;
  }
}

async function testValidation() {
  console.log('\n✅ 4. Probando validaciones...');
  
  const invalidData = {
    nombre_completo: 'A', // Muy corto
    dni: '123', // Muy corto
    telefono: '123', // Muy corto
    email: 'invalid-email', // Email inválido
    metodo_contacto: 'invalid', // Método inválido
    session_id: '', // Vacío
    lead_id: '', // Vacío
  };
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    const result = await response.json();
    
    if (!response.ok && result.error === 'Validation error' && result.details) {
      console.log('   ✅ Validaciones funcionando correctamente');
      console.log(`   📝 Errores detectados: ${result.details.length}`);
      return true;
    } else {
      console.log('   ❌ Las validaciones no están funcionando correctamente');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ Error probando validaciones:', error.message);
    return false;
  }
}

async function cleanupTestData(leadData) {
  console.log('\n🧹 5. Limpiando datos de prueba...');
  
  try {
    const client = await pool.connect();
    
    await client.query('BEGIN');
    
    // Eliminar en orden correcto (por las foreign keys)
    await client.query('DELETE FROM user_navigation_tracking WHERE lead_id = $1', [leadData.lead_id]);
    await client.query('DELETE FROM user_program_selections WHERE lead_id = $1', [leadData.lead_id]);
    await client.query('DELETE FROM user_leads WHERE lead_id = $1', [leadData.lead_id]);
    
    await client.query('COMMIT');
    
    console.log('   ✅ Datos de prueba eliminados');
    
    client.release();
    return true;
    
  } catch (error) {
    console.log('   ❌ Error limpiando datos:', error.message);
    return false;
  }
}

async function runTests() {
  const results = {
    database: false,
    api: false,
    data: false,
    validation: false,
    cleanup: false
  };
  
  try {
    // Ejecutar todas las pruebas
    results.database = await testDatabaseConnection();
    
    if (results.database) {
      results.api = await testAPIEndpoint();
      
      if (results.api) {
        results.data = await testDatabaseData(results.api);
        results.validation = await testValidation();
        results.cleanup = await cleanupTestData(results.api);
      }
    }
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log(`   ${results.database ? '✅' : '❌'} Conexión a base de datos`);
    console.log(`   ${results.api ? '✅' : '❌'} Endpoint de API`);
    console.log(`   ${results.data ? '✅' : '❌'} Almacenamiento de datos`);
    console.log(`   ${results.validation ? '✅' : '❌'} Validaciones`);
    console.log(`   ${results.cleanup ? '✅' : '❌'} Limpieza de datos`);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
      console.log('✅ El sistema de leads está funcionando correctamente');
    } else {
      console.log('\n❌ ALGUNAS PRUEBAS FALLARON');
      console.log('🔧 Revisa los errores anteriores para solucionarlos');
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('\n💥 Error fatal durante las pruebas:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Ejecutar las pruebas
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error ejecutando pruebas:', error);
  process.exit(1);
});
