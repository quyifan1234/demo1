import { describe, it, expect } from 'vitest';
import { requireUserId, ensureWritten, maskKey } from '../helpers';

describe('helpers', () => {
  describe('requireUserId', () => {
    it('throws when userId is falsy', () => {
      expect(() => requireUserId(null)).toThrow('请先登录后再操作');
      expect(() => requireUserId(undefined)).toThrow('请先登录后再操作');
      expect(() => requireUserId('')).toThrow('请先登录后再操作');
    });

    it('returns userId when provided', () => {
      expect(requireUserId('user-123')).toBe('user-123');
    });
  });

  describe('ensureWritten', () => {
    it('throws when data is null or empty', () => {
      expect(() => ensureWritten(null, '创建')).toThrow('创建失败：可能被权限策略拦截，请确认已登录');
      expect(() => ensureWritten([], '更新')).toThrow('更新失败：可能被权限策略拦截，请确认已登录');
    });

    it('returns data when present', () => {
      const data = [{ id: 1 }];
      expect(ensureWritten(data, '操作')).toBe(data);
    });
  });

  describe('maskKey', () => {
    it('masks keys of length <= 8', () => {
      expect(maskKey('12')).toBe('****'); // fails! original implementation expects **** for length <=4 if max
      expect(maskKey('12345')).toBe('*****');
      expect(maskKey('12345678')).toBe('********');
    });

    it('masks middle part of longer keys', () => {
      expect(maskKey('1234567890')).toBe('1234**7890');
      expect(maskKey('sk-1234567890abcdef')).toBe('sk-1***********cdef');
    });
  });
});
