import { useMemo, useState } from 'react';
import { createFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Star, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useAssets, useMutate } from '../../lib/queries';
import { ASSET_CATEGORIES } from '../../lib/types';
import { PageHeader, EmptyState, Highlight, QueryError, InitialAvatar } from '../../components/bits';
import { CapsuleSearch, FilterChip, RowList, RowChevron, RowAction, RowSkeleton } from '../../components/rows';

export const Route = createFileRoute('/_app/assets')({
  component: AssetsPage,
});

function AssetsPage() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const isList = matchRoute({ to: '/assets', fuzzy: false });
  const { data: assets = [], isLoading, isError, refetch } = useAssets();
  const { save, remove } = useMutate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [favOnly, setFavOnly] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return assets.filter((a) => {
      if (cat !== '全部' && a.category !== cat) return false;
      if (favOnly && !a.is_favorite) return false;
      return terms.every((t) =>
        a.name.toLowerCase().includes(t) || (a.description ?? '').toLowerCase().includes(t) ||
        (a.url ?? '').toLowerCase().includes(t) || a.tags.join(' ').toLowerCase().includes(t));
    });
  }, [assets, q, cat, favOnly]);

  const toggleFav = async (id: string, v: boolean) => {
    const a = assets.find((x) => x.id === id);
    if (a) await save('assets', { ...a, is_favorite: !v }, [['assets']]);
  };

  const copyUrl = async (id: string, url: string) => {
    try { await navigator.clipboard.writeText(url); } catch { /* 剪贴板不可用时静默 */ }
    setCopied(id);
    setTimeout(() => setCopied((p) => (p === id ? null : p)), 1500);
  };

  if (!isList) return <Outlet />;

  return (
    <div>
      <PageHeader title="素材库" desc="收藏开源项目、设计资源与参考链接"
        action={<Button className="rounded-full shadow-none" onClick={() => navigate({ to: '/assets/new' })}><Plus size={16} />新增</Button>} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CapsuleSearch value={q} onChange={setQ} placeholder="搜索名称、描述、网址、标签" />
        <FilterChip active={favOnly} onClick={() => setFavOnly(!favOnly)}>
          <span className="inline-flex items-center gap-1">
            <Star size={14} fill={favOnly ? 'currentColor' : 'none'} />只看收藏
          </span>
        </FilterChip>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['全部', ...ASSET_CATEGORIES].map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <RowSkeleton rows={4} />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="还没有素材" desc="把好用的开源项目、设计资源收进素材库"
          action={<Button variant="link" className="text-[17px]" onClick={() => navigate({ to: '/assets/new' })}>新增素材</Button>} />
      ) : (
        <RowList>
          {filtered.map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-1 py-3">
              <Link to="/assets/$assetId" params={{ assetId: a.id }} className="flex min-w-0 flex-1 items-center gap-3">
                <InitialAvatar name={a.name} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[16px]"><Highlight text={a.name} query={q} /></span>
                    {a.is_favorite && <Star size={13} className="shrink-0 text-primary" fill="currentColor" />}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    {a.category}
                    {a.description ? ` · ${a.description}` : a.url ? ` · ${a.url.replace(/^https?:\/\//, '')}` : ''}
                  </p>
                  {a.tags.length > 0 ? (
                    <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{a.tags.slice(0, 4).join('、')}</p>
                  ) : null}
                </div>
              </Link>
              <div className="flex shrink-0 items-center">
                {a.url ? (
                  <RowAction title={copied === a.id ? '已复制' : '复制网址'} onClick={() => copyUrl(a.id, a.url!)}>
                    {copied === a.id ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                  </RowAction>
                ) : null}
                <RowAction title="收藏" onClick={() => toggleFav(a.id, a.is_favorite)}>
                  <Star size={16} className={a.is_favorite ? 'text-primary' : ''} fill={a.is_favorite ? 'currentColor' : 'none'} />
                </RowAction>
                <RowAction title="编辑" className="hidden sm:flex"
                  onClick={() => navigate({ to: '/assets/$assetId/edit', params: { assetId: a.id } })}>
                  <Pencil size={16} />
                </RowAction>
                <RowAction title="删除" danger className="hidden sm:flex" onClick={() => setDelId(a.id)}>
                  <Trash2 size={16} />
                </RowAction>
                <Link to="/assets/$assetId" params={{ assetId: a.id }} aria-label="查看详情" className="flex h-9 w-9 items-center justify-center">
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
            <AlertDialogTitle>删除素材？</AlertDialogTitle>
            <AlertDialogDescription>该素材将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={() => delId && remove('assets', delId, [['assets']], {
                optimistic: (old) => old.filter((x: any) => x.id !== delId),
              }).then(() => setDelId(null))}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
