import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Check, Eye, EyeOff, Layers } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../lib/auth';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

const VALUE_POINTS = [
  { n: '01', t: '应用 · 密钥 · 技能一处收纳', d: '散落在浏览器书签和备忘录里的 AI 装备，全部收进同一个库。' },
  { n: '02', t: '额度余量实时预警', d: '每个应用的剩余次数一目了然，低于阈值立刻提醒你。' },
  { n: '03', t: '复制即用，随处调用', d: '密钥打码存储、一键复制；提示词模板随取随用。' },
];

function LoginPage() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: '/', replace: true });
  }, [ready, user, navigate]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy || done) return;
    setError(null);
    if (!email.trim() || !password) { setError('请填写账号和密码'); return; }
    if (mode === 'signup' && password.length < 6) { setError('密码至少 6 位'); return; }
    if (mode === 'signup' && !inviteCode.trim()) { setError('注册需要邀请码'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email.trim(), password);
      else await signUp(email.trim(), password, inviteCode);
      setDone(true);
      setTimeout(() => navigate({ to: '/', replace: true }), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: 'signin' | 'signup') => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setDone(false);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[55fr_45fr]">
      {/* 左栏：品牌叙事区（移动端压缩为顶部小块） */}
      <section className="bg-muted/40 lg:bg-muted/30 flex flex-col justify-between px-6 py-8 md:px-12 lg:p-16 xl:p-20 border-b hairline lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 reveal">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers size={18} />
          </div>
          <span className="text-[17px] font-bold tracking-tight">SI 装备库</span>
        </div>

        <div className="max-w-md mt-10 lg:mt-0">
          <h1 className="reveal text-[clamp(30px,4.2vw,52px)] font-extrabold leading-[1.12] tracking-tight" data-reveal-delay="60">
            你的 AI 装备库
            <br />
            <span className="text-primary">一处收藏</span>，处处可用
          </h1>
          <p className="reveal text-[15px] text-muted-foreground mt-5 leading-relaxed" data-reveal-delay="140">
            把散落的应用、密钥与提示词收进同一处，随时找到、随时调用。
          </p>
        </div>

        {/* 价值点：移动端只留一行概要，桌面完整展示 */}
        <ul className="hidden lg:block space-y-6 mt-14 max-w-md">
          {VALUE_POINTS.map((v, i) => (
            <li key={v.n} className="reveal flex gap-4" data-reveal-delay={String(200 + i * 90)}>
              <span className="text-xs font-semibold text-muted-foreground tabular-nums pt-1">{v.n}</span>
              <div>
                <p className="text-[15px] font-semibold">{v.t}</p>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{v.d}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="hidden lg:block text-xs text-muted-foreground mt-12">内测阶段 · 注册需邀请码</p>
      </section>

      {/* 右栏：表单区 */}
      <section className="flex items-center justify-center px-6 py-10 md:px-12 lg:p-16">
        <div className="w-full max-w-[360px]">
          {/* 模式 Tab */}
          <div className="flex border-b hairline mb-8" role="tablist" aria-label="登录方式">
            {([['signin', '登录'], ['signup', '注册']] as const).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                tabIndex={mode === m ? 0 : -1}
                onClick={() => switchMode(m)}
                className={`pb-3 pr-8 text-[16px] font-semibold transition-colors relative ${
                  mode === m ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
                {mode === m && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary rounded-full" />}
              </button>
            ))}
          </div>

          <h2 className="text-[22px] font-bold tracking-tight">
            {mode === 'signin' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 mb-7">
            {mode === 'signin' ? '继续管理你的 AI 装备' : '开始记录你的 AI 装备'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">账号</Label>
              <Input id="login-email" placeholder="邮箱" type="email" autoComplete="email" autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">密码</Label>
              <div className="relative">
                <Input id="login-password" placeholder={mode === 'signup' ? '至少 6 位' : '密码'}
                  type={showPwd ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10 h-11 rounded-lg" />
                <button type="button" aria-label={showPwd ? '隐藏密码' : '显示密码'}
                  aria-pressed={showPwd}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="login-invite">邀请码</Label>
                <Input id="login-invite" placeholder="内测邀请码" className="h-11 rounded-lg"
                  value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
              </div>
            )}
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full h-11 rounded-full shadow-none text-[16px] font-semibold" disabled={busy || done}>
              {done ? (
                <><Check size={16} />{mode === 'signin' ? '登录成功，正在进入…' : '注册成功，正在进入…'}</>
              ) : busy ? '请稍候…' : mode === 'signin' ? '登录' : '注册并登录'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8 lg:hidden">内测阶段 · 注册需邀请码</p>
        </div>
      </section>
    </div>
  );
}
