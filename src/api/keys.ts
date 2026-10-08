import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { requireUserId, ensureWritten } from './helpers';

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
  return ensureWritten(data, '写入')[0];
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
  return ensureWritten(data, '更新')[0];
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
  ensureWritten(data, '删除');
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
  ensureWritten(data, '绑定');
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
  ensureWritten(data, '解绑');
}

export type { KeyRow, LinkRow };
