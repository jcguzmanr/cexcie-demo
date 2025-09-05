"use client";

// Componente para mostrar el estado del sistema
import { useDataProviderHealth, useDataProviderStats } from '../lib/hooks/useDataProvider';

export function SystemStatus() {
  const health = useDataProviderHealth();
  const stats = useDataProviderStats();
  
  if (!health || !stats) return null;
  
  // Type assertion para stats
  const typedStats = stats as {
    type: string;
    features: string[];
    capabilities: string[];
  };

  if (!health || !stats) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-sm z-50">
      <div className="flex items-center space-x-2 mb-2">
        <h4 className="font-semibold text-gray-800">Estado del Sistema</h4>
        <span className="text-xs text-gray-500">DB Migration</span>
      </div>
      
      <div className="space-y-2">
        {/* Estado de PostgreSQL */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${health.postgres ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">PostgreSQL</span>
          <span className={`text-xs ${health.postgres ? 'text-green-600' : 'text-red-600'}`}>
            {health.postgres ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Estado de JSON */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${health.json ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">JSON</span>
          <span className={`text-xs ${health.json ? 'text-green-600' : 'text-red-600'}`}>
            {health.json ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Tipo de Provider */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <strong>Provider:</strong> {typedStats.type}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {typedStats.features.slice(0, 2).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}
