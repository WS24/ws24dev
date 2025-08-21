import dotenv from 'dotenv';
dotenv.config(); 
import { Pool, type PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Optimized PostgreSQL connection pool configuration
 * Based on best practices for production workloads
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool size configuration
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),  // Minimum pool size
  
  // Connection lifecycle timeouts (in milliseconds)
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),        // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10), // 5 seconds
  
  // Query timeouts
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10), // 30 seconds
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000', 10), // 60 seconds
  
  // Advanced pool configuration
  allowExitOnIdle: process.env.NODE_ENV !== 'production', // Allow pool to close in dev
  maxUses: parseInt(process.env.DB_MAX_USES || '7500', 10), // Max uses per connection
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.includes('localhost') ? {
    rejectUnauthorized: false // For self-signed certificates
  } : false,
  
  // Application name for monitoring
  application_name: `ws24dev-${process.env.NODE_ENV || 'development'}`,
  
  // Keep alive settings for long-running connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // 10 seconds
};

// Create the connection pool with monitoring
export const pool = new Pool(poolConfig);

// Pool event handlers for monitoring and debugging
pool.on('connect', (client) => {
  console.log(`📊 DB: New client connected (total: ${pool.totalCount}, idle: ${pool.idleCount}, waiting: ${pool.waitingCount})`);
});

pool.on('acquire', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DB: Client acquired from pool`);
  }
});

pool.on('release', (client) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ DB: Client released to pool`);
  }
});

pool.on('remove', (client) => {
  console.log(`🗑️  DB: Client removed from pool (total: ${pool.totalCount})`);
});

pool.on('error', (err) => {
  console.error('❌ DB Pool Error:', err);
  // In production, you might want to send this to a monitoring service
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully closing database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

// Initialize Drizzle ORM with the optimized pool
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true'
});

/**
 * Get current pool statistics for monitoring
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    config: {
      max: poolConfig.max,
      min: poolConfig.min,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis,
    }
  };
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{ 
  status: 'healthy' | 'unhealthy'; 
  latency?: number; 
  error?: string;
  poolStats: ReturnType<typeof getPoolStats>;
}> {
  const start = Date.now();
  
  try {
    // Simple query to check connectivity and measure latency
    await pool.query('SELECT 1 as health_check');
    
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
      poolStats: getPoolStats()
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      poolStats: getPoolStats()
    };
  }
}
