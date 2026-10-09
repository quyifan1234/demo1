import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LibraryOverview } from '../library-overview';
import type { AiApp, ApiKey } from '../../lib/types';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children, ...props }: { to: string; params?: Record<string, string>; children: ReactNode }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)} {...props}>{children}</a>
  ),
}));
afterEach(cleanup);

const app = (overrides: Partial<AiApp>): AiApp => ({
  id: 'dialog', user_id: 'test-user', name: '对话助手', url: null, category: '对话',
  description: '长文分析', specialties: ['推理'], quota_total: 100, quota_remaining: 80,
  quota_unit: '次', quota_updated_at: null, status: '在用', is_favorite: false, rating: 0,
  icon_url: null, note: null, created_at: '2026-10-01T12:00:00Z', updated_at: '2026-10-09T12:00:00Z', ...overrides,
});
const apps = [app({}), app({ id: 'image', name: '绘画工具', category: '绘画', description: '概念设计', quota_remaining: 5 }),
  app({ id: 'old', name: '旧工具', status: '已弃用', quota_remaining: 0 })];
const secret = { id: 'key', name: '个人密钥', key_value: 'secret-must-not-render', updated_at: '2026-10-09T14:00:00Z' } as ApiKey;
function mount(items = apps) {
  return render(<LibraryOverview apps={items} assets={[]} skills={[]} keys={[secret]} threshold={20} loading={false} />);
}

describe('资料库总览', () => {
  it('按真实传入数据汇总，不把已弃用应用计入告警，也不泄露密钥', () => {
    mount();
    expect(screen.getByText('已收纳 4 项资源。')).toBeTruthy();
    expect(screen.getByText('1 个应用额度偏低')).toBeTruthy();
    expect(screen.queryByText(secret.key_value)).toBeNull();
    expect(within(screen.getByRole('region', { name: '应用台账' })).queryByText('旧工具')).toBeNull();
  });

  it('支持分类、跨字段多词搜索以及清除筛选', () => {
    mount();
    const registry = screen.getByRole('region', { name: '应用台账' });
    fireEvent.click(screen.getByRole('radio', { name: /绘画/ }));
    expect(within(registry).queryByText('对话助手')).toBeNull();
    expect(within(registry).getByText('绘画工具')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /全部/ }));
    fireEvent.change(screen.getByRole('searchbox', { name: '搜索应用台账' }), { target: { value: '对话 推理' } });
    expect(registry.querySelectorAll('.registry-row')).toHaveLength(1);
    fireEvent.change(screen.getByRole('searchbox', { name: '搜索应用台账' }), { target: { value: '不存在' } });
    expect(within(registry).getByText('没有找到匹配的应用，试试其他关键词或分类。')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));
    expect(registry.querySelectorAll('.registry-row')).toHaveLength(2);
  });

  it('空库保留新增入口，加载状态不伪造统计数字', () => {
    const { rerender } = render(<LibraryOverview apps={[]} assets={[]} skills={[]} keys={[]} threshold={20} loading={false} />);
    expect(screen.getByRole('link', { name: '添加应用' }).getAttribute('href')).toBe('/apps/new');
    rerender(<LibraryOverview apps={[]} assets={[]} skills={[]} keys={[]} threshold={20} loading />);
    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(screen.queryByRole('link', { name: '添加应用' })).toBeNull();
  });
});
