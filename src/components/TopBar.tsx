import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ChevronRight, FolderOpen, KeyRound, Layers, Plus, Sparkles } from 'lucide-react';
import { ALL_NAV, isNavActive } from './libraryNav';
import { isPreviewDemoEnabled } from '../lib/preview-demo';
import { ThemeSwitch } from './theme-switch';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const current = ALL_NAV.find((entry) => isNavActive(pathname, entry));
  return (
    <header className="workspace-toolbar">
      <nav className="toolbar-crumb" aria-label="面包屑">
        <Link to="/">SI<span className="hidden lg:inline"> 装备库</span></Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span>{pathname === '/' ? '资料库' : current?.label ?? '资料库'}</span>
      </nav>
      <div className="toolbar-actions">
        {isPreviewDemoEnabled() && <span className="demo-badge" role="status">演示模式 · 示例数据</span>}
        <ThemeSwitch />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button><Plus data-icon="inline-start" /><span>新增装备</span></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => navigate({ to: '/apps/new' })}><Layers />新增应用</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: '/assets/new' })}><FolderOpen />新增素材</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: '/skills/$skillId', params: { skillId: 'new' } })}><Sparkles />新增技能</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate({ to: '/keys/$keyId', params: { keyId: 'new' } })}><KeyRound />新增密钥</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
