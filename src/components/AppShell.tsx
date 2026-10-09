import { Outlet } from '@tanstack/react-router';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';

/** 共享壳：桌面侧边栏 + 顶栏；移动端底部 Tab。子页面通过 Outlet 渲染 */
export function AppShell() {
  return (
    <div className="arsenal-shell">
      <a href="#main-content" className="skip-link">跳转到内容</a>
      <DesktopNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main-content" className="arsenal-body" tabIndex={-1}>
          <Outlet />
          <footer className="workspace-footer">
            <span>SI 装备库 <span aria-hidden="true">/</span> 个人 AI 资源工作台</span>
            <span>有序归档，随时可用。</span>
          </footer>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
