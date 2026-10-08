// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { OUTPUT_KINDS, OUTPUT_KIND_LABEL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  presetAppId?: string | null;
}

export function OutputFormDialog({ open, onOpenChange, presetAppId }: Props) {
  const { userId } = useAuth();
  const apps = useAppStore((s) => s.apps);
  const addOutput = useAppStore((s) => s.addOutput);
  const [saving, setSaving] = useState(false);
  const [appId, setAppId] = useState('');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<string>('text');
  const [content, setContent] = useState('');
  const [assetUrl, setAssetUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    setAppId(presetAppId ?? apps[0]?.id ?? '');
    setTitle('');
    setKind('text');
    setContent('');
    setAssetUrl('');
  }, [open, presetAppId, apps]);

  async function handleSubmit() {
    if (!userId) return toast.error('请先登录');
    if (!title.trim()) return toast.error('请填写产物标题');
    if (!appId) return toast.error('请选择关联的应用');
    setSaving(true);
    try {
      await addOutput(userId, {
        app_id: appId,
        title: title.trim(),
        kind,
        content: content.trim() || null,
        asset_url: assetUrl.trim() || null,
      });
      toast.success('产物已记录');
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
          <DialogTitle>记录 AI 产物</DialogTitle>
          <DialogDescription>保存某个应用生成的文本、图片或代码成果</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>关联应用 *</Label>
            {apps.length === 0 ? (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">还没有 AI 应用，请先到「AI 应用」页添加。</p>
            ) : (
              <Select value={appId} onValueChange={setAppId}>
                <SelectTrigger><SelectValue placeholder="选择应用" /></SelectTrigger>
                <SelectContent>
                  {apps.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>标题 *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如 周报初稿 v1" />
          </div>
          <div className="space-y-2">
            <Label>类型</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OUTPUT_KINDS.map((k) => <SelectItem key={k} value={k}>{OUTPUT_KIND_LABEL[k]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>内容</Label>
            <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="粘贴生成的文本 / 代码…" className="font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label>资产链接（图片等）</Label>
            <Input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} placeholder="https://… （选填）" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving || apps.length === 0}>{saving ? '保存中…' : '保存'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
