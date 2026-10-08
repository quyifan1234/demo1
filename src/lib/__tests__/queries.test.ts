import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMutate } from '../queries';

// Mock dependencies
vi.mock('@tanstack/react-query', () => {
  const setQueryDataMock = vi.fn();
  const invalidateQueriesMock = vi.fn();

  return {
    useQueryClient: vi.fn(() => ({
      setQueryData: setQueryDataMock,
      invalidateQueries: invalidateQueriesMock,
    })),
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock('../supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      },
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        }),
      }))
    }
  }
});

import { useQueryClient } from '@tanstack/react-query';

describe('queries', () => {
  let mutate: any;
  let qc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = useMutate();
    qc = useQueryClient();
  });

  describe('useMutate', () => {
    describe('save', () => {
      it('applies optimistic updates correctly for save', async () => {
        const optimisticFn = vi.fn((old) => [...old, { id: 'new' }]);

        // Setup mock so it calls the callback
        qc.setQueryData.mockImplementation((key: string, updater: any) => {
          // Provide an old state array so the Array.isArray check passes
          updater([{ id: 'old' }]);
        });

        await mutate.save('test_table', { id: 'new' }, [['testKey']], { optimistic: optimisticFn });

        expect(qc.setQueryData).toHaveBeenCalledWith(['testKey'], expect.any(Function));
        expect(optimisticFn).toHaveBeenCalledWith([{ id: 'old' }]);
      });

      it('does not crash if old is undefined/null in optimistic update for save', async () => {
        const optimisticFn = vi.fn((old) => [{ id: 'new' }]);

        qc.setQueryData.mockImplementation((key: string, updater: any) => {
          // Provide undefined old state
          updater(undefined);
        });

        await mutate.save('test_table', { id: 'new' }, [['testKey']], { optimistic: optimisticFn });

        // It shouldn't call optimisticFn if old is undefined/not an array based on implementation
        expect(optimisticFn).not.toHaveBeenCalled();
      });
    });

    describe('remove', () => {
      it('applies optimistic updates correctly for remove', async () => {
        const optimisticFn = vi.fn((old) => old.filter((x: any) => x.id !== 'del'));

        qc.setQueryData.mockImplementation((key: string, updater: any) => {
          updater([{ id: 'keep' }, { id: 'del' }]);
        });

        await mutate.remove('test_table', 'del', [['testKey']], { optimistic: optimisticFn });

        expect(qc.setQueryData).toHaveBeenCalledWith(['testKey'], expect.any(Function));
        expect(optimisticFn).toHaveBeenCalledWith([{ id: 'keep' }, { id: 'del' }]);
      });
    });
  });
});
