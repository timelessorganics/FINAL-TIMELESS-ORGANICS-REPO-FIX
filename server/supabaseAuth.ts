// Supabase Auth for Railway backend
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

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

// Middleware to verify Supabase JWT token
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('[Auth] Checking authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'MISSING');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] No Bearer token found - returning 401');
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT token with Supabase
    console.log('[Auth] Verifying token with Supabase...');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.log('[Auth] Supabase validation error:', error.message);
      return res.status(401).json({ message: "Unauthorized - Token invalid" });
    }
    
    if (!user) {
      console.log('[Auth] No user returned from Supabase');
      return res.status(401).json({ message: "Unauthorized - No user" });
    }

    console.log('[Auth] User verified:', user.email);
    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('[Auth] Exception during verification:', error?.message || error);
    res.status(401).json({ message: "Unauthorized - Verification failed" });
  }
};
