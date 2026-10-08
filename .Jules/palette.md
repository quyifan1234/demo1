## 2025-02-22 - Form Badge Tag Removal Buttons
**Learning:** In tag lists and badge collections with inline remove buttons inside forms, icon-only `<button>` elements missing `type="button"` and `aria-label` create screen reader ambiguity and can accidentally trigger form submission when pressing Enter.
**Action:** Always specify `type="button"` and an explicit, context-aware `aria-label` (e.g. `aria-label={`删除标签 ${tag}`}`) on badge removal buttons inside form components.
