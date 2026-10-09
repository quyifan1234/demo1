1.  **Refactor `src/api` files to use `ensureWritten`**:
    - Update `apps.ts`, `keys.ts`, `outputs.ts`, `prefs.ts`, `skills.ts` to uniformly use `ensureWritten(data, action)` for insert/update/delete operations instead of manual `if (!data || data.length === 0)` checks, to ensure proper RLS handling and standardized error messages.
    - Also verify error handling.
2.  **Add tests for `src/api` CRUD operations**:
    - Create test files: `src/api/__tests__/apps.test.ts`, `src/api/__tests__/keys.test.ts`, `src/api/__tests__/outputs.test.ts`, `src/api/__tests__/prefs.test.ts`, `src/api/__tests__/skills.test.ts`.
    - Mock `supabase` client and `requireUserId` / `ensureWritten` where needed or test full integration. Actually, unit testing the API wrapper functions with mocked `supabase` is better because we just need to verify they call `supabase` correctly and handle the results/errors correctly.
3.  **Fix Flaky Logic and Boundary Conditions**:
    - In `src/api/helpers.ts`, `maskKey` might have unexpected behavior for strings length < 4 because `Math.max(value.length, 4)` is used but maybe it shouldn't guarantee 4 asterisks if the string is very short, or the test `expect(maskKey('12')).toBe('****')` implies it does. The user commented `// fails! original implementation expects **** for length <=4 if max` - wait, the comment says `// fails!` but the test passes. Wait, does it pass? Yes, the previous coverage run passed. The implementation: `if (value.length <= 8) return '*'.repeat(Math.max(value.length, 4));`. For `'12'`, length is 2, `Math.max(2, 4)` is 4. So `'****'`. What if length is 0? `****`. Let's clarify `maskKey` boundary condition. If value is empty string, maybe return `''`.
    - `ensureWritten` signature in memory is `ensureWritten<T>(data, action, customErrorMsg?)`. Currently it's `ensureWritten<T>(data: T[] | null, action: string): T[]`. We should update `ensureWritten` to support `customErrorMsg?` parameter if memory suggests it: *"use the ensureWritten helper... (signature: ensureWritten<T>(data, action, customErrorMsg?)) to explicitly check if the returned data is empty to properly handle Row Level Security (RLS) silent failures while preserving custom error messages."*
4.  **Implement `ensureWritten` with `customErrorMsg`**:
    - Update `src/api/helpers.ts` `ensureWritten` to accept `customErrorMsg?` and throw it if provided.
    - Update `src/api/__tests__/helpers.test.ts` to test this new parameter.
5.  **Pre-commit steps**:
    - Run all tests to ensure coverage and no breakage.
    - Run `vite build` and `tsc --noEmit`.
