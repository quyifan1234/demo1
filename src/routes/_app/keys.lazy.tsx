import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createLazyFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Eye, EyeOff, Copy, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useKeys, useApps, useKeyLinks, useMutate } from '../../lib/queries';
import { PageHeader, EmptyState, MaskedKey, Highlight, QueryError, InitialAvatar } from '../../components/bits';
import { CapsuleSearch, FilterChip, RowList, RowChevron, RowAction, RowSkeleton } from '../../components/rows';
import { toast } from 'sonner';

import { memo } from 'react';

const KeyRow = memo(({ k, q, appNames, revealed, copied, onEye, copy, save, setDelId }: {
  k: any;
  q: string;
  appNames: string[];
  revealed: boolean;
  copied: boolean;
  onEye: (id: string) => void;
  copy: (id: string, value: string) => void;
  save: (table: string, data: any, tags: string[][]) => void;
  setDelId: (id: string) => void;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 px-1 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <InitialAvatar name={k.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[16px] font-medium"><Highlight text={k.name} query={q} /></span>
            {!k.is_active && <span className="shrink-0 text-[13px] text-muted-foreground">已停用</span>}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {k.platform ? <Highlight text={k.platform} query={q} /> : '未分类平台'}
            {appNames.length > 0 ? ` · ${appNames.join('、')}` : ''}
          </p>
          <div className="mt-1.5"><MaskedKey value={k.key_value} revealed={revealed} /></div>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <Switch checked={k.is_active} onCheckedChange={(v) => save('api_keys', { ...k, is_active: v }, [['keys']])} title={k.is_active ? '停用' : '启用'} />
        <RowAction title={revealed ? '隐藏' : '显示 15 秒'} onClick={() => onEye(k.id)}>
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </RowAction>
        <RowAction title="复制" onClick={() => copy(k.id, k.key_value)}>
          {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
        </RowAction>
        <RowAction title="编辑" onClick={() => navigate({ to: '/keys/$keyId', params: { keyId: k.id } })}>
          <Pencil size={16} />
        </RowAction>
        <RowAction title="删除" danger onClick={() => setDelId(k.id)}>
          <Trash2 size={16} />
        </RowAction>
        <Link to="/keys/$keyId" params={{ keyId: k.id }} aria-label="编辑密钥" className="hidden h-9 w-9 items-center justify-center sm:flex">
          <RowChevron />
        </Link>
      </div>
    </div>
  );
});

export const Route = createLazyFileRoute('/_app/keys')({
  component: KeysPage,
});

function KeysPage() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const isList = matchRoute({ to: '/keys', fuzzy: false });
  const { data: keys = [], isLoading, isError, refetch } = useKeys();
  const { data: apps = [] } = useApps();
  const { data: links = [] } = useKeyLinks();
  const { save, remove } = useMutate();
  const [q, setQ] = useState('');
  const [platform, setPlatform] = useState('全部');
  const [revealed, setRevealed] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const t = timers.current;
    return () => { t.forEach(clearTimeout); t.clear(); };
  }, []);

  const platforms = useMemo(() => ['全部', ...Array.from(new Set(keys.map((k) => k.platform).filter(Boolean) as string[]))], [keys]);

  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return keys.filter((k) => {
      if (platform !== '全部' && k.platform !== platform) return false;
      return terms.every((t) => k.name.toLowerCase().includes(t) || (k.platform ?? '').toLowerCase().includes(t));
    });
  }, [keys, q, platform]);

  const clearTimer = React.useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const doReveal = React.useCallback((id: string) => {
    clearTimer(id);
    setRevealed((p) => [...p, id]);
    timers.current.set(id, setTimeout(() => {
      timers.current.delete(id);
      setRevealed((p) => p.filter((x) => x !== id));
    }, 15000));
  }, [clearTimer]);

  const onEye = React.useCallback((id: string) => {
    if (revealed.includes(id)) { clearTimer(id); setRevealed((p) => p.filter((x) => x !== id)); }
    else setConfirmId(id);
  }, [revealed, clearTimer]);

  const copy = React.useCallback(async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('已复制');
    } catch {
      toast.error('复制失败，请重试');
      return;
    }
    setCopied(id);
    setTimeout(() => setCopied((p) => (p === id ? null : p)), 1500);
  }, []);

  const appNames = React.useCallback((keyId: string) =>
    links.filter((l) => l.key_id === keyId).map((l) => apps.find((a) => a.id === l.app_id)?.name).filter(Boolean) as string[],
  [links, apps]);

  const handleDel = React.useCallback((id: string) => setDelId(id), []);

  if (!isList) return <Outlet />;

  return (
    <div>
      <PageHeader title="密钥" desc="默认打码显示，仅你本人可见"
        action={<Button className="rounded-full shadow-none" onClick={() => navigate({ to: '/keys/$keyId', params: { keyId: 'new' } })}><Plus size={16} />新增</Button>} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <CapsuleSearch value={q} onChange={setQ} placeholder="搜索密钥名称、平台" />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {platforms.map((p) => (
          <FilterChip key={p} active={platform === p} onClick={() => setPlatform(p)}>{p}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <RowSkeleton rows={3} />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="还没有密钥" desc="把各平台的 API Key 集中收好，需要时一键复制"
          action={<Button variant="link" className="text-[17px]" onClick={() => navigate({ to: '/keys/$keyId', params: { keyId: 'new' } })}>新增密钥</Button>} />
      ) : (
        <RowList>
          {filtered.map((k) => (
            <KeyRow key={k.id} k={k} q={q} appNames={appNames(k.id)} revealed={revealed.includes(k.id)} copied={copied === k.id} onEye={onEye} copy={copy} save={save} setDelId={handleDel} />
          ))}
        </RowList>
      )}

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>显示完整密钥？</AlertDialogTitle>
            <AlertDialogDescription>展示 15 秒后将自动恢复打码，请勿外传。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmId && doReveal(confirmId)}>显示</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除密钥？</AlertDialogTitle>
            <AlertDialogDescription>该密钥及其与应用的关联将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive"
              onClick={() => delId && remove('api_keys', delId, [['keys'], ['keyLinks']]).then(() => setDelId(null))}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
