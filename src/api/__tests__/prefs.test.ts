import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPrefs, savePrefs } from '../prefs';
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

describe('prefs api', () => {
  const userId = 'user-123';
  const mockDate = '2024-01-01T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
  });

  describe('getPrefs', () => {
    it('returns prefs for the user', async () => {
      const mockData = { id: 'pref-1', user_id: userId, language: 'zh' };
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await getPrefs(userId);

      expect(supabase.from).toHaveBeenCalledWith('user_prefs');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toBe(mockData);
    });
  });

  describe('savePrefs', () => {
    it('saves prefs and returns it', async () => {
      const patch = { language: 'en' };
      const mockData = [{ id: 'pref-1', user_id: userId, ...patch }];
      const mockQuery = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await savePrefs(userId, patch as any);

      expect(supabase.from).toHaveBeenCalledWith('user_prefs');
      expect(mockQuery.upsert).toHaveBeenCalledWith(
        { user_id: userId, ...patch, updated_at: mockDate },
        { onConflict: 'user_id' }
      );
      expect(result).toBe(mockData[0]);
    });
  });
});
