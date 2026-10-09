import { useEffect } from 'react';

const BASE_TITLE = 'SI 装备库 · 个人 AI 资源工作台';

/**
 * 按页面设置浏览器标题：多标签页、历史记录里都能一眼认出当前页面。
 * 卸载时恢复站点标题，避免详情页标题残留到列表页。
 */
export function useDocTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · SI 装备库` : BASE_TITLE;
    return () => { document.title = BASE_TITLE; };
  }, [title]);
}
