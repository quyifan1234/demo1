import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X, Star } from 'lucide-react';
import { RequiredMark } from './bits';
import { ASSET_CATEGORIES, type Asset } from '../lib/types';

export interface AssetFormValue {
  name: string; url: string; category: string; description: string;
  tags: string[]; is_favorite: boolean;
}

export function toAssetFormValue(a?: Asset): AssetFormValue {
  return {
    name: a?.name ?? '', url: a?.url ?? '', category: a?.category ?? '其他',
    description: a?.description ?? '', tags: a?.tags ?? [],
    is_favorite: a?.is_favorite ?? false,
  };
}

export function AssetForm({ initial, onSubmit, busy, submitLabel }: {
  initial: AssetFormValue; onSubmit: (v: AssetFormValue) => Promise<void>; busy: boolean; submitLabel: string;
}) {
  const [v, setV] = useState(initial);
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const set = (k: keyof AssetFormValue, val: unknown) => setV((p) => ({ ...p, [k]: val }));

  const submit = async () => {
    const errs: string[] = [];
    if (!v.name.trim()) errs.push('请填写素材名称');
    if (v.url && !/^https?:\/\//.test(v.url)) errs.push('网址需以 http:// 或 https:// 开头');
    setErrors(errs);
    if (errs.length > 0) return;
    await onSubmit(v);
  };

  const addTag = () => {
    const t = tag.trim();
    if (t && !v.tags.includes(t)) set('tags', [...v.tags, t]);
    setTag('');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称<RequiredMark /></Label>
          <Input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="素材名称" autoFocus />
        </div>
        <div className="space-y-2">
          <Label>分类</Label>
          <Select value={v.category} onValueChange={(x) => set('category', x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ASSET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>网址</Label>
        <Input value={v.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" />
      </div>
      <div className="space-y-2">
        <Label>描述</Label>
        <Textarea value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="这个素材是做什么的、好在哪里" rows={3} />
      </div>
      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex gap-2">
          <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="回车添加"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <Button type="button" variant="outline" onClick={addTag}>添加</Button>
        </div>
        {v.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {v.tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">{t}
                <button type="button" aria-label="Remove tag" onClick={() => set('tags', v.tags.filter((x) => x !== t))}><X size={12} /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <button type="button" onClick={() => set('is_favorite', !v.is_favorite)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Star size={16} className={v.is_favorite ? 'text-primary' : ''} fill={v.is_favorite ? 'currentColor' : 'none'} />
        {v.is_favorite ? '已收藏' : '收藏'}
      </button>
      {errors.length > 0 && (
        <div className="text-sm text-destructive space-y-1">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}
      <div>
        <Button disabled={busy} onClick={submit} className="min-w-28">{busy ? '保存中…' : submitLabel}</Button>
      </div>
    </div>
  );
}
