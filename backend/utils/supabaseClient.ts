import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

interface SupabaseOptions {
  global?: {
    headers?: {
      Authorization?: string;
    };
  };
}

const getSupabase = (token?: string): SupabaseClient => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    token ? {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    } : {}
  ) as SupabaseClient;
};

export default getSupabase;
