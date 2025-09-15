const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

async function testFrontendFlow() {
  console.log('🧪 Probando flujo completo del frontend...\n');
  
  // Simular datos que enviaría el frontend
  const leadData = {
    nombre_completo: "Usuario Frontend Test",
    dni: "22222222",
    telefono: "987654321",
    email: "frontend@test.com",
    metodo_contacto: "whatsapp",
    session_id: "frontend_session_123",
    lead_id: "frontend_lead_123",
    source: "career",
    institution_type: "university",
    telemetry_events: [
      {
        page_path: "/carreras",
        page_title: "Carreras",
        action_type: "page_visit",
        entity_type: "page",
        entity_id: "carreras",
        entity_name: "Página de Carreras",
        metadata: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      }
    ],
    program_selections: [
      {
        program_id: "frontend_carrera_1",
        program_name: "Carrera Frontend 1",
        program_type: "career",
        department_id: "frontend_facultad_1",
        department_name: "Facultad Frontend 1",
        selection_source: "programs_list",
        selection_order: 1
      },
      {
        program_id: "frontend_carrera_2",
        program_name: "Carrera Frontend 2",
        program_type: "career",
        department_id: "frontend_facultad_1",
        department_name: "Facultad Frontend 1",
        selection_source: "programs_list",
        selection_order: 2
      }
    ]
  };
  
  console.log('📤 Enviando datos al API...');
  console.log('📊 Selecciones de programas:', leadData.program_selections.length);
  
  try {
    // Enviar al API
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Response:', result);
      
      // Verificar en la base de datos
      const pool = new Pool({ 
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
      });
      
      const client = await pool.connect();
      await client.query('SET search_path TO cexcie');
      
      // Verificar lead
      const leadResult = await client.query(
        'SELECT * FROM user_leads WHERE lead_id = $1',
        [leadData.lead_id]
      );
      
      console.log('\n📋 Lead guardado:', leadResult.rows.length > 0 ? '✅ Sí' : '❌ No');
      
      // Verificar selecciones
      const selectionsResult = await client.query(
        'SELECT * FROM user_program_selections WHERE lead_id = $1 ORDER BY selection_order',
        [leadData.lead_id]
      );
      
      console.log('📋 Selecciones guardadas:', selectionsResult.rows.length);
      
      if (selectionsResult.rows.length > 0) {
        console.log('\n📝 Selecciones encontradas:');
        selectionsResult.rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.program_name} (${row.program_id})`);
        });
      }
      
      client.release();
      await pool.end();
      
    } else {
      console.error('❌ Error del API:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendFlow();
