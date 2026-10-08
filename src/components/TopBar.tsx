// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import { LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function TopBar() {
  const { user, signOut } = useAuth();
  const username = (user?.user_metadata?.username as string) ?? '已登录用户';

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '退出失败');
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 text-sm font-medium md:hidden">
        <UserCircle2 size={16} className="text-muted-foreground" />
        <span className="truncate">{username}</span>
      </div>
      <div className="hidden items-center gap-2 text-sm md:flex">
        <UserCircle2 size={16} className="text-muted-foreground" />
        <span>{username}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LogOut size={14} />
        退出
      </button>
    </header>
  );
}
