// API 层公共校验：RLS 静默失败防御 + user_id 归属校验

export function requireUserId(userId: string | null | undefined): string {
  if (!userId) throw new Error('请先登录后再操作');
  return userId;
}

/** Supabase select 可能因 RLS 返回空数组而不报错，统一在此判断 */
export function ensureWritten<T>(data: T[] | null, action: string, customErrorMsg?: string): T[] {
  if (!data || data.length === 0) {
    throw new Error(customErrorMsg || `${action}失败：可能被权限策略拦截，请确认已登录`);
  }
  return data;
}

/** 密钥打码：前4后4 */
export function maskKey(value: string): string {
  if (value.length <= 8) return '*'.repeat(Math.max(value.length, 4));
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 8, 12))}${value.slice(-4)}`;
}
