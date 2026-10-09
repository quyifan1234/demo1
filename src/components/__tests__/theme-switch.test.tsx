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

describe('主题跨刷新保留', () => {
  it('已保存的主题在下次打开时直接生效（含 index.html 预置的 data-theme）', () => {
    localStorage.setItem('si-arsenal-theme', 'editorial');
    // 模拟 index.html 预置脚本：首屏前就把主题写到 <html>，React 接管后不应跳回浅色
    document.documentElement.dataset.theme = 'editorial';
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe('editorial');
    cleanup();
    document.documentElement.dataset.theme = 'light';
    localStorage.clear();
  });

  it('切换主题会写入 localStorage', () => {
    localStorage.clear();
    document.documentElement.dataset.theme = 'light';
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
    fireEvent.click(screen.getByRole('radio', { name: '暗色控制台' }));
    expect(localStorage.getItem('si-arsenal-theme')).toBe('dark');
    cleanup();
    document.documentElement.dataset.theme = 'light';
    localStorage.clear();
  });

  it('存储值非法时回落到浅色，不抛错', () => {
    localStorage.setItem('si-arsenal-theme', 'nonsense');
    delete document.documentElement.dataset.theme;
    render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe('light');
    cleanup();
    document.documentElement.dataset.theme = 'light';
    localStorage.clear();
  });
});
