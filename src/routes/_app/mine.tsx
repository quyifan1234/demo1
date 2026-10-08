import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useApps, useKeys, useSkills, useAssets, usePrefs, useProfile, useMutate } from '../../lib/queries';
import { SORTS } from '../../lib/types';
import { useAuth } from '../../lib/auth';
import { PageHeader, InitialAvatar } from '../../components/bits';
import { RowList, RowChevron, SectionTitle } from '../../components/rows';
import { LIBRARY_NAV } from '../../components/libraryNav';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/mine')({
  component: MinePage,
});

function MinePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: apps = [] } = useApps();
  const { data: keys = [] } = useKeys();
  const { data: skills = [] } = useSkills();
  const { data: assets = [] } = useAssets();
  const { data: prefs } = usePrefs();
  const { data: profile } = useProfile();
  const { save } = useMutate();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [threshold, setThreshold] = useState(String(prefs?.quota_threshold ?? 20));
  const [sort, setSort] = useState(prefs?.default_sort ?? 'updated');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveAll = async () => {
    setBusy(true);
    try {
      await save('profiles', { id: user?.id, nickname: nickname.trim() || null, bio: bio.trim() || null },
        [['profile']], { isNew: !profile, skipUserId: true });
      await save('user_prefs', { user_id: user?.id, quota_threshold: Number(threshold) || 20, default_sort: sort },
        [['prefs']], { isNew: !prefs, keyCol: 'user_id' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusy(false);
    }
  };

  const counts: Record<string, number> = {
    '/apps': apps.length,
    '/assets': assets.length,
    '/skills': skills.length,
    '/keys': keys.length,
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="我的" />

      <div className="flex items-center gap-4 mb-10">
        <InitialAvatar name={nickname || profile?.username || user?.email || '?'} size={64} />
        <div className="min-w-0">
          <div className="font-bold text-[20px] truncate">{profile?.nickname || profile?.username || '未设置昵称'}</div>
          <div className="text-[13px] text-muted-foreground truncate">{user?.email}</div>
          {profile?.bio ? <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p> : null}
        </div>
      </div>

      <SectionTitle>数据概览</SectionTitle>
      <RowList className="mb-2">
        {LIBRARY_NAV.map(({ to, label, Icon }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-1 py-3">
            <Icon size={17} className="text-muted-foreground shrink-0" />
            <span className="min-w-0 flex-1 text-[16px]">{label}</span>
            <span className="shrink-0 text-[15px] text-muted-foreground">{counts[to] ?? 0}</span>
            <RowChevron />
          </Link>
        ))}
      </RowList>

      <SectionTitle>档案与偏好</SectionTitle>
      <div className="space-y-4 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>昵称</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="昵称" />
          </div>
          <div className="space-y-2">
            <Label>额度提醒阈值（%）</Label>
            <Select value={threshold} onValueChange={setThreshold}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['10', '20', '30'].map((t) => <SelectItem key={t} value={t}>{t}%</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>简介</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="一句话介绍自己" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>应用列表默认排序</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button disabled={busy} onClick={saveAll} className="rounded-full shadow-none">{busy ? '保存中…' : '保存设置'}</Button>
          {saved ? <span className="text-sm text-primary">已保存</span> : null}
        </div>
      </div>

      <button
        onClick={async () => { await signOut(); navigate({ to: '/login', replace: true }); }}
        className="flex items-center gap-2 text-[15px] font-medium text-destructive">
        <LogOut size={16} />退出登录
      </button>
    </div>
  );
}
