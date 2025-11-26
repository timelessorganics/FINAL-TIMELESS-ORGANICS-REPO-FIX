import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

console.log('[DB] Initializing database connection...');

// Replit environment requires NODE_TLS_REJECT_UNAUTHORIZED=0 for Supabase connections
if (process.env.REPL_ID) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[DB] Replit environment detected - TLS certificate verification disabled for Supabase');
}

// Simple, direct connection using DATABASE_URL
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.REPL_ID ? { rejectUnauthorized: false } : true,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

const pool = new Pool(poolConfig);

// Add event listeners to debug connection issues
pool.on('connect', (client) => {
  console.log('[DB] Successfully connected to database');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection immediately
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log('[DB] Connected as:', result.rows[0].current_user);
    console.log('[DB] Database:', result.rows[0].current_database);
    client.release();
  } catch (err: any) {
    console.error('[DB] Connection test failed:', err.message);
    console.error('[DB] Please verify your DATABASE_URL is correct');
  }
})();

export const db = drizzle(pool, { schema });
export { pool };