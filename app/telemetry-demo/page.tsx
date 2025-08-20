'use client';

import { useEffect } from 'react';
import { Telemetry } from '@/lib/telemetry';
import { TelemetryLogger } from '@/components/TelemetryLogger';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function TelemetryDemoPage() {
  useEffect(() => {
    // Track page visit
    Telemetry.events.push({
      type: 'custom',
      semantic: {
        label: 'Page visited: Telemetry Demo',
        entityType: 'page',
        entityId: 'telemetry_demo',
        action: 'visited',
        context: 'demo_page',
      },
      details: {
        custom: {
          action: 'page_visit',
          page: 'telemetry_demo'
        }
      }
    });
  }, []);

  const handleCustomEvent = () => {
    Telemetry.events.push({
      type: 'custom',
      semantic: {
        label: 'Custom Event Button Clicked',
        entityType: 'button',
        entityId: 'custom_event_button',
        action: 'clicked',
        context: 'demo_section',
      },
      details: {
        custom: {
          action: 'button_click',
          button: 'custom_event_button',
          timestamp: Date.now()
        }
      }
    });
  };

  const handleRouteChange = () => {
    Telemetry.trackRouteChange('/telemetry-demo', '/some-other-page');
  };

  const handleDownloadAll = () => {
    Telemetry.events.download();
    Telemetry.leads.download();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      Telemetry.events.clear();
      Telemetry.leads.clear();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Telemetry & Lead Capture Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Esta página demuestra el sistema de telemetría y captura de leads. 
            Interactúa con los elementos para ver los eventos en tiempo real.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Telemetry.events.count()}
            </div>
            <div className="text-gray-600">Interacciones capturadas</div>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Telemetry.leads.count()}
            </div>
            <div className="text-gray-600">Prospectos capturados</div>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Telemetry.events.getSessionId().slice(0, 8)}...
            </div>
            <div className="text-gray-600">ID de sesión</div>
          </Card>
        </div>

        {/* Interactive Demo Section */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎯 Sección Interactiva
            </h2>
            <p className="text-gray-600 mb-6">
              Haz clic en los botones de abajo para generar eventos de telemetría personalizados.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleCustomEvent}
                className="w-full"
              >
                🎯 Generar Evento Personalizado
              </Button>
              
              <Button
                onClick={handleRouteChange}
                variant="ghost"
                className="w-full"
              >
                🔄 Simular Cambio de Ruta
              </Button>
              
              <Button
                onClick={handleDownloadAll}
                variant="ghost"
                className="w-full"
              >
                📥 Descargar Interacciones
              </Button>
              
              <Button
                onClick={handleClearAll}
                variant="ghost"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                🗑️ Limpiar Interacciones
              </Button>
            </div>
          </div>
        </Card>

        {/* Lead Capture Form */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📝 Formulario de Captura de Leads
            </h2>
            <p className="text-gray-600 mb-6">
              Completa el formulario para probar la captura de leads. Los datos se almacenan 
              localmente y se pueden exportar como JSON.
            </p>
            
            <LeadCaptureForm />
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📚 Instrucciones de Uso
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900">🎯 Telemetría Automática:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Los clics en elementos significativos se capturan automáticamente</li>
                  <li>Los cambios en formularios se registran (sin valores)</li>
                  <li>Las teclas seguras (Enter, Escape, etc.) se capturan</li>
                  <li>Los envíos de formularios se registran</li>
                  <li>Los clics en elementos genéricos se filtran para mejor calidad de datos</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">📊 Logger Terminal:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Ubicado en la esquina inferior derecha</li>
                  <li>Muestra eventos en tiempo real</li>
                  <li>Se puede pausar, expandir y colapsar</li>
                  <li>Permite descargar y limpiar datos</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">👥 Captura de Leads:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Datos personales solo cuando se envía el formulario</li>
                  <li>Validación automática de campos</li>
                  <li>Consentimiento obligatorio</li>
                  <li>Almacenamiento separado de la telemetría</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">🔒 Privacidad:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nunca se capturan valores de texto ingresados</li>
                  <li>Solo se registran metadatos (IDs, clases, roles)</li>
                  <li>Atributos data-* permitidos: data-track, data-test, data-analytics</li>
                  <li>Telemetría y leads están completamente separados</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Clean JSON Output Example */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ✨ Clean JSON Output
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Example Event (Business Analytics Ready):</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "ts": "2024-01-15T10:30:45.123Z",
  "type": "click",
  "sessionId": "session_abc123",
  "page": {
    "url": "https://cexcie.edu.pe/comparador",
    "path": "/comparador",
    "title": "Comparador de Carreras"
  },
  "semantic": {
    "label": "Ciencias de la Comunicación Career Card",
    "entityType": "career",
    "entityId": "ciencias_comunicacion",
    "context": "career_comparison",
    "action": "clicked"
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Benefits:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700">
                  <li><strong>Clean Data:</strong> No CSS classes or HTML technical details</li>
                  <li><strong>Business Focus:</strong> Only captures what matters for analytics</li>
                  <li><strong>Human Readable:</strong> Clear labels like "Ciencias de la Comunicación Career Card"</li>
                  <li><strong>Structured:</strong> Consistent entityType, entityId, context for easy analysis</li>
                  <li><strong>Actionable:</strong> Perfect for generating usage reports and insights</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* API Examples */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💻 Ejemplos de API
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Eventos Personalizados:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`Telemetry.events.push({
  type: 'custom',
  details: {
    custom: {
      action: 'user_action',
      step: 'completed_onboarding',
      metadata: { userId: '123' }
    }
  }
});`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Captura de Lead:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const result = Telemetry.leads.push({
  fullName: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+51 999 888 777',
  medium: 'web',
  interests: ['Ingeniería'],
  consent: true
});`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descarga de Datos:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Descargar eventos
Telemetry.events.download();

// Descargar leads
Telemetry.leads.download();

// Obtener conteos
const eventCount = Telemetry.events.count();
const leadCount = Telemetry.leads.count();`}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Telemetry Logger Overlay */}
      <TelemetryLogger />
    </div>
  );
}
