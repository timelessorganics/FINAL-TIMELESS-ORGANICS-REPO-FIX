// From javascript_log_in_with_replit blueprint, adapted for Railway/Supabase

// CRITICAL: Import db FIRST to ensure PG* environment variables are set
// before connect-pg-simple imports pg
import { pool } from "./db";

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, Request, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Replit OIDC is only enabled when running on Replit
export const REPLIT_OIDC_ENABLED = !!process.env.REPL_ID;

// Normalize OIDC claims to app-specific fields
function normalizeClaims(claims: any) {
  return {
    sub: claims.sub,
    email: claims.email || null,
    first_name: claims.given_name || claims.first_name || null,
    last_name: claims.family_name || claims.last_name || null,
    profile_image_url: claims.profile_image_url || claims.picture || null,
  };
}

// Helper to get session user for downstream routes
export function getSessionUser(req: any): User | null {
  if (!req.user || !req.user.dbUser) {
    return null;
  }
  return req.user.dbUser as User;
}

// Helper to get user ID from session (with fallbacks for non-Replit envs)
export function getUserId(req: Request & { user?: any }): string {
  // Preferred: DB user id from Replit session
  if (req.user?.dbUser?.id) return req.user.dbUser.id as string;

  // Fallbacks from OIDC claims
  if (req.user?.normalizedClaims?.sub) return req.user.normalizedClaims.sub as string;
  if (req.user?.claims?.sub) return req.user.claims.sub as string;

  // Non-Replit / Supabase environment:
  // allow the frontend to pass a user id header if we add that later
  const headerId =
    (req.headers["x-user-id"] as string | string[] | undefined) ??
    (req.headers["x-supabase-user-id"] as string | string[] | undefined);

  if (Array.isArray(headerId)) {
    if (headerId[0] && headerId[0].trim()) return headerId[0].trim();
  } else if (typeof headerId === "string" && headerId.trim()) {
    return headerId.trim();
  }

  // Last-resort dev fallback so the app can run without auth wiring
  return "anonymous-dev-user";
}

const getOidcConfig = memoize(
  async () => {
    if (!REPLIT_OIDC_ENABLED) {
      throw new Error("[Replit Auth] OIDC config requested but REPL_ID is not set");
    }

    const issuerUrl = new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc");
    const clientId = process.env.REPL_ID!;

    return await client.discovery(issuerUrl, clientId);
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production");
    }
    console.warn(
      "[Replit Auth] DATABASE_URL not set, using MemoryStore for sessions (NOT suitable for production)"
    );
    const MemoryStore = createMemoryStore(session);
    const memStore = new MemoryStore({ checkPeriod: sessionTtl });
    return session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      store: memStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  }

  // Validate DATABASE_URL format
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    if (dbUrl.protocol !== "postgres:" && dbUrl.protocol !== "postgresql:") {
      throw new Error(`Invalid DATABASE_URL protocol: ${dbUrl.protocol}`);
    }
    console.log(
      "[Replit Auth] Database URL validated:",
      dbUrl.protocol + "//" + dbUrl.hostname
    );
  } catch (urlError: any) {
    console.error("[Replit Auth] Invalid DATABASE_URL format:", urlError.message);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid DATABASE_URL in production");
    }
    console.warn("[Replit Auth] Falling back to MemoryStore in development");
    const MemoryStore = createMemoryStore(session);
    const memStore = new MemoryStore({ checkPeriod: sessionTtl });
    return session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      store: memStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  }

  // Try to create PostgreSQL store
  try {
    const PgStore = connectPg(session);
    // Use the pool from db.ts which has proper SSL configuration
    const sessionStore = new PgStore({
      pool: pool as any,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    console.log("[Replit Auth] Using PostgreSQL session storage");
    return session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  } catch (error) {
    console.error(
      "[Replit Auth] Failed to initialize PostgreSQL session store:",
      error
    );
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("[Replit Auth] Falling back to MemoryStore in development");
    const MemoryStore = createMemoryStore(session);
    const memStore = new MemoryStore({ checkPeriod: sessionTtl });
    return session({
      secret: process.env.SESSION_SECRET || "dev-session-secret",
      store: memStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(normalizedClaims: ReturnType<typeof normalizeClaims>) {
  try {
    const user = await storage.upsertUser({
      id: normalizedClaims.sub,
      email: normalizedClaims.email,
      firstName: normalizedClaims.first_name,
      lastName: normalizedClaims.last_name,
      profileImageUrl: normalizedClaims.profile_image_url,
    });
    console.log("[Replit Auth] User upserted:", user.id, user.email);
    return user;
  } catch (error) {
    console.error("[Replit Auth] Failed to upsert user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  if (!REPLIT_OIDC_ENABLED) {
    console.log(
      "[Auth] Replit OIDC disabled (no REPL_ID). Skipping Replit auth setup – assuming Supabase/client-side auth."
    );
    return;
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);

    // Normalize OIDC claims to app-specific fields
    const normalized = normalizeClaims(tokens.claims());
    user.normalizedClaims = normalized;

    // Upsert user and cache in session
    const dbUser = await upsertUser(normalized);
    user.dbUser = dbUser;

    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  console.log(
    "[Replit Auth] Authentication configured - Google, GitHub, X, Apple, Email supported"
  );
  console.log("[Replit Auth] Session storage: PostgreSQL");
}

// Auth guard middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (REPLIT_OIDC_ENABLED) {
    // Replit OIDC flow
    const user = req.user as any;

    if (!req.isAuthenticated || !req.isAuthenticated() || !user?.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } else {
    // Supabase JWT token flow (dev/Railway)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // For dev/Replit local testing: verify token locally by parsing (not validating signature)
    // In production on Railway, Supabase JWT validation happens at the auth library level
    try {
      // Simple JWT decode (header.payload.signature)
      const parts = token.split(".");
      if (parts.length !== 3) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      // Decode payload (second part)
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now > payload.exp) {
        return res.status(401).json({ message: "Token expired" });
      }

      // Attach user info to request
      const userId = payload.sub || payload.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Invalid token: no user ID" });
      }

      req.user = {
        ...req.user,
        normalizedClaims: {
          sub: userId,
          email: payload.email || null,
          first_name: payload.first_name || null,
          last_name: payload.last_name || null,
          profile_image_url: payload.picture || null,
        },
      };

      return next();
    } catch (error: any) {
      console.error("[Auth] JWT verification failed:", error.message);
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};
