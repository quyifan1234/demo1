// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { Link, useRouterState } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navItems';

export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles size={16} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">SI 装备库</p>
          <p className="text-[11px] text-muted-foreground">Web Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-muted-foreground">
        与「AI 应用管理助手」共享数据
      </div>
    </aside>
  );
}
