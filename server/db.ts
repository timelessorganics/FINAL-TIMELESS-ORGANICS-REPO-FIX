import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// 1. PURGE REPLIT'S CONFLICTING VARIABLES
// This is the "Magic Fix". We delete Replit's default DB variables 
// so the driver is forced to use ONLY your Supabase DATABASE_URL.
if (process.env.REPL_ID) {
  delete process.env.PGUSER;
  delete process.env.PGHOST;
  delete process.env.PGPASSWORD;
  delete process.env.PGDATABASE;
  delete process.env.PGPORT;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

// 2. Create the Connection Pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // Required for Replit -> Supabase handshake
  },
  max: 10,
});

// 3. Add Logging to Confirm Success
pool.on('connect', () => {
  console.log('[DB] Connected to Supabase successfully');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
export { pool };