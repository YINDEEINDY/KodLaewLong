import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug log
console.log('[Supabase] URL:', supabaseUrl ? 'set' : 'NOT SET');
console.log('[Supabase] Key:', supabaseAnonKey ? 'set (length: ' + supabaseAnonKey.length + ')' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length || 0);
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
