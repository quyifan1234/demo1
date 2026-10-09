import { createClient } from '@supabase/supabase-js';

const remoteSupabaseUrl = 'https://yhqzletzhzij4sax.database.meoo.xyz';
// 预览浏览器不能直接跨域访问云端认证，开发时改走 Vite 同源代理。
export const supabaseUrl = import.meta.env.DEV && typeof window !== 'undefined'
  ? `${window.location.origin}/sb-api`
  : remoteSupabaseUrl;
export const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg0OTYzODAyLCJleHAiOjEzMjk1NjAzODAyfQ.oIQw3VwGvHtSAXySDts-P2oKRGScqnIOqEDjDiYJqKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: { headers: { 'OneDay-App-Id': 'wgh68uu2zihu' } },
});
