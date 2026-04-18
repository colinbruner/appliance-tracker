import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let _idToken = null;
let _supabase = null;

/** Update the OIDC id_token used for Supabase auth. */
export function setIdToken(token) {
  _idToken = token;
}

/** Lazily create and return the shared Supabase client. */
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      accessToken: () => _idToken
    });
  }
  return _supabase;
}
