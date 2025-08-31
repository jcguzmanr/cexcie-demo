// Factory para crear providers según configuración
import { DataProvider, DataProviderConfig } from '../types/dal';
import { JSONDataProvider } from './json-provider';
import { PostgreSQLDataProvider } from './postgresql-provider';
import { HybridDataProvider } from './hybrid-provider';

export class DataProviderFactory {
  static createProvider(config: DataProviderConfig): DataProvider {
    switch (config.source) {
      case 'json':
        console.log('🔧 Creating JSON Data Provider');
        return new JSONDataProvider();
      
      case 'postgresql':
        if (!config.databaseUrl) {
          throw new Error('Database URL required for PostgreSQL provider');
        }
        console.log('🔧 Creating PostgreSQL Data Provider');
        return new PostgreSQLDataProvider(config.databaseUrl);
      
      case 'hybrid':
        if (!config.databaseUrl) {
          console.warn('⚠️ No database URL provided, falling back to JSON-only mode');
          return new JSONDataProvider();
        }
        console.log('🔧 Creating Hybrid Data Provider');
        return new HybridDataProvider(
          new JSONDataProvider(),
          new PostgreSQLDataProvider(config.databaseUrl)
        );
      
      default:
        throw new Error(`Unknown data source: ${config.source}`);
    }
  }

  static async validateProvider(provider: DataProvider): Promise<boolean> {
    try {
      console.log('🔍 Validating data provider...');
      
      // Intentar obtener facultades como test básico
      const facultades = await provider.getFacultades();
      const isValid = Array.isArray(facultades) && facultades.length > 0;
      
      if (isValid) {
        console.log(`✅ Provider validation successful. Found ${facultades.length} facultades`);
      } else {
        console.warn('⚠️ Provider validation: No facultades found');
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Provider validation failed:', error);
      return false;
    }
  }

  static async benchmarkProvider(provider: DataProvider, iterations: number = 5): Promise<{
    operation: string;
    avgTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }[]> {
    const operations = [
      { name: 'getFacultades', fn: () => provider.getFacultades() },
      { name: 'getCampus', fn: () => provider.getCampus() },
      { name: 'getCarreras', fn: () => provider.getCarreras() },
    ];

    const results = [];

    for (const operation of operations) {
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        try {
          await operation.fn();
          const duration = Date.now() - start;
          times.push(duration);
        } catch (error) {
          console.warn(`⚠️ Benchmark iteration ${i + 1} failed for ${operation.name}:`, error);
        }
      }

      if (times.length > 0) {
        const totalTime = times.reduce((sum, time) => sum + time, 0);
        const avgTime = totalTime / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        results.push({
          operation: operation.name,
          avgTime: Math.round(avgTime * 100) / 100,
          minTime,
          maxTime,
          totalTime
        });
      }
    }

    return results;
  }

  static getProviderInfo(provider: DataProvider): {
    type: string;
    features: string[];
    capabilities: string[];
  } {
    const providerType = provider.constructor.name;
    
    let features: string[] = [];
    let capabilities: string[] = [];

    if (providerType === 'JSONDataProvider') {
      features = ['Caching', 'File-based', 'Fast startup'];
      capabilities = ['Read-only', 'Static data', 'No persistence'];
    } else if (providerType === 'PostgreSQLDataProvider') {
      features = ['Database', 'ACID compliance', 'Concurrent access'];
      capabilities = ['Read/Write', 'Dynamic data', 'Persistent storage'];
    } else if (providerType === 'HybridDataProvider') {
      features = ['Fallback mechanism', 'Automatic recovery', 'Best of both worlds'];
      capabilities = ['Read/Write (PostgreSQL)', 'Fallback to JSON', 'High availability'];
    }

    return {
      type: providerType,
      features,
      capabilities
    };
  }
}
