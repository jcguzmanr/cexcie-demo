const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function checkProgramSelections() {
  const client = await pool.connect();
  
  try {
    // Configurar el schema
    await client.query('SET search_path TO cexcie');
    
    console.log('🔍 Consultando user_program_selections...\n');
    
    // Consultar todas las selecciones de programas
    const result = await client.query(`
      SELECT 
        id,
        lead_id,
        session_id,
        program_id,
        program_name,
        program_type,
        department_id,
        department_name,
        selection_source,
        selection_order,
        timestamp
      FROM user_program_selections 
      ORDER BY timestamp DESC
    `);
    
    console.log(`📊 Total de registros encontrados: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('❌ No hay registros en user_program_selections');
    } else {
      console.log('📋 Registros encontrados:\n');
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}`);
        console.log(`   Lead ID: ${row.lead_id}`);
        console.log(`   Session ID: ${row.session_id}`);
        console.log(`   Program ID: ${row.program_id}`);
        console.log(`   Program Name: ${row.program_name}`);
        console.log(`   Program Type: ${row.program_type}`);
        console.log(`   Department ID: ${row.department_id || '[null]'}`);
        console.log(`   Department Name: ${row.department_name || '[null]'}`);
        console.log(`   Selection Source: ${row.selection_source}`);
        console.log(`   Selection Order: ${row.selection_order}`);
        console.log(`   Timestamp: ${row.timestamp}`);
        console.log('   ---');
      });
    }
    
    // También consultar los leads para ver la relación
    console.log('\n🔍 Consultando user_leads relacionados...\n');
    
    const leadsResult = await client.query(`
      SELECT 
        id,
        lead_id,
        nombre_completo,
        email,
        source,
        created_at
      FROM user_leads 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total de leads: ${leadsResult.rows.length}\n`);
    
    leadsResult.rows.forEach((lead, index) => {
      console.log(`${index + 1}. Lead ID: ${lead.lead_id}`);
      console.log(`   Nombre: ${lead.nombre_completo}`);
      console.log(`   Email: ${lead.email}`);
      console.log(`   Source: ${lead.source}`);
      console.log(`   Created: ${lead.created_at}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error consultando la base de datos:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkProgramSelections();
