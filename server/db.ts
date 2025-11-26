// CRITICAL: Override Replit's built-in PG* variables with Supabase values BEFORE importing pg
// Replit has its own PostgreSQL (helium) that sets PGUSER=postgres, etc.
// Simply deleting these doesn't work - we must OVERRIDE them with our values
if (process.env.DATABASE_URL) {
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    process.env.PGHOST = parsedUrl.hostname;
    process.env.PGPORT = parsedUrl.port || '5432';
    process.env.PGUSER = parsedUrl.username;
    process.env.PGPASSWORD = decodeURIComponent(parsedUrl.password);
    process.env.PGDATABASE = parsedUrl.pathname.slice(1);
    console.log(`[DB] Overriding PG* variables with Supabase values - user: ${parsedUrl.username}, host: ${parsedUrl.hostname}`);
  } catch (e) {
    console.error('[DB] Failed to parse DATABASE_URL:', e);
  }
}

import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

// Parse DATABASE_URL to extract individual components
// This ensures pg library uses EXACTLY our values, not any environment overrides
const dbUrl = new URL(process.env.DATABASE_URL);
console.log('[DB] Connecting to:', dbUrl.hostname, 'as user:', dbUrl.username, 'port:', dbUrl.port);
console.log('[DB] DATABASE_URL format check:', process.env.DATABASE_URL?.substring(0, 80) + '...');

// Replit environment requires NODE_TLS_REJECT_UNAUTHORIZED=0 for Supabase connections
if (process.env.REPL_ID) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[DB] Replit environment detected - TLS certificate verification disabled for Supabase');
}

// CRITICAL: Delete Replit's PG* variables RIGHT BEFORE pool creation
// The pg library may be re-reading environment variables after our override
const replitVars = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'];
for (const key of replitVars) {
  delete process.env[key];
}
console.log('[DB] Deleted Replit PG* variables - PGUSER is now:', process.env.PGUSER);

// Use connectionString directly - the pg library will parse it internally
// This avoids any potential issues with our password parsing
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.REPL_ID ? { rejectUnauthorized: false } : true,
  max: 10,
};

console.log('[DB] Pool config - using connectionString with host:', dbUrl.hostname, 'user:', dbUrl.username);

const pool = new Pool(poolConfig);

// Add event listeners to debug connection issues
pool.on('connect', (client) => {
  console.log('[DB] Connected to database successfully');
  console.log('[DB] Client config - host:', client.host, 'port:', client.port, 'user:', client.user);
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection immediately
(async () => {
  try {
    const client = await pool.connect();
    console.log('[DB] Test query - connected to:', client.host, 'as:', client.user);
    const result = await client.query('SELECT current_user, current_database()');
    console.log('[DB] Test query result:', result.rows[0]);
    client.release();
  } catch (err: any) {
    console.error('[DB] Test connection failed:', err.message);
    console.error('[DB] Expected user:', poolConfig.user, 'Expected host:', poolConfig.host);
  }
})();

export const db = drizzle(pool, { schema });
export { pool };