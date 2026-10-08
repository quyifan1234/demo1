import { LayoutDashboard, Layers, KeyRound, Sparkles, FolderOpen, User, type LucideIcon } from 'lucide-react';

export interface NavEntry {
  to: string;
  label: string;
  Icon: LucideIcon;
  end?: boolean;
}

/** 资料库：四类内容（应用 / 素材 / 技能 / 密钥） */
export const LIBRARY_NAV: NavEntry[] = [
  { to: '/apps', label: '应用', Icon: Layers },
  { to: '/assets', label: '素材', Icon: FolderOpen },
  { to: '/skills', label: '技能', Icon: Sparkles },
  { to: '/keys', label: '密钥', Icon: KeyRound },
];

export const GENERAL_NAV: NavEntry[] = [
  { to: '/', label: '总览', Icon: LayoutDashboard, end: true },
  { to: '/mine', label: '我的', Icon: User },
];

export const ALL_NAV: NavEntry[] = [...LIBRARY_NAV, ...GENERAL_NAV];

export function isNavActive(pathname: string, entry: NavEntry): boolean {
  return entry.end ? pathname === '/' : pathname === entry.to || pathname.startsWith(entry.to + '/');
}
