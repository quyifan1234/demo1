import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../lib/auth';
import { AppShell } from '../components/AppShell';

export const Route = createFileRoute('/_app')({ component: ProtectedLayout });

function ProtectedLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: '/login', replace: true });
  }, [ready, user, navigate]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center text-muted-foreground" role="status">正在打开装备库…</div>;
  if (!user) return null;
  return <AppShell />;
}
