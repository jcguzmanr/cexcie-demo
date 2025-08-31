// Configuración de base de datos
export interface DatabaseConfig {
  provider: 'json' | 'postgresql' | 'hybrid';
  postgresql?: {
    url: string;
    ssl: boolean;
    maxConnections: number;
    connectionTimeout: number;
    idleTimeout: number;
  };
  json?: {
    cacheEnabled: boolean;
    cacheTTL: number;
    enableLogging: boolean;
  };
  features: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableHealthCheck: boolean;
    enableCache: boolean;
  };
}

export function getDatabaseConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'development') {
    return {
      provider: (process.env.DATABASE_PROVIDER as any) || 'json',
      postgresql: process.env.DATABASE_URL ? {
        url: process.env.DATABASE_URL,
        ssl: false,
        maxConnections: 10,
        connectionTimeout: 5000,
        idleTimeout: 30000
      } : undefined,
      json: {
        cacheEnabled: true,
        cacheTTL: 5 * 60 * 1000,
        enableLogging: true
      },
      features: {
        enableMetrics: true,
        enableLogging: true,
        enableHealthCheck: true,
        enableCache: true
      }
    };
  }

  // Producción: siempre PostgreSQL
  return {
    provider: 'postgresql',
    postgresql: {
      url: process.env.DATABASE_URL!,
      ssl: true,
      maxConnections: 50,
      connectionTimeout: 10000,
      idleTimeout: 60000
    },
    features: {
      enableMetrics: true,
      enableLogging: false,
      enableHealthCheck: true,
      enableCache: true
    }
  };
}

export function getEnvironmentInfo(): { env: string; provider: string; hasDatabase: boolean } {
  const config = getDatabaseConfig();
  return {
    env: process.env.NODE_ENV || 'development',
    provider: config.provider,
    hasDatabase: !!config.postgresql?.url
  };
}

export function validateDatabaseConfig(): { valid: boolean; errors: string[] } {
  const config = getDatabaseConfig();
  const errors: string[] = [];

  if (config.provider === 'postgresql' || config.provider === 'hybrid') {
    if (!config.postgresql?.url) {
      errors.push('DATABASE_URL is required for PostgreSQL or hybrid providers');
    }
    
    if (config.postgresql?.url && !config.postgresql.url.startsWith('postgresql://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }
  }

  if (config.provider === 'hybrid' && !config.postgresql?.url) {
    errors.push('Hybrid provider requires DATABASE_URL');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getDatabaseConnectionString(): string | null {
  const config = getDatabaseConfig();
  return config.postgresql?.url || null;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  if (isDevelopment()) {
    return 'debug';
  }
  
  const logLevel = process.env.LOG_LEVEL as any;
  if (['debug', 'info', 'warn', 'error'].includes(logLevel)) {
    return logLevel;
  }
  
  return 'info';
}
