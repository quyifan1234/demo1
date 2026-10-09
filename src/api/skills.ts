import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';
import { ensureWritten, requireUserId } from './helpers';

type SkillRow = Database['public']['Tables']['skills']['Row'];
type SkillInsert = Database['public']['Tables']['skills']['Insert'];
type SkillUpdate = Database['public']['Tables']['skills']['Update'];
type SkillLink = Database['public']['Tables']['skill_app_links']['Row'];

export async function listSkills(userId: string): Promise<SkillRow[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSkill(
  userId: string,
  payload: Omit<SkillInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>,
): Promise<SkillRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skills')
    .insert({ ...payload, user_id: uid })
    .select();
  if (error) throw new Error(error.message);
  const written = ensureWritten(data, '创建', '写入失败：请确认已登录');
  return written[0];
}

export async function updateSkill(userId: string, id: string, patch: SkillUpdate): Promise<SkillRow> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skills')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  const written = ensureWritten(data, '更新', '更新失败：记录不存在或无权修改');
  return written[0];
}

export async function deleteSkill(userId: string, id: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  ensureWritten(data, '删除', '删除失败：记录不存在或无权删除');
}

export async function bumpUsage(userId: string, skill: SkillRow): Promise<void> {
  const uid = requireUserId(userId);
  const { error } = await supabase
    .from('skills')
    .update({ usage_count: skill.usage_count + 1, updated_at: new Date().toISOString() })
    .eq('id', skill.id)
    .eq('user_id', uid);
  if (error) throw new Error(error.message);
}

export async function listSkillLinks(userId: string): Promise<SkillLink[]> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skill_app_links')
    .select('*')
    .eq('user_id', uid);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function linkSkillToApp(userId: string, appId: string, skillId: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skill_app_links')
    .insert({ user_id: uid, app_id: appId, skill_id: skillId })
    .select();
  if (error) throw new Error(error.message);
  ensureWritten(data, '绑定', '绑定失败：请确认已登录');
}

export async function unlinkSkillFromApp(userId: string, linkId: string): Promise<void> {
  const uid = requireUserId(userId);
  const { data, error } = await supabase
    .from('skill_app_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', uid)
    .select();
  if (error) throw new Error(error.message);
  ensureWritten(data, '解绑', '解绑失败：记录不存在或无权删除');
}

export type { SkillRow, SkillLink };
