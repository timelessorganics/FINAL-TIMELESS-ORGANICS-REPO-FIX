// Database configuration - supports both Supabase and Neon
import { Pool as PgPool } from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Build connection string and database instance based on available credentials
let connectionString: string | undefined;
let pool: PgPool | NeonPool;
let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleNeon>;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Supabase connection using standard PostgreSQL driver
  // SUPABASE_URL is like: https://xxxxx.supabase.co
  const supabaseUrl = process.env.SUPABASE_URL;
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const password = encodeURIComponent(process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Use Supabase connection pooler (better compatibility with cloud environments)
  connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  
  pool = new PgPool({ 
    connectionString,
    max: 1, // Pooler works best with single connection from serverless
  });
  db = drizzlePg(pool, { schema });
  
  console.log(`Using Supabase database (pooler): ${projectRef}`);
} else if (process.env.DATABASE_URL) {
  // Fall back to Neon using serverless driver
  connectionString = process.env.DATABASE_URL;
  
  pool = new NeonPool({ connectionString });
  db = drizzleNeon({ client: pool, schema });
  
  console.log('Using DATABASE_URL for database connection');
} else {
  throw new Error(
    "Database connection not configured. Provide either SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL",
  );
}

export { pool, db };
