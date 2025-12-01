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
    // Manually verify the JWT token using Supabase's secret
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      console.error('[Auth] SUPABASE_JWT_SECRET not configured');
      return res.status(500).json({ message: "Server error: Auth not configured" });
    }

    console.log('[Auth] Verifying JWT token manually...');
    const decoded: any = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });

    console.log('[Auth] Token verified successfully, user:', decoded.sub);
    
    // Attach decoded token info to request
    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
      aud: decoded.aud,
    };
    
    next();
  } catch (error: any) {
    console.error('[Auth] JWT verification failed:', error?.message || error);
    res.status(401).json({ message: `Unauthorized - ${error?.message || 'Token invalid'}` });
  }
};
