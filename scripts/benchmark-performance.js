const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

async function benchmarkPerformance() {
  console.log('🚀 Benchmark de rendimiento del sistema...\n');
  
  const testCases = [
    { name: "Test Básico", events: 5, selections: 3 },
    { name: "Test Medio", events: 15, selections: 8 },
    { name: "Test Pesado", events: 30, selections: 15 },
    { name: "Test Extremo", events: 50, selections: 25 }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`📊 Ejecutando ${testCase.name}...`);
    
    const leadData = {
      nombre_completo: `Test ${testCase.name}`,
      dni: Math.random().toString().slice(2, 10),
      telefono: "987654321",
      email: `test${Math.random().toString().slice(2, 8)}@test.com`,
      metodo_contacto: "whatsapp",
      session_id: `benchmark_session_${Date.now()}`,
      lead_id: `benchmark_lead_${Date.now()}`,
      source: "test",
      institution_type: "university",
      telemetry_events: Array.from({ length: testCase.events }, (_, i) => ({
        page_path: `/benchmark_page_${i}`,
        page_title: `Página Benchmark ${i}`,
        action_type: "page_visit",
        entity_type: "page",
        entity_id: `benchmark_page_${i}`,
        entity_name: `Página Benchmark ${i}`,
        metadata: { timestamp: new Date().toISOString(), test_case: testCase.name },
        timestamp: new Date().toISOString()
      })),
      program_selections: Array.from({ length: testCase.selections }, (_, i) => ({
        program_id: `benchmark_carrera_${i}`,
        program_name: `Carrera Benchmark ${i}`,
        program_type: "career",
        department_id: `benchmark_facultad_${Math.floor(i / 5)}`,
        department_name: `Facultad Benchmark ${Math.floor(i / 5)}`,
        selection_source: "programs_list",
        selection_order: i + 1
      }))
    };
    
    const startTime = Date.now();
    
    try {
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
        const performance = {
          testCase: testCase.name,
          events: testCase.events,
          selections: testCase.selections,
          duration: duration,
          eventsPerSecond: Math.round((result.data.telemetry_events_saved / duration) * 1000),
          selectionsPerSecond: Math.round((result.data.program_selections_saved / duration) * 1000),
          totalRecordsPerSecond: Math.round(((result.data.telemetry_events_saved + result.data.program_selections_saved) / duration) * 1000)
        };
        
        results.push(performance);
        
        console.log(`   ✅ Completado en ${duration}ms`);
        console.log(`   📈 ${performance.totalRecordsPerSecond} registros/segundo`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Resumen de rendimiento:');
  console.log('┌─────────────────┬──────────┬─────────────┬─────────────┬──────────────────────┐');
  console.log('│ Test Case       │ Duración │ Evts/seg    │ Sel/seg     │ Total registros/seg  │');
  console.log('├─────────────────┼──────────┼─────────────┼─────────────┼──────────────────────┤');
  
  results.forEach(result => {
    console.log(`│ ${result.testCase.padEnd(15)} │ ${result.duration.toString().padEnd(8)} │ ${result.eventsPerSecond.toString().padEnd(11)} │ ${result.selectionsPerSecond.toString().padEnd(11)} │ ${result.totalRecordsPerSecond.toString().padEnd(20)} │`);
  });
  
  console.log('└─────────────────┴──────────┴─────────────┴─────────────┴──────────────────────┘');
  
  // Calcular promedio
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length);
  const avgRecordsPerSecond = Math.round(results.reduce((sum, r) => sum + r.totalRecordsPerSecond, 0) / results.length);
  
  console.log(`\n📈 Promedios:`);
  console.log(`   - Duración promedio: ${avgDuration}ms`);
  console.log(`   - Registros por segundo promedio: ${avgRecordsPerSecond}`);
  
  // Recomendaciones
  console.log(`\n💡 Recomendaciones:`);
  if (avgDuration < 1000) {
    console.log(`   ✅ Excelente rendimiento (< 1s)`);
  } else if (avgDuration < 3000) {
    console.log(`   ✅ Buen rendimiento (< 3s)`);
  } else {
    console.log(`   ⚠️ Rendimiento puede mejorarse (> 3s)`);
  }
  
  if (avgRecordsPerSecond > 50) {
    console.log(`   ✅ Alta throughput (> 50 registros/s)`);
  } else if (avgRecordsPerSecond > 20) {
    console.log(`   ✅ Throughput aceptable (> 20 registros/s)`);
  } else {
    console.log(`   ⚠️ Throughput bajo (< 20 registros/s)`);
  }
}

benchmarkPerformance();
