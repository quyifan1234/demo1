import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutate } from '../../lib/queries';
import { PageHeader } from '../../components/bits';
import { AssetForm, toAssetFormValue, type AssetFormValue } from '../../components/asset-form';
import { UnsavedGuardDialog, useUnsavedGuard } from '../../components/unsaved-guard';

export const Route = createFileRoute('/_app/assets/new')({
  component: NewAsset,
});

function NewAsset() {
  const navigate = useNavigate();
  const { save } = useMutate();
  const [busy, setBusy] = useState(false);
  const { blocker, markDirty, clearDirty } = useUnsavedGuard();

  const submit = async (v: AssetFormValue) => {
    setBusy(true);
    try {
      const ok = await save('assets', {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, tags: v.tags,
        is_favorite: v.is_favorite,
      }, [['assets']], { isNew: true, success: '已新增素材', errorMessage: '素材保存失败，请稍后重试' });
      // 保存失败时留在表单，已填内容不丢（toast 已提示原因）
      if (!ok) return;
      clearDirty();
      navigate({ to: '/assets' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="新增素材" desc="收藏一个开源项目或参考链接" />
      {/* onChangeCapture：表单内任何输入变化都算「未保存」，离开前会拦一下 */}
      <div className="max-w-2xl" onChangeCapture={markDirty}>
        <AssetForm initial={toAssetFormValue()} onSubmit={submit} busy={busy} submitLabel="保存" autoFocus />
      </div>
      <UnsavedGuardDialog blocker={blocker} />
    </div>
  );
}
