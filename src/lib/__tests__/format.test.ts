import { describe, it, expect } from 'vitest';
import { maskKey, isQuotaAlert, quotaPct, fmtDate, timeAgo } from '../format';

describe('format.ts', () => {
  describe('maskKey', () => {
    it('handles empty strings', () => {
      expect(maskKey('')).toBe('');
    });

    it('masks keys with 8 or less characters', () => {
      expect(maskKey('12345678')).toBe('••••••••');
      expect(maskKey('1234')).toBe('••••••••');
    });

    it('masks middle part of longer keys', () => {
      expect(maskKey('1234567890')).toBe('1234••••••7890');
      expect(maskKey('sk-1234567890abcdef')).toBe('sk-1••••••cdef');
    });
  });

  describe('isQuotaAlert', () => {
    it('returns false when total or remaining is invalid', () => {
      expect(isQuotaAlert(null, 100, 20)).toBe(false);
      expect(isQuotaAlert(50, null, 20)).toBe(false);
      expect(isQuotaAlert(50, 0, 20)).toBe(false);
      expect(isQuotaAlert(50, -10, 20)).toBe(false);
    });

    it('correctly identifies alert conditions', () => {
      expect(isQuotaAlert(10, 100, 20)).toBe(true); // 10 <= 20
      expect(isQuotaAlert(20, 100, 20)).toBe(true); // 20 <= 20
      expect(isQuotaAlert(21, 100, 20)).toBe(false); // 21 > 20
    });
  });

  describe('quotaPct', () => {
    it('returns 0 when total is invalid', () => {
      expect(quotaPct(50, null)).toBe(0);
      expect(quotaPct(50, 0)).toBe(0);
      expect(quotaPct(50, -10)).toBe(0);
    });

    it('calculates correct percentages clamped between 0 and 1', () => {
      expect(quotaPct(50, 100)).toBe(0.5);
      expect(quotaPct(0, 100)).toBe(0);
      expect(quotaPct(100, 100)).toBe(1);
      expect(quotaPct(150, 100)).toBe(1); // clamped
      expect(quotaPct(-10, 100)).toBe(0); // clamped
      expect(quotaPct(null, 100)).toBe(0);
    });
  });
});

  describe('fmtDate', () => {
    it('returns empty string for falsy values', () => {
      expect(fmtDate(null)).toBe('');
      expect(fmtDate('')).toBe('');
    });

    it('formats valid ISO string correctly', () => {
      const date = new Date('2023-10-15T14:30:00Z');
      const expectedDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      expect(fmtDate('2023-10-15T14:30:00Z')).toBe(expectedDateStr);
    });
  });

  describe('timeAgo', () => {
    it('handles "just now" for times less than 1 minute ago', () => {
      const now = new Date();
      now.setSeconds(now.getSeconds() - 30);
      expect(timeAgo(now.toISOString())).toBe('刚刚');
    });

    it('handles minutes ago', () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 15);
      expect(timeAgo(now.toISOString())).toBe('15分钟前');
    });

    it('handles hours ago', () => {
      const now = new Date();
      now.setHours(now.getHours() - 5);
      expect(timeAgo(now.toISOString())).toBe('5小时前');
    });

    it('handles days ago', () => {
      const now = new Date();
      now.setDate(now.getDate() - 5);
      expect(timeAgo(now.toISOString())).toBe('5天前');
    });

    it('falls back to fmtDate string for times >= 30 days ago', () => {
      const now = new Date();
      now.setDate(now.getDate() - 35);
      const expected = fmtDate(now.toISOString()).slice(0, 10);
      expect(timeAgo(now.toISOString())).toBe(expected);
    });
  });
