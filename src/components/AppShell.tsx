// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { Outlet } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopNav } from '@/components/DesktopNav';
import { MobileTabBar } from '@/components/MobileTabBar';
import { TopBar } from '@/components/TopBar';

/** 共享壳：桌面侧边栏 + 顶栏；移动端底部 Tab。子页面通过 Outlet 渲染 */
export function AppShell() {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">跳过到主要内容</a>
      {!isMobile && <DesktopNav />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main-content" tabIndex={-1}
          className={`focus:outline-none ${
            isMobile
              ? 'flex-1 overflow-y-auto px-4 pb-24 pt-4'
              : 'flex-1 overflow-y-auto px-6 py-6 lg:px-10'
          }`}
        >
          <Outlet />
        </main>
        {isMobile && <MobileTabBar />}
      </div>
    </div>
  );
}
