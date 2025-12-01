import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// In development (Vite dev server), use relative paths - requests go to Express backend on same server
// In production (Netlify), use direct Railway URL to bypass Netlify proxy (which strips auth headers)
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? (import.meta.env.VITE_API_URL || "") : "";

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  
  // Check for admin password in localStorage
  const adminPassword = localStorage.getItem('admin_password');
  if (adminPassword) {
    headers['x-admin-password'] = adminPassword;
  }
  
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure url starts with / and handle the empty base url correctly
  const path = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = API_BASE_URL + path;
  const authHeaders = await getAuthHeaders();
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...authHeaders,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Join query key segments and ensure leading slash
    const path = queryKey.join("/");
    const fullUrl = API_BASE_URL + (path.startsWith('/') ? path : `/${path}`);
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(fullUrl, {
      headers: authHeaders,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});