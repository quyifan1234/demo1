import { Link, useMatches, useNavigate, useRouterState } from '@tanstack/react-router';
import { ChevronRight, FolderOpen, KeyRound, Layers, Plus, Sparkles } from 'lucide-react';
import { ALL_NAV, isNavActive } from './libraryNav';
import { ThemeSwitch } from './theme-switch';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useApps, useAssets, useKeys, useSkills } from '../lib/queries';

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const current = ALL_NAV.find((entry) => isNavActive(pathname, entry));

  // 详情页在面包屑里带上具体名称：只显示分区名（如「应用」）会让人不知道自己停在哪一条
  const matches = useMatches();
  const params = (matches[matches.length - 1]?.params ?? {}) as Record<string, string | undefined>;
  const apps = useApps();
  const assets = useAssets();
  const skills = useSkills();
  const keys = useKeys();
  const id = params.appId ?? params.assetId ?? params.skillId ?? params.keyId;
  const list = params.appId ? apps.data : params.assetId ? assets.data : params.skillId ? skills.data : keys.data;
  const recordName = id && id !== 'new' ? list?.find((item) => item.id === id)?.name : undefined;
  const actionLabel = pathname.endsWith('/new') ? '新增' : pathname.endsWith('/edit') ? '编辑' : undefined;
  const tail = recordName ?? actionLabel;

  return (
    <header className="workspace-toolbar">
      <nav className="toolbar-crumb" aria-label="面包屑">
        <Link to="/">SI<span className="hidden lg:inline"> 装备库</span></Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span>{pathname === '/' ? '资料库' : current?.label ?? '资料库'}</span>
        {tail ? <>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="toolbar-crumb-tail" aria-current="page">{tail}</span>
        </> : null}
      </nav>
      <div className="toolbar-actions">
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
