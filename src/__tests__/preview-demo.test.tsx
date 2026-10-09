import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

/**
 * 本地预览（演示）模式冒烟测试
 *
 * 用真实路由树渲染每个页面，验证「免登录即可浏览全部页面」确实成立。
 * 注意：演示开关必须在导入应用模块之前打开，因为 lib/auth、lib/queries
 * 在模块首次加载时读取该开关。
 */
window.localStorage.setItem('si-preview-demo', '1');

beforeAll(() => {
  // jsdom 缺失的浏览器 API（Radix / 主题切换会用到）
  const g = globalThis as Record<string, unknown>;
  if (!g.ResizeObserver) {
    g.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  }
  const w = window as unknown as Record<string, unknown>;
  if (!w.matchMedia) {
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  }
  if (!g.PointerEvent) g.PointerEvent = MouseEvent;
  const proto = Element.prototype as unknown as Record<string, unknown>;
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
  if (!proto.hasPointerCapture) proto.hasPointerCapture = () => false;
  if (!proto.setPointerCapture) proto.setPointerCapture = () => {};
  if (!proto.releasePointerCapture) proto.releasePointerCapture = () => {};
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

async function renderRoute(path: string) {
  const { routeTree } = await import('../routeTree.gen');
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient },
  });
  render(createElement(RouterProvider, { router }));
  return router;
}

describe('演示模式页面渲染', () => {
  it('总览页展示汇总统计、示例应用与演示徽标', async () => {
    await renderRoute('/');
    expect(await screen.findByRole('heading', { name: '资料库', level: 1 })).toBeTruthy();
    expect(await screen.findByText(/已收纳 16 项资源/)).toBeTruthy();
    expect((await screen.findAllByText('ChatGPT Plus')).length).toBeGreaterThan(0);
    expect(screen.getByText('演示模式 · 示例数据')).toBeTruthy();
  });

  it('AI 应用页列出示例应用', async () => {
    await renderRoute('/apps');
    expect(await screen.findByRole('heading', { name: '应用', level: 1 })).toBeTruthy();
    expect(await screen.findByText('Claude Pro')).toBeTruthy();
    expect(await screen.findByText('Midjourney')).toBeTruthy();
  });

  it('密钥页列出示例密钥', async () => {
    await renderRoute('/keys');
    expect(await screen.findByText('OpenAI 主密钥')).toBeTruthy();
    expect(await screen.findByText('Anthropic 密钥')).toBeTruthy();
  });

  it('技能页列出示例技能', async () => {
    await renderRoute('/skills');
    expect(await screen.findByText('结构化长文提纲')).toBeTruthy();
    expect(await screen.findByText('代码评审清单')).toBeTruthy();
  });

  it('素材页列出示例素材', async () => {
    await renderRoute('/assets');
    expect(await screen.findByText('品牌主视觉提示词包')).toBeTruthy();
    expect(await screen.findByText('虚拟列表代码片段')).toBeTruthy();
  });

  it('我的页展示示例档案与数量统计', async () => {
    await renderRoute('/mine');
    expect(await screen.findByText('示例用户')).toBeTruthy();
    expect(await screen.findByText('demo@si-arsenal.local')).toBeTruthy();
  });

  it('应用详情页可打开并显示关联信息', async () => {
    await renderRoute('/apps/demo-app-chatgpt');
    expect(await screen.findByText('日常问答与长文写作，支持联网检索与文件分析。')).toBeTruthy();
    expect(await screen.findByText('OpenAI 主密钥')).toBeTruthy();
  });
});
