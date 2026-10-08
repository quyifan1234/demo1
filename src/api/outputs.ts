import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { requireUserId } from './helpers';

type OutputRow = Database['public']['Tables']['app_outputs']['Row'];
type OutputInsert = Database['public']['Tables']['app_outputs']['Insert'];

export async function listOutputs(userId: string): Promise<OutputRow[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_outputs')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createOutput(
  userId: string,
  payload: Omit<OutputInsert, 'user_id' | 'id' | 'created_at'>,
): Promise<OutputRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_outputs')
    .insert({ ...payload, user_id: uid })
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('写入失败：请确认已登录');
  return data[0];
}

export async function deleteOutput(userId: string, id: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('app_outputs')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('删除失败：记录不存在或无权删除');
}

export type { OutputRow };
