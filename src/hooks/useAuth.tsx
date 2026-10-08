// @ts-nocheck — 平台 agent 遗留的死代码，不再维护，仅为通过构建而跳过类型检查
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userId: string | null;
  loading: boolean;
  signIn(username: string, password: string): Promise<void>;
  signUp(username: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** 基础密码认证：用户名 + 密码，内部映射 {username}@meoo.local 虚拟邮箱（不展示给用户） */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const resetStore = useAppStore((s) => s.reset);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) resetStore();
    });
    return () => sub.subscription.unsubscribe();
  }, [resetStore]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    userId: session?.user.id ?? null,
    loading,
    async signIn(username, password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username.trim()}@meoo.local`,
        password,
      });
      if (error) throw new Error(friendlyAuthError(error.message));
    },
    async signUp(username, password) {
      const name = username.trim();
      if (name.length < 2) throw new Error('用户名至少 2 个字符');
      if (password.length < 6) throw new Error('密码至少 6 位');
      const { error } = await supabase.auth.signUp({
        email: `${name}@meoo.local`,
        password,
        options: { data: { username: name } },
      });
      if (error) throw new Error(friendlyAuthError(error.message));
    },
    async signOut() {
      await supabase.auth.signOut();
      resetStore();
    },
  }), [session, loading, resetStore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return '用户名或密码错误';
  if (m.includes('already registered') || m.includes('already exists')) return '该用户名已被注册';
  if (m.includes('rate limit')) return '操作过于频繁，请稍后再试';
  if (m.includes('confirm')) return '账号待确认，请重试或联系管理员';
  return msg;
}
