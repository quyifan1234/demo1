import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider, ThemeSwitch } from '../theme-switch';

afterEach(cleanup);

describe('三主题切换', () => {
  it('默认浅色，并在切换时同步全局主题和颜色模式', () => {
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe('light');
    fireEvent.click(screen.getByRole('radio', { name: '暗色控制台' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    fireEvent.click(screen.getByRole('radio', { name: '编辑排版' }));
    expect(document.documentElement.dataset.theme).toBe('editorial');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    fireEvent.click(screen.getByRole('radio', { name: '浅色原生' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('再次点击当前主题不会清空主题', () => {
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
    fireEvent.click(screen.getByRole('radio', { name: '浅色原生' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
