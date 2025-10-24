// Database configuration - supports both Supabase and Neon
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Build connection string based on available credentials
let connectionString: string | undefined;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Supabase connection string format
  // SUPABASE_URL is like: https://xxxxx.supabase.co
  // We need to extract the project ref and build the connection string
  const supabaseUrl = process.env.SUPABASE_URL;
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  console.log(`Using Supabase database: ${projectRef}`);
} else if (process.env.DATABASE_URL) {
  // Fall back to Neon or other PostgreSQL
  connectionString = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL for database connection');
} else {
  throw new Error(
    "Database connection not configured. Provide either SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
