import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Pencil, Trash2, Plus, ExternalLink, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useApps, useKeys, useSkills, useOutputs, useKeyLinks, useSkillLinks, usePrefs, useMutate } from '../../lib/queries';
import { OUTPUT_KINDS } from '../../lib/types';
import { fmtDate } from '../../lib/format';
import { InitialAvatar, QuotaBar, Stars, EmptyState, DetailSkeleton } from '../../components/bits';
import { RowList, RowChevron, SectionTitle, RowAction } from '../../components/rows';

export const Route = createFileRoute('/_app/apps/$appId')({
  component: AppDetail,
});

function AppDetail() {
  const { appId } = Route.useParams();
  const navigate = useNavigate();
  const { data: apps = [], isLoading: appsLoading } = useApps();
  const { data: keys = [] } = useKeys();
  const { data: skills = [] } = useSkills();
  const { data: outputs = [] } = useOutputs();
  const { data: keyLinks = [] } = useKeyLinks();
  const { data: skillLinks = [] } = useSkillLinks();
  const { data: prefs } = usePrefs();
  const { save, remove } = useMutate();

  const [consumeOpen, setConsumeOpen] = useState(false);
  const [consumeAmt, setConsumeAmt] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [outOpen, setOutOpen] = useState(false);
  const [outTitle, setOutTitle] = useState('');
  const [outKind, setOutKind] = useState('文案');
  const [outContent, setOutContent] = useState('');

  const app = apps.find((a) => a.id === appId);
  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (appsLoading) return <DetailSkeleton />;
  if (!app) return <p className="text-muted-foreground text-sm">应用不存在或已被删除</p>;
  const threshold = prefs?.quota_threshold ?? 20;

  const linkedKeys = keyLinks.filter((l) => l.app_id === appId).map((l) => keys.find((k) => k.id === l.key_id)).filter(Boolean);
  const linkedSkills = skillLinks.filter((l) => l.app_id === appId).map((l) => skills.find((s) => s.id === l.skill_id)).filter(Boolean);
  const appOutputs = outputs.filter((o) => o.app_id === appId);

  const updateQuota = async (remaining: number | null, total?: number | null) => {
    await save('ai_apps', {
      ...app,
      quota_remaining: remaining,
      quota_total: total ?? app.quota_total,
      quota_updated_at: new Date().toISOString(),
    }, [['apps']], {
      optimistic: (old) => old.map((a: any) => a.id === appId
        ? { ...a, quota_remaining: remaining, quota_total: total ?? a.quota_total, quota_updated_at: new Date().toISOString() }
        : a),
    });
  };

  const consume = async (amt: number) => {
    const cur = app.quota_remaining ?? 0;
    await updateQuota(Math.max(0, cur - amt));
    setConsumeOpen(false);
    setConsumeAmt('');
  };

  const addOutput = async () => {
    if (!outTitle.trim()) return;
    await save('app_outputs', { app_id: appId, title: outTitle.trim(), kind: outKind, content: outContent.trim() || null }, [['outputs']]);
    setOutOpen(false); setOutTitle(''); setOutContent('');
  };

  return (
    <div>
      <button onClick={() => navigate({ to: '/apps' })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} />返回应用列表
      </button>

      {/* 详情 Hero：120px 大封面 + 大标题 + 红色主操作按钮 */}
      <div className="flex items-center gap-5 mb-5">
        <InitialAvatar name={app.name} size={120} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap text-[13px] text-muted-foreground">
            <span>{app.category}</span>
            <span>·</span>
            <span>{app.status}</span>
            {app.is_favorite && <Star size={13} className="text-primary" fill="currentColor" />}
            <Stars value={app.rating} />
          </div>
          <h1 className="text-[34px] leading-[1.15] font-extrabold tracking-tight mt-1 break-words">{app.name}</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-10">
        {app.url ? (
          <a href={app.url} target="_blank" rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground">
            <ExternalLink size={16} />打开
          </a>
        ) : null}
        <Button variant="outline" className="rounded-full shadow-none" onClick={() => navigate({ to: '/apps/$appId/edit', params: { appId } })}>
          <Pencil size={14} />编辑
        </Button>
        <Button variant="outline" className="rounded-full shadow-none text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
          <Trash2 size={14} />删除
        </Button>
      </div>

      <div className="max-w-3xl">
        {app.description ? <p className="text-[15px] leading-relaxed mb-6">{app.description}</p> : null}
        {app.specialties.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {app.specialties.map((t) => <span key={t} className="text-[13px] bg-muted px-2.5 py-1 rounded-full">{t}</span>)}
          </div>
        )}
        {(app.url || app.note) && (
          <div className="flex items-center gap-4 mb-10 text-sm flex-wrap">
            {app.url && (
              <div className="flex items-center gap-1 min-w-0">
                <span className="min-w-0 truncate text-muted-foreground" title={app.url}>
                  {app.url.replace(/^https?:\/\//, '')}
                </span>
                <a href={app.url} target="_blank" rel="noreferrer" title="在新标签页打开"
                  aria-label="在新标签页打开"
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0">
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
            {app.note ? <span className="text-muted-foreground min-w-0 truncate" title={app.note}>备注：{app.note}</span> : null}
          </div>
        )}

        <SectionTitle>额度</SectionTitle>
        <div className="mb-10 max-w-md">
          <QuotaBar remaining={app.quota_remaining} total={app.quota_total} thresholdPct={threshold} unit={app.quota_unit} />
          {app.quota_updated_at && <p className="text-xs text-muted-foreground mt-2">上次更新：{fmtDate(app.quota_updated_at)}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" variant="outline" className="rounded-full shadow-none" onClick={() => consume(1)}>记一次消耗</Button>
            <Button size="sm" variant="outline" className="rounded-full shadow-none" onClick={() => setConsumeOpen(true)}>自定义扣减</Button>
            <Button size="sm" variant="outline" className="rounded-full shadow-none" onClick={() => setResetOpen(true)}>重置额度</Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 mt-8">
          <h2 className="text-[13px] font-semibold text-muted-foreground">产物（{appOutputs.length}）</h2>
          <Button size="sm" variant="link" className="text-[15px]" onClick={() => setOutOpen(true)}><Plus size={14} />添加产物</Button>
        </div>
        {appOutputs.length === 0 ? (
          <EmptyState title="还没有产物" desc="把用这个应用产出的好结果存下来" />
        ) : (
          <RowList className="mb-10">
            {appOutputs.map((o) => (
              <div key={o.id} className="px-1 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-[15px]">{o.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{o.kind}</Badge>
                  </div>
                  <RowAction title="删除产物" danger onClick={() => remove('app_outputs', o.id, [['outputs']])}>
                    <Trash2 size={14} />
                  </RowAction>
                </div>
                {o.content ? <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{o.content}</p> : null}
                {o.asset_url ? <a href={o.asset_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">查看附件</a> : null}
              </div>
            ))}
          </RowList>
        )}

        <SectionTitle>关联密钥（{linkedKeys.length}）</SectionTitle>
        {linkedKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-10">暂无，去密钥页绑定</p>
        ) : (
          <RowList className="mb-10">
            {linkedKeys.map((k) => k && (
              <Link key={k.id} to="/keys/$keyId" params={{ keyId: k.id }} className="flex items-center gap-3 px-1 py-3">
                <InitialAvatar name={k.name} size={40} />
                <span className="min-w-0 flex-1 truncate text-[15px]">{k.name}</span>
                <span className="shrink-0 text-[13px] text-muted-foreground">{k.platform ?? '未分类'}</span>
                <RowChevron />
              </Link>
            ))}
          </RowList>
        )}

        <SectionTitle>关联技能（{linkedSkills.length}）</SectionTitle>
        {linkedSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-10">暂无，去技能页绑定</p>
        ) : (
          <RowList className="mb-10">
            {linkedSkills.map((s) => s && (
              <Link key={s.id} to="/skills/$skillId" params={{ skillId: s.id }} className="flex items-center gap-3 px-1 py-3">
                <InitialAvatar name={s.name} size={40} />
                <span className="min-w-0 flex-1 truncate text-[15px]">{s.name}</span>
                <span className="shrink-0 text-[13px] text-muted-foreground">{s.category}</span>
                <RowChevron />
              </Link>
            ))}
          </RowList>
        )}

        <p className="text-xs text-muted-foreground">更新于 {fmtDate(app.updated_at)}</p>
      </div>

      <Dialog open={consumeOpen} onOpenChange={setConsumeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>自定义扣减</DialogTitle></DialogHeader>
          <Input placeholder="扣减数量" inputMode="decimal" value={consumeAmt} onChange={(e) => setConsumeAmt(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeOpen(false)}>取消</Button>
            <Button onClick={() => { const n = Number(consumeAmt); if (!Number.isNaN(n) && n >= 0) consume(n); }}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>重置额度</AlertDialogTitle>
            <AlertDialogDescription>将剩余额度恢复为总额度（{app.quota_total ?? '未设置'} {app.quota_unit}）。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateQuota(app.quota_total)}>恢复满额</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>删除应用？</AlertDialogTitle>
            <AlertDialogDescription>「{app.name}」及其 {appOutputs.length} 条产物记录将被删除，不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={async () => { await remove('ai_apps', appId, [['apps'], ['outputs']], { optimistic: (old) => old.filter((a: any) => a.id !== appId) }); navigate({ to: '/apps' }); }}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={outOpen} onOpenChange={setOutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>添加产物</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="产物名称" value={outTitle} onChange={(e) => setOutTitle(e.target.value)} />
            <Select value={outKind} onValueChange={setOutKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OUTPUT_KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="内容或链接" value={outContent} onChange={(e) => setOutContent(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutOpen(false)}>取消</Button>
            <Button onClick={addOutput}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
