import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { useApps, useKeys, useSkills, useKeyLinks, useSkillLinks, useMutate, replaceLinks } from '../../lib/queries';
import { PageHeader, DetailSkeleton } from '../../components/bits';
import { AppForm, toFormValue, type AppFormValue } from '../../components/app-form';

export const Route = createFileRoute('/_app/apps/$appId/edit')({
  component: EditApp,
});

function EditApp() {
  const { appId } = Route.useParams();
  const navigate = useNavigate();
  const { data: apps = [], isLoading: appsLoading } = useApps();
  const { data: keys = [] } = useKeys();
  const { data: skills = [] } = useSkills();
  const { data: keyLinks = [] } = useKeyLinks();
  const { data: skillLinks = [] } = useSkillLinks();
  const { save, invalidate } = useMutate();
  const [busy, setBusy] = useState(false);
  const [selKeys, setSelKeys] = useState<string[] | null>(null);
  const [selSkills, setSelSkills] = useState<string[] | null>(null);

  const app = apps.find((a) => a.id === appId);
  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (appsLoading) return <DetailSkeleton />;
  if (!app) return <p className="text-muted-foreground text-sm">应用不存在</p>;

  const curKeys = selKeys ?? keyLinks.filter((l) => l.app_id === appId).map((l) => l.key_id);
  const curSkills = selSkills ?? skillLinks.filter((l) => l.app_id === appId).map((l) => l.skill_id);
  const toggle = (list: string[], set: (x: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const submit = async (v: AppFormValue) => {
    setBusy(true);
    try {
      const patch = {
        name: v.name.trim(), url: v.url.trim() || null, category: v.category,
        description: v.description.trim() || null, specialties: v.specialties,
        quota_total: v.quota_total === '' ? null : Number(v.quota_total),
        quota_remaining: v.quota_remaining === '' ? null : Number(v.quota_remaining),
        quota_unit: v.quota_unit, quota_updated_at: new Date().toISOString(),
        status: v.status, rating: v.rating, note: v.note.trim() || null,
      };
      // 乐观更新：保存前先把新值写入缓存，详情页挂载即得新值，不闪现旧标题
      await save('ai_apps', { ...app, ...patch }, [['apps']], {
        optimistic: (old) => old.map((a: any) => (a.id === appId ? { ...a, ...patch } : a)),
      });
      await replaceLinks('app_key_links', 'key_id', appId, curKeys);
      await replaceLinks('skill_app_links', 'skill_id', appId, curSkills);
      invalidate([['keyLinks'], ['skillLinks']]);
      navigate({ to: '/apps/$appId', params: { appId } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate({ to: '/apps/$appId', params: { appId } })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={15} />返回详情
      </button>
      <PageHeader title="编辑应用" />
      <div className="max-w-2xl">
        {/* key 保证 reload 时数据就绪后表单重新挂载，initial 取到真实值 */}
        <AppForm key={app.id} initial={toFormValue(app)} onSubmit={submit} busy={busy} submitLabel="保存" />
        <div className="mt-8 space-y-5 max-w-2xl">
          <div>
            <Label>关联密钥</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {keys.length === 0 ? <span className="text-sm text-muted-foreground">还没有密钥</span> :
                keys.map((k) => (
                  <button key={k.id} onClick={() => toggle(curKeys, setSelKeys, k.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${curKeys.includes(k.id) ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-muted text-muted-foreground border-transparent'}`}>
                    {k.name}
                  </button>
                ))}
            </div>
          </div>
          <div>
            <Label>关联技能</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.length === 0 ? <span className="text-sm text-muted-foreground">还没有技能</span> :
                skills.map((s) => (
                  <button key={s.id} onClick={() => toggle(curSkills, setSelSkills, s.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${curSkills.includes(s.id) ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-muted text-muted-foreground border-transparent'}`}>
                    {s.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
