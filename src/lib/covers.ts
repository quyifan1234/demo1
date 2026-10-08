/**
 * 封面 token（Apple Music v2）：
 * 无图时用「纯色块 + 首字」。12 个纯色 hex 只定义在 styles.css 的
 * `--am-cover-1 … --am-cover-12` 里（禁止渐变）；这里只做「按名称 hash
 * 取类名」的映射，组件层不出现任何色值字面量。
 */

export const COVER_COUNT = 12;

/** 按名称 hash 取封面类名：`am-cover-1` … `am-cover-12` */
export function coverClass(name: string): string {
  const s = name || '?';
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  const n = ((h % COVER_COUNT) + COVER_COUNT) % COVER_COUNT + 1;
  return `am-cover-${n}`;
}

/** 封面首字：首个非空字符大写 */
export function firstChar(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}
