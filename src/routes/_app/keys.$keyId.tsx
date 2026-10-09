import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { useKeys, useApps, useKeyLinks, useMutate, replaceLinks } from '../../lib/queries';
import { PageHeader, RequiredMark, DetailSkeleton } from '../../components/bits';
import { UnsavedGuardDialog, useUnsavedGuard } from '../../components/unsaved-guard';

export const Route = createFileRoute('/_app/keys/$keyId')({
  component: KeyDetail,
});

function KeyDetail() {
  const { keyId } = Route.useParams();
  const navigate = useNavigate();
  const isNew = keyId === 'new';
  const { data: keys = [], isLoading: keysLoading } = useKeys();
  const { data: apps = [] } = useApps();
  const { data: links = [] } = useKeyLinks();
  const { save, remove, invalidate } = useMutate();

  const key = keys.find((k) => k.id === keyId);
  const [name, setName] = useState(key?.name ?? '');
  const [platform, setPlatform] = useState(key?.platform ?? '');
  const [value, setValue] = useState(key?.key_value ?? '');
  const [note, setNote] = useState(key?.note ?? '');
  const [active, setActive] = useState(key?.is_active ?? true);
  const [selApps, setSelApps] = useState<string[] | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  // 未保存标记：只有用户真的改过东西才拦截跳转，避免误报
  const nameRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  // reload 时数据后到：key 就绪后同步一次表单（按 id 去重，不覆盖用户已输入内容）
  const syncedId = useRef<string | null>(isNew ? 'new' : null);
  useEffect(() => {
    if (!isNew && key && syncedId.current !== key.id) {
      syncedId.current = key.id;
      setName(key.name);
      setPlatform(key.platform ?? '');
      setValue(key.key_value);
      setNote(key.note ?? '');
      setActive(key.is_active);
    }
  }, [isNew, key]);

  const { blocker, markDirty, clearDirty } = useUnsavedGuard();

  // 加载门控：数据就绪前只渲染骨架，绝不先渲染"不存在"（修复 reload 闪现 bug）
  if (!isNew && keysLoading) return <DetailSkeleton />;
  if (!isNew && !key) return <p className="text-muted-foreground text-sm">密钥不存在</p>;
  const curApps = selApps ?? links.filter((l) => l.key_id === keyId).map((l) => l.app_id);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('请填写密钥名称');
      nameRef.current?.focus();
      return;
    }
    if (!value.trim()) {
      setError('请填写密钥内容');
      valueRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const row = {
        name: name.trim(), platform: platform.trim() || null,
        key_value: value.trim(), note: note.trim() || null, is_active: active,
      };
      const savedId = isNew ? crypto.randomUUID() : keyId;
      // 乐观更新：编辑场景先把新值写入缓存，返回列表即得新值，不闪现旧内容
      const ok = await save('api_keys', isNew ? { ...row, id: savedId } : { ...key, ...row }, [['keys']], {
        isNew,
        optimistic: (old) => old.map((k: any) => (k.id === keyId ? { ...k, ...row } : k)),
        success: isNew ? '已新增密钥' : '已保存',
        errorMessage: '密钥保存失败，请稍后重试',
      });
      // 失败时 toast 已提示：保留输入、停在表单，不跳转
      if (!ok) return;
      await replaceLinks('app_key_links', 'key_id', savedId, curApps);
      invalidate([['keyLinks']]);
      clearDirty();
      navigate({ to: '/keys' });
    } finally {
      setBusy(false);
    }
  };

  const removeKey = async () => {
    if (!(await remove('api_keys', keyId, [['keys'], ['keyLinks']], { success: '已删除密钥' }))) return;
    clearDirty();
    navigate({ to: '/keys' });
  };

  return (
    <div>
      <button type="button" onClick={() => navigate({ to: '/keys' })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={15} />返回密钥列表
      </button>
      <PageHeader title={isNew ? '新增密钥' : '编辑密钥'} />
      {/* onChangeCapture：表单内任何输入变化都算「未保存」，离开前会拦一下 */}
      <div className="space-y-5 max-w-2xl" onChangeCapture={markDirty}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">名称<RequiredMark /></Label>
            <Input id="key-name" ref={nameRef} required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="密钥名称" aria-invalid={!!error && !name.trim()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key-platform">所属平台</Label>
            <Input id="key-platform" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="如 OpenAI" list="platforms" />
            <datalist id="platforms">{Array.from(new Set(keys.map((k) => k.platform).filter(Boolean))).map((p) => <option key={p as string} value={p as string} />)}</datalist>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="key-value">密钥内容<RequiredMark /></Label>
          <div className="relative">
            <Input id="key-value" ref={valueRef} required type={show ? 'text' : 'password'} value={value} onChange={(e) => setValue(e.target.value)}
              placeholder="粘贴密钥" className="pr-10 font-mono" aria-invalid={!!error && !value.trim()} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setShow(!show)} aria-label={show ? '隐藏密钥' : '显示密钥'} title={show ? '隐藏' : '显示'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="key-note">备注</Label>
          <Textarea id="key-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="用途说明" rows={2} />
        </div>
        <div role="group" aria-label="绑定应用">
          <Label>绑定应用</Label>
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
        <div className="flex items-center gap-2">
          <Switch id="key-active" checked={active} onCheckedChange={(v) => { setActive(v); markDirty(); }} />
          <Label htmlFor="key-active">启用</Label>
        </div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={busy} onClick={submit} className="min-w-28 rounded-full shadow-none">{busy ? '保存中…' : '保存'}</Button>
          {/* 列表行在移动端不显示删除，详情页保留入口 */}
          {!isNew && (
            <Button variant="outline" className="rounded-full shadow-none text-destructive hover:text-destructive" onClick={() => setDelOpen(true)}>
              <Trash2 size={14} />删除密钥
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除密钥？</AlertDialogTitle>
            <AlertDialogDescription>「{key?.name}」及其与应用的关联将被删除，不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive" onClick={removeKey}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnsavedGuardDialog blocker={blocker} />
    </div>
  );
}
