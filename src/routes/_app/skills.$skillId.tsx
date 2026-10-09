import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Copy, Check, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useSkills, useApps, useSkillLinks, useMutate, replaceLinks } from '../../lib/queries';
import { SKILL_CATEGORIES } from '../../lib/types';
import { PageHeader, RequiredMark, DetailSkeleton, InitialAvatar, EmptyState } from '../../components/bits';
import { copyText } from '../../lib/clipboard';
import { UnsavedGuardDialog, useUnsavedGuard } from '../../components/unsaved-guard';

export const Route = createFileRoute('/_app/skills/$skillId')({
  // ?edit=1：列表页的「编辑」直接进入编辑态，不必先进详情再点编辑
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => ({
    edit: search.edit === true || search.edit === '1' || search.edit === 1,
  }),
  component: SkillDetail,
});

function SkillDetail() {
  const { skillId } = Route.useParams();
  const { edit: editParam } = Route.useSearch();
  const navigate = useNavigate();
  const isNew = skillId === 'new';
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: apps = [] } = useApps();
  const { data: links = [] } = useSkillLinks();
  const { save, remove, invalidate } = useMutate();

  const skill = skills.find((s) => s.id === skillId);
  const [editing, setEditing] = useState(isNew || !!editParam);
  const [name, setName] = useState(skill?.name ?? '');
  const [category, setCategory] = useState(skill?.category ?? 'Prompt 模板');
  const [scene, setScene] = useState(skill?.scene ?? '');
  const [content, setContent] = useState(skill?.content ?? '');
  const [tags, setTags] = useState<string[]>(skill?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [selApps, setSelApps] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // reload 时数据后到：skill 就绪后同步一次表单（按 id 去重，不覆盖用户已输入内容）
  const syncedId = useRef<string | null>(isNew ? 'new' : null);
  useEffect(() => {
    if (!isNew && skill && syncedId.current !== skill.id) {
      syncedId.current = skill.id;
      setName(skill.name);
      setCategory(skill.category);
      setScene(skill.scene ?? '');
      setContent(skill.content ?? '');
      setTags(skill.tags ?? []);
    }
  }, [isNew, skill]);

  const { blocker, markDirty, clearDirty } = useUnsavedGuard();

  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (!isNew && skillsLoading) return <DetailSkeleton />;
  if (!isNew && !skill) return <p className="text-muted-foreground text-sm">技能不存在</p>;
  const curApps = selApps ?? links.filter((l) => l.skill_id === skillId).map((l) => l.app_id);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('请填写技能名称');
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const row = {
        name: name.trim(), category, scene: scene.trim() || null,
        content: content.trim() || null, tags,
        usage_count: skill?.usage_count ?? 0,
      };
      const savedId = isNew ? crypto.randomUUID() : skillId;
      // 乐观更新：编辑场景先把新值写入缓存，切回详情视图即得新值，不闪现旧内容
      const ok = await save('skills', isNew ? { ...row, id: savedId } : { ...skill, ...row }, [['skills']], {
        isNew,
        optimistic: (old) => old.map((s: any) => (s.id === skillId ? { ...s, ...row } : s)),
        success: isNew ? '已新增技能' : '已保存',
        errorMessage: '技能保存失败，请稍后重试',
      });
      // 失败时 toast 已提示，这里保留用户输入、停在表单，不跳转
      if (!ok) return;
      await replaceLinks('skill_app_links', 'skill_id', savedId, curApps);
      invalidate([['skillLinks']]);
      clearDirty();
      if (isNew) {
        navigate({ to: '/skills' });
      } else {
        setEditing(false);
        // 清掉 ?edit=1，避免刷新后又自动进入编辑态
        if (editParam) navigate({ to: '/skills/$skillId', params: { skillId }, search: {}, replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    // 取消＝回到已保存的内容，而不是留着改了一半的值
    if (skill) {
      setName(skill.name);
      setCategory(skill.category);
      setScene(skill.scene ?? '');
      setContent(skill.content ?? '');
      setTags(skill.tags ?? []);
    }
    setError(null);
    clearDirty();
    setEditing(false);
  };

  const removeSkill = async () => {
    if (!(await remove('skills', skillId, [['skills'], ['skillLinks']], { success: '已删除技能' }))) return;
    clearDirty();
    navigate({ to: '/skills' });
  };

  const bumpUsage = async () => {
    if (!skill) return;
    await save('skills', { ...skill, usage_count: skill.usage_count + 1 }, [['skills']], { success: '已记录一次使用' });
  };

  const copyContent = async () => {
    if (!skill?.content) return;
    if (!(await copyText(skill.content, '已复制技能内容'))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); markDirty(); }
    setTagInput('');
  };

  return (
    <div>
      <button type="button" onClick={() => navigate({ to: '/skills' })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} />返回技能列表
      </button>

      {editing || isNew ? (
        <>
          <PageHeader title={isNew ? '新增技能' : '编辑技能'} />
          {/* onChangeCapture：表单内任何输入变化都算「未保存」，离开前会拦一下 */}
          <div className="space-y-5 max-w-2xl" onChangeCapture={markDirty}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill-name">名称<RequiredMark /></Label>
                <Input id="skill-name" ref={nameRef} required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="技能名称" aria-invalid={!!error} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-category">分类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="skill-category"><SelectValue /></SelectTrigger>
                  <SelectContent>{SKILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-scene">适用场景</Label>
              <Input id="skill-scene" value={scene} onChange={(e) => setScene(e.target.value)} placeholder="什么时候用这个技能" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-content">技能内容</Label>
              <Textarea id="skill-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="粘贴完整的 Prompt 或工作流" rows={8} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-tags">标签</Label>
              <div className="flex gap-2">
                <Input id="skill-tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="回车添加"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" className="rounded-full shadow-none" onClick={addTag}>添加</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 rounded-full">{t}
                      <button type="button" aria-label={`移除标签 ${t}`} className="-mr-1 inline-flex h-5 w-5 items-center justify-center"
                        onClick={() => { setTags(tags.filter((x) => x !== t)); markDirty(); }}><X size={12} /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div role="group" aria-label="适用应用">
              <Label>适用应用</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {apps.length === 0 ? <span className="text-sm text-muted-foreground">还没有应用</span> :
                  apps.map((a) => (
                    <button type="button" key={a.id} aria-pressed={curApps.includes(a.id)}
                      onClick={() => { setSelApps(curApps.includes(a.id) ? curApps.filter((x) => x !== a.id) : [...curApps, a.id]); markDirty(); }}
                      className={`px-3 py-1.5 rounded-full text-sm border ${curApps.includes(a.id) ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-muted text-muted-foreground border-transparent'}`}>
                      {a.name}
                    </button>
                  ))}
              </div>
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button disabled={busy} onClick={submit} className="min-w-28 rounded-full shadow-none">{busy ? '保存中…' : '保存'}</Button>
              {!isNew && <Button variant="outline" className="rounded-full shadow-none" onClick={cancelEdit}>取消</Button>}
            </div>
          </div>
        </>
      ) : skill && (
        <>
          {/* 详情 Hero：120px 大封面 + 大标题 + 红色主操作按钮 */}
          <div className="flex items-center gap-5 mb-5">
            <InitialAvatar name={skill.name} size={120} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-muted-foreground">
                {skill.category}
                {skill.tags.length > 0 ? ` · ${skill.tags.join('、')}` : ''}
              </p>
              <h1 className="text-[34px] leading-[1.15] font-extrabold tracking-tight mt-1 break-words">{skill.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {skill.content ? (
              <button
                onClick={copyContent}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '已复制' : '复制全文'}
              </button>
            ) : null}
            <Button variant="outline" className="rounded-full shadow-none" onClick={() => setEditing(true)}>
              <Pencil size={14} />编辑
            </Button>
            {/* 移动端列表行不显示删除，详情页必须保留入口 */}
            <Button variant="outline" className="rounded-full shadow-none text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
              <Trash2 size={14} />删除
            </Button>
          </div>

          <div className="space-y-6 max-w-3xl">
            {skill.scene ? <p className="text-[15px] text-muted-foreground">适用场景：{skill.scene}</p> : null}
            {skill.content ? (
              <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">{skill.content}</pre>
            ) : (
              <EmptyState title="还没有内容" desc="编辑这个技能，把 Prompt 写进来" />
            )}
            <div className="flex items-center gap-4 pt-2">
              <Button variant="outline" className="rounded-full shadow-none" onClick={bumpUsage}>记一次使用</Button>
              <span className="text-sm text-muted-foreground">已使用 {skill.usage_count} 次</span>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除技能？</AlertDialogTitle>
            <AlertDialogDescription>「{skill?.name}」将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive" onClick={removeSkill}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnsavedGuardDialog blocker={blocker} />
    </div>
  );
}
