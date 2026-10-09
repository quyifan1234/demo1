import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ArrowUpRight, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { useApps, useAssets, useKeys, useSkills } from '../lib/queries';
import { LIBRARY_NAV, GENERAL_NAV, isNavActive, type NavEntry } from './libraryNav';
import { Button } from './ui/button';

export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const apps = useApps();
  const assets = useAssets();
  const skills = useSkills();
  const keys = useKeys();
  const counts: Record<string, number | undefined> = {
    '/apps': apps.data?.length, '/assets': assets.data?.length,
    '/skills': skills.data?.length, '/keys': keys.data?.length,
  };
  const row = (entry: NavEntry) => {
    const active = isNavActive(pathname, entry);
    return (
      <Link key={entry.to} to={entry.to} aria-current={active ? 'page' : undefined}
        className={cn('rail-link', active && 'is-active')}>
        {/* 选中态标记由 rail-link 的主题样式统一控制 */}
        <entry.Icon size={17} strokeWidth={1.7} aria-hidden="true" />
        <span className="flex-1">{entry.label}</span>
        {entry.to in counts && <span className="rail-count">{counts[entry.to] ?? '—'}</span>}
      </Link>
    );
  };
  const displayName = user?.user_metadata?.nickname || user?.email?.split('@')[0] || '我的工作台';
  return (
    <aside className="arsenal-rail" aria-label="主导航">
      <Link to="/" className="brand-lockup" aria-label="SI 装备库首页">
        <span className="brand-mark" aria-hidden="true">SI</span>
        <span className="flex flex-col gap-1"><strong>SI 装备库</strong><span className="eyebrow">个人 AI 资源台账</span></span>
      </Link>
      <nav className="flex flex-col gap-7" aria-label="工作台分区">
        <div className="flex flex-col gap-1">{GENERAL_NAV.filter((entry) => entry.to === '/').map(row)}</div>
        <section className="flex flex-col gap-2">
          <h2 className="rail-section-label">资料库</h2>
          <div className="flex flex-col gap-1">{LIBRARY_NAV.map(row)}</div>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="rail-section-label">工作空间</h2>
          {GENERAL_NAV.filter((entry) => entry.to !== '/').map(row)}
        </section>
      </nav>
      <div className="rail-bottom">
        <div className="rail-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>你的装备，只属于你<span>密钥默认打码 · 个人数据隔离</span></p>
        </div>
        <Link to="/mine" className="rail-profile">
          <span className="profile-monogram" aria-hidden="true">{String(displayName).slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate">{displayName}</strong><span className="block truncate">个人工作空间</span></span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <Button variant="ghost" onClick={async () => { await signOut(); navigate({ to: '/login', replace: true }); }}>
          <LogOut data-icon="inline-start" />退出登录
        </Button>
      </div>
    </aside>
  );
}
