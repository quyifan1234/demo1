import { useState } from 'react';
import { createFileRoute, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useAssets, useMutate } from '../../lib/queries';
import { InitialAvatar, DetailSkeleton } from '../../components/bits';

export const Route = createFileRoute('/_app/assets/$assetId')({
  component: AssetDetail,
});

function AssetDetail() {
  const { assetId } = Route.useParams();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: '/assets/$assetId', params: { assetId }, fuzzy: false });
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { save, remove } = useMutate();
  const [delOpen, setDelOpen] = useState(false);

  if (!isDetail) return <Outlet />;

  const asset = assets.find((a) => a.id === assetId);
  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (assetsLoading) return <DetailSkeleton />;
  if (!asset) return <p className="text-muted-foreground text-sm">素材不存在或已被删除</p>;

  const toggleFav = async () => {
    await save('assets', { ...asset, is_favorite: !asset.is_favorite }, [['assets']], {
      optimistic: (old) => old.map((x: any) => x.id === assetId ? { ...x, is_favorite: !asset.is_favorite } : x),
    });
  };

  return (
    <div>
      <button type="button" onClick={() => navigate({ to: '/assets' })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} />返回素材库
      </button>

      {/* 详情 Hero：120px 大封面 + 大标题 + 红色主操作按钮 */}
      <div className="flex items-center gap-5 mb-5">
        <InitialAvatar name={asset.name} size={120} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted-foreground">
            {asset.category}
            {asset.is_favorite ? ' · 已收藏' : ''}
          </p>
          <h1 className="text-[34px] leading-[1.15] font-extrabold tracking-tight mt-1 break-words">{asset.name}</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-10">
        {asset.url ? (
          <a href={asset.url} target="_blank" rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground">
            <ExternalLink size={16} />打开链接
          </a>
        ) : null}
        <Button variant="outline" className="rounded-full shadow-none" onClick={toggleFav}>
          <Star size={14} className={asset.is_favorite ? 'text-primary' : ''} fill={asset.is_favorite ? 'currentColor' : 'none'} />
          {asset.is_favorite ? '已收藏' : '收藏'}
        </Button>
        <Button variant="outline" className="rounded-full shadow-none"
          onClick={() => navigate({ to: '/assets/$assetId/edit', params: { assetId } })}>
          <Pencil size={14} />编辑
        </Button>
        <Button variant="outline" className="rounded-full shadow-none text-destructive hover:text-destructive"
          onClick={() => setDelOpen(true)}>
          <Trash2 size={14} />删除
        </Button>
      </div>

      <div className="space-y-6 max-w-3xl">
        {asset.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {asset.tags.map((t) => <span key={t} className="text-[13px] bg-muted px-2.5 py-1 rounded-full">{t}</span>)}
          </div>
        )}
        {asset.url ? (
          <a href={asset.url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline break-all text-[15px]">
            <ExternalLink size={16} className="shrink-0" />
            {asset.url}
          </a>
        ) : null}
        {asset.description ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{asset.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">暂无描述</p>
        )}
      </div>

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除素材？</AlertDialogTitle>
            <AlertDialogDescription>「{asset.name}」将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={async () => {
                await remove('assets', assetId, [['assets']], {
                  optimistic: (old) => old.filter((x: any) => x.id !== assetId),
                });
                navigate({ to: '/assets' });
              }}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
