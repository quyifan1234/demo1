import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import type { AiApp, ApiKey, AppKeyLink, AppOutput, Profile, Skill, SkillAppLink, UserPrefs, Asset } from './types';

const uid = () => supabase.auth.getUser().then(({ data }) => data.user?.id ?? '');

async function list<T>(table: string): Promise<T[]> {
  const userId = await uid();
  if (!userId) return [];
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export function useApps() { return useQuery({ queryKey: ['apps'], queryFn: () => list<AiApp>('ai_apps') }); }
export function useKeys() { return useQuery({ queryKey: ['keys'], queryFn: () => list<ApiKey>('api_keys') }); }
export function useSkills() { return useQuery({ queryKey: ['skills'], queryFn: () => list<Skill>('skills') }); }
export function useOutputs() { return useQuery({ queryKey: ['outputs'], queryFn: () => list<AppOutput>('app_outputs') }); }
export function useKeyLinks() { return useQuery({ queryKey: ['keyLinks'], queryFn: () => list<AppKeyLink>('app_key_links') }); }
export function useSkillLinks() { return useQuery({ queryKey: ['skillLinks'], queryFn: () => list<SkillAppLink>('skill_app_links') }); }
export function useAssets() { return useQuery({ queryKey: ['assets'], queryFn: () => list<Asset>('assets') }); }

export function usePrefs() {
  return useQuery({
    queryKey: ['prefs'],
    queryFn: async (): Promise<UserPrefs> => {
      const userId = await uid();
      const { data } = await supabase.from('user_prefs').select('*').eq('user_id', userId).maybeSingle();
      return (data as UserPrefs) ?? { user_id: userId, quota_threshold: 20, default_sort: 'updated' };
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const userId = await uid();
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      return data as Profile | null;
    },
  });
}

export function useMutate() {
  const qc = useQueryClient();
  const invalidate = (keys: string[][]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  return {
    invalidate,
    save: async (table: string, row: Record<string, unknown>, keys: string[][], opts?: { isNew?: boolean; keyCol?: string; skipUserId?: boolean; optimistic?: (old: any[]) => any[] }) => {
      const userId = await uid();
      const keyCol = opts?.keyCol ?? 'id';
      const payload = { ...row, ...(opts?.skipUserId ? {} : { user_id: userId }), updated_at: new Date().toISOString() };
      // 乐观更新：先改本地缓存，界面立即响应
      if (opts?.optimistic) {
        keys.forEach((k) => qc.setQueryData(k, (old: any) => (Array.isArray(old) ? opts.optimistic!(old) : old)));
      }
      const { error, data } = opts?.isNew || !row[keyCol]
        ? await supabase.from(table).insert(payload).select()
        : await supabase.from(table).update(payload).eq(keyCol, String(row[keyCol])).select();
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('操作失败，可能无权限或记录不存在');
      invalidate(keys);
    },
    remove: async (table: string, id: string, keys: string[][], opts?: { optimistic?: (old: any[]) => any[] }) => {
      if (opts?.optimistic) {
        keys.forEach((k) => qc.setQueryData(k, (old: any) => (Array.isArray(old) ? opts.optimistic!(old) : old)));
      }
      const { error, data } = await supabase.from(table).delete().eq('id', id).select();
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('操作失败，可能无权限或记录不存在');
      invalidate(keys);
    },
  };
}

export async function replaceLinks(table: 'app_key_links' | 'skill_app_links', col: 'key_id' | 'skill_id', appId: string, ids: string[]) {
  const userId = await uid();
  await supabase.from(table).delete().eq('app_id', appId);
  if (ids.length === 0) return;
  const { error } = await supabase.from(table).insert(ids.map((id) => ({ user_id: userId, app_id: appId, [col]: id })));
  if (error) throw new Error(error.message);
}
