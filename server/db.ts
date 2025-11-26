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
  
  // Check if it's a Supabase connection string (includes supabase.co or pooler.supabase.com)
  if (connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com')) {
    // Append sslmode=require if not already present in the connection string
    if (!connectionString.includes('sslmode=')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = connectionString + separator + 'sslmode=require';
    }
    
    // Use standard PostgreSQL driver for Supabase with SSL
    const poolConfig: any = { 
      connectionString,
      ssl: { rejectUnauthorized: false }
    };
    
    pool = new PgPool(poolConfig);
    db = drizzlePg(pool, { schema });
    console.log('Using Supabase database via DATABASE_URL (pooler mode)' + (connectionString.includes('pooler') ? ' - Pooler' : ''));
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
