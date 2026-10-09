import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useAssets, useMutate } from '../../lib/queries';
import { PageHeader, DetailSkeleton } from '../../components/bits';
import { AssetForm, toAssetFormValue, type AssetFormValue } from '../../components/asset-form';
import { UnsavedGuardDialog, useUnsavedGuard } from '../../components/unsaved-guard';

export const Route = createFileRoute('/_app/assets/$assetId/edit')({
  component: EditAsset,
});

function EditAsset() {
  const { assetId } = Route.useParams();
  const navigate = useNavigate();
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { save } = useMutate();
  const [busy, setBusy] = useState(false);
  const { blocker, markDirty, clearDirty } = useUnsavedGuard();

  const asset = assets.find((a) => a.id === assetId);
  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (assetsLoading) return <DetailSkeleton />;
  if (!asset) return <p className="text-muted-foreground text-sm">素材不存在</p>;

  const submit = async (v: AssetFormValue) => {
    setBusy(true);
    try {
      const patch = {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, tags: v.tags,
        is_favorite: v.is_favorite,
      };
      // 乐观更新：保存前先把新值写入缓存，详情页挂载即得新值，不闪现旧标题
      const ok = await save('assets', { ...asset, ...patch }, [['assets']], {
        optimistic: (old) => old.map((x: any) => (x.id === assetId ? { ...x, ...patch } : x)),
        success: '已保存',
        errorMessage: '素材保存失败，请稍后重试',
      });
      // 失败时留在表单，已填内容不丢（toast 已提示原因）
      if (!ok) return;
      clearDirty();
      navigate({ to: '/assets/$assetId', params: { assetId } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={() => navigate({ to: '/assets/$assetId', params: { assetId } })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={15} />返回详情
      </button>
      <PageHeader title="编辑素材" />
      {/* onChangeCapture：表单内任何输入变化都算「未保存」，离开前会拦一下 */}
      <div className="max-w-2xl" onChangeCapture={markDirty}>
        {/* key 保证 reload 时数据就绪后表单重新挂载，initial 取到真实值 */}
        <AssetForm key={asset.id} initial={toAssetFormValue(asset)} onSubmit={submit} busy={busy} submitLabel="保存" />
      </div>
      <UnsavedGuardDialog blocker={blocker} />
    </div>
  );
}
