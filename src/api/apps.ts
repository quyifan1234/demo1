import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { ensureWritten, requireUserId } from './helpers';

type AppRow = Database['public']['Tables']['ai_apps']['Row'];
type AppInsert = Database['public']['Tables']['ai_apps']['Insert'];
type AppUpdate = Database['public']['Tables']['ai_apps']['Update'];

export async function listApps(userId: string): Promise<AppRow[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('ai_apps')
    .select('*')
    .eq('user_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createApp(
  userId: string,
  payload: Omit<AppInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>,
): Promise<AppRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('ai_apps')
    .insert({ ...payload, user_id: uid })
    .select();
  if (error) throw new Error(error.message);
  const written = ensureWritten(data, '创建', '写入失败：请确认已登录且数据归属当前用户');
  return written[0];
}

export async function updateApp(
  userId: string,
  id: string,
  patch: AppUpdate,
): Promise<AppRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('ai_apps')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  const written = ensureWritten(data, '更新', '更新失败：记录不存在或无权修改');
  return written[0];
}

export async function deleteApp(userId: string, id: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('ai_apps')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  ensureWritten(data, '删除', '删除失败：记录不存在或无权删除');
}

export type { AppRow };
