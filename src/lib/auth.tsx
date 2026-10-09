import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { verifyInviteCode } from './invite';
import { DEMO_USER, disablePreviewDemo, isPreviewDemoEnabled } from './preview-demo';

/** 演示模式：不访问云端鉴权，直接使用本地示例用户 */
const DEMO = isPreviewDemoEnabled();

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
    if (DEMO) {
      setUser(DEMO_USER as User);
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO) return;
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
    if (DEMO) return;
    const valid = await verifyInviteCode(inviteCode);
    if (!valid) throw new Error('邀请码不正确，请检查后重试');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message.includes('already') ? '该账号已被注册，请直接登录' : `注册失败：${error.message}`);
  };

  const signOut = async () => {
    if (DEMO) {
      // 退出演示：关掉开关并整页刷新，回到真实的登录页
      disablePreviewDemo();
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, ready, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
