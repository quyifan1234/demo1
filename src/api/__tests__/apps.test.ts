import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listApps, createApp, updateApp, deleteApp } from '../apps';
import { supabase } from '@/supabase/client';
import { requireUserId } from '../helpers';

vi.mock('@/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../helpers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../helpers')>();
  return {
    ...mod,
    requireUserId: vi.fn((userId) => {
      if (!userId) throw new Error('请先登录后再操作');
      return userId;
    }),
  };
});

describe('apps api', () => {
  const userId = 'user-123';
  const mockDate = '2024-01-01T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
  });

  describe('listApps', () => {
    it('returns apps for the user', async () => {
      const mockData = [{ id: 'app-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listApps(userId);

      expect(supabase.from).toHaveBeenCalledWith('ai_apps');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toBe(mockData);
    });

    it('throws if error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(listApps(userId)).rejects.toThrow('db error');
    });
  });

  describe('createApp', () => {
    it('creates an app and returns it', async () => {
      const payload = { name: 'Test App', description: 'Test', settings: {} };
      const mockData = [{ id: 'app-1', user_id: userId, ...payload }];
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await createApp(userId, payload);

      expect(supabase.from).toHaveBeenCalledWith('ai_apps');
      expect(mockQuery.insert).toHaveBeenCalledWith({ ...payload, user_id: userId });
      expect(mockQuery.select).toHaveBeenCalled();
      expect(result).toBe(mockData[0]);
    });

    it('throws if no data returned (RLS)', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(createApp(userId, { name: 'test' })).rejects.toThrow('写入失败：请确认已登录且数据归属当前用户');
    });
  });

  describe('updateApp', () => {
    it('updates an app and returns it', async () => {
      const patch = { name: 'Updated App' };
      const mockData = [{ id: 'app-1', user_id: userId, ...patch }];
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await updateApp(userId, 'app-1', patch);

      expect(supabase.from).toHaveBeenCalledWith('ai_apps');
      expect(mockQuery.update).toHaveBeenCalledWith({ ...patch, updated_at: mockDate });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'app-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toBe(mockData[0]);
    });
  });

  describe('deleteApp', () => {
    it('deletes an app', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'app-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(deleteApp(userId, 'app-1')).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith('ai_apps');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'app-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });
});
