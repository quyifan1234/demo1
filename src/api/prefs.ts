import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { requireUserId, ensureWritten } from './helpers';

type PrefRow = Database['public']['Tables']['user_prefs']['Row'];

export async function getPrefs(userId: string): Promise<PrefRow | null> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('user_prefs')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** upsert：user_prefs 主键即 user_id */
export async function savePrefs(
  userId: string,
  patch: Partial<Omit<PrefRow, 'user_id' | 'created_at'>>,
): Promise<PrefRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('user_prefs')
    .upsert(
      { user_id: uid, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    .select();
  if (error) throw new Error(error.message);
  return ensureWritten(data, '保存')[0];
}

export type { PrefRow };
