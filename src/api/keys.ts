import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { requireUserId } from './helpers';

type KeyRow = Database['public']['Tables']['api_keys']['Row'];
type KeyInsert = Database['public']['Tables']['api_keys']['Insert'];
type KeyUpdate = Database['public']['Tables']['api_keys']['Update'];
type LinkRow = Database['public']['Tables']['app_key_links']['Row'];

export async function listKeys(userId: string): Promise<KeyRow[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createKey(
  userId: string,
  payload: Omit<KeyInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>,
): Promise<KeyRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ ...payload, user_id: uid })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('写入失败：请确认已登录');
  return data[0];
}

export async function updateKey(userId: string, id: string, patch: KeyUpdate): Promise<KeyRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('api_keys')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('更新失败：记录不存在或无权修改');
  return data[0];
}

export async function deleteKey(userId: string, id: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('删除失败：记录不存在或无权删除');
}

export async function listKeyLinks(userId: string): Promise<LinkRow[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_key_links')
    .select('*')
    .eq('user_id', uid);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function linkKeyToApp(
  userId: string,
  appId: string,
  keyId: string,
): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_key_links')
    .insert({ user_id: uid, app_id: appId, key_id: keyId })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('绑定失败：请确认已登录');
}

export async function unlinkKeyFromApp(userId: string, linkId: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_key_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('解绑失败：记录不存在或无权删除');
}

export type { KeyRow, LinkRow };
