import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { MobileNav } from '../components/MobileNav';
import { LIBRARY_NAV, GENERAL_NAV, ALL_NAV, isNavActive, type NavEntry } from '../components/libraryNav';

export const Route = createFileRoute('/_app')({
  component: AppShell,
});

/** 折叠小标题用：按路径取所属资料库/分区名称 */
function sectionLabel(pathname: string): string {
  const hit = ALL_NAV.find((e) => isNavActive(pathname, e));
  return hit?.label ?? '资料库';
}

function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const row = (entry: NavEntry) => {
    const active = isNavActive(pathname, entry);
    return (
      <Link
        key={entry.to}
        to={entry.to}
        className={cn(
          'flex items-center gap-3 px-4 py-2 text-[15px] transition-colors',
          active ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground',
        )}
      >
        {/* 选中态红点 */}
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', active ? 'bg-primary' : 'bg-transparent')} />
        <entry.Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
        <span className="truncate">{entry.label}</span>
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-2">
      <section>
        <p className="px-4 pb-1 text-[13px] font-medium text-muted-foreground">资料库</p>
        <div className="space-y-0.5">{LIBRARY_NAV.map(row)}</div>
      </section>
      <section>
        <div className="space-y-0.5">{GENERAL_NAV.map(row)}</div>
      </section>
    </nav>
  );
}

function AppShell() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mainRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: '/login', replace: true });
  }, [ready, user, navigate]);

  // 大标题随滚动折叠为小标题
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 48);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中…</div>;
  }
  if (!user) return null;

  const onSignOut = async () => {
    await signOut();
    navigate({ to: '/login', replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* 桌面端：左侧边栏 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background sticky top-0 h-screen md:flex">
        <div className="px-6 pt-8 pb-6">
          <div className="text-[17px] font-extrabold tracking-wide">SI 装备库</div>
          <div className="text-[13px] text-muted-foreground mt-1">个人 AI 资源台账</div>
        </div>
        <SidebarNav />
        <div className="p-4 border-t border-border">
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-4 py-2 text-[15px] text-muted-foreground hover:text-foreground w-full"
          >
            <LogOut size={17} strokeWidth={1.8} />
            退出登录
          </button>
        </div>
      </aside>

      <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto">
        {/* 滚动折叠后的小标题（Apple Music 式） */}
        <div
          className={cn(
            'sticky top-0 z-20 border-b bg-background transition-all duration-200',
            scrolled ? 'border-border opacity-100' : 'pointer-events-none -translate-y-1 border-transparent opacity-0',
          )}
          aria-hidden={!scrolled}
        >
          <div className="mx-auto max-w-[1100px] px-4 md:px-10 py-3 text-center text-[17px] font-semibold truncate">
            {sectionLabel(pathname)}
          </div>
        </div>
        <div className="mx-auto max-w-[1100px] px-4 md:px-10 pt-6 md:pt-8 pb-24 md:pb-16">
          <Outlet />
        </div>
      </main>

      {/* 移动端：底部 Tab */}
      <MobileNav />
    </div>
  );
}
