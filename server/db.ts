import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

// Create a standard PostgreSQL pool
// We explicitly enable SSL with rejectUnauthorized: false to fix Replit connection issues
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 10, // Optimize connection count
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