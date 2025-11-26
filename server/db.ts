import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

// Supabase pooler uses internal "Supabase Intermediate 2021 CA" certificates
// NOT public CAs like Let's Encrypt. Therefore we use rejectUnauthorized: false
// which is SCOPED to this database connection only (not global like NODE_TLS_REJECT_UNAUTHORIZED).
// The connection is still encrypted via TLS - we just skip certificate verification
// because Supabase's internal CA is not in system trust stores.
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

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