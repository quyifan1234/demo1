import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Copy, Check, Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useSkills, useApps, useSkillLinks, useMutate, replaceLinks } from '../../lib/queries';
import { SKILL_CATEGORIES } from '../../lib/types';
import { PageHeader, RequiredMark, DetailSkeleton, InitialAvatar, EmptyState } from '../../components/bits';
import { X } from 'lucide-react';

export const Route = createFileRoute('/_app/skills/$skillId')({
  component: SkillDetail,
});

function SkillDetail() {
  const { skillId } = Route.useParams();
  const navigate = useNavigate();
  const isNew = skillId === 'new';
  const { data: skills = [], isLoading: skillsLoading } = useSkills();
  const { data: apps = [] } = useApps();
  const { data: links = [] } = useSkillLinks();
  const { save, invalidate } = useMutate();

  const skill = skills.find((s) => s.id === skillId);
  const [editing, setEditing] = useState(isNew);
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

  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (!isNew && skillsLoading) return <DetailSkeleton />;
  if (!isNew && !skill) return <p className="text-muted-foreground text-sm">技能不存在</p>;
  const curApps = selApps ?? links.filter((l) => l.skill_id === skillId).map((l) => l.app_id);

  const submit = async () => {
    setError(null);
    if (!name.trim()) { setError('请填写技能名称'); return; }
    setBusy(true);
    try {
      const row = {
        name: name.trim(), category, scene: scene.trim() || null,
        content: content.trim() || null, tags,
        usage_count: skill?.usage_count ?? 0,
      };
      const savedId = isNew ? crypto.randomUUID() : skillId;
      // 乐观更新：编辑场景先把新值写入缓存，切回详情视图即得新值，不闪现旧内容
      await save('skills', isNew ? { ...row, id: savedId } : { ...skill, ...row }, [['skills']], {
        isNew,
        optimistic: (old) => old.map((s: any) => (s.id === skillId ? { ...s, ...row } : s)),
      });
      await replaceLinks('skill_app_links', 'skill_id', savedId, curApps);
      invalidate([['skillLinks']]);
      if (isNew) navigate({ to: '/skills' });
      else setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  };

  const bumpUsage = async () => {
    if (!skill) return;
    await save('skills', { ...skill, usage_count: skill.usage_count + 1 }, [['skills']]);
  };

  const copyContent = async () => {
    if (!skill?.content) return;
    try { await navigator.clipboard.writeText(skill.content); } catch { /* 忽略 */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  return (
    <div>
      <button onClick={() => navigate({ to: '/skills' })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={15} />返回技能列表
      </button>

      {editing || isNew ? (
        <>
          <PageHeader title={isNew ? '新增技能' : '编辑技能'} />
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>名称<RequiredMark /></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="技能名称" />
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SKILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>适用场景</Label>
              <Input value={scene} onChange={(e) => setScene(e.target.value)} placeholder="什么时候用这个技能" />
            </div>
            <div className="space-y-2">
              <Label>技能内容</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="粘贴完整的 Prompt 或工作流" rows={8} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="回车添加"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" className="rounded-full shadow-none" onClick={addTag}>添加</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 rounded-full">{t}
                      <button
                        type="button"
                        aria-label={`删除标签 ${t}`}
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>适用应用</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {apps.length === 0 ? <span className="text-sm text-muted-foreground">还没有应用</span> :
                  apps.map((a) => (
                    <button key={a.id} onClick={() => setSelApps(curApps.includes(a.id) ? curApps.filter((x) => x !== a.id) : [...curApps, a.id])}
                      className={`px-3 py-1.5 rounded-full text-sm border ${curApps.includes(a.id) ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-muted text-muted-foreground border-transparent'}`}>
                      {a.name}
                    </button>
                  ))}
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button disabled={busy} onClick={submit} className="min-w-28 rounded-full shadow-none">{busy ? '保存中…' : '保存'}</Button>
              {!isNew && <Button variant="outline" className="rounded-full shadow-none" onClick={() => setEditing(false)}>取消</Button>}
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
    </div>
  );
}
