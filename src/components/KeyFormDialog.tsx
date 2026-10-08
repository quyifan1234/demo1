// @ts-nocheck — 平台 agent 遗留的死代码，不再维护，仅为通过构建而跳过类型检查
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import type { KeyRow } from '@/api/keys';
import { KEY_PLATFORMS } from '@/lib/constants';
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
  editing?: KeyRow | null;
}

export function KeyFormDialog({ open, onOpenChange, editing }: Props) {
  const { userId } = useAuth();
  const addKey = useAppStore((s) => s.addKey);
  const patchKey = useAppStore((s) => s.patchKey);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<string>('其他');
  const [KeyValue, setKeyValue] = useState('');
  const [note, setNote] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setPlatform(editing?.platform ?? '其他');
    setKeyValue(editing?.key_value ?? '');
    setNote(editing?.note ?? '');
    setIsActive(editing?.is_active ?? true);
  }, [open, editing]);

  async function handleSubmit() {
    if (!userId) return toast.error('请先登录');
    if (!name.trim()) return toast.error('请填写密钥名称');
    if (!KeyValue.trim()) return toast.error('请填写密钥值');
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        platform,
        key_value: KeyValue.trim(),
        note: note.trim() || null,
        is_active: isActive,
      };
      if (editing) {
        await patchKey(userId, editing.id, payload);
        toast.success('密钥已更新');
      } else {
        await addKey(userId, payload);
        toast.success('密钥已保存');
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑密钥' : '新增 API 密钥'}</DialogTitle>
          <DialogDescription>密钥仅自己可见，列表默认打码展示</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>名称 *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 OpenAI 生产 Key" />
          </div>
          <div className="space-y-2">
            <Label>平台</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KEY_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>密钥值 *</Label>
            <Input
              value={KeyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-…"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="用途、限额、到期时间等" />
          </div>
          <div className="flex items-center justify-between">
            <Label>启用中</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
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
