import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutate } from '../../lib/queries';
import { PageHeader } from '../../components/bits';
import { AssetForm, toAssetFormValue, type AssetFormValue } from '../../components/asset-form';

export const Route = createFileRoute('/_app/assets/new')({
  component: NewAsset,
});

function NewAsset() {
  const navigate = useNavigate();
  const { save } = useMutate();
  const [busy, setBusy] = useState(false);

  const submit = async (v: AssetFormValue) => {
    setBusy(true);
    try {
      await save('assets', {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, tags: v.tags,
        is_favorite: v.is_favorite,
      }, [['assets']], { isNew: true });
      navigate({ to: '/assets' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="新增素材" desc="收藏一个开源项目或参考链接" />
      <div className="max-w-2xl">
        <AssetForm initial={toAssetFormValue()} onSubmit={submit} busy={busy} submitLabel="保存" />
      </div>
    </div>
  );
}
