// Database configuration - supports both Supabase and Neon
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use Supabase if configured, otherwise fall back to DATABASE_URL
const connectionString = process.env.SUPABASE_URL 
  ? `postgresql://postgres.${process.env.SUPABASE_URL.split('//')[1].split('.')[0]}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${process.env.SUPABASE_URL.split('//')[1]}/postgres`
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection not configured. Provide either SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL",
  );
}

console.log(`Using database: ${process.env.SUPABASE_URL ? 'Supabase' : 'Neon'}`);

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
