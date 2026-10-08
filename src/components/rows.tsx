import { Search, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

/**
 * 列表页共享视觉原语（Apple Music v2）：
 * 胶囊搜索框 / 筛选 chips / hairline 分隔行 / chevron / 行内操作按钮 / 骨架行。
 * 只管视觉，过滤/排序/增删改逻辑全部留在各页面。
 */

/** 顶部胶囊搜索框：分组灰底、无边框、胶囊圆角，实时过滤（value/onChange 由页面持有） */
export function CapsuleSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-full border-0 bg-muted pl-10 pr-4 text-[15px] shadow-none focus-visible:ring-1"
      />
    </div>
  );
}

/** 筛选 chip：选中态红字 + 淡红底（选中态可用红） */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm transition-colors',
        active
          ? 'bg-primary/10 font-semibold text-primary'
          : 'bg-muted text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

/** hairline 分隔的列表容器（无卡片、无阴影） */
export function RowList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('divide-y divide-border border-y border-border bg-background', className)}>
      {children}
    </div>
  );
}

/** 列表行 chevron › */
export function RowChevron() {
  return <ChevronRight size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />;
}

/** 行内图标操作按钮（圆形、无边框） */
export function RowAction({
  title,
  onClick,
  disabled,
  danger,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
        danger && 'hover:text-destructive',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** 列表加载骨架：hairline 行 + 分组灰脉冲块 */
export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border border-y border-border" aria-busy="true" aria-label="加载中">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-3">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 分组小标题：13pt 次文字 */
export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('mb-2 mt-8 text-[13px] font-semibold text-muted-foreground first:mt-0', className)}>
      {children}
    </h2>
  );
}
