import { useMemo, useState } from 'react';
import { createFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Star, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useAssets, useMutate } from '../../lib/queries';
import { copyText } from '../../lib/clipboard';
import { ASSET_CATEGORIES } from '../../lib/types';
import { PageHeader, EmptyState, Highlight, QueryError, InitialAvatar } from '../../components/bits';
import { CapsuleSearch, CategoryFilters, FilterChip, RowList, RowChevron, RowAction, RowSkeleton } from '../../components/rows';

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
  // 正在切换收藏的行 id：防重复点击
  const [toggling, setToggling] = useState<Set<string>>(new Set());

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

  // 一键清空筛选，回到完整列表
  const clearFilters = () => { setQ(''); setCat('全部'); setFavOnly(false); };

  const toggleFav = async (id: string, v: boolean) => {
    if (toggling.has(id)) return; // 请求未完成时禁止重复点击
    const a = assets.find((x) => x.id === id);
    if (!a) return;
    setToggling((s) => new Set(s).add(id));
    // 乐观更新：星标立即翻转，失败时由 save 回滚并提示
    await save('assets', { ...a, is_favorite: !v }, [['assets']], {
      optimistic: (old) => old.map((x) => (x.id === id ? { ...x, is_favorite: !v } : x)),
    });
    setToggling((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const copyUrl = async (id: string, url: string) => {
    // 复制成功才显示 ✓；失败由 copyText 统一提示
    if (!(await copyText(url))) return;
    setCopied(id);
    setTimeout(() => setCopied((p) => (p === id ? null : p)), 1500);
  };

  if (!isList) return <Outlet />;

  return (
    <div>
      <PageHeader title="素材库" desc="收藏开源项目、设计资源与参考链接"
        action={<Button className="shadow-none" onClick={() => navigate({ to: '/assets/new' })}><Plus size={16} />新增</Button>} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CapsuleSearch value={q} onChange={setQ} placeholder="搜索名称、描述、网址、标签" />
        <FilterChip active={favOnly} onClick={() => setFavOnly(!favOnly)}>
          <span className="inline-flex items-center gap-1">
            <Star size={14} fill={favOnly ? 'currentColor' : 'none'} />只看收藏
          </span>
        </FilterChip>
      </div>
      <div className="mb-6"><CategoryFilters options={['全部', ...ASSET_CATEGORIES]} value={cat} onChange={setCat} /></div>

      {isLoading ? (
        <RowSkeleton rows={4} />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : assets.length === 0 ? (
        <EmptyState title="还没有素材" desc="把好用的开源项目、设计资源收进素材库"
          action={<Button variant="link" className="text-[17px]" onClick={() => navigate({ to: '/assets/new' })}>新增素材</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState title="没有匹配的素材" desc="试试其他关键词或分类"
          action={<Button variant="link" className="text-[17px]" onClick={clearFilters}>清除筛选</Button>} />
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
                <RowAction title={a.is_favorite ? '取消收藏' : '收藏'} disabled={toggling.has(a.id)}
                  onClick={() => toggleFav(a.id, a.is_favorite)}>
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
              onClick={async (event) => {
                // AlertDialogAction 默认点击即关闭，先阻止；仅删除成功后关弹窗，失败时保留让用户重试
                event.preventDefault();
                const id = delId;
                if (!id) return;
                const ok = await remove('assets', id, [['assets']], {
                  optimistic: (old) => old.filter((x: any) => x.id !== id),
                  success: '已删除',
                });
                if (ok) setDelId(null);
              }}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
