const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

async function testPerformance() {
  console.log('⚡ Probando rendimiento del sistema optimizado...\n');
  
  // Crear datos de prueba con muchos eventos y selecciones
  const leadData = {
    nombre_completo: "Test Performance",
    dni: "33333333",
    telefono: "987654321",
    email: "performance@test.com",
    metodo_contacto: "whatsapp",
    session_id: "performance_session",
    lead_id: "performance_lead",
    source: "test",
    institution_type: "university",
    telemetry_events: Array.from({ length: 20 }, (_, i) => ({
      page_path: `/page_${i}`,
      page_title: `Página ${i}`,
      action_type: "page_visit",
      entity_type: "page",
      entity_id: `page_${i}`,
      entity_name: `Página ${i}`,
      metadata: { timestamp: new Date().toISOString(), page_index: i },
      timestamp: new Date().toISOString()
    })),
    program_selections: Array.from({ length: 10 }, (_, i) => ({
      program_id: `perf_carrera_${i}`,
      program_name: `Carrera Performance ${i}`,
      program_type: "career",
      department_id: `perf_facultad_${Math.floor(i / 3)}`,
      department_name: `Facultad Performance ${Math.floor(i / 3)}`,
      selection_source: "programs_list",
      selection_order: i + 1
    }))
  };
  
  console.log(`📊 Datos de prueba:`);
  console.log(`   - Eventos de telemetría: ${leadData.telemetry_events.length}`);
  console.log(`   - Selecciones de programas: ${leadData.program_selections.length}`);
  
  const startTime = Date.now();
  
  try {
    // Enviar al API
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Resultado exitoso:');
      console.log(`   - Tiempo total: ${duration}ms`);
      console.log(`   - Eventos guardados: ${result.data.telemetry_events_saved}`);
      console.log(`   - Selecciones guardadas: ${result.data.program_selections_saved}`);
      
      // Calcular métricas de rendimiento
      const eventsPerSecond = Math.round((result.data.telemetry_events_saved / duration) * 1000);
      const selectionsPerSecond = Math.round((result.data.program_selections_saved / duration) * 1000);
      
      console.log(`\n📈 Métricas de rendimiento:`);
      console.log(`   - Eventos por segundo: ${eventsPerSecond}`);
      console.log(`   - Selecciones por segundo: ${selectionsPerSecond}`);
      
      // Verificar en la base de datos
      const pool = new Pool({ 
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      });
      
      const client = await pool.connect();
      await client.query('SET search_path TO cexcie');
      
      // Verificar selecciones
      const selectionsResult = await client.query(
        'SELECT COUNT(*) as count FROM user_program_selections WHERE lead_id = $1',
        [leadData.lead_id]
      );
      
      console.log(`\n✅ Verificación en BD:`);
      console.log(`   - Selecciones en BD: ${selectionsResult.rows[0].count}`);
      
      client.release();
      await pool.end();
      
    } else {
      console.error('❌ Error del API:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPerformance();
