import { useEffect, useState, useRef } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ThemeSwitch } from '../components/theme-switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
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
  const [done, setDone] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const doneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ready && user) navigate({ to: '/', replace: true });
  }, [ready, user, navigate]);

  useEffect(() => () => { if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current); }, []);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy || done) return;
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) { setError('请填写账号和密码'); return; }
    if (mode === 'signup' && password.length < 6) { setError('密码至少 6 位'); return; }
    if (mode === 'signup' && !inviteCode.trim()) { setError('注册需要邀请码'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        enter('登录成功，正在进入…');
      } else {
        const { needsEmailConfirm } = await signUp(email.trim(), password, inviteCode);
        // 需要邮箱确认时没有会话，直接跳转会被弹回登录页（像死循环），改为提示 + 切到登录态
        if (needsEmailConfirm) {
          setMode('signin');
          setInfo('注册成功！请先到邮箱点确认链接，再回来登录。');
          return;
        }
        enter('注册成功，正在进入…');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  /** 成功后短暂展示结果文案，再进入工作台 */
  const enter = (message: string) => {
    setDone(message);
    if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current);
    doneTimeoutRef.current = setTimeout(() => navigate({ to: '/', replace: true }), 600);
  };

  const switchMode = (next: 'signin' | 'signup') => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setDone(null);
    setInfo(null);
  };

  return (
    <div className="login-layout">
      <header className="login-toolbar">
        <div className="brand-lockup"><span className="brand-mark" aria-hidden="true">SI</span><span className="flex flex-col gap-1"><strong>SI 装备库</strong><span className="eyebrow">个人 AI 资源台账</span></span></div>
        <ThemeSwitch />
      </header>
      <main className="login-main">
        {/* 左栏：品牌叙事区（移动端压缩为顶部小块） */}
        <section className="login-story">
          <span className="eyebrow">更少寻找，更多创造。</span>
          <h1>你的 AI 装备库<br /><span>一处收藏</span>，处处可用。</h1>
          <p>把散落的应用、素材、密钥与提示词收进同一处。<br className="hidden sm:block" />让灵感有迹可循，让好工具随取随用。</p>
          {/* 价值点：移动端只留一行概要，桌面完整展示 */}
          <ul className="login-points">{VALUE_POINTS.map((point) => (
            <li key={point.n}><span>{point.n}</span><div><strong>{point.t}</strong><p>{point.d}</p></div></li>
          ))}</ul>
        </section>
        {/* 右栏：表单区 */}
        <section className="login-form-area" aria-label="账号登录与注册">
          <Card className="login-card">
            <CardHeader className="login-card-top">
              <span className="eyebrow">打开你的工作空间</span>
              <CardTitle><h2 className="display-type text-2xl">{mode === 'signin' ? '欢迎回来' : '创建账号'}</h2></CardTitle>
              <CardDescription>{mode === 'signin' ? '登录，继续管理你的 AI 装备。' : '用邀请码开启你的个人装备库。'}</CardDescription>
            </CardHeader>
            <CardContent className="login-card-body">
              {/* 模式 Tab */}
              <ToggleGroup type="single" value={mode} onValueChange={(value) => {
                if (value === 'signin' || value === 'signup') switchMode(value);
              }} className="login-tabs" aria-label="登录方式">
                <ToggleGroupItem value="signin">登录</ToggleGroupItem><ToggleGroupItem value="signup">注册</ToggleGroupItem>
              </ToggleGroup>
              <form onSubmit={submit} className="login-form">
                <div className="login-field"><Label htmlFor="login-email">邮箱账号</Label><Input id="login-email" placeholder="you@example.com" type="email" autoComplete="email" required
                  value={email} onChange={(event) => setEmail(event.target.value)} /></div>
                <div className="login-field"><Label htmlFor="login-password">密码</Label><div className="login-password">
                  <Input id="login-password" placeholder={mode === 'signup' ? '至少 6 位密码' : '输入你的密码'} type={showPwd ? 'text' : 'password'} required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} />
                  <button type="button" aria-label={showPwd ? '隐藏密码' : '显示密码'} onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div></div>
                {mode === 'signup' && <div className="login-field"><Label htmlFor="login-invite">邀请码</Label><Input id="login-invite" placeholder="输入内测邀请码" required value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} /></div>}
                {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
                {info && <p role="status" className="text-xs text-primary">{info}</p>}
                <Button type="submit" className="w-full" disabled={busy || !!done}>
                  {done ? <><Check data-icon="inline-start" />{done}</> : busy ? '请稍候…' : <>{mode === 'signin' ? '进入装备库' : '注册并登录'}<ArrowRight data-icon="inline-end" /></>}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center gap-2 border-t py-4"><ShieldCheck size={13} className="text-muted-foreground" aria-hidden="true" /><span className="text-[10px] text-muted-foreground">内测阶段 · 注册需要邀请码</span></CardFooter>
          </Card>
        </section>
      </main>
      <footer className="login-footer"><span>SI 装备库 / 个人 AI 资源工作台</span><span>应用 · 素材 · 技能 · 密钥</span></footer>
    </div>
  );
}
