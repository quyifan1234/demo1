import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutate } from '../../lib/queries';
import { PageHeader } from '../../components/bits';
import { AppForm, toFormValue, type AppFormValue } from '../../components/app-form';
import { UnsavedGuardDialog, useUnsavedGuard } from '../../components/unsaved-guard';

export const Route = createFileRoute('/_app/apps/new')({
  component: NewApp,
});

function NewApp() {
  const navigate = useNavigate();
  const { save } = useMutate();
  const [busy, setBusy] = useState(false);
  const { blocker, markDirty, clearDirty } = useUnsavedGuard();

  const submit = async (v: AppFormValue) => {
    setBusy(true);
    try {
      const ok = await save('ai_apps', {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, specialties: v.specialties,
        quota_total: v.quota_total === '' ? null : Number(v.quota_total),
        quota_remaining: v.quota_remaining === '' ? null : Number(v.quota_remaining),
        quota_unit: v.quota_unit, quota_updated_at: new Date().toISOString(),
        status: v.status, rating: v.rating, note: v.note.trim() || null,
        is_favorite: false,
      }, [['apps']], { success: '已新增应用', errorMessage: '应用保存失败，请稍后重试' });
      // 保存失败时留在表单，已填内容不丢（toast 已提示原因）
      if (!ok) return;
      clearDirty();
      navigate({ to: '/apps' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="新增应用" desc="把一个新的 AI 产品记进台账" />
      {/* onChangeCapture：表单内任何输入变化都算「未保存」，离开前会拦一下 */}
      <div className="max-w-2xl" onChangeCapture={markDirty}>
        <AppForm initial={toFormValue()} onSubmit={submit} busy={busy} submitLabel="保存" />
      </div>
      <UnsavedGuardDialog blocker={blocker} />
    </div>
  );
}
