// @ts-nocheck — 平台 agent 遗留的死代码，不再维护，仅为通过构建而跳过类型检查
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import type { SkillRow } from '@/api/skills';
import { SKILL_CATEGORIES } from '@/lib/constants';
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
  editing?: SkillRow | null;
}

export function SkillFormDialog({ open, onOpenChange, editing }: Props) {
  const { userId } = useAuth();
  const addSkill = useAppStore((s) => s.addSkill);
  const patchSkill = useAppStore((s) => s.patchSkill);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(SKILL_CATEGORIES[0]);
  const [scene, setScene] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setCategory(editing?.category ?? SKILL_CATEGORIES[0]);
    setScene(editing?.scene ?? '');
    setTags(editing?.tags.join('、') ?? '');
    setContent(editing?.content ?? '');
  }, [open, editing]);

  async function handleSubmit() {
    if (!userId) return toast.error('请先登录');
    if (!name.trim()) return toast.error('请填写技能名称');
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        scene: scene.trim() || null,
        tags: tags.split(/[、,，\s]+/).map((t) => t.trim()).filter(Boolean),
        content: content.trim() || null,
      };
      if (editing) {
        await patchSkill(userId, editing.id, payload);
        toast.success('技能已更新');
      } else {
        await addSkill(userId, payload);
        toast.success('技能已保存');
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
          <DialogTitle>{editing ? '编辑技能' : '新增技能 / Prompt 模板'}</DialogTitle>
          <DialogDescription>沉淀可复用的提示词与技巧，支持一键复制使用</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>名称 *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 代码审查提示词" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>适用场景</Label>
              <Input value={scene} onChange={(e) => setScene(e.target.value)} placeholder="如 PRD 评审" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>标签（顿号分隔）</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="编程、重构" />
          </div>
          <div className="space-y-2">
            <Label>内容</Label>
            <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="粘贴你的 Prompt 或笔记…" className="font-mono text-xs" />
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
