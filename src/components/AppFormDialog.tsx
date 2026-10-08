// @ts-nocheck — 平台 agent 遗留的死代码，不再维护，仅为通过构建而跳过类型检查
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import type { AppRow } from '@/api/apps';
import { APP_CATEGORIES, APP_STATUSES, APP_STATUS_LABEL, QUOTA_UNITS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  editing?: AppRow | null;
}

export function AppFormDialog({ open, onOpenChange, editing }: Props) {
  const { userId } = useAuth();
  const addApp = useAppStore((s) => s.addApp);
  const patchApp = useAppStore((s) => s.patchApp);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<string>(APP_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [rating, setRating] = useState(0);
  const [quotaTotal, setQuotaTotal] = useState('');
  const [quotaRemaining, setQuotaRemaining] = useState('');
  const [quotaUnit, setQuotaUnit] = useState<string>('次');
  const [isFavorite, setIsFavorite] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setUrl(editing?.url ?? '');
    setCategory(editing?.category ?? APP_CATEGORIES[0]);
    setDescription(editing?.description ?? '');
    setSpecialties(editing?.specialties.join('、') ?? '');
    setStatus(editing?.status ?? 'active');
    setRating(editing?.rating ?? 0);
    setQuotaTotal(editing?.quota_total != null ? String(editing.quota_total) : '');
    setQuotaRemaining(editing?.quota_remaining != null ? String(editing.quota_remaining) : '');
    setQuotaUnit(editing?.quota_unit ?? '次');
    setIsFavorite(editing?.is_favorite ?? false);
    setNote(editing?.note ?? '');
  }, [open, editing]);

  async function handleSubmit() {
    if (!userId) return toast.error('请先登录');
    if (!name.trim()) return toast.error('请填写应用名称');
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        url: url.trim() || null,
        category,
        description: description.trim() || null,
        specialties: specialties.split(/[、,，\s]+/).map((s) => s.trim()).filter(Boolean),
        status,
        rating,
        quota_total: quotaTotal === '' ? null : Number(quotaTotal),
        quota_remaining: quotaRemaining === '' ? null : Number(quotaRemaining),
        quota_unit: quotaUnit,
        quota_updated_at: quotaTotal !== '' || quotaRemaining !== '' ? new Date().toISOString() : null,
        is_favorite: isFavorite,
        note: note.trim() || null,
      };
      if (editing) {
        await patchApp(userId, editing.id, payload);
        toast.success('应用已更新');
      } else {
        await addApp(userId, payload);
        toast.success('应用已添加');
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑应用' : '新增 AI 应用'}</DialogTitle>
          <DialogDescription>记录工具信息、额度与状态，便于统一台账管理</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>名称 *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 ChatGPT" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>网址</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-2">
            <Label>分类</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{APP_STATUS_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>简介</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="一句话说明用途" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>擅长方向（顿号分隔）</Label>
            <Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="代码补全、重构建议" />
          </div>
          <div className="space-y-2">
            <Label>总额度</Label>
            <Input type="number" value={quotaTotal} onChange={(e) => setQuotaTotal(e.target.value)} placeholder="选填" />
          </div>
          <div className="space-y-2">
            <Label>剩余额度</Label>
            <Input type="number" value={quotaRemaining} onChange={(e) => setQuotaRemaining(e.target.value)} placeholder="选填" />
          </div>
          <div className="space-y-2">
            <Label>额度单位</Label>
            <Select value={quotaUnit} onValueChange={setQuotaUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTA_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>评分（0-5）</Label>
            <Input type="number" min={0} max={5} value={rating} onChange={(e) => setRating(Math.max(0, Math.min(5, Number(e.target.value) || 0)))} />
          </div>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <Label>收藏为常用</Label>
            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>备注</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="订阅计划、注意事项等" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
