import { render, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../useAuth';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// setup mock for supabase
vi.mock('@/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

// setup mock for store
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    // just return a dummy reset func
    return vi.fn();
  })
}));

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    let error: Error | null = null;

    // Silence console.error for expected throw
    const originalError = console.error;
    console.error = vi.fn();

    const TestComponent = () => {
      try {
        useAuth();
      } catch (e) {
        error = e instanceof Error ? e : new Error(String(e));
      }
      return null;
    };

    render(<TestComponent />);

    expect(error).not.toBeNull();
    expect(error!.message).toBe('useAuth 必须在 AuthProvider 内使用');

    console.error = originalError;
  });
});
