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

/* 出错字段 → 控件 id：提交失败后据此把焦点移到第一个出错的控件 */
const ASSET_FIELD_IDS = {
  name: 'asset-form-name',
  url: 'asset-form-url',
} as const;

type AssetErrorField = keyof typeof ASSET_FIELD_IDS;

/* 错误摘要容器 id：出错控件的 aria-describedby 指向它，读屏能念出对应错误 */
const ASSET_ERRORS_ID = 'asset-form-errors';

interface AssetFieldError { field: AssetErrorField; message: string; }

export function AssetForm({ initial, onSubmit, busy, submitLabel, autoFocus = false }: {
  initial: AssetFormValue; onSubmit: (v: AssetFormValue) => Promise<void>; busy: boolean; submitLabel: string;
  /** 仅新增页传 true：编辑页自动聚焦名称会在手机上弹出键盘、打断阅读 */
  autoFocus?: boolean;
}) {
  const [v, setV] = useState(initial);
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<AssetFieldError[]>([]);
  const set = (k: keyof AssetFormValue, val: unknown) => setV((p) => ({ ...p, [k]: val }));

  // 仅出错时挂 aria-invalid/aria-describedby：正常控件不加多余的无障碍属性
  const fieldAria = (field: AssetErrorField) => errors.some((e) => e.field === field)
    ? { 'aria-invalid': true as const, 'aria-describedby': ASSET_ERRORS_ID }
    : {};

  const submit = async () => {
    const errs: AssetFieldError[] = [];
    if (!v.name.trim()) errs.push({ field: 'name', message: '请填写素材名称' });
    if (v.url && !/^https?:\/\//.test(v.url)) errs.push({ field: 'url', message: '网址需以 http:// 或 https:// 开头' });
    setErrors(errs);
    if (errs.length > 0) {
      // 焦点落到第一个出错控件：键盘/读屏用户不必自己在页面里找错在哪
      document.getElementById(ASSET_FIELD_IDS[errs[0].field])?.focus();
      return;
    }
    await onSubmit(v);
  };

  const addTag = () => {
    const t = tag.trim();
    if (t && !v.tags.includes(t)) set('tags', [...v.tags, t]);
    setTag('');
  };

  return (
    // 用真实 form 承载提交：回车即可保存，且浏览器能对 required 字段做原生校验
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="asset-form-name">名称<RequiredMark /></Label>
          <Input id="asset-form-name" required autoFocus={autoFocus} value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="素材名称" {...fieldAria('name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="asset-form-category">分类</Label>
          <Select value={v.category} onValueChange={(x) => set('category', x)}>
            <SelectTrigger id="asset-form-category"><SelectValue /></SelectTrigger>
            <SelectContent>{ASSET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="asset-form-url">网址</Label>
        <Input id="asset-form-url" value={v.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" {...fieldAria('url')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="asset-form-description">描述</Label>
        <Textarea id="asset-form-description" value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="这个素材是做什么的、好在哪里" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="asset-form-tag">标签</Label>
        <div className="flex gap-2">
          <Input id="asset-form-tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="回车添加"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
          <Button type="button" variant="outline" onClick={addTag}>添加</Button>
        </div>
        {v.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {v.tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">{t}
                <button type="button" aria-label={`移除标签 ${t}`} onClick={() => set('tags', v.tags.filter((x) => x !== t))}
                  className="inline-flex size-6 -my-1 -mr-1 items-center justify-center rounded-full hover:bg-foreground/10">
                  <X size={12} />
                </button>
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
        // role=alert：错误出现即被读屏播报；id 供出错控件的 aria-describedby 引用
        <div id={ASSET_ERRORS_ID} role="alert" className="text-sm text-destructive space-y-1">
          {errors.map((e) => <p key={`${e.field}:${e.message}`}>{e.message}</p>)}
        </div>
      )}
      <div>
        <Button type="submit" disabled={busy} className="min-w-28">{busy ? '保存中…' : submitLabel}</Button>
      </div>
    </form>
  );
}
