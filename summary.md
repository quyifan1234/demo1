### Changes Summary

- **`src/api/helpers.ts`**:
  - Updated `ensureWritten` to accept a `customErrorMsg` parameter to preserve context-specific error messages.
  - Fixed a boundary issue in `maskKey` to correctly return an empty string for empty input (`''`).

- **`src/api/__tests__/helpers.test.ts`**:
  - Updated helper tests to cover the new `customErrorMsg` parameter and the empty string boundary logic in `maskKey`.

- **`src/api/apps.ts`**, **`src/api/keys.ts`**, **`src/api/outputs.ts`**, **`src/api/prefs.ts`**, **`src/api/skills.ts`**:
  - Refactored logic to uniformly use `ensureWritten(data, action, customErrorMsg)` for better resilience against RLS silent failures, preserving any original context-specific error messages.

- **`src/api/__tests__/apps.test.ts`**, **`src/api/__tests__/keys.test.ts`**, **`src/api/__tests__/outputs.test.ts`**, **`src/api/__tests__/prefs.test.ts`**, **`src/api/__tests__/skills.test.ts`**:
  - Created brand new unit tests to cover success and error paths (including checking that `.eq('user_id', uid)` logic functions as expected via Supabase mocks) for every API layer file.

- Successfully ran tests (`vitest` suite passes flawlessly) and build tasks (`vite build` and `tsc --noEmit`). No dangling references left.
