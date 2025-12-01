// Supabase Auth for Railway backend
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import jwt from 'jsonwebtoken';

// Create Supabase admin client for server-side operations
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  console.log('[Supabase Auth] Authentication configured');
}

// Simple admin password for admin panel access (no secrets needed)
const ADMIN_PASSWORD = 'timeless100';

// Middleware to verify admin password
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check for password in header
  const passwordHeader = req.headers['x-admin-password'] as string;
  
  if (!passwordHeader) {
    console.log('[Auth] No admin password provided');
    return res.status(401).json({ message: "Admin password required" });
  }

  if (passwordHeader !== ADMIN_PASSWORD) {
    console.log('[Auth] Invalid admin password attempt');
    return res.status(401).json({ message: "Invalid admin password" });
  }

  console.log('[Auth] Admin access granted');
  (req as any).user = { id: 'admin', email: 'admin@timelessorganics.com' };
  next();
};
