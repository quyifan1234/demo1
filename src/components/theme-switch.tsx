import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { Moon, Sun, Type } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export type ArsenalTheme = 'light' | 'dark' | 'editorial';
const ThemeContext = createContext<{ theme: ArsenalTheme; setTheme: (theme: ArsenalTheme) => void } | null>(null);
const THEMES = [
  { value: 'dark', label: '暗色控制台', Icon: Moon, color: '#0f0e0c' },
  { value: 'light', label: '浅色原生', Icon: Sun, color: '#f4f4f7' },
  { value: 'editorial', label: '编辑排版', Icon: Type, color: '#fbfbfa' },
] as const;
const STORAGE_KEY = 'si-arsenal-theme';

function isTheme(value: unknown): value is ArsenalTheme {
  return THEMES.some((item) => item.value === value);
}

/**
 * 主题是设备级偏好，需跨刷新保留：
 * 优先读 index.html 预置脚本写入的 <html data-theme>（避免首屏与 React 状态不一致），
 * 其次读 localStorage，都没有才回落浅色。
 */
function initialTheme(): ArsenalTheme {
  try {
    const fromDom = document.documentElement.dataset.theme;
    if (isTheme(fromDom)) return fromDom;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* 隐私模式/禁用存储时忽略，回落浅色 */
  }
  return 'light';
}


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ArsenalTheme>(initialTheme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES.find((item) => item.value === theme)!.color);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* 存储不可用时仅本次会话生效 */
    }
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeSwitch() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeSwitch 必须在 ThemeProvider 内使用');
  return (
    <ToggleGroup type="single" value={context.theme} onValueChange={(value) => {
      if (THEMES.some((item) => item.value === value)) context.setTheme(value as ArsenalTheme);
    }} className="theme-switch" aria-label="界面主题">
      {THEMES.map(({ value, label, Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
