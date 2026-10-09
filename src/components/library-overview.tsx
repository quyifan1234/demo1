import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, ChevronRight, FolderOpen, KeyRound, Layers, Plus, Search, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import type { AiApp, ApiKey, Asset, Skill } from '../lib/types';
import { APP_CATEGORIES } from '../lib/types';
import { isQuotaAlert, timeAgo } from '../lib/format';
import { cn } from '../lib/utils';
import { Highlight, InitialAvatar, QuotaBar } from './bits';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { RowSkeleton } from './rows';

interface LibraryOverviewProps {
  apps: AiApp[];
  assets: Asset[];
  skills: Skill[];
  keys: ApiKey[];
  threshold: number;
  loading: boolean;
}

export function LibraryOverview({ apps, assets, skills, keys, threshold, loading }: LibraryOverviewProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');

  // Performance optimization: Memoize active apps to avoid re-filtering apps on every render pass
  const activeApps = useMemo(() => apps.filter((app) => app.status !== '已弃用'), [apps]);

  // Performance optimization: Memoize alert apps calculation to avoid re-evaluating quota thresholds
  const alerts = useMemo(
    () => activeApps.filter((app) => isQuotaAlert(app.quota_remaining, app.quota_total, threshold)),
    [activeApps, threshold],
  );

  const total = apps.length + assets.length + skills.length + keys.length;
  const stats = [
    { label: '应用', count: apps.length, to: '/apps', Icon: Layers },
    { label: '素材', count: assets.length, to: '/assets', Icon: FolderOpen },
    { label: '技能', count: skills.length, to: '/skills', Icon: Sparkles },
    { label: '密钥', count: keys.length, to: '/keys', Icon: KeyRound },
  ];
  const recent = useMemo(() => [
    ...apps.map((app) => ({ name: app.name, kind: '应用', updated: app.updated_at, path: `/apps/${app.id}` })),
    ...assets.map((asset) => ({ name: asset.name, kind: '素材', updated: asset.updated_at, path: `/assets/${asset.id}` })),
    ...skills.map((skill) => ({ name: skill.name, kind: '技能', updated: skill.updated_at, path: `/skills/${skill.id}` })),
    ...keys.map((key) => ({ name: key.name, kind: '密钥', updated: key.updated_at, path: `/keys/${key.id}` })),
  ].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6), [apps, assets, skills, keys]);

  // Performance optimization: Memoize search terms parsing to avoid string splits on unchanged queries
  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);

  // Performance optimization: Memoize app filtering & sorting to prevent O(N) operations during unrelated re-renders
  const filtered = useMemo(
    () =>
      activeApps
        .filter(
          (app) =>
            (category === '全部' || app.category === category) &&
            terms.every((term) =>
              [app.name, app.description ?? '', app.category, app.specialties.join(' ')].join(' ').toLowerCase().includes(term),
            ),
        )
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [activeApps, category, terms],
  );

  return (
    <div className="library-overview">
      <section className="library-hero" aria-labelledby="library-title">
        <div>
          <span className="eyebrow">个人工作空间 / 资源总览</span>
          <h1 id="library-title" className="page-title">资料库</h1>
          <p className="page-description">让每一件 AI 装备，都有自己的位置。{!loading && <span className="hidden sm:inline"> 已收纳 {total} 项资源。</span>}</p>
        </div>
        <span className="hero-note"><ShieldCheck size={14} aria-hidden="true" />个人专属，安心收纳</span>
      </section>

      <section className="overview-stats" aria-label="装备概览">
        {stats.map(({ label, count, to, Icon }) => (
          <Link key={to} to={to} className="overview-stat">
            <div><strong>{loading ? '—' : count}</strong><span>{label}</span></div>
            <Icon size={20} strokeWidth={1.3} aria-hidden="true" />
          </Link>
        ))}
      </section>

      {!loading && alerts.length > 0 && (
        <div className="quota-alert" role="status">
          <TriangleAlert size={16} aria-hidden="true" />
          <p><strong>{alerts.length} 个应用额度偏低</strong><span className="hidden sm:inline"> · {alerts.slice(0, 3).map((app) => app.name).join('、')}{alerts.length > 3 ? '等' : ''}，记得及时补充。</span></p>
          <Link to="/apps">查看额度 <span aria-hidden="true">↗</span></Link>
        </div>
      )}

      <section className="overview-section" aria-labelledby="recent-title">
        <div className="overview-section-head"><h2 id="recent-title">最近更新</h2><span>跨资料库 · 最近 {recent.length} 项</span></div>
        {loading ? <RowSkeleton rows={2} /> : recent.length > 0 ? (
          <div className="recent-grid">
            {recent.map((item) => (
              <Link key={item.path} to={item.path} className="recent-tile" title={`${item.name} · ${timeAgo(item.updated)}`}>
                <div className="flex w-full items-center justify-between"><InitialAvatar name={item.name} size={34} /><ArrowUpRight size={13} className="text-muted-foreground" aria-hidden="true" /></div>
                <strong className="truncate">{item.name}</strong><span>{item.kind} · {timeAgo(item.updated)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="registry-empty"><Layers size={24} strokeWidth={1.3} aria-hidden="true" /><p>装备库还是空的，从添加第一件装备开始。</p><Button asChild size="sm"><Link to="/apps/new"><Plus data-icon="inline-start" />添加应用</Link></Button></div>
        )}
      </section>

      <section className="overview-section" aria-labelledby="registry-title">
        <div className="overview-section-head"><h2 id="registry-title">应用台账</h2><Link to="/apps">查看全部 <ArrowRight size={13} aria-hidden="true" /></Link></div>
        <div className="registry-toolbar">
          <ToggleGroup type="single" value={category} onValueChange={(value) => value && setCategory(value)} className="category-toggles" aria-label="应用分类">
            {['全部', ...APP_CATEGORIES.filter((item) => activeApps.some((app) => app.category === item))].map((item) => (
              <ToggleGroupItem key={item} value={item}>{item}<span className="tabular-nums">{item === '全部' ? activeApps.length : activeApps.filter((app) => app.category === item).length}</span></ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="registry-search"><Search size={14} aria-hidden="true" /><Input aria-label="搜索应用台账" type="search" placeholder="搜索应用、描述或擅长领域…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        </div>
        {loading ? <RowSkeleton rows={3} /> : filtered.length === 0 ? (
          <div className="registry-empty"><Search size={22} strokeWidth={1.3} aria-hidden="true" /><p>{activeApps.length ? '没有找到匹配的应用，试试其他关键词或分类。' : '添加你常用的 AI 工具，名称、状态和额度一目了然。'}</p>
            {activeApps.length ? <Button variant="link" size="sm" onClick={() => { setQuery(''); setCategory('全部'); }}>清除筛选</Button> : <Button variant="outline" size="sm" asChild><Link to="/apps/new">新增应用</Link></Button>}
          </div>
        ) : (
          <div className="app-registry">
            <div className="registry-column-head" aria-hidden="true"><span>应用 / 分类</span><span>描述</span><span>剩余额度</span><span>状态</span></div>
            {filtered.slice(0, 8).map((app) => {
              const alert = isQuotaAlert(app.quota_remaining, app.quota_total, threshold);
              return (
                <Link key={app.id} to="/apps/$appId" params={{ appId: app.id }} className="registry-row">
                  <InitialAvatar name={app.name} size={34} />
                  <span className="registry-name"><strong className="truncate"><Highlight text={app.name} query={query} /></strong><span>{app.category}{app.is_favorite ? ' · 已收藏' : ''}</span></span>
                  <p className="registry-description line-clamp-2"><Highlight text={app.description || app.specialties.join('、') || '暂无描述'} query={query} /></p>
                  <QuotaBar remaining={app.quota_remaining} total={app.quota_total} thresholdPct={threshold} unit={app.quota_unit} />
                  <span className={cn('registry-status', alert ? 'is-warning' : app.status === '在用' && 'is-active')}>{alert ? '额度偏低' : app.status}</span>
                  <ChevronRight size={14} className="text-muted-foreground" aria-hidden="true" />
                </Link>
              );
            })}
            {filtered.length > 8 && <div className="flex justify-center pt-4"><Button variant="link" size="sm" asChild><Link to="/apps">还有 {filtered.length - 8} 个应用，查看完整台账<ArrowRight data-icon="inline-end" /></Link></Button></div>}
          </div>
        )}
      </section>
    </div>
  );
}
