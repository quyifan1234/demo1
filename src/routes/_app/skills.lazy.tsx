import React, { useMemo, useState } from 'react';
import { createLazyFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useSkills, useMutate } from '../../lib/queries';
import { toast } from 'sonner';
import { SKILL_CATEGORIES } from '../../lib/types';
import { PageHeader, EmptyState, Highlight, QueryError, InitialAvatar } from '../../components/bits';
import { CapsuleSearch, FilterChip, RowList, RowChevron, RowAction, RowSkeleton } from '../../components/rows';

import { memo } from 'react';

const SkillRow = memo(({ s, q, copied, copyContent, setDelId }: {
  s: any;
  q: string;
  copied: boolean;
  copyContent: (id: string, content: string) => void;
  setDelId: (id: string) => void;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 px-1 py-3">
      <Link to="/skills/$skillId" params={{ skillId: s.id }} className="flex min-w-0 flex-1 items-center gap-3">
        <InitialAvatar name={s.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px]"><Highlight text={s.name} query={q} /></div>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {s.category}
            {s.scene ? ` · ${s.scene}` : ''}
            {s.tags.length > 0 ? ` · ${s.tags.slice(0, 4).join('、')}` : ''}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">已使用 {s.usage_count} 次</p>
        </div>
      </Link>
      <div className="flex shrink-0 items-center">
        {s.content ? (
          <RowAction title={copied ? '已复制' : '复制内容'} onClick={() => copyContent(s.id, s.content!)}>
            {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
          </RowAction>
        ) : null}
        <RowAction title="编辑" className="hidden sm:flex"
          onClick={() => navigate({ to: '/skills/$skillId', params: { skillId: s.id } })}>
          <Pencil size={16} />
        </RowAction>
        <RowAction title="删除" danger className="hidden sm:flex" onClick={() => setDelId(s.id)}>
          <Trash2 size={16} />
        </RowAction>
        <Link to="/skills/$skillId" params={{ skillId: s.id }} aria-label="查看详情" className="flex h-9 w-9 items-center justify-center">
          <RowChevron />
        </Link>
      </div>
    </div>
  );
});

export const Route = createLazyFileRoute('/_app/skills')({
  component: SkillsPage,
});

function SkillsPage() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const isList = matchRoute({ to: '/skills', fuzzy: false });
  const { data: skills = [], isLoading, isError, refetch } = useSkills();
  const { remove } = useMutate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [delId, setDelId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return skills.filter((s) => {
      if (cat !== '全部' && s.category !== cat) return false;
      return terms.every((t) =>
        s.name.toLowerCase().includes(t) || (s.content ?? '').toLowerCase().includes(t) ||
        s.tags.join(' ').toLowerCase().includes(t) || (s.scene ?? '').toLowerCase().includes(t));
    });
  }, [skills, q, cat]);

  const copyContent = React.useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制');
    } catch {
      toast.error('复制失败，请重试');
      return;
    }
    setCopied(id);
    setTimeout(() => setCopied((p) => (p === id ? null : p)), 1500);
  }, []);

  const handleDel = React.useCallback((id: string) => setDelId(id), []);

  if (!isList) return <Outlet />;

  return (
    <div>
      <PageHeader title="技能" desc="沉淀好用的 Prompt 模板与工作流"
        action={<Button className="rounded-full shadow-none" onClick={() => navigate({ to: '/skills/$skillId', params: { skillId: 'new' } })}><Plus size={16} />新增</Button>} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CapsuleSearch value={q} onChange={setQ} placeholder="搜索名称、内容、标签" />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['全部', ...SKILL_CATEGORIES].map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <RowSkeleton rows={3} />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="还没有技能" desc="把反复验证好用的 Prompt 存成技能，随时复用"
          action={<Button variant="link" className="text-[17px]" onClick={() => navigate({ to: '/skills/$skillId', params: { skillId: 'new' } })}>新增技能</Button>} />
      ) : (
        <RowList>
          {filtered.map((s) => (
            <SkillRow key={s.id} s={s} q={q} copied={copied === s.id} copyContent={copyContent} setDelId={handleDel} />
          ))}
        </RowList>
      )}

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除技能？</AlertDialogTitle>
            <AlertDialogDescription>该技能将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={() => delId && remove('skills', delId, [['skills'], ['skillLinks']]).then(() => setDelId(null))}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
