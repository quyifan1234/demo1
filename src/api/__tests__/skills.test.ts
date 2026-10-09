import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSkills, createSkill, updateSkill, deleteSkill, bumpUsage, listSkillLinks, linkSkillToApp, unlinkSkillFromApp } from '../skills';
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

describe('skills api', () => {
  const userId = 'user-123';
  const mockDate = '2024-01-01T00:00:00.000Z';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));
  });

  describe('listSkills', () => {
    it('returns skills for the user', async () => {
      const mockData = [{ id: 'skill-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listSkills(userId);

      expect(supabase.from).toHaveBeenCalledWith('skills');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockQuery.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toBe(mockData);
    });
  });

  describe('createSkill', () => {
    it('creates a skill and returns it', async () => {
      const payload = { name: 'Test Skill', prompt_template: 'test' };
      const mockData = [{ id: 'skill-1', user_id: userId, ...payload }];
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await createSkill(userId, payload);

      expect(supabase.from).toHaveBeenCalledWith('skills');
      expect(mockQuery.insert).toHaveBeenCalledWith({ ...payload, user_id: userId });
      expect(result).toBe(mockData[0]);
    });
  });

  describe('updateSkill', () => {
    it('updates a skill and returns it', async () => {
      const patch = { name: 'Updated Skill' };
      const mockData = [{ id: 'skill-1', user_id: userId, ...patch }];
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await updateSkill(userId, 'skill-1', patch);

      expect(mockQuery.update).toHaveBeenCalledWith({ ...patch, updated_at: mockDate });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'skill-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toBe(mockData[0]);
    });
  });

  describe('deleteSkill', () => {
    it('deletes a skill', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'skill-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(deleteSkill(userId, 'skill-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('skills');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'skill-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });

  describe('bumpUsage', () => {
    it('bumps usage count', async () => {
      const skill = { id: 'skill-1', usage_count: 5 } as any;
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // For the chained eq calls
      mockQuery.eq.mockReturnValueOnce(mockQuery).mockResolvedValueOnce({ error: null });

      (supabase.from as any).mockReturnValue(mockQuery);

      await bumpUsage(userId, skill);

      expect(supabase.from).toHaveBeenCalledWith('skills');
      expect(mockQuery.update).toHaveBeenCalledWith({ usage_count: 6, updated_at: mockDate });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'skill-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
    });
  });

  describe('listSkillLinks', () => {
    it('returns skill links', async () => {
      const mockData = [{ id: 'link-1', user_id: userId }];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await listSkillLinks(userId);

      expect(supabase.from).toHaveBeenCalledWith('skill_app_links');
      expect(result).toBe(mockData);
    });
  });

  describe('linkSkillToApp', () => {
    it('links a skill to an app', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'link-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(linkSkillToApp(userId, 'app-1', 'skill-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('skill_app_links');
      expect(mockQuery.insert).toHaveBeenCalledWith({ user_id: userId, app_id: 'app-1', skill_id: 'skill-1' });
    });
  });

  describe('unlinkSkillFromApp', () => {
    it('unlinks a skill from an app', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [{ id: 'link-1' }], error: null }),
      };
      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(unlinkSkillFromApp(userId, 'link-1')).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('skill_app_links');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'link-1');
    });
  });
});
