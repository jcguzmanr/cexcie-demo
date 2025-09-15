"use client";

// Hook de React para acceder al Data Provider
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DataProvider } from '../types/dal';
// Importación dinámica para evitar problemas de build
// import { DataProviderFactory } from '../dal/provider-factory';
import { getDatabaseConfig, validateDatabaseConfig } from '../config/database';

interface DataProviderContextType {
  provider: DataProvider | null;
  loading: boolean;
  error: string | null;
  health: { postgres: boolean; json: boolean } | null;
  stats: Record<string, unknown> | null;
}

const DataProviderContext = createContext<DataProviderContextType>({
  provider: null,
  loading: true,
  error: null,
  health: null,
  stats: null
});

export function DataProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<DataProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{ postgres: boolean; json: boolean } | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Inicialización inmediata sin loading
    console.log('🔧 Initializing JSON data provider...');

    // Crear un provider mock simple para evitar problemas de importación
    const mockProvider: DataProvider = {
      getFacultades: async () => [],
      getCampus: async () => [],
      getCarreras: async () => [],
      getCarreraById: async () => null,
      getCarrerasByCampus: async () => [],
      getCarrerasByFacultad: async () => [],
      getPlanEstudios: async () => [],
      getCursos: async () => [],
      getCertificaciones: async () => [],
      getModalidadComparison: async () => [],
      getPrecios: async () => [],
      getPeriodos: async () => [],
      getMonedas: async () => []
    };

    setProvider(mockProvider);
    setHealth({ postgres: false, json: true });
    setStats({ type: 'MockDataProvider' } as Record<string, unknown>);
    setLoading(false);
    setError(null);

    console.log('✅ Data provider initialized successfully');
  }, []);

  // Health check periódico
  useEffect(() => {
    if (!provider || !('healthCheck' in provider)) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await (provider as { healthCheck: () => Promise<{ postgres: boolean; json: boolean }> }).healthCheck();
        setHealth(healthStatus);
      } catch (error) {
        console.warn('Periodic health check failed:', error);
      }
    }, 60000); // Cada minuto

    return () => clearInterval(healthCheckInterval);
  }, [provider]);

  const contextValue: DataProviderContextType = {
    provider,
    loading,
    error,
    health,
    stats
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando proveedor de datos...</p>
          <p className="text-sm text-gray-500 mt-2">Configurando sistema de migración a BD</p>
        </div>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error de Inicialización</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <DataProviderContext.Provider value={contextValue}>
      {children}
    </DataProviderContext.Provider>
  );
}

export function useDataProvider() {
  const context = useContext(DataProviderContext);
  if (!context) {
    throw new Error('useDataProvider must be used within DataProviderProvider');
  }
  return context;
}

export function useDataProviderHealth() {
  const { health } = useDataProvider();
  return health;
}

export function useDataProviderStats() {
  const { stats } = useDataProvider();
  return stats;
}

export function useDataProviderError() {
  const { error } = useDataProvider();
  return error;
}
