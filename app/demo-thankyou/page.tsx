"use client";

import { CompleteExample } from '@/examples/ThankYouModalUsage';

export default function DemoThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-100">
            Demo: Vista de Agradecimiento - Dark Mode
          </h1>
          <p className="mt-2 text-gray-400">
            Prueba la implementación con instrumentación de eventos, UX mejorada y tema oscuro institucional de CExCIE
          </p>
          <div className="mt-4 p-4 bg-blue-950/30 border border-blue-800/50 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>✨ Tema:</strong> Aplicación configurada exclusivamente en Dark Mode con los colores institucionales de CExCIE.
            </p>
          </div>
        </div>
      </div>
      
      <CompleteExample />
    </div>
  );
}
