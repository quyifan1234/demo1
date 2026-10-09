import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocTitle } from '../use-doc-title';

describe('useDocTitle', () => {
  it('把页面名写进浏览器标题，卸载后恢复站点标题', () => {
    const { unmount } = renderHook(() => useDocTitle('应用'));
    expect(document.title).toBe('应用 · SI 装备库');
    unmount();
    expect(document.title).toBe('SI 装备库 · 个人 AI 资源工作台');
  });

  it('没有页面名时使用站点默认标题', () => {
    renderHook(() => useDocTitle());
    expect(document.title).toBe('SI 装备库 · 个人 AI 资源工作台');
  });
});
