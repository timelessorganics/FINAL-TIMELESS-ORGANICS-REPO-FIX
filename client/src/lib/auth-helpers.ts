import { supabase } from "@/lib/supabase";

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
  // Redirect to home
  window.location.href = "/";
}

export function redirectToSignIn() {
  window.location.href = "/sign-in";
}
