import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { coverClass, firstChar } from '../lib/covers';
import { isQuotaAlert, maskKey, quotaPct } from '../lib/format';
import { Button } from './ui/button';

export function InitialAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const ch = firstChar(name);
  // Apple Music v2：无图封面 = 纯色块 + 首字（颜色按名称 hash 取 12 纯色之一，无渐变无阴影）
  return (
    <div className={cn('am-cover', coverClass(name))}
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {ch}
    </div>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= value ? 'currentColor' : 'none'} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function QuotaBar({ remaining, total, thresholdPct = 20, unit = '次' }: {
  remaining: number | null; total: number | null; thresholdPct?: number; unit?: string;
}) {
  if (total == null || total <= 0) return <span className="text-xs text-muted-foreground">无限额度</span>;
  const alert = isQuotaAlert(remaining, total, thresholdPct);
  return (
    <div className="space-y-1">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full', alert ? 'bg-warn' : 'bg-primary')} style={{ width: `${quotaPct(remaining, total) * 100}%` }} />
      </div>
      <div className={cn('text-xs', alert ? 'text-warn font-semibold' : 'text-muted-foreground')}>
        剩余 {remaining ?? 0} / {total} {unit}{alert ? ' · 额度告急' : ''}
      </div>
    </div>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  // Apple Music v2 空状态：大字标题 + 一句次文字 + 红色文字按钮，不用插画
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center" role="status" aria-live="polite">
      <p className="text-xl font-bold">{title}</p>
      {desc ? <p className="text-sm text-muted-foreground mt-2 max-w-sm">{desc}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/**
 * 搜索关键词高亮：把 text 中命中 query（空格分词，AND 逻辑） 的片段包进 <mark>。
 * v2 规范：淡红底 bg-primary/15（--am-red 淡化），文字颜色 text-inherit 继承上下文
 * （名称/描述/徽章字色各不相同，高亮不得改字色）；无硬编码色值、无渐变、无阴影。
 * 无命中/空 query 时原样返回文本，可安全地与 truncate、line-clamp 混用。
 */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0 || !text) return <>{text}</>;
  const lower = text.toLowerCase();
  const ranges: Array<[number, number]> = [];
  for (const t of terms) {
    let i = 0;
    while (true) {
      const idx = lower.indexOf(t, i);
      if (idx === -1) break;
      ranges.push([idx, idx + t.length]);
      i = idx + t.length;
    }
  }
  if (ranges.length === 0) return <>{text}</>;
  // 合并重叠/相邻区间（多词命中同一位置时不嵌套 mark）
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) {
      last[1] = Math.max(last[1], r[1]);
    } else {
      merged.push(r);
    }
  }
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  merged.forEach(([s, e], i) => {
    if (s > pos) nodes.push(text.slice(pos, s));
    nodes.push(<mark key={i} className="bg-primary/15 text-inherit rounded-sm">{text.slice(s, e)}</mark>);
    pos = e;
  });
  if (pos < text.length) nodes.push(text.slice(pos));
  return <>{nodes}</>;
}

/**
 * 必填项红色星号标记（全站表单统一使用）：
 * 红色走主题类 text-destructive（CSS 变量 --destructive，无硬编码色值）；
 * 自带前置空格，渲染效果与原先的「名称 *」视觉间距一致。
 */
export function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {' *'}
    </span>
  );
}

export function MaskedKey({ value, revealed }: { value: string; revealed: boolean }) {
  return <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{revealed ? value : maskKey(value)}</code>;
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  // Apple Music v2：大标题 34px Heavy；随滚动折叠为小标题由 AppShell 的吸顶条实现
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-[34px] leading-[1.15] font-extrabold tracking-tight truncate">{title}</h1>
        {desc ? <p className="text-[13px] text-muted-foreground mt-1 truncate">{desc}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2 pt-2">{action}</div> : null}
    </div>
  );
}

/**
 * 详情/编辑页加载骨架：数据就绪前只渲染它，绝不先渲染"不存在"。
 * v2 规范：分组灰 bg-muted 占位块 + animate-pulse，无阴影，4pt 网格间距。
 */
export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="加载中">
      <div className="h-4 w-24 bg-muted rounded-lg animate-pulse mb-4" />
      <div className="flex items-start justify-between mb-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-6 max-w-3xl">
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-28 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

/**
 * 查询失败态：明确失败反馈 + 重试入口。供各列表/详情页复用。
 */
export function QueryError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center" role="alert" aria-live="assertive">
      <p className="text-base font-semibold">加载失败</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{message ?? '网络开小差了，请稍后重试'}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="link" onClick={onRetry}>
            重试
          </Button>
        </div>
      ) : null}
    </div>
  );
}
