import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listOutputs, createOutput, deleteOutput } from '../outputs';
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

describe('outputs api', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listOutputs', () => {
    it('returns outputs for the user', async () => {
      const mockData = [{ id: 'output-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listOutputs(userId);

      expect(supabase.from).toHaveBeenCalledWith('app_outputs');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toBe(mockData);
    });
  });

  describe('createOutput', () => {
    it('creates an output and returns it', async () => {
      const payload = { app_id: 'app-1', input_data: {}, output_data: {} };
      const mockData = [{ id: 'output-1', user_id: userId, ...payload }];
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await createOutput(userId, payload as any);

      expect(supabase.from).toHaveBeenCalledWith('app_outputs');
      expect(mockQuery.insert).toHaveBeenCalledWith({ ...payload, user_id: userId });
      expect(result).toBe(mockData[0]);
    });
  });

  describe('deleteOutput', () => {
    it('deletes an output', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'output-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(deleteOutput(userId, 'output-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('app_outputs');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'output-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });
});
