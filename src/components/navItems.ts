// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { BarChart3, BookMarked, Boxes, KeyRound, ScrollText, SlidersHorizontal, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '总览', Icon: BarChart3 },
  { to: '/apps', label: 'AI 应用', Icon: Boxes },
  { to: '/keys', label: 'API 密钥', Icon: KeyRound },
  { to: '/skills', label: '技能库', Icon: BookMarked },
  { to: '/outputs', label: '产物记录', Icon: ScrollText },
  { to: '/settings', label: '设置', Icon: SlidersHorizontal },
];
