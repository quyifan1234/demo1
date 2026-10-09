import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listKeys, createKey, updateKey, deleteKey, listKeyLinks, linkKeyToApp, unlinkKeyFromApp } from '../keys';
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

describe('keys api', () => {
  const userId = 'user-123';
  const mockDate = '2024-01-01T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
  });

  describe('listKeys', () => {
    it('returns keys for the user', async () => {
      const mockData = [{ id: 'key-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listKeys(userId);

      expect(supabase.from).toHaveBeenCalledWith('api_keys');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toBe(mockData);
    });
  });

  describe('createKey', () => {
    it('creates a key and returns it', async () => {
      const payload = { platform: 'OpenAI', key_value: 'sk-test', name: 'Test Key' };
      const mockData = [{ id: 'key-1', user_id: userId, ...payload }];
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await createKey(userId, payload);

      expect(supabase.from).toHaveBeenCalledWith('api_keys');
      expect(mockQuery.insert).toHaveBeenCalledWith({ ...payload, user_id: userId });
      expect(mockQuery.select).toHaveBeenCalled();
      expect(result).toBe(mockData[0]);
    });
  });

  describe('updateKey', () => {
    it('updates a key and returns it', async () => {
      const patch = { key_value: 'sk-updated' };
      const mockData = [{ id: 'key-1', user_id: userId, ...patch }];
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await updateKey(userId, 'key-1', patch);

      expect(mockQuery.update).toHaveBeenCalledWith({ ...patch, updated_at: mockDate });
      expect(result).toBe(mockData[0]);
    });
  });

  describe('deleteKey', () => {
    it('deletes a key', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'key-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(deleteKey(userId, 'key-1')).resolves.toBeUndefined();
    });
  });

  describe('linkKeyToApp', () => {
    it('links a key to an app', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'link-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(linkKeyToApp(userId, 'app-1', 'key-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('app_key_links');
      expect(mockQuery.insert).toHaveBeenCalledWith({ user_id: userId, app_id: 'app-1', key_id: 'key-1' });
    });
  });

  describe('unlinkKeyFromApp', () => {
    it('unlinks a key from an app', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'link-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(unlinkKeyFromApp(userId, 'link-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('app_key_links');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'link-1');
    });
  });

  describe('listKeyLinks', () => {
    it('returns key links', async () => {
      const mockData = [{ id: 'link-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listKeyLinks(userId);

      expect(supabase.from).toHaveBeenCalledWith('app_key_links');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toBe(mockData);
    });
  });
});
