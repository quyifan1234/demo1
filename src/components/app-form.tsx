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

/* 出错字段 → 控件 id：提交失败后据此把焦点移到第一个出错的控件 */
const APP_FIELD_IDS = {
  name: 'app-form-name',
  url: 'app-form-url',
  quota_total: 'app-form-quota-total',
  quota_remaining: 'app-form-quota-remaining',
} as const;

type AppErrorField = keyof typeof APP_FIELD_IDS;

/* 错误摘要容器 id：出错控件的 aria-describedby 指向它，读屏能念出对应错误 */
const APP_ERRORS_ID = 'app-form-errors';

interface AppFieldError { field: AppErrorField; message: string; }

export function AppForm({ initial, onSubmit, busy, submitLabel }: {
  initial: AppFormValue; onSubmit: (v: AppFormValue) => Promise<void>; busy: boolean; submitLabel: string;
}) {
  const [v, setV] = useState(initial);
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<AppFieldError[]>([]);
  const set = (k: keyof AppFormValue, val: unknown) => setV((p) => ({ ...p, [k]: val }));

  // 仅出错时挂 aria-invalid/aria-describedby：正常控件不加多余的无障碍属性
  const fieldAria = (field: AppErrorField) => errors.some((e) => e.field === field)
    ? { 'aria-invalid': true as const, 'aria-describedby': APP_ERRORS_ID }
    : {};

  const submit = async () => {
    const errs: AppFieldError[] = [];
    if (!v.name.trim()) errs.push({ field: 'name', message: '请填写应用名称' });
    const total = v.quota_total === '' ? null : Number(v.quota_total);
    const remain = v.quota_remaining === '' ? null : Number(v.quota_remaining);
    if (total != null && (Number.isNaN(total) || total < 0)) errs.push({ field: 'quota_total', message: '总额度需为非负数字' });
    if (remain != null && (Number.isNaN(remain) || remain < 0)) errs.push({ field: 'quota_remaining', message: '剩余额度需为非负数字' });
    if (total != null && remain != null && remain > total) errs.push({ field: 'quota_remaining', message: '剩余额度不能大于总额度' });
    if (v.url && !/^https?:\/\//.test(v.url)) errs.push({ field: 'url', message: '网址需以 http:// 或 https:// 开头' });
    setErrors(errs);
    if (errs.length > 0) {
      // 焦点落到第一个出错控件：键盘/读屏用户不必自己在页面里找错在哪
      document.getElementById(APP_FIELD_IDS[errs[0].field])?.focus();
      return;
    }
    await onSubmit(v);
  };

  const addTag = () => {
    const t = tag.trim();
    if (t && !v.specialties.includes(t)) set('specialties', [...v.specialties, t]);
    setTag('');
  };

  return (
    // 用真实 form 承载提交：回车即可保存，且浏览器能对 required 字段做原生校验
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="app-form-name">名称<RequiredMark /></Label>
          <Input id="app-form-name" required value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="应用名称" {...fieldAria('name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-form-url">网址</Label>
          <Input id="app-form-url" value={v.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" {...fieldAria('url')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="app-form-category">分类</Label>
          <Select value={v.category} onValueChange={(x) => set('category', x)}>
            <SelectTrigger id="app-form-category"><SelectValue /></SelectTrigger>
            <SelectContent>{APP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-form-status">状态</Label>
          <Select value={v.status} onValueChange={(x) => set('status', x)}>
            <SelectTrigger id="app-form-status"><SelectValue /></SelectTrigger>
            <SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-form-description">描述</Label>
        <Textarea id="app-form-description" value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="这个应用是做什么的" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-form-tag">擅长领域</Label>
        <div className="flex gap-2">
          <Input id="app-form-tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="输入标签后回车添加"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <Button type="button" variant="outline" onClick={addTag}>添加</Button>
        </div>
        {v.specialties.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {v.specialties.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">{t}
                <button type="button" aria-label={`移除标签 ${t}`} onClick={() => set('specialties', v.specialties.filter((x) => x !== t))}
                  className="inline-flex size-6 -my-1 -mr-1 items-center justify-center rounded-full hover:bg-foreground/10">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="app-form-quota-total">总额度</Label>
          <Input id="app-form-quota-total" value={v.quota_total} onChange={(e) => set('quota_total', e.target.value)} placeholder="空=无限" inputMode="decimal" {...fieldAria('quota_total')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-form-quota-remaining">剩余额度</Label>
          <Input id="app-form-quota-remaining" value={v.quota_remaining} onChange={(e) => set('quota_remaining', e.target.value)} placeholder="空=无限" inputMode="decimal" {...fieldAria('quota_remaining')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-form-quota-unit">单位</Label>
          <Select value={v.quota_unit} onValueChange={(x) => set('quota_unit', x)}>
            <SelectTrigger id="app-form-quota-unit"><SelectValue /></SelectTrigger>
            <SelectContent>{QUOTA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-form-rating">评分：{v.rating} 星</Label>
        <input id="app-form-rating" type="range" min={0} max={5} step={1} value={v.rating} onChange={(e) => set('rating', Number(e.target.value))} className="w-full accent-primary" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-form-note">备注</Label>
        <Textarea id="app-form-note" value={v.note} onChange={(e) => set('note', e.target.value)} rows={2} />
      </div>
      {errors.length > 0 && (
        // role=alert：错误出现即被读屏播报；id 供出错控件的 aria-describedby 引用
        <div id={APP_ERRORS_ID} role="alert" className="text-sm text-destructive space-y-1">
          {errors.map((e) => <p key={`${e.field}:${e.message}`}>{e.message}</p>)}
        </div>
      )}
      <Button type="submit" disabled={busy} className="min-w-28">{busy ? '保存中…' : submitLabel}</Button>
    </form>
  );
}
