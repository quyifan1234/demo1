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
      {!isMobile && <DesktopNav />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          className={
            isMobile
              ? 'flex-1 overflow-y-auto px-4 pb-24 pt-4'
              : 'flex-1 overflow-y-auto px-6 py-6 lg:px-10'
          }
        >
          <Outlet />
        </main>
        {isMobile && <MobileTabBar />}
      </div>
    </div>
  );
}
