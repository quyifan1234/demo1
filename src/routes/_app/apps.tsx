import { useMemo, useState } from 'react';
import { createFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Star, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useApps, usePrefs, useMutate } from '../../lib/queries';
import { APP_CATEGORIES, APP_STATUSES, SORTS } from '../../lib/types';
import { toast } from 'sonner';
import { isQuotaAlert } from '../../lib/format';
import { InitialAvatar, PageHeader, QuotaBar, EmptyState, Highlight, QueryError } from '../../components/bits';
import { CapsuleSearch, FilterChip, RowList, RowChevron, RowAction, RowSkeleton } from '../../components/rows';

export const Route = createFileRoute('/_app/apps')({
  component: AppsPage,
});

function AppsPage() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  // 子路由（/apps/new、/apps/$appId 等）激活时只渲染 Outlet，不显示列表
  const isList = matchRoute({ to: '/apps', fuzzy: false });
  const { data: apps = [], isLoading, isError, refetch } = useApps();
  const { data: prefs } = usePrefs();
  const { save, remove, invalidate } = useMutate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [status, setStatus] = useState('全部');
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState(prefs?.default_sort ?? 'updated');
  const [delId, setDelId] = useState<string | null>(null);
  // 正在切换收藏的行 id：防重复点击、显示等待态
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const threshold = prefs?.quota_threshold ?? 20;

  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = apps.filter((a) => {
      if (cat !== '全部' && a.category !== cat) return false;
      if (status !== '全部' && a.status !== status) return false;
      if (favOnly && !a.is_favorite) return false;
      if (status === '全部' && a.status === '已弃用') return false;
      return terms.every((t) =>
        a.name.toLowerCase().includes(t) || (a.description ?? '').toLowerCase().includes(t) ||
        a.specialties.join(' ').toLowerCase().includes(t) || (a.url ?? '').toLowerCase().includes(t));
    });
    const by: Record<string, (x: typeof list[number], y: typeof list[number]) => number> = {
      updated: (x, y) => y.updated_at.localeCompare(x.updated_at),
      name: (x, y) => x.name.localeCompare(y.name, 'zh'),
      quota: (x, y) => (x.quota_remaining ?? Infinity) - (y.quota_remaining ?? Infinity),
      favorite: (x, y) => Number(y.is_favorite) - Number(x.is_favorite) || y.updated_at.localeCompare(x.updated_at),
    };
    return [...list].sort(by[sort] ?? by.updated);
  }, [apps, q, cat, status, favOnly, sort]);

  const toggleFav = async (id: string, v: boolean) => {
    if (toggling.has(id)) return; // 请求未完成时禁止重复点击
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    setToggling((s) => new Set(s).add(id));
    try {
      // 乐观更新：星标立即翻转，失败时回滚并提示
      await save('ai_apps', { ...app, is_favorite: !v }, [['apps']], {
        optimistic: (old) => old.map((a) => (a.id === id ? { ...a, is_favorite: !v } : a)),
      });
    } catch (e) {
      invalidate([['apps']]);
      toast.error(e instanceof Error ? e.message : '收藏失败，请重试');
    } finally {
      setToggling((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  if (!isList) return <Outlet />;

  return (
    <div>
      <PageHeader title="应用" desc={`${filtered.length} 个应用`}
        action={<Button className="rounded-full shadow-none" onClick={() => navigate({ to: '/apps/new' })}><Plus size={16} />新增</Button>} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CapsuleSearch value={q} onChange={setQ} placeholder="搜索名称、描述、擅长领域、网址" />
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-28 rounded-full border-0 bg-muted shadow-none"><SelectValue /></SelectTrigger>
            <SelectContent>{['全部', ...APP_STATUSES].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-32 rounded-full border-0 bg-muted shadow-none"><SelectValue /></SelectTrigger>
            <SelectContent>{SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          <FilterChip active={favOnly} onClick={() => setFavOnly(!favOnly)}>
            <span className="inline-flex items-center gap-1">
              <Star size={14} fill={favOnly ? 'currentColor' : 'none'} />只看收藏
            </span>
          </FilterChip>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['全部', ...APP_CATEGORIES].map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <RowSkeleton rows={4} />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="没有匹配的应用" desc="换个关键词试试，或添加一个新的应用"
          action={<Button variant="link" className="text-[17px]" onClick={() => navigate({ to: '/apps/new' })}>新增应用</Button>} />
      ) : (
        <RowList>
          {filtered.map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-1 py-3">
              <Link to="/apps/$appId" params={{ appId: a.id }} className="flex min-w-0 flex-1 items-center gap-3">
                <InitialAvatar name={a.name} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[16px]"><Highlight text={a.name} query={q} /></span>
                    {a.is_favorite && <Star size={13} className="shrink-0 text-primary" fill="currentColor" />}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {a.category}
                    {a.description ? ` · ${a.description}` : ''}
                    {isQuotaAlert(a.quota_remaining, a.quota_total, threshold) ? ' · 额度告急' : ''}
                  </p>
                  <div className="mt-1.5 max-w-xs"><QuotaBar remaining={a.quota_remaining} total={a.quota_total} thresholdPct={threshold} unit={a.quota_unit} /></div>
                </div>
              </Link>
              <div className="flex shrink-0 items-center">
                <RowAction
                  title={a.is_favorite ? '取消收藏' : '收藏'}
                  disabled={toggling.has(a.id)}
                  onClick={() => toggleFav(a.id, a.is_favorite)}>
                  {toggling.has(a.id) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Star size={16} className={a.is_favorite ? 'text-primary' : ''} fill={a.is_favorite ? 'currentColor' : 'none'} />
                  )}
                </RowAction>
                <RowAction title="编辑" className="hidden sm:flex"
                  onClick={() => navigate({ to: '/apps/$appId/edit', params: { appId: a.id } })}>
                  <Pencil size={16} />
                </RowAction>
                <RowAction title="删除" danger className="hidden sm:flex" onClick={() => setDelId(a.id)}>
                  <Trash2 size={16} />
                </RowAction>
                <Link to="/apps/$appId" params={{ appId: a.id }} aria-label="查看详情" className="flex h-9 w-9 items-center justify-center">
                  <RowChevron />
                </Link>
              </div>
            </div>
          ))}
        </RowList>
      )}

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除应用？</AlertDialogTitle>
            <AlertDialogDescription>该应用及其产物记录将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={() => delId && remove('ai_apps', delId, [['apps'], ['outputs']]).then(() => setDelId(null))}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
