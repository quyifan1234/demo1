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
    /**
     * 保存数据到 Supabase，支持乐观更新（Optimistic UI）
     * 乐观更新通过直接修改 react-query 的本地缓存来实现界面即时响应，
     * 而无需等待网络请求返回。如果请求失败，react-query 会自动处理（但在目前的简单实现中发生错误会抛出异常，通常由外层捕获并回滚或提示）
     */
    save: async <T extends { id?: string } = any>(table: string, row: Partial<T> & Record<string, unknown>, keys: string[][], opts?: { isNew?: boolean; keyCol?: string; skipUserId?: boolean; optimistic?: (old: T[]) => T[] }) => {
      const userId = await uid();
      const keyCol = opts?.keyCol ?? 'id';
      const payload = { ...row, ...(opts?.skipUserId ? {} : { user_id: userId }), updated_at: new Date().toISOString() };
      // 乐观更新：先改本地缓存，界面立即响应
      if (opts?.optimistic) {
        keys.forEach((k) => qc.setQueryData(k, (old: T[] | undefined) => (Array.isArray(old) ? opts.optimistic!(old) : old)));
      }
      const { error } = opts?.isNew || !row[keyCol as keyof typeof row]
        ? await supabase.from(table).insert(payload)
        : await supabase.from(table).update(payload).eq(keyCol, row[keyCol as keyof typeof row] as string);
      if (error) throw new Error(error.message);
      invalidate(keys);
    },
    /**
     * 从 Supabase 删除数据，并支持乐观更新
     * 在调用实际的删除 API 前，先从缓存中过滤掉目标项，使用户感觉操作已瞬间完成。
     */
    remove: async <T = any>(table: string, id: string, keys: string[][], opts?: { optimistic?: (old: T[]) => T[] }) => {
      if (opts?.optimistic) {
        keys.forEach((k) => qc.setQueryData(k, (old: T[] | undefined) => (Array.isArray(old) ? opts.optimistic!(old) : old)));
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
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
