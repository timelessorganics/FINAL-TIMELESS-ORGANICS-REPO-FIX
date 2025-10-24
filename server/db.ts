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

// Priority: Use DATABASE_URL first (works for both Supabase and Neon)
if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
  
  // Check if it's a Supabase connection string
  if (connectionString.includes('supabase.com')) {
    // Use standard PostgreSQL driver for Supabase
    pool = new PgPool({ connectionString });
    db = drizzlePg(pool, { schema });
    console.log('Using Supabase database via DATABASE_URL');
  } else {
    // Use Neon serverless driver for Neon databases
    pool = new NeonPool({ connectionString });
    db = drizzleNeon({ client: pool, schema });
    console.log('Using Neon database via DATABASE_URL');
  }
} else {
  throw new Error(
    "DATABASE_URL must be set. Please configure your database connection string.",
  );
}

export { pool, db };
