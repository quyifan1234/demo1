import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { verifyInviteCode } from './invite';

interface AuthCtx {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, inviteCode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 透出真实错误便于诊断；仅对"凭证无效"做友好文案
      const msg = error.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        throw new Error('账号或密码不正确');
      }
      throw new Error(`登录失败：${msg || '未知错误'}`);
    }
  };

  const signUp = async (email: string, password: string, inviteCode: string) => {
    const valid = await verifyInviteCode(inviteCode);
    if (!valid) throw new Error('邀请码不正确，请检查后重试');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message.includes('already') ? '该账号已被注册，请直接登录' : `注册失败：${error.message}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, ready, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
