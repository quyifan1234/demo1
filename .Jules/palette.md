## 2026-10-12 - Search Input Clear Button & Switch Accessibility

**Learning:** Search inputs shared across list pages benefit from an inline clear button (`X`) that resets state and returns focus to the input (`inputRef.focus()`). Radix switches require an explicit `aria-label` dynamic with item names (e.g. `aria-label="停用密钥 OpenAI Key"`) rather than relying on `title` attributes alone for screen readers.
**Action:** Always bind input refs and pass explicit dynamic `aria-label` attributes to toggle switches in data lists.
