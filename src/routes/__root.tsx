import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext, useRouterState, Navigate } from '@tanstack/react-router';
import { AuthProvider } from '../lib/auth';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/theme-switch';

function NotFoundComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === '/') return null;
  return <Navigate to="/" replace />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          {/* mobileOffset：移动端把 toast 抬到底部 Tab 栏之上，避免遮住导航 */}
          <Toaster position="bottom-right" mobileOffset={{ bottom: 84 }} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
