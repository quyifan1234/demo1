import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutate } from '../../lib/queries';
import { PageHeader } from '../../components/bits';
import { AppForm, toFormValue, type AppFormValue } from '../../components/app-form';

export const Route = createFileRoute('/_app/apps/new')({
  component: NewApp,
});

function NewApp() {
  const navigate = useNavigate();
  const { save } = useMutate();
  const [busy, setBusy] = useState(false);

  const submit = async (v: AppFormValue) => {
    setBusy(true);
    try {
      await save('ai_apps', {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, specialties: v.specialties,
        quota_total: v.quota_total === '' ? null : Number(v.quota_total),
        quota_remaining: v.quota_remaining === '' ? null : Number(v.quota_remaining),
        quota_unit: v.quota_unit, quota_updated_at: new Date().toISOString(),
        status: v.status, rating: v.rating, note: v.note.trim() || null,
        is_favorite: false,
      }, [['apps']]);
      navigate({ to: '/apps' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="新增应用" desc="把一个新的 AI 产品记进台账" />
      <div className="max-w-2xl">
        <AppForm initial={toFormValue()} onSubmit={submit} busy={busy} submitLabel="保存" />
      </div>
    </div>
  );
}
