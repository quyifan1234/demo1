import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { LIBRARY_NAV, isNavActive, type NavEntry } from './libraryNav';

interface TabEntry extends NavEntry {}

/** 移动端底部 Tab：总览、资料库四项与我的，选中态跟随主题。 */
const TABS: TabEntry[] = [
  { to: '/', label: '总览', Icon: LayoutDashboard, end: true },
  ...LIBRARY_NAV,
  { to: '/mine', label: '我的', Icon: User },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="mobile-tabbar" aria-label="移动端主导航">
      <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((entry) => {
          const active = isNavActive(pathname, entry);
          const { to, label, Icon } = entry;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium truncate max-w-full">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
