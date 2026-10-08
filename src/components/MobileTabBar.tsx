// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { Link, useRouterState } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './navItems';

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              <span className="truncate">{label.replace(' 密钥', '密钥').replace('记录', '')}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
