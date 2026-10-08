import { describe, it, expect } from 'vitest';
import { requireUserId, ensureWritten, maskKey } from './helpers';

describe('helpers', () => {
  describe('requireUserId', () => {
    it('returns the userId when provided', () => {
      expect(requireUserId('user-123')).toBe('user-123');
    });

    it('throws an error when userId is null', () => {
      expect(() => requireUserId(null)).toThrow('请先登录后再操作');
    });

    it('throws an error when userId is undefined', () => {
      expect(() => requireUserId(undefined)).toThrow('请先登录后再操作');
    });

    it('throws an error when userId is empty string', () => {
      expect(() => requireUserId('')).toThrow('请先登录后再操作');
    });
  });

  describe('ensureWritten', () => {
    it('returns the data array when it is not empty', () => {
      const data = [{ id: 1 }];
      expect(ensureWritten(data, '写入')).toBe(data);
    });

    it('throws an error when data is null', () => {
      expect(() => ensureWritten(null, '写入')).toThrow('写入失败：可能被权限策略拦截，请确认已登录');
    });

    it('throws an error when data is empty array', () => {
      expect(() => ensureWritten([], '更新')).toThrow('更新失败：可能被权限策略拦截，请确认已登录');
    });
  });

  describe('maskKey', () => {
    it('masks keys 8 characters or shorter completely with asterisks', () => {
      expect(maskKey('12345')).toBe('*****');
      expect(maskKey('12345678')).toBe('********');
    });

    it('keeps first 4 and last 4 characters, masking the middle for keys longer than 8 characters', () => {
      expect(maskKey('1234567890')).toBe('1234**7890');
      expect(maskKey('sk-1234567890abcdef')).toBe('sk-1***********cdef');
    });

    it('caps the mask length to 12 asterisks for very long keys', () => {
        expect(maskKey('123456789012345678901234567890')).toBe('1234************7890');
    });
  });
});
