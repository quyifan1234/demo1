import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://yhqzletzhzij4sax.database.meoo.xyz';
export const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0OTYzODAyLCJleHAiOjEzMjk1NjAzODAyfQ.oIQw3VwGvHtSAXySDts-P2oKRGScqnIOqEDjDiYJqKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: { headers: { 'OneDay-App-Id': 'wgh68uu2zihu' } },
});
