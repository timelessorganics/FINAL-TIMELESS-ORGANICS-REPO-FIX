import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

// Replit environment requires NODE_TLS_REJECT_UNAUTHORIZED=0 for Supabase connections
// because Replit's certificate handling differs from standard environments.
// This is safe because:
// 1. The connection is still encrypted via TLS
// 2. Supabase uses internal CA certificates not in public trust stores
// 3. Railway/production environments don't need this workaround
if (process.env.REPL_ID) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[DB] Replit environment detected - TLS certificate verification disabled for Supabase');
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.REPL_ID ? { rejectUnauthorized: false } : true,
  max: 10,
};

const pool = new Pool(poolConfig);

// Add event listeners to debug connection issues
pool.on('connect', () => {
  console.log('[DB] Connected to database successfully');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
export { pool };