import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { RequiredMark } from './bits';
import { APP_CATEGORIES, APP_STATUSES, QUOTA_UNITS, type AiApp } from '../lib/types';

export interface AppFormValue {
  name: string; url: string; category: string; description: string;
  specialties: string[]; quota_total: string; quota_remaining: string;
  quota_unit: string; status: string; rating: number; note: string;
}

export function toFormValue(a?: AiApp): AppFormValue {
  return {
    name: a?.name ?? '', url: a?.url ?? '', category: a?.category ?? '对话',
    description: a?.description ?? '', specialties: a?.specialties ?? [],
    quota_total: a?.quota_total != null ? String(a.quota_total) : '',
    quota_remaining: a?.quota_remaining != null ? String(a.quota_remaining) : '',
    quota_unit: a?.quota_unit ?? '次', status: a?.status ?? '在用',
    rating: a?.rating ?? 0, note: a?.note ?? '',
  };
}

export function AppForm({ initial, onSubmit, busy, submitLabel }: {
  initial: AppFormValue; onSubmit: (v: AppFormValue) => Promise<void>; busy: boolean; submitLabel: string;
}) {
  const [v, setV] = useState(initial);
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const set = <K extends keyof AppFormValue>(k: K, val: AppFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = async () => {
    const errs: string[] = [];
    if (!v.name.trim()) errs.push('请填写应用名称');
    const total = v.quota_total === '' ? null : Number(v.quota_total);
    const remain = v.quota_remaining === '' ? null : Number(v.quota_remaining);
    if (total != null && (Number.isNaN(total) || total < 0)) errs.push('总额度需为非负数字');
    if (remain != null && (Number.isNaN(remain) || remain < 0)) errs.push('剩余额度需为非负数字');
    if (total != null && remain != null && remain > total) errs.push('剩余额度不能大于总额度');
    if (v.url && !/^https?:\/\//.test(v.url)) errs.push('网址需以 http:// 或 https:// 开头');
    setErrors(errs);
    if (errs.length > 0) return;
    await onSubmit(v);
  };

  const addTag = () => {
    const t = tag.trim();
    if (t && !v.specialties.includes(t)) set('specialties', [...v.specialties, t]);
    setTag('');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>名称<RequiredMark /></Label>
          <Input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="应用名称" />
        </div>
        <div className="space-y-2">
          <Label>网址</Label>
          <Input value={v.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>分类</Label>
          <Select value={v.category} onValueChange={(x) => set('category', x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{APP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>状态</Label>
          <Select value={v.status} onValueChange={(x) => set('status', x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>描述</Label>
        <Textarea value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="这个应用是做什么的" rows={2} />
      </div>
      <div className="space-y-2">
        <Label>擅长领域</Label>
        <div className="flex gap-2">
          <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="输入标签后回车添加"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <Button type="button" variant="outline" onClick={addTag}>添加</Button>
        </div>
        {v.specialties.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {v.specialties.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">{t}
                <button onClick={() => set('specialties', v.specialties.filter((x) => x !== t))}><X size={12} /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>总额度</Label>
          <Input value={v.quota_total} onChange={(e) => set('quota_total', e.target.value)} placeholder="空=无限" inputMode="decimal" />
        </div>
        <div className="space-y-2">
          <Label>剩余额度</Label>
          <Input value={v.quota_remaining} onChange={(e) => set('quota_remaining', e.target.value)} placeholder="空=无限" inputMode="decimal" />
        </div>
        <div className="space-y-2">
          <Label>单位</Label>
          <Select value={v.quota_unit} onValueChange={(x) => set('quota_unit', x)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{QUOTA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>评分：{v.rating} 星</Label>
        <input type="range" min={0} max={5} step={1} value={v.rating} onChange={(e) => set('rating', Number(e.target.value))} className="w-full accent-primary" />
      </div>
      <div className="space-y-2">
        <Label>备注</Label>
        <Textarea value={v.note} onChange={(e) => set('note', e.target.value)} rows={2} />
      </div>
      {errors.length > 0 && (
        <div className="text-sm text-destructive space-y-1">{errors.map((e) => <p key={e}>{e}</p>)}</div>
      )}
      <Button disabled={busy} onClick={submit} className="min-w-28">{busy ? '保存中…' : submitLabel}</Button>
    </div>
  );
}
