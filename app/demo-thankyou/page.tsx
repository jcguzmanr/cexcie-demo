"use client";

import { CompleteExample } from '@/examples/ThankYouModalUsage';

export default function DemoThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Demo: Vista de Agradecimiento Mejorada
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Prueba la nueva implementación con instrumentación de eventos, UX mejorada y soporte completo para Dark Mode
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>✨ Nuevo:</strong> Soporte completo para Dark Mode en todos los componentes de la vista de agradecimiento.
              Cambia el tema usando el botón en la barra superior para ver la diferencia.
            </p>
          </div>
        </div>
      </div>
      
      <CompleteExample />
    </div>
  );
}
